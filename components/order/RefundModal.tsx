import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { useQuery } from 'react-query';
import { Order, Store } from '../../interfaces';
import useOutsideClick from '../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../hooks/useEscapeKeydownClose';
import { useBenefitQuery } from '../../hooks/useBenefitQuery';
import { useRefundMutation } from '../../hooks/useRefundMutation';
import { fetchShippingData } from '../../queries/fetchShippingData';
import { formatToMoney } from '../../utils';
import {
  adminRefundSentence,
  applyChoices,
  computeRefund,
  RefundInput,
  RefundSplit,
  restoredPhrase,
} from '../../utils/refund';
import {
  memberDisplayName,
  normalizeEmail,
  parseDollars,
} from '../../utils/memberBenefit';
import { ModalStyles, ModalSpinner } from '../modals/modalStyles';

type Props = {
  order: Order;
  store: Store;
  closeModal: () => void;
};

// The credit side of a refund. Macaport refunds the card in Stripe by hand;
// this works out how much that should be and how much goes back onto the
// member's allowance, then records it and emails the customer.
export default function RefundModal({ order, store, closeModal }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [mode, setMode] = React.useState<'items' | 'amount'>('items');
  const [quantities, setQuantities] = React.useState<Record<string, string>>(
    {}
  );
  const [amountInput, setAmountInput] = React.useState('');
  const [restoreCredit, setRestoreCredit] = React.useState(true);
  const [restock, setRestock] = React.useState<Set<string>>(
    () => new Set(order.items.map(i => i.id))
  );
  const [done, setDone] = React.useState<{
    split: RefundSplit;
    emailed: boolean;
    redirectedTo: string | null;
    restocked: number;
  } | null>(null);

  const refund = useRefundMutation({ order, store });
  const busy = refund.isLoading;

  // A stray click outside must not throw away the picked quantities.
  useOutsideClick(true, closeModal, ref, true);
  useEscapeKeydownClose(true, closeModal, busy);

  const benefitQuery = useBenefitQuery(store._id, Boolean(order.benefit));
  const shippingQuery = useQuery(['shipping'], fetchShippingData, {
    staleTime: 1000 * 60 * 10,
  });

  const alreadyReturned = new Map(
    (order.refund?.returnedItems ?? []).map(r => [r.id, r.quantity])
  );

  const input: RefundInput | null = React.useMemo(() => {
    if (mode === 'amount') {
      const cents = parseDollars(amountInput);
      if (cents === null) return null;
      return { mode: 'amount', amount: cents };
    }
    const returnedItems = order.items
      .map(item => ({
        id: item.id,
        quantity: Math.min(
          Math.max(0, Math.floor(Number(quantities[item.id] || 0))),
          item.quantity - (alreadyReturned.get(item.id) ?? 0)
        ),
      }))
      .filter(r => r.quantity > 0);
    if (returnedItems.length === 0) return null;
    return { mode: 'items', returnedItems };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, amountInput, quantities, order]);

  const ready =
    shippingQuery.data && (!order.benefit || benefitQuery.data !== undefined);

  const computed =
    ready && input && shippingQuery.data
      ? computeRefund(
          {
            order,
            benefit: order.benefit ? benefitQuery.data ?? null : null,
            shipping: shippingQuery.data,
          },
          input
        )
      : null;
  const split = computed
    ? applyChoices(computed, { restoreCredit, restock: [] })
    : null;
  const restockIds =
    input?.mode === 'items'
      ? input.returnedItems.map(r => r.id).filter(id => restock.has(id))
      : [];

  const member = order.benefit
    ? benefitQuery.data?.members.find(
        m =>
          normalizeEmail(m.email) === normalizeEmail(order.benefit?.email ?? '')
      )
    : undefined;
  const memberName = member
    ? memberDisplayName(member)
    : `${order.customer.firstName} ${order.customer.lastName}`.trim();

  const moneyMoves = Boolean(
    split && (split.card > 0 || split.creditRestored > 0)
  );
  const sentence = split
    ? moneyMoves
      ? adminRefundSentence(split, memberName)
      : restockIds.length > 0
      ? `Nothing goes back to the card or to ${memberName}. ${
          restockIds.length
        } returned item${restockIds.length === 1 ? '' : 's'} go${
          restockIds.length === 1 ? 'es' : ''
        } back into inventory.`
      : 'Nothing to refund.'
    : null;
  const nothing =
    split &&
    split.card === 0 &&
    split.creditRestored === 0 &&
    restockIds.length === 0;

  const handleConfirm = () => {
    if (!input) return;
    refund.mutate(
      { ...input, restoreCredit, restock: restockIds },
      {
        onSuccess: data =>
          setDone({
            split: data.split,
            emailed: data.emailed,
            redirectedTo: data.redirectedTo,
            restocked: data.restocked,
          }),
      }
    );
  };

  const previousCard = order.refund?.card ?? 0;
  const previousRestored = order.refund?.creditRestored ?? 0;

  return (
    <ModalStyles>
      <div ref={ref} className="modal wide">
        <button
          type="button"
          className="close-button"
          onClick={closeModal}
          disabled={busy}
          aria-label="Close"
        >
          <XMarkIcon aria-hidden="true" />
        </button>
        <h3>Refund calculator</h3>

        {done ? (
          <>
            <section className="form-section">
              <div className="section-head">
                <h4>Recorded</h4>
                <p>
                  On order <strong>#{order.orderId}</strong>.
                  {done.split.card > 0 || done.split.creditRestored > 0
                    ? done.emailed
                      ? ' The customer has been emailed.'
                      : ' The customer email failed to send; tell them by hand.'
                    : ' Nothing changed for the customer, so no email was sent.'}
                  {done.restocked > 0
                    ? ` ${done.restocked} item${
                        done.restocked === 1 ? '' : 's'
                      } went back into inventory.`
                    : ''}
                </p>
              </div>
              {done.redirectedTo && (
                <p className="hint warn-hint">
                  Test environment: the customer email went to{' '}
                  {done.redirectedTo} instead of {order.customer.email}. That is
                  the setup, not a fault.
                </p>
              )}
              {(done.split.card > 0 || done.split.creditRestored > 0) && (
                <div className="sentence">
                  {adminRefundSentence(done.split, memberName)}
                </div>
              )}
            </section>
            <div className="form-footer">
              <p className="footer-note">
                {done.split.card > 0
                  ? 'The card refund still needs to be made in Stripe.'
                  : 'No card refund is needed.'}
              </p>
              <div className="buttons">
                <button
                  type="button"
                  className="primary-button"
                  onClick={closeModal}
                >
                  Done
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <fieldset className="form-fields" disabled={busy}>
              <section className="form-section">
                <div className="section-head">
                  <h4>What is coming back</h4>
                  <p>
                    Pick the returned items, or enter an amount when it is not a
                    return.
                  </p>
                </div>

                {(previousCard > 0 || previousRestored > 0) && (
                  <div className="summary-box" style={{ margin: '0 0 1rem' }}>
                    <div className="row">
                      <span className="muted">Already refunded to card</span>
                      <span>{formatToMoney(previousCard, true)}</span>
                    </div>
                    {order.benefit && (
                      <div className="row">
                        <span className="muted">Already restored</span>
                        <span>
                          {restoredPhrase(order.benefit.type, previousRestored)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="field">
                  <div className="option-cards" role="radiogroup">
                    <label
                      htmlFor="refund-mode-items"
                      aria-label="Returned items"
                      className={`option-card${
                        mode === 'items' ? ' selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        id="refund-mode-items"
                        name="refund-mode"
                        checked={mode === 'items'}
                        onChange={() => setMode('items')}
                      />
                      <span className="option-body">
                        <span className="option-label">Returned items</span>
                        <span className="option-description">
                          The split comes from re-pricing what the customer
                          kept.
                        </span>
                      </span>
                    </label>
                    <label
                      htmlFor="refund-mode-amount"
                      aria-label="An amount"
                      className={`option-card${
                        mode === 'amount' ? ' selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        id="refund-mode-amount"
                        name="refund-mode"
                        checked={mode === 'amount'}
                        onChange={() => setMode('amount')}
                      />
                      <span className="option-body">
                        <span className="option-label">An amount</span>
                        <span className="option-description">
                          Card first, up to what it paid, then the member&apos;s
                          credit.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                {mode === 'items' ? (
                  <table className="item-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="num">Ordered</th>
                        <th className="num">Returned before</th>
                        <th className="num">Returning now</th>
                        <th className="num">Back to inventory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => {
                        const before = alreadyReturned.get(item.id) ?? 0;
                        const max = item.quantity - before;
                        return (
                          <tr key={item.id}>
                            <td>
                              {item.name}
                              <span className="sub">
                                {item.sku.color.label} · {item.sku.size.label} ·{' '}
                                {formatToMoney(item.price, true)} each
                              </span>
                            </td>
                            <td className="num">{item.quantity}</td>
                            <td className="num">{before}</td>
                            <td className="num">
                              <input
                                type="number"
                                min={0}
                                max={max}
                                step={1}
                                value={quantities[item.id] ?? ''}
                                placeholder="0"
                                disabled={max === 0}
                                aria-label={`Quantity of ${item.name} returning`}
                                onChange={e =>
                                  setQuantities(q => ({
                                    ...q,
                                    [item.id]: e.target.value,
                                  }))
                                }
                              />
                            </td>
                            <td className="num">
                              <input
                                type="checkbox"
                                checked={restock.has(item.id)}
                                disabled={
                                  max === 0 ||
                                  !(Number(quantities[item.id] || 0) > 0)
                                }
                                aria-label={`Put returned ${item.name} back into inventory`}
                                onChange={e =>
                                  setRestock(prev => {
                                    const next = new Set(prev);
                                    if (e.target.checked) next.add(item.id);
                                    else next.delete(item.id);
                                    return next;
                                  })
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="field">
                    <label htmlFor="refund-amount">Amount</label>
                    <div className="adorned prefix">
                      <span className="adornment">$</span>
                      <input
                        id="refund-amount"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="0.00"
                        value={amountInput}
                        onChange={e => setAmountInput(e.target.value)}
                      />
                    </div>
                    {amountInput.trim() &&
                      parseDollars(amountInput) === null && (
                        <p className="hint error-hint">
                          Enter a dollar amount like 25 or 24.99.
                        </p>
                      )}
                  </div>
                )}
              </section>

              <section className="form-section">
                <div className="section-head">
                  <h4>The split</h4>
                  <p>
                    What goes back to the card, and what goes back onto the
                    member&apos;s allowance.
                  </p>
                </div>

                {shippingQuery.isSuccess && !shippingQuery.data && (
                  <p className="hint error-hint">
                    Store settings have not been set up yet. Save them from the
                    settings menu next to Search, then reopen this calculator.
                  </p>
                )}
                {!ready &&
                  (shippingQuery.isLoading || benefitQuery.isLoading) && (
                    <p className="hint">Loading pricing details...</p>
                  )}

                {!split && ready && (
                  <p className="hint">
                    {mode === 'items'
                      ? 'Enter a returning quantity on at least one item.'
                      : 'Enter an amount.'}
                  </p>
                )}

                {computed && computed.creditRestored > 0 && (
                  <div className="field">
                    <div className="checkbox-row">
                      <label htmlFor="refund-restore-credit">
                        <input
                          id="refund-restore-credit"
                          type="checkbox"
                          checked={restoreCredit}
                          onChange={e => setRestoreCredit(e.target.checked)}
                        />
                        Restore{' '}
                        {restoredPhrase(
                          computed.benefitType,
                          computed.creditRestored
                        )}{' '}
                        to {memberName}
                      </label>
                    </div>
                    <p className="hint">
                      Untick if the member has left or the program has ended.
                      The card refund is unaffected.
                    </p>
                  </div>
                )}

                {split && (
                  <div className="summary-box" style={{ margin: 0 }}>
                    <div className="row">
                      <span className="muted">Card paid</span>
                      <span>{formatToMoney(split.cardPaid, true)}</span>
                    </div>
                    {mode === 'items' && (
                      <div className="row">
                        <span className="muted">
                          Re-priced total of what is kept
                        </span>
                        <span>{formatToMoney(split.repricedTotal, true)}</span>
                      </div>
                    )}
                    <div className="row">
                      <span className="muted">Refund to card</span>
                      <span>{formatToMoney(split.card, true)}</span>
                    </div>
                    {split.benefitType && (
                      <div className="row">
                        <span className="muted">
                          Restore to {split.benefitLabel}
                        </span>
                        <span>
                          {restoredPhrase(
                            split.benefitType,
                            split.creditRestored
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {sentence && (
                  <div className={`sentence${nothing ? ' muted' : ''}`}>
                    {sentence}
                  </div>
                )}
              </section>
            </fieldset>

            {refund.isError && (
              <div className="error-message">
                {(refund.error as Error)?.message}
              </div>
            )}

            <div className="form-footer">
              <p className="footer-note">
                Confirming restores the credit, records the refund on the order,
                and emails the customer. It does not touch Stripe.
              </p>
              <div className="buttons">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleConfirm}
                  disabled={!split || nothing || busy}
                >
                  {busy ? 'Recording...' : 'Confirm refund'}
                </button>
              </div>
            </div>
            <ModalSpinner isLoading={busy} />
          </>
        )}
      </div>
    </ModalStyles>
  );
}
