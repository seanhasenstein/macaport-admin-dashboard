import React from 'react';
import styled from 'styled-components';
import {
  MemberBenefit,
  MemberBenefitMember,
} from '../../../core/memberBenefits/types';
import { Store } from '../../../interfaces';
import { useQuery } from 'react-query';
import { useBenefitQuery } from '../../../hooks/useBenefitQuery';
import { fetchShippingData } from '../../../queries/fetchShippingData';
import { useBenefitMutations } from '../../../hooks/useBenefitMutations';
import {
  benefitFormValues,
  benefitTypeLabel,
  buildUsageReport,
  DEFAULT_INVOICE_GRACE_DAYS,
  downloadCsv,
  formatBenefitAmount,
  invoiceTotals,
  memberUsage,
  orderNetBenefitAmount,
  splitOrdersForInvoicing,
} from '../../../utils/memberBenefit';
import { formatToMoney } from '../../../utils';
import LoadingSpinner from '../../LoadingSpinner';
import {
  uploadBenefitLogo,
  validateLogoFile,
} from '../../../utils/benefitLogo';
import BenefitFormModal from './BenefitFormModal';
import AddMembersModal from './AddMembersModal';
import BenefitActiveModal from './BenefitActiveModal';
import DeleteBenefitModal from './DeleteBenefitModal';
import RemoveMemberModal from './RemoveMemberModal';
import EndBenefitModal from './EndBenefitModal';
import RestoreUsedModal from './RestoreUsedModal';
import AllowanceModal from './AllowanceModal';
import MemberRow from './MemberRow';
import InvoicingSection from './InvoicingSection';
import BenefitMenu from './BenefitMenu';

type Props = {
  store: Store;
};

type Tab = 'members' | 'invoicing' | 'card';
type MemberSort = 'email' | 'used' | 'remaining';
type MemberFilter = 'all' | 'used' | 'unused' | 'override';

type MemberModal =
  | { kind: 'restore'; member: MemberBenefitMember }
  | { kind: 'allowance'; member: MemberBenefitMember }
  | { kind: 'remove'; member: MemberBenefitMember }
  | { kind: 'end'; member: MemberBenefitMember }
  | null;

function errorOf(mutation: { isError: boolean; error: unknown }) {
  return mutation.isError ? (mutation.error as Error)?.message : undefined;
}

