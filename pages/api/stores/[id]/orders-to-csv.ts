import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { createObjectCsvStringifier } from 'csv-writer';
import { format, utcToZonedTime } from 'date-fns-tz';
import { withAuth } from '../../../../utils/withAuth';
import { Request, Store } from '../../../../interfaces';
import database from '../../../../middleware/db';
import { store } from '../../../../db';
import {
  calculateStripeFee,
  calculateTotalItems,
  formatPhoneNumber,
  formatToMoney,
} from '../../../../utils';

type Field = {
  id: number;
  field: string;
  checked: boolean;
};

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const data: Store = await store.getStoreById(req.db, req.query.id);

    const headerFields = [
      { id: 'orderId', title: 'ORDER ID' },
      { id: 'date', title: 'DATE' },
      { id: data.groupTerm, title: data.groupTerm.toUpperCase() },
      { id: 'customer.firstName', title: 'FIRST NAME' },
      { id: 'customer.lastName', title: 'LAST NAME' },
      { id: 'customer.email', title: 'EMAIL' },
      { id: 'customer.phone', title: 'PHONE' },
      { id: 'uniqueItems', title: 'UNIQUE ITEMS' },
      { id: 'totalItems', title: 'TOTAL ITEMS' },
      { id: 'orderStatus', title: 'ORDER STATUS' },
      { id: 'summary.subtotal', title: 'SUBTOTAL' },
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

    let records: any[];
    if (!data.orders || data.orders.length === 0) {
      records = [];
    } else {
      records = data.orders.map(order => {
        const zonedDate = utcToZonedTime(
          new Date(order.createdAt),
          'America/Chicago'
        );
        const createdAt = format(zonedDate, 'Pp', {
          timeZone: 'America/Chicago',
        });

        return {
          orderId: order.orderId,
          date: createdAt,
          [data.groupTerm]: order.group,
          ['customer.firstName']: order.customer.firstName,
          ['customer.lastName']: order.customer.lastName,
          ['customer.email']: order.customer.email,
          ['customer.phone']: formatPhoneNumber(order.customer.phone),
          uniqueItems: order.items.length,
          totalItems: calculateTotalItems(order.items),
          orderStatus: order.orderStatus,
          ['summary.subtotal']: formatToMoney(order.summary.subtotal, true),
          ['summary.shipping']: formatToMoney(order.summary.shipping, true),
          ['summary.salesTax']: formatToMoney(order.summary.salesTax, true),
          ['summary.total']: formatToMoney(order.summary.total, true),
          ['summary.stripeFee']: formatToMoney(
            calculateStripeFee(order.summary.total),
            true
          ),
          ['summary.netTotal']: formatToMoney(
            order.summary.total - calculateStripeFee(order.summary.total),
            true
          ),
          shippingMethod: order.shippingMethod,
          ['shippingAddress.street']: order.shippingAddress.street,
          ['shippingAddress.street2']: order.shippingAddress.street2,
          ['shippingAddress.city']: order.shippingAddress.city,
          ['shippingAddress.state']: order.shippingAddress.state,
          ['shippingAddress.zipcode']: order.shippingAddress.zipcode,
          stripeId: order.stripeId,
        };
      });
    }

    let orderItemsRows: Record<string, unknown>[][] = [];

    if (
      req.body.fields.some((f: Field) => f.field === 'orderItems' && f.checked)
    ) {
      // format rows of orderItems for every order
      orderItemsRows = data.orders.reduce(
        (orderItemsRowsAcc: Record<string, unknown>[][], currentOrder) => {
          let rows: Record<string, unknown>[] = [];
          currentOrder.items.forEach((item, i) => {
            const itemRow = {
              [header[0].id]: `${i + 1}`,
              [header[1].id]: item.name,
              [header[2].id]: `${item.merchandiseCode}`, // TODO: should be merchandiseCode?
              [header[3].id]: `${item.sku.size.label}`,
              [header[4].id]: `${item.sku.color.label}`,
              [header[5].id]: `${formatToMoney(item.price, true)}`,
              [header[6].id]: `${item.quantity}`,
              [header[7].id]: `${formatToMoney(item.itemTotal, true)}`,
              [header[8].id]: `${item.customName ? item.customName : '-'}`,
              [header[9].id]: `${item.customNumber ? item.customNumber : '-'}`,
            };
            rows = [...rows, itemRow];
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
        [header[8].id]: 'CUSTOM NAME',
        [header[9].id]: 'CUSTOM NUMBER',
      };

      const blankRow = header.map(h => ({ [h.id]: '' }));

      const updatedRecords = records.reduce((acc, currentRecord, i) => {
        return [
          ...acc,
          currentRecord,
          orderItemsHeaderRow,
          ...orderItemsRows[i],
          { ...blankRow },
          { ...blankRow },
        ];
      }, []);

      records = updatedRecords;
    }

    res.json({
      success: true,
      test: orderItemsRows,
      csv: `${csvStringifier.getHeaderString()} ${csvStringifier.stringifyRecords(
        records
      )}`,
    });
  });

export default withAuth(handler);
