import React from 'react';
import styled from 'styled-components';
import { Order, Store } from '../../../interfaces';
import { useTeacherAppreciationQuery } from '../../../hooks/useTeacherAppreciationQuery';
import { useTeacherAppreciationMutations } from '../../../hooks/useTeacherAppreciationMutations';
import LoadingSpinner from '../../LoadingSpinner';
import ResetUsedEmailModal from './ResetUsedEmailModal';
import RemoveEligibleEmailModal from './RemoveEligibleEmailModal';
import ProgramActiveModal from './ProgramActiveModal';
import AddEligibleEmailsModal from './AddEligibleEmailsModal';

type Props = {
  store: Store;
};

function downloadCsv(filename: string, header: string, rows: string[]) {
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TeacherAppreciationPanel({ store }: Props) {
  const enabled = Boolean(store.teacherAppreciationId);
  const query = useTeacherAppreciationQuery(store._id, enabled);
  const { addEligibleEmails, removeEligibleEmail, resetUsedEmail, setActive } =
    useTeacherAppreciationMutations({ storeId: store._id });

  const [search, setSearch] = React.useState('');
  const [emailToReset, setEmailToReset] = React.useState<string | null>(null);
  const [emailToRemove, setEmailToRemove] = React.useState<string | null>(null);
  const [showActiveModal, setShowActiveModal] = React.useState(false);
  const [showAddEmailsModal, setShowAddEmailsModal] = React.useState(false);

  if (!enabled) return null;

  if (query.isLoading) {
    return (
      <PanelStyles>
        <div className="loading">
          <LoadingSpinner isLoading />
        </div>
      </PanelStyles>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PanelStyles>
        <h3 className="title">Teacher Appreciation</h3>
        <div className="error">
          Could not load teacher appreciation data for this store.
        </div>
      </PanelStyles>
    );
  }

  const ta = query.data;
  const eligibleCount = ta.eligibleEmails.length;
  const usedCount = ta.usedEmails.length;
  const total = eligibleCount + usedCount;
  const usedPct = total === 0 ? 0 : Math.round((usedCount / total) * 100);

  const searchLower = search.trim().toLowerCase();
  const filteredEligible = ta.eligibleEmails
    .filter(e => e.toLowerCase().includes(searchLower))
    .sort((a, b) => a.localeCompare(b));

  const filteredUsed = ta.usedEmails
    .filter(e => e.toLowerCase().includes(searchLower))
    .sort((a, b) => a.localeCompare(b));

  const findLinkedOrders = (email: string): Order[] => {
    const matches =
      store.orders?.filter(
        o =>
          o.teacherAppreciation?.email?.toLowerCase() === email.toLowerCase()
      ) || [];
    return [...matches].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const handleAddEmails = (emails: string[]) => {
    addEligibleEmails.mutate(emails, {
      onSuccess: () => setShowAddEmailsModal(false),
    });
  };

  const handleConfirmReset = () => {
    if (!emailToReset) return;
    resetUsedEmail.mutate(emailToReset, {
      onSuccess: () => setEmailToReset(null),
    });
  };

  const handleConfirmRemove = () => {
    if (!emailToRemove) return;
    removeEligibleEmail.mutate(emailToRemove, {
      onSuccess: () => setEmailToRemove(null),
    });
  };

  const handleConfirmToggleActive = () => {
    setActive.mutate(!ta.active, {
      onSuccess: () => setShowActiveModal(false),
    });
  };

  return (
    <PanelStyles>
      <div className="header">
        <div className="title-row">
          <h3 className="title">Teacher Appreciation</h3>
          <span className={`status-pill ${ta.active ? 'active' : 'paused'}`}>
            {ta.active ? 'Active' : 'Paused'}
          </span>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="header-button"
            onClick={() => setShowAddEmailsModal(true)}
          >
            + Add emails
          </button>
          <button
            type="button"
            className={`toggle-button ${ta.active ? 'pause' : 'resume'}`}
            onClick={() => setShowActiveModal(true)}
            disabled={setActive.isLoading}
          >
            {ta.active ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zm6 0a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M6.3 4.16a1 1 0 011.05.05l8 5a1 1 0 010 1.69l-8 5A1 1 0 016 15V5a1 1 0 01.3-.84z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {ta.active ? 'Pause program' : 'Resume program'}
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">{eligibleCount}</div>
          <div className="stat-label">Eligible</div>
        </div>
        <div className="stat">
          <div className="stat-value">{usedCount}</div>
          <div className="stat-label">Used</div>
        </div>
        <div className="stat">
          <div className="stat-value">{usedPct}%</div>
          <div className="stat-label">Redemption rate</div>
        </div>
      </div>

      <div className="search-row">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search across both lists..."
        />
        {searchLower && (
          <span className="search-summary">
            {filteredEligible.length} eligible · {filteredUsed.length} used
          </span>
        )}
      </div>

      <div className="lists">
        <div className="list-column">
          <div className="list-header">
            <h4>
              Eligible (
              {searchLower
                ? `${filteredEligible.length} of ${eligibleCount}`
                : eligibleCount}
              )
            </h4>
            <button
              type="button"
              className="text-button"
              disabled={filteredEligible.length === 0}
              onClick={() =>
                downloadCsv(
                  `teacher-appreciation-eligible${
                    searchLower ? '-filtered' : ''
                  }-${store._id}.csv`,
                  'email',
                  filteredEligible
                )
              }
            >
              {searchLower
                ? `Export ${filteredEligible.length} filtered`
                : 'Export CSV'}
            </button>
          </div>
          <ul className="email-list">
            {filteredEligible.length === 0 && (
              <li className="empty">
                {eligibleCount === 0 ? 'No eligible emails.' : 'No matches.'}
              </li>
            )}
            {filteredEligible.map(email => (
              <li key={email}>
                <span className="email">{email}</span>
                <button
                  type="button"
                  className="row-button"
                  aria-label={`Remove ${email}`}
                  onClick={() => setEmailToRemove(email)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="list-column">
          <div className="list-header">
            <h4>
              Used (
              {searchLower
                ? `${filteredUsed.length} of ${usedCount}`
                : usedCount}
              )
            </h4>
            <button
              type="button"
              className="text-button"
              disabled={filteredUsed.length === 0}
              onClick={() =>
                downloadCsv(
                  `teacher-appreciation-used${
                    searchLower ? '-filtered' : ''
                  }-${store._id}.csv`,
                  'email',
                  filteredUsed
                )
              }
            >
              {searchLower
                ? `Export ${filteredUsed.length} filtered`
                : 'Export CSV'}
            </button>
          </div>
          <ul className="email-list">
            {filteredUsed.length === 0 && (
              <li className="empty">
                {usedCount === 0 ? 'No used emails yet.' : 'No matches.'}
              </li>
            )}
            {filteredUsed.map(email => {
              const orders = findLinkedOrders(email);
              const latest = orders[0];
              return (
                <li key={email}>
                  <div className="used-info">
                    <span className="email">{email}</span>
                    {latest ? (
                      <span className="order-ref">
                        Order {latest.orderId} · {latest.orderStatus}
                        {orders.length > 1 && ` · +${orders.length - 1} more`}
                      </span>
                    ) : (
                      <span className="order-ref muted">No linked order</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="row-button"
                    onClick={() => setEmailToReset(email)}
                  >
                    Reset
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {emailToReset && (
        <ResetUsedEmailModal
          email={emailToReset}
          linkedOrders={findLinkedOrders(emailToReset)}
          storeId={store._id}
          isLoading={resetUsedEmail.isLoading}
          errorMessage={
            resetUsedEmail.isError
              ? (resetUsedEmail.error as Error)?.message
              : undefined
          }
          onConfirm={handleConfirmReset}
          onCancel={() => {
            resetUsedEmail.reset();
            setEmailToReset(null);
          }}
        />
      )}

      {emailToRemove && (
        <RemoveEligibleEmailModal
          email={emailToRemove}
          isLoading={removeEligibleEmail.isLoading}
          errorMessage={
            removeEligibleEmail.isError
              ? (removeEligibleEmail.error as Error)?.message
              : undefined
          }
          onConfirm={handleConfirmRemove}
          onCancel={() => {
            removeEligibleEmail.reset();
            setEmailToRemove(null);
          }}
        />
      )}

      {showActiveModal && (
        <ProgramActiveModal
          nextActive={!ta.active}
          isLoading={setActive.isLoading}
          errorMessage={
            setActive.isError
              ? (setActive.error as Error)?.message
              : undefined
          }
          onConfirm={handleConfirmToggleActive}
          onCancel={() => {
            setActive.reset();
            setShowActiveModal(false);
          }}
        />
      )}

      {showAddEmailsModal && (
        <AddEligibleEmailsModal
          existingEligible={ta.eligibleEmails}
          existingUsed={ta.usedEmails}
          isLoading={addEligibleEmails.isLoading}
          errorMessage={
            addEligibleEmails.isError
              ? (addEligibleEmails.error as Error)?.message
              : undefined
          }
          onSubmit={handleAddEmails}
          onCancel={() => {
            addEligibleEmails.reset();
            setShowAddEmailsModal(false);
          }}
        />
      )}
    </PanelStyles>
  );
}

const PanelStyles = styled.div`
  position: relative;
  margin: 1.875rem 0 0;
  padding: 1.625rem 1.75rem 1.5rem;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.4375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

  .loading,
  .error {
    padding: 2rem;
    text-align: center;
    color: #6b7280;
  }

  .header {
    margin: 0 0 1rem;
    padding: 0 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .status-pill {
    padding: 0.25rem 0.5rem;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.075em;
    border-radius: 0.25rem;
    line-height: 1;
  }

  .status-pill.active {
    color: #065f46;
    background-color: #d1fae5;
  }

  .status-pill.paused {
    color: #991b1b;
    background-color: #fee2e2;
  }

  .toggle-button {
    padding: 0.5rem 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4375rem;
    font-size: 0.8125rem;
    font-weight: 500;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 150ms linear, border-color 150ms linear;
  }

  .toggle-button svg {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  .toggle-button.pause {
    color: #1f2937;
    background-color: #fff;
    border: 1px solid #d1d5db;
  }

  .toggle-button.pause:hover:not(:disabled) {
    color: #000;
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }

  .toggle-button.resume {
    color: #fff;
    background-color: #111827;
    border: none;
  }

  .toggle-button.resume:hover:not(:disabled) {
    background-color: #000;
  }

  .toggle-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .toggle-button:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  .toggle-button:focus-visible {
    text-decoration: underline;
  }

  .stats {
    margin: 0 0 1.5rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat {
    padding: 0.875rem 1rem;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    line-height: 1.1;
  }

  .stat-label {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  input[type='search'] {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: #111827;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: none;
    font-family: inherit;
  }

  input[type='search']:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    border-color: #1c44b9;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
      #1c44b9 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .header-button {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #1f2937;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: color 150ms linear, background-color 150ms linear,
      border-color 150ms linear;
  }

  .header-button:hover {
    color: #000;
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }

  .header-button:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  .header-button:focus-visible {
    text-decoration: underline;
  }

  .text-button {
    padding: 0;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #4b5563;
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  .text-button:hover:not(:disabled) {
    color: #1c44b9;
    text-decoration: underline;
  }

  .text-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .search-row {
    margin: 0 0 1rem;
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .search-row input[type='search'] {
    flex: 1;
  }

  .search-summary {
    font-size: 0.8125rem;
    color: #4b5563;
    flex-shrink: 0;
  }

  .lists {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .list-column .list-header {
    margin: 0 0 0.5rem;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .list-header h4 {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #111827;
  }

  .email-list {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 22rem;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
  }

  .email-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.8125rem;
  }

  .email-list li:last-child {
    border-bottom: none;
  }

  .email-list li.empty {
    color: #9ca3af;
    justify-content: center;
    padding: 1.25rem;
  }

  .email {
    color: #111827;
    word-break: break-all;
  }

  .used-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .order-ref {
    font-size: 0.75rem;
    color: #4b5563;
  }

  .order-ref.muted {
    color: #9ca3af;
    font-style: italic;
  }

  .row-button {
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4b5563;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 0.5rem;
    transition: color 150ms linear, background-color 150ms linear,
      border-color 150ms linear;
  }

  .row-button:hover {
    color: #111827;
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }

  @media (max-width: 800px) {
    padding: 1.25rem 1.25rem 1.125rem;

    .header {
      flex-wrap: wrap;
      gap: 0.875rem;
    }

    .lists {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .email-list {
      max-height: 18rem;
    }
  }
`;
