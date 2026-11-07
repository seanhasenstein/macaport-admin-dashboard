import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { createObjectCsvStringifier } from 'csv-writer';
import { format, utcToZonedTime } from 'date-fns-tz';
import { withAuth } from '../../../../utils/withAuth';
import { ClientInvoice, Order, Request, Store } from '../../../../interfaces';
import { MemberBenefit } from '../../../../core/memberBenefits/types';
import database from '../../../../middleware/db';
import { store } from '../../../../db';
import {
  calculateStripeFee,
  calculateTotalItems,
  formatPhoneNumber,
  formatToMoney,
} from '../../../../utils';
import { hydrateOrderItemsWithArtworkId } from '../../../../utils/orderItem';
import { filterOrdersByView, OrderView } from '../../../../utils/store';
import {
  DEFAULT_INVOICE_GRACE_DAYS,
  formatBenefitAmount,
  orderAdjustments,
  orderBenefitAmount,
  orderInvoiceState,
} from '../../../../utils/memberBenefit';
import { clientInvoice, memberBenefit } from '../../../../db';

type Field = {
  id: number;
  field: string;
  checked: boolean;
};

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const queriedStore: Store = await store.getStoreById(req.db, req.query.id);

    const rawView = req.body.view;
    const viewFilter: OrderView =
      rawView === 'outstanding' || rawView === 'all' || rawView === undefined
        ? rawView ?? 'all'
        : Number(rawView);
    const groupFilter: string | undefined = req.body.groupFilter || undefined;
    const shippingFilter: string | undefined =
      req.body.shippingFilter || undefined;

    let scopedOrders = filterOrdersByView(
      queriedStore.orders ?? [],
      viewFilter
    );
    if (groupFilter || shippingFilter) {
      scopedOrders = scopedOrders.filter(o => {
        if (groupFilter && o.group !== groupFilter) return false;
        if (shippingFilter && o.shippingMethod !== shippingFilter) return false;
        return true;
      });
    }
    queriedStore.orders = scopedOrders;

    const headerFields = [
      { id: 'orderId', title: 'ORDER ID' },
      { id: 'date', title: 'DATE' },
      {
        id: queriedStore.groupTerm,
        title: queriedStore.groupTerm.toUpperCase(),
      },
      { id: 'customer.firstName', title: 'FIRST NAME' },
      { id: 'customer.lastName', title: 'LAST NAME' },
      { id: 'customer.email', title: 'EMAIL' },
      { id: 'customer.phone', title: 'PHONE' },
      { id: 'uniqueItems', title: 'UNIQUE ITEMS' },
      { id: 'totalItems', title: 'TOTAL ITEMS' },
      { id: 'orderStatus', title: 'ORDER STATUS' },
      { id: 'summary.subtotal', title: 'SUBTOTAL' },
      { id: 'summary.adjustments', title: 'DISCOUNTS & CREDITS' },
      { id: 'summary.shipping', title: 'SHIPPING' },
      { id: 'summary.salesTax', title: 'SALES TAX' },
      { id: 'summary.total', title: 'TOTAL' },
      { id: 'summary.stripeFee', title: 'STRIPE FEE' },
      { id: 'summary.netTotal', title: 'NET TOTAL' },
      { id: 'shippingMethod', title: 'SHIPPING METHOD' },
      { id: 'shippingAddress.street', title: 'STREET' },
      { id: 'shippingAddress.street2', title: 'STREET 2' },
      { id: 'shippingAddress.city', title: 'CITY' },
      { id: 'shippingAddress.state', title: 'STATE' },
      { id: 'shippingAddress.zipcode', title: 'ZIPCODE' },
      { id: 'stripeId', title: 'STRIPE ID' },
      { id: 'refund.card', title: 'REFUNDED TO CARD' },
      { id: 'benefit.name', title: 'MEMBER BENEFIT' },
      { id: 'benefit.email', title: 'MEMBER EMAIL' },
      { id: 'benefit.funding', title: 'FUNDED BY' },
      { id: 'benefit.invoice', title: 'CLIENT INVOICE' },
      { id: 'refund.creditRestored', title: 'CREDIT RESTORED' },
    ];

    const header = headerFields.filter(hf => {
      const field: Field = req.body.fields.find(
        (f: Field) => f.field === hf.id
      );
      if (field) {
        return field.checked;
      }
    });

    const csvStringifier = createObjectCsvStringifier({
      header,
    });

    // Benefit columns: each order's own benefit (a store's benefit can be
    // replaced), the invoices of those benefits, and the return window,
    // loaded once for the whole export.
    const benefitIds = Array.from(
      new Set(
        (queriedStore.orders ?? [])
          .map(o => o.benefit?.benefitId)
          .filter((id): id is string => Boolean(id))
      )
    );
    const benefitsById = new Map<string, MemberBenefit>();
    const invoicesById = new Map<string, ClientInvoice>();
    for (const benefitId of benefitIds) {
      const found = await memberBenefit.getById(req.db, benefitId);
      if (found) benefitsById.set(benefitId, found);
      for (const inv of await clientInvoice.listByBenefit(req.db, benefitId)) {
        invoicesById.set(inv._id, inv);
      }
    }
    const settings = await req.db.collection('shipping').findOne({});
    const graceDays =
      typeof settings?.invoiceGraceDays === 'number'
        ? settings.invoiceGraceDays
        : DEFAULT_INVOICE_GRACE_DAYS;
    const legacyEmail = (o: Order) =>
      o.sheboyganLutheranStaffDiscount?.email ??
      o.switchFitnessDiscount?.email ??
      o.teacherAppreciation?.email ??
      '';
    const invoiceColumn = (o: Order) => {
      if (o.clientInvoiceId) {
        const inv = invoicesById.get(o.clientInvoiceId);
        return inv
          ? `#${inv.number} (${inv.status === 'paid' ? 'Paid' : 'Open'})`
          : 'Invoiced';
      }
      if (o.clientInvoiceExcluded) {
        return `Excluded: ${o.clientInvoiceExcluded.reason}`;
      }
      if (!o.benefit) return '';
      if (benefitsById.get(o.benefit.benefitId)?.funding !== 'client') {
        return '';
      }
      const state = orderInvoiceState(o, graceDays);
      return state === 'eligible'
        ? 'Not invoiced'
        : state === 'grace' || state === 'awaiting'
        ? 'Not yet invoiceable'
        : '';
    };

    let records: any[];
    if (!queriedStore.orders || queriedStore.orders.length === 0) {
      records = [];
    } else {
      records = queriedStore.orders.map(order => {
        const zonedDate = utcToZonedTime(
          new Date(order.createdAt),
          'America/Chicago'
        );
        const createdAt = format(zonedDate, 'Pp', {
          timeZone: 'America/Chicago',
        });

        // The fee the storefront recorded; only very old orders lack it.
        const stripeFee =
          typeof order.summary.stripeFee === 'number'
            ? order.summary.stripeFee
            : calculateStripeFee(order.summary.total);
        const benefitAmount = orderBenefitAmount(order);

        return {
          orderId: order.orderId,
          date: createdAt,
          [queriedStore.groupTerm]: order.group,
          ['customer.firstName']: order.customer.firstName,
          ['customer.lastName']: order.customer.lastName,
          ['customer.email']: order.customer.email,
          ['customer.phone']: formatPhoneNumber(order.customer.phone),
          uniqueItems: order.items.length,
          totalItems: calculateTotalItems(order.items),
          orderStatus: order.orderStatus,
          ['summary.subtotal']: formatToMoney(order.summary.subtotal, true),
          ['summary.adjustments']: benefitAmount
            ? `-${formatToMoney(benefitAmount, true)}`
            : '',
          ['summary.shipping']: formatToMoney(order.summary.shipping, true),
          ['summary.salesTax']: formatToMoney(order.summary.salesTax, true),
          ['summary.total']: formatToMoney(order.summary.total, true),
          ['summary.stripeFee']: formatToMoney(stripeFee, true),
          ['summary.netTotal']: formatToMoney(
            order.summary.total - stripeFee,
            true
          ),
          shippingMethod: order.shippingMethod,
          ['shippingAddress.street']: order.shippingAddress.street,
          ['shippingAddress.street2']: order.shippingAddress.street2,
          ['shippingAddress.city']: order.shippingAddress.city,
          ['shippingAddress.state']: order.shippingAddress.state,
          ['shippingAddress.zipcode']: order.shippingAddress.zipcode,
          stripeId: order.stripeId,
          // Orders canceled before card refunds were tracked recorded only
          // `amount`, which is what went back to the card.
          ['refund.card']:
            (order.refund?.card ?? order.refund?.amount ?? 0) > 0
              ? formatToMoney(
                  order.refund?.card ?? order.refund?.amount ?? 0,
                  true
                )
              : '',
          ['benefit.name']:
            orderAdjustments(order).find(a => a.kind !== 'waived')?.label ?? '',
          ['benefit.email']: order.benefit?.email ?? legacyEmail(order),
          ['benefit.funding']: (() => {
            const used = order.benefit
              ? benefitsById.get(order.benefit.benefitId)
              : undefined;
            if (!used) return '';
            return used.funding === 'client' ? 'Client' : 'Macaport';
          })(),
          ['benefit.invoice']: invoiceColumn(order),
          ['refund.creditRestored']:
            order.refund?.creditRestored && order.benefit
              ? formatBenefitAmount(
                  order.benefit.type,
                  order.refund.creditRestored
                )
              : '',
        };
      });
    }

    let notesRows: Record<string, unknown>[] = [];

    if (req.body.fields.some((f: Field) => f.field === 'note' && f.checked)) {
      notesRows = queriedStore.orders.reduce(
        (notesRowsAcc: Record<string, unknown>[], currentOrder) => {
          const row = {
            [header[0].id]: 'ORDER NOTE',
            [header[1].id]: currentOrder.note ? `${currentOrder.note}` : '',
          };
          return [...notesRowsAcc, row];
        },
        []
      );
    }

    let orderItemsRows: Record<string, unknown>[][] = [];

    if (
      req.body.fields.some((f: Field) => f.field === 'orderItems' && f.checked)
    ) {
      // format rows of orderItems for every order
      orderItemsRows = queriedStore.orders.reduce(
        (orderItemsRowsAcc: Record<string, unknown>[][], currentOrder) => {
          let rows: Record<string, unknown>[] = [];

          const hydratedOrderItems = hydrateOrderItemsWithArtworkId(
            currentOrder.items,
            queriedStore.products
          );

          hydratedOrderItems.forEach((item, i) => {
            const itemRow = {
              [header[0].id]: `${i + 1}`,
              [header[1].id]: item.name,
              [header[2].id]: `${item.merchandiseCode}`, // TODO: should be merchandiseCode?
              [header[3].id]: `${item.sku.size.label}`,
              [header[4].id]: `${item.sku.color.label}`,
              [header[5].id]: `${formatToMoney(item.price, true)}`,
              [header[6].id]: `${item.quantity}`,
              [header[7].id]: `${formatToMoney(item.itemTotal, true)}`,
            };

            let personalizationAddonRows: Record<string, any>[] = [];
            const artworkId = {
              [header[0].id]: '',
              [header[1].id]: `Artwork ID: ${item.artworkId || 'Not provided'}`,
            };
            if (item.personalizationAddons.length > 0) {
              personalizationAddonRows = item.personalizationAddons.reduce(
                (accumulator: Record<string, any>[], currentAddon) => {
                  const baseAddonRow = {
                    [header[0].id]: '',
                    [header[1].id]: `${currentAddon.addon}: ${
                      currentAddon.value
                    } [${currentAddon.location.toLowerCase()}]`,
                  };

                  const subItemRows = currentAddon.subItems.map(subitem => {
                    return {
                      [header[0].id]: '',
                      [header[1].id]: `${subitem.addon}: ${
                        subitem.value
                      } [${subitem.location.toLowerCase()}]`,
                    };
                  });

                  return [...accumulator, baseAddonRow, ...subItemRows];
                },
                []
              );
            }

            rows = [...rows, itemRow, artworkId, ...personalizationAddonRows];
          });
          return [...orderItemsRowsAcc, rows];
        },
        []
      );

      const orderItemsHeaderRow = {
        [header[0].id]: 'ORDER ITEMS',
        [header[1].id]: 'NAME',
        [header[2].id]: 'MERCH CODE',
        [header[3].id]: 'SIZE',
        [header[4].id]: 'COLOR',
        [header[5].id]: 'ITEM PRICE',
        [header[6].id]: 'QUANTITY',
        [header[7].id]: 'ITEM TOTAL',
      };

      const blankRow = header.map(h => ({ [h.id]: '' }));

      const updatedRecords = records.reduce((acc, currentRecord, i) => {
        const noteRowData = notesRows[i][header[1].id];

        return [
          ...acc,
          currentRecord,
          noteRowData ? notesRows[i] : undefined,
          orderItemsHeaderRow,
          ...orderItemsRows[i],
          { ...blankRow },
          { ...blankRow },
        ];
      }, []);

      records = updatedRecords.filter((r: unknown) => !!r);
    }

    const encodedCSVData = encodeURIComponent(
      csvStringifier.stringifyRecords(records)
    );

    res.json({
      success: true,
      csv: `${csvStringifier.getHeaderString()} ${encodedCSVData}`,
    });
  });

export default withAuth(handler);