export default function BenefitPanel({ store }: Props) {
  const enabled = Boolean(store.benefitId);
  const query = useBenefitQuery(store._id, enabled);
  const mutations = useBenefitMutations({ storeId: store._id });
  const settingsQuery = useQuery(['shipping'], fetchShippingData, {
    staleTime: 1000 * 60 * 10,
    enabled,
  });

  const [showForm, setShowForm] = React.useState(false);
  const [showAddMembers, setShowAddMembers] = React.useState(false);
  const [showActive, setShowActive] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [memberModal, setMemberModal] = React.useState<MemberModal>(null);
  const [search, setSearch] = React.useState('');
  const [tab, setTab] = React.useState<Tab>('members');
  const [sort, setSort] = React.useState<MemberSort>('email');
  const [filter, setFilter] = React.useState<MemberFilter>('all');
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const [logoBusy, setLogoBusy] = React.useState(false);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [confirmRemoveLogo, setConfirmRemoveLogo] = React.useState(false);

  const closeForm = () => {
    mutations.createBenefit.reset();
    mutations.updateBenefit.reset();
    setShowForm(false);
  };
  const closeMemberModal = () => {
    mutations.restoreUsed.reset();
    mutations.setAllowance.reset();
    mutations.removeMember.reset();
    mutations.endMember.reset();
    setMemberModal(null);
  };

  if (!enabled) {
    return (
      <PanelStyles>
        <div className="header">
          <div className="title-row">
            <h3 className="title">Member benefit</h3>
          </div>
          <button
            type="button"
            className="header-button"
            onClick={() => setShowForm(true)}
          >
            + Create member benefit
          </button>
        </div>
        <p className="empty-copy">
          This store has no member benefit. A benefit gives a list of people a
          store credit, a fixed discount, or a free item, verified by an emailed
          code at checkout.
        </p>
        {showForm && (
          <BenefitFormModal
            store={store}
            isLoading={mutations.createBenefit.isLoading}
            errorMessage={errorOf(mutations.createBenefit)}
            onSubmit={values =>
              mutations.createBenefit.mutate(values, { onSuccess: closeForm })
            }
            onCancel={closeForm}
          />
        )}
      </PanelStyles>
    );
  }

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
        <h3 className="title">Member benefit</h3>
        <div className="error">
          This store points at a member benefit that could not be loaded.
        </div>
      </PanelStyles>
    );
  }

  const benefit: MemberBenefit = query.data;
  const orders = store.orders ?? [];
  const report = buildUsageReport(benefit, orders);
  const products = benefit.productIds
    ? benefit.productIds.map(
        id => store.products.find(p => p.id === id)?.name ?? id
      )
    : null;

  // The logo saves on its own, through the same update route as the edit
  // form, with every other field left as it is.
  const saveLogo = (logo: string) => {
    setLogoError(null);
    setLogoBusy(true);
    mutations.updateBenefit.mutate(
      { ...benefitFormValues(benefit), logo },
      {
        onError: err =>
          setLogoError(err instanceof Error ? err.message : 'Save failed.'),
        onSettled: () => setLogoBusy(false),
      }
    );
  };

  const handleLogoFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = validateLogoFile(file);
    if (problem) {
      setLogoError(problem);
      return;
    }
    setLogoError(null);
    setLogoBusy(true);
    try {
      const url = await uploadBenefitLogo(store._id, file);
      saveLogo(url);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Upload failed.');
      setLogoBusy(false);
    }
  };

  const searchLower = search.trim().toLowerCase();
  const members = [...benefit.members]
    .filter(m =>
      searchLower
        ? m.email.includes(searchLower) ||
          `${m.firstName ?? ''} ${m.lastName ?? ''}`
            .toLowerCase()
            .includes(searchLower)
        : true
    )
    .filter(m => {
      const used = m.used ?? 0;
      if (filter === 'used') return used > 0;
      if (filter === 'unused') return used === 0;
      if (filter === 'override') return m.allowance !== undefined;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'used') {
        return (b.used ?? 0) - (a.used ?? 0) || a.email.localeCompare(b.email);
      }
      if (sort === 'remaining') {
        return (
          memberUsage(benefit, b).remaining -
            memberUsage(benefit, a).remaining || a.email.localeCompare(b.email)
        );
      }
      return a.email.localeCompare(b.email);
    });

  const clientFunded = benefit.funding === 'client';
  const graceDays =
    settingsQuery.data?.invoiceGraceDays ?? DEFAULT_INVOICE_GRACE_DAYS;
  const invoicing = clientFunded
    ? splitOrdersForInvoicing(benefit, orders, graceDays)
    : null;
  const uninvoiced = invoicing
    ? invoiceTotals(invoicing.eligible.map(orderNetBenefitAmount)).subtotal
    : 0;
  const activeTab: Tab = tab === 'invoicing' && !clientFunded ? 'members' : tab;

  const summary = [
    benefitTypeLabel(benefit.type),
    `${formatBenefitAmount(benefit.type, benefit.amount)} per member`,
    benefit.access === 'members' ? 'Members only' : 'Public',
    clientFunded ? 'Client-funded' : 'Macaport-funded',
  ].join(' · ');

  const cardPreview = benefit.copy.instructions
    ? benefit.copy.instructions
    : `${benefit.copy.memberLabel}: enter your email to activate your ${benefit.copy.benefitName}.`;

  const exportUsage = () => {
    const rows = [
      [
        'email',
        'firstName',
        'lastName',
        'allowance',
        'used',
        'remaining',
        'orders',
      ],
      ...[...benefit.members]
        .sort((a, b) => a.email.localeCompare(b.email))
        .map(m => {
          const u = memberUsage(benefit, m);
          const unit = (n: number) =>
            benefit.type === 'freeItem' ? String(n) : (n / 100).toFixed(2);
          return [
            m.email,
            m.firstName ?? '',
            m.lastName ?? '',
            unit(u.allowance),
            unit(u.used),
            unit(u.remaining),
            (m.orderIds ?? []).join(' '),
          ];
        }),
    ];
    downloadCsv(`${benefit.copy.benefitName}-usage-${store._id}.csv`, rows);
  };

  return (
    <PanelStyles>
      <div className="header">
        <div>
          <div className="title-row">
            <h3 className="title">{benefit.copy.benefitName}</h3>
            <span className="type-pill">{benefitTypeLabel(benefit.type)}</span>
            <span
              className={`status-pill ${benefit.active ? 'active' : 'paused'}`}
            >
              {benefit.active ? 'Active' : 'Paused'}
            </span>
          </div>
          <p className="summary">{summary}</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="header-button"
            onClick={() => setShowAddMembers(true)}
          >
            + Add {benefit.copy.memberLabel.toLowerCase()}
          </button>
          <button
            type="button"
            className={`toggle-button ${benefit.active ? 'pause' : 'resume'}`}
            onClick={() => setShowActive(true)}
          >
            {benefit.active ? 'Pause' : 'Resume'}
          </button>
          <BenefitMenu
            onEdit={() => setShowForm(true)}
            onExport={exportUsage}
            canExport={benefit.members.length > 0}
            onDelete={() => setShowDelete(true)}
          />
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">{report.memberCount}</div>
          <div className="stat-label">{benefit.copy.memberLabel}</div>
        </div>
        <div className="stat">
          <div className="stat-value">{report.membersWithUsage}</div>
          <div className="stat-label">Have used it</div>
        </div>
        <div className="stat">
          <div className="stat-value">
            {formatBenefitAmount(benefit.type, report.totalUsed)}
          </div>
          <div className="stat-label">
            Used of {formatBenefitAmount(benefit.type, report.totalAllowance)}
          </div>
        </div>
        {clientFunded ? (
          <button
            type="button"
            className="stat clickable"
            onClick={() => setTab('invoicing')}
          >
            <div className="stat-value">{formatToMoney(uninvoiced, true)}</div>
            <div className="stat-label">
              Uninvoiced · {invoicing?.eligible.length ?? 0} shipped
            </div>
          </button>
        ) : (
          <div className="stat">
            <div className="stat-value">{report.linkedOrders.length}</div>
            <div className="stat-label">Orders</div>
          </div>
        )}
      </div>

      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'members'}
          className={activeTab === 'members' ? 'active' : ''}
          onClick={() => setTab('members')}
        >
          {benefit.copy.memberLabel}
          <span className="count">{benefit.members.length}</span>
        </button>
        {clientFunded && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'invoicing'}
            className={activeTab === 'invoicing' ? 'active' : ''}
            onClick={() => setTab('invoicing')}
          >
            Invoicing
            {(invoicing?.eligible.length ?? 0) > 0 && (
              <span className="count attention">
                {invoicing?.eligible.length} uninvoiced
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'card'}
          className={activeTab === 'card' ? 'active' : ''}
          onClick={() => setTab('card')}
        >
          Storefront card
        </button>
      </div>

      {activeTab === 'members' && (
        <div className="tab-panel">
          <div className="list-tools">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or name..."
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as MemberSort)}
              aria-label="Sort members"
            >
              <option value="email">Sort: Email</option>
              <option value="used">Sort: Most used</option>
              <option value="remaining">Sort: Most remaining</option>
            </select>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as MemberFilter)}
              aria-label="Filter members"
            >
              <option value="all">All</option>
              <option value="used">Have used it</option>
              <option value="unused">Not yet used</option>
              <option value="override">Allowance override</option>
            </select>
          </div>
          <ul className="member-list">
            <li className="list-head" aria-hidden="true">
              <span>Email</span>
              <span>Used of allowance</span>
              <span className="right">Orders</span>
            </li>
            {members.length === 0 && (
              <li className="empty">
                {benefit.members.length === 0
                  ? `No ${benefit.copy.memberLabel.toLowerCase()} yet.`
                  : 'No matches.'}
              </li>
            )}
            {members.map(member => (
              <MemberRow
                key={member.email}
                benefit={benefit}
                member={member}
                orders={orders}
                storeId={store._id}
                onRestore={() => setMemberModal({ kind: 'restore', member })}
                onAllowance={() =>
                  setMemberModal({ kind: 'allowance', member })
                }
                onRemove={() => setMemberModal({ kind: 'remove', member })}
                onEnd={() => setMemberModal({ kind: 'end', member })}
              />
            ))}
          </ul>
          {(searchLower || filter !== 'all') && (
            <p className="list-note">
              Showing {members.length} of {benefit.members.length}.
            </p>
          )}
        </div>
      )}

      {activeTab === 'invoicing' && clientFunded && (
        <div className="tab-panel">
          <InvoicingSection benefit={benefit} store={store} />
        </div>
      )}

      {activeTab === 'card' && (
        <div className="tab-panel card-tab">
          <div className="card-preview">
            <div className="card-preview-label">How the card reads</div>
            <div className="card-mock">
              {benefit.copy.logo && /^https?:\/\//.test(benefit.copy.logo) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={benefit.copy.logo} alt="" />
              )}
              <div className="card-mock-title">{benefit.copy.benefitName}</div>
              <div className="card-mock-copy">{cardPreview}</div>
              <div className="card-mock-button">
                {benefit.active ? 'Verify your email' : 'Paused'}
              </div>
            </div>
          </div>
          <div className="card-fields">
            <div className="detail">
              <span className="label">Members are called</span>
              <span>{benefit.copy.memberLabel}</span>
            </div>
            <div className="detail">
              <span className="label">Instructions</span>
              <span>
                {benefit.copy.instructions || (
                  <em className="muted">
                    Default, built from the name and label
                  </em>
                )}
              </span>
            </div>
            {benefit.type === 'freeItem' && (
              <div className="detail">
                <span className="label">Qualifying products</span>
                <span>{products ? products.join(', ') : 'Every product'}</span>
              </div>
            )}
            <div className="detail">
              <span className="label">Logo</span>
              <div className="logo-row">
                {benefit.copy.logo ? (
                  <div className="logo-thumb">
                    {/^https?:\/\//.test(benefit.copy.logo) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={benefit.copy.logo} alt="Benefit logo" />
                    ) : (
                      <span className="logo-path" title={benefit.copy.logo}>
                        {benefit.copy.logo}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="logo-thumb empty">No logo</div>
                )}
                <div className="logo-actions">
                  <button
                    type="button"
                    className="row-button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoBusy}
                  >
                    {logoBusy
                      ? 'Saving...'
                      : benefit.copy.logo
                      ? 'Replace'
                      : 'Upload'}
                  </button>
                  {benefit.copy.logo && !logoBusy && !confirmRemoveLogo && (
                    <button
                      type="button"
                      className="link-button danger"
                      onClick={() => setConfirmRemoveLogo(true)}
                    >
                      Remove
                    </button>
                  )}
                  {benefit.copy.logo && !logoBusy && confirmRemoveLogo && (
                    <span className="confirm-inline">
                      Remove the logo from the storefront card?
                      <button
                        type="button"
                        className="row-button danger"
                        onClick={() => {
                          setConfirmRemoveLogo(false);
                          saveLogo('');
                        }}
                      >
                        Remove
                      </button>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => setConfirmRemoveLogo(false)}
                      >
                        Keep
                      </button>
                    </span>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    onChange={handleLogoFile}
                    hidden
                  />
                </div>
              </div>
              {logoError && <span className="logo-error">{logoError}</span>}
            </div>
            <p className="list-note">
              Name, instructions, products and the rest are changed under Edit
              benefit in the menu.
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <BenefitFormModal
          store={store}
          benefit={benefit}
          isLoading={mutations.updateBenefit.isLoading}
          errorMessage={errorOf(mutations.updateBenefit)}
          onSubmit={values =>
            mutations.updateBenefit.mutate(values, { onSuccess: closeForm })
          }
          onCancel={closeForm}
        />
      )}

      {showAddMembers && (
        <AddMembersModal
          memberLabel={benefit.copy.memberLabel}
          existingEmails={benefit.members.map(m => m.email)}
          isLoading={mutations.addMembers.isLoading}
          errorMessage={errorOf(mutations.addMembers)}
          onSubmit={members =>
            mutations.addMembers.mutate(members, {
              onSuccess: () => setShowAddMembers(false),
            })
          }
          onCancel={() => {
            mutations.addMembers.reset();
            setShowAddMembers(false);
          }}
        />
      )}

      {showActive && (
        <BenefitActiveModal
          benefitName={benefit.copy.benefitName}
          nextActive={!benefit.active}
          isLoading={mutations.setActive.isLoading}
          errorMessage={errorOf(mutations.setActive)}
          onConfirm={() =>
            mutations.setActive.mutate(!benefit.active, {
              onSuccess: () => setShowActive(false),
            })
          }
          onCancel={() => {
            mutations.setActive.reset();
            setShowActive(false);
          }}
        />
      )}

      {showDelete && (
        <DeleteBenefitModal
          benefitName={benefit.copy.benefitName}
          memberCount={benefit.members.length}
          linkedOrderCount={report.linkedOrders.length}
          isLoading={mutations.deleteBenefit.isLoading}
          errorMessage={errorOf(mutations.deleteBenefit)}
          onConfirm={() =>
            mutations.deleteBenefit.mutate(undefined, {
              onSuccess: () => setShowDelete(false),
            })
          }
          onCancel={() => {
            mutations.deleteBenefit.reset();
            setShowDelete(false);
          }}
        />
      )}

      {memberModal?.kind === 'restore' && (
        <RestoreUsedModal
          benefit={benefit}
          member={memberModal.member}
          isLoading={mutations.restoreUsed.isLoading}
          errorMessage={errorOf(mutations.restoreUsed)}
          onConfirm={amount =>
            mutations.restoreUsed.mutate(
              { email: memberModal.member.email, amount },
              { onSuccess: closeMemberModal }
            )
          }
          onCancel={closeMemberModal}
        />
      )}

      {memberModal?.kind === 'allowance' && (
        <AllowanceModal
          benefit={benefit}
          member={memberModal.member}
          isLoading={mutations.setAllowance.isLoading}
          errorMessage={errorOf(mutations.setAllowance)}
          onConfirm={allowance =>
            mutations.setAllowance.mutate(
              { email: memberModal.member.email, allowance },
              { onSuccess: closeMemberModal }
            )
          }
          onCancel={closeMemberModal}
        />
      )}

      {memberModal?.kind === 'remove' && (
        <RemoveMemberModal
          email={memberModal.member.email}
          usedLabel={null}
          isLoading={mutations.removeMember.isLoading}
          errorMessage={errorOf(mutations.removeMember)}
          onConfirm={() =>
            mutations.removeMember.mutate(memberModal.member.email, {
              onSuccess: closeMemberModal,
            })
          }
          onCancel={closeMemberModal}
        />
      )}

      {memberModal?.kind === 'end' && (
        <EndBenefitModal
          email={memberModal.member.email}
          benefitName={benefit.copy.benefitName}
          usedLabel={formatBenefitAmount(
            benefit.type,
            memberUsage(benefit, memberModal.member).used
          )}
          remainingLabel={formatBenefitAmount(
            benefit.type,
            memberUsage(benefit, memberModal.member).remaining
          )}
          isLoading={mutations.endMember.isLoading}
          errorMessage={errorOf(mutations.endMember)}
          onConfirm={() =>
            mutations.endMember.mutate(memberModal.member.email, {
              onSuccess: closeMemberModal,
            })
          }
          onCancel={closeMemberModal}
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

  .empty-copy {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
    max-width: 40rem;
  }

  /* Header ---------------------------------------------------------- */

  .header {
    margin: 0 0 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }

  .summary {
    margin: 0.5rem 0 0;
    font-size: 0.8125rem;
    color: #6b7280;
  }

  .status-pill,
  .type-pill {
    padding: 0.25rem 0.5rem;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.075em;
    border-radius: 0.25rem;
    line-height: 1;
  }

  .type-pill {
    color: #374151;
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
  }

  .status-pill.active {
    color: #065f46;
    background-color: #d1fae5;
    border: 1px solid #a7f3d0;
  }

  .status-pill.paused {
    color: #991b1b;
    background-color: #fee2e2;
    border: 1px solid #fecaca;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-shrink: 0;
  }

  .header-button,
  .toggle-button {
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

  .header-button:hover,
  .toggle-button.pause:hover {
    color: #000;
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }

  .toggle-button.resume {
    color: #fff;
    background-color: #111827;
    border-color: #111827;
  }

  .toggle-button.resume:hover {
    background-color: #000;
  }

  /* Stat strip ------------------------------------------------------ */

  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }

  .stat {
    padding: 0.875rem 1rem;
    text-align: left;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-family: inherit;
  }

  .stat.clickable {
    cursor: pointer;
    transition: border-color 120ms linear, background-color 120ms linear;
  }

  .stat.clickable:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }

  .stat-value {
    font-size: 1.375rem;
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

  /* Tabs ------------------------------------------------------------ */

  .tabs {
    margin: 1.5rem 0 0;
    display: flex;
    gap: 0.25rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .tabs button {
    margin: 0 0 -1px;
    padding: 0.625rem 0.875rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    background-color: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-family: inherit;
  }

  .tabs button:hover {
    color: #111827;
  }

  .tabs button.active {
    color: #111827;
    border-bottom-color: #111827;
  }

  .tabs .count {
    padding: 0.0625rem 0.4375rem;
    font-size: 0.6875rem;
    font-weight: 600;
    color: #4b5563;
    background-color: #f3f4f6;
    border-radius: 9999px;
  }

  .tabs .count.attention {
    color: #1e40af;
    background-color: #dbeafe;
  }

  .tab-panel {
    padding: 1.25rem 0 0;
  }

  /* Members --------------------------------------------------------- */

  .list-tools {
    margin: 0 0 0.75rem;
    display: flex;
    gap: 0.625rem;
  }

  .list-tools input[type='search'] {
    flex: 1;
    padding: 0.4375rem 0.75rem;
    font-size: 0.8125rem;
    color: #111827;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-family: inherit;
  }

  .list-tools select {
    padding: 0.4375rem 0.625rem;
    font-size: 0.8125rem;
    color: #111827;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-family: inherit;
  }

  .list-tools input:focus,
  .list-tools select:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    border-color: #1c44b9;
    box-shadow: #1c44b9 0px 0px 0px 1px;
  }

  /* The list is one segmented stack: rows share borders, only the outer
     corners are rounded, and the open row's border sits over its
     neighbours'. Rings are inset so the scrolling list never clips them. */
  .member-list {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 32rem;
    overflow-y: auto;
    border-radius: 0.375rem;
  }

  .list-head {
    position: sticky;
    top: 0;
    z-index: 4;
    padding: 0.4375rem 0.75rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 13rem 5rem;
    gap: 1rem;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    background-color: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem 0.375rem 0 0;
  }

  .list-head .right {
    text-align: right;
  }

  .member-list > li + li {
    margin-top: -1px;
  }

  /* The sticky header sits above the rows while the list scrolls, so the
     first row must not tuck under it, or the header hides that row's top
     edge. The header's own bottom border is the shared edge, and it takes
     the row's colour when the row is hovered, open or focused. */
  .member-list > .list-head + li {
    margin-top: 0;
    border-top-width: 0;
  }

  .list-head:has(+ li:hover) {
    border-bottom-color: #9ca3af;
  }

  .list-head:has(+ li.open),
  .list-head:has(+ li .row:focus-visible) {
    border-bottom-color: #1c44b9;
  }

  .member-list > li:last-child {
    border-radius: 0 0 0.375rem 0.375rem;
  }

  .member-list .empty {
    padding: 1.25rem;
    text-align: center;
    font-size: 0.8125rem;
    color: #9ca3af;
    border: 1px solid #d1d5db;
  }

  .list-note {
    margin: 0.625rem 0 0;
    font-size: 0.75rem;
    color: #6b7280;
  }

  /* Storefront card ------------------------------------------------- */

  .card-tab {
    display: grid;
    grid-template-columns: 18rem minmax(0, 1fr);
    gap: 2rem;
  }

  .card-preview-label,
  .label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  .card-mock {
    margin: 0.5rem 0 0;
    padding: 1.25rem;
    text-align: center;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .card-mock img {
    max-width: 8rem;
    max-height: 4rem;
    object-fit: contain;
    margin: 0 auto 0.75rem;
    display: block;
  }

  .card-mock-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #111827;
  }

  .card-mock-copy {
    margin: 0.375rem 0 0.875rem;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: #4b5563;
  }

  .card-mock-button {
    display: inline-block;
    padding: 0.4375rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #fff;
    background-color: #111827;
    border-radius: 0.25rem;
  }

  .card-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    font-size: 0.875rem;
    color: #111827;
  }

  .detail {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    line-height: 1.5;
  }

  .muted {
    color: #9ca3af;
  }

  .logo-row {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .logo-thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 7rem;
    height: 4.5rem;
    padding: 0.375rem;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .logo-thumb img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .logo-thumb.empty {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .logo-path {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.6875rem;
    color: #4b5563;
    word-break: break-all;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .logo-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-error {
    font-size: 0.75rem;
    color: #b91c1c;
  }

  .link-button {
    padding: 0;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4b5563;
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  .link-button:hover {
    color: #111827;
    text-decoration: underline;
  }

  .link-button.danger:hover {
    color: #991b1b;
  }

  .row-button {
    padding: 0.3125rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #4b5563;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .row-button:hover:not(:disabled) {
    color: #111827;
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }

  .row-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .row-button.danger {
    color: #b91c1c;
    border-color: #fecaca;
    background-color: #fef2f2;
  }

  .row-button.danger:hover:not(:disabled) {
    color: #991b1b;
    background-color: #fee2e2;
    border-color: #fca5a5;
  }

  .confirm-inline {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #374151;
  }

  @media (max-width: 800px) {
    padding: 1.25rem 1.25rem 1.125rem;

    .header {
      flex-wrap: wrap;
    }

    .stats {
      grid-template-columns: 1fr 1fr;
    }

    .list-tools {
      flex-wrap: wrap;
    }

    .list-tools input[type='search'] {
      flex-basis: 100%;
    }

    .card-tab {
      grid-template-columns: 1fr;
    }

    .list-head {
      grid-template-columns: minmax(0, 1fr) 9rem 4rem;
    }
  }
`;
