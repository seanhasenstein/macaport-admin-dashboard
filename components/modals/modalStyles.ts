import styled from 'styled-components';
import LoadingSpinner from '../LoadingSpinner';

// The overlay, card, form fields and buttons shared by the member benefit
// and refund modals. Matches the store's other confirm modals.
export const ModalStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;

  .modal {
    position: relative;
    margin: -4rem 0 0;
    padding: 2rem 2.25rem 1.5rem;
    max-width: 36rem;
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    width: 100%;
    text-align: left;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  }

  .modal.narrow {
    max-width: 30rem;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem;
    display: inline-flex;
    color: #6b7280;
    background-color: transparent;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: color 100ms linear, background-color 100ms linear;
  }

  .close-button:hover:not(:disabled) {
    color: #111827;
    background-color: #f3f4f6;
  }

  .close-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .close-button svg {
    height: 1.25rem;
    width: 1.25rem;
  }

  .close-button:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  .close-button:focus-visible {
    box-shadow: 0 0 0 2px #1c44b9;
  }

  .modal.wide {
    max-width: 44rem;
  }

  h3 {
    margin: 0 0 0.625rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  h4 {
    margin: 1.25rem 0 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  p {
    margin: 0 0 1rem;
    font-size: 0.9375rem;
    color: #4b5563;
    line-height: 1.5;
  }

  strong {
    font-weight: 600;
    color: #111827;
  }

  .field {
    margin: 0 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .field label,
  .field .group-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #374151;
  }

  .field .hint {
    margin: 0;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .field .hint.error-hint,
  .error-hint {
    color: #b91c1c;
  }

  .field .hint.warn-hint {
    color: #92400e;
  }

  .form-section {
    margin: 0;
    padding: 1.25rem 0;
    border-top: 1px solid #e5e7eb;
  }

  .form-section:first-of-type {
    padding-top: 0.5rem;
    border-top: none;
  }

  .section-head {
    margin: 0 0 1rem;
  }

  .section-head h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0;
    color: #111827;
  }

  .section-head p {
    margin: 0.25rem 0 0;
    font-size: 0.8125rem;
    color: #6b7280;
  }

  /* Fields that appear because of the choice just above them. No box: a
     box reads as a separate thing, and these belong to that choice. */
  .field-row.follow-up {
    margin: 0.875rem 0 0;
  }

  .field-row.follow-up .field {
    margin: 0;
  }

  .form-footer {
    margin: 0.5rem -2.25rem -1.5rem;
    padding: 1rem 2.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    background-color: #f9fafb;
    border-top: 1px solid #e5e7eb;
    border-radius: 0 0 0.5rem 0.5rem;
  }

  .form-footer .buttons {
    margin: 0;
  }

  .footer-note {
    margin: 0;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .form-fields {
    margin: 0;
    padding: 0;
    min-width: 0;
    border: none;
  }

  .form-fields:disabled {
    opacity: 0.7;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
  }

  .counter {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .counter.over {
    color: #b91c1c;
  }

  .adorned {
    position: relative;
    display: flex;
    align-items: center;
  }

  .adorned .adornment {
    position: absolute;
    font-size: 0.875rem;
    color: #6b7280;
    pointer-events: none;
  }

  .adorned.prefix .adornment {
    left: 0.75rem;
  }

  .adorned.prefix input {
    padding-left: 1.5rem;
  }

  .adorned.suffix .adornment {
    right: 0.75rem;
  }

  .adorned.suffix input {
    padding-right: 5rem;
  }

  .warn-hint {
    color: #92400e;
  }

  .list-toolbar {
    margin: 0 0 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .list-actions {
    display: inline-flex;
    gap: 0.75rem;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  input[type='text'],
  input[type='number'],
  input[type='search'],
  input[type='url'],
  select,
  textarea {
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

  textarea {
    resize: vertical;
    line-height: 1.4;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    border-color: #1c44b9;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px, #1c44b9 0px 0px 0px 1px,
      rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  }

  .radio-row,
  .checkbox-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    font-size: 0.875rem;
    color: #111827;
  }

  .radio-row label,
  .checkbox-row label,
  .check-list label {
    display: inline-flex;
    align-items: center;
    gap: 0.4375rem;
    font-size: 0.875rem;
    font-weight: 400;
    color: #111827;
    cursor: pointer;
  }

  /* Option cards form one segmented control: the options share borders,
     only the outer corners are rounded, and the selected option's border
     is drawn over its neighbours'. */
  .option-cards {
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }

  .option-cards.cols-1 {
    flex-direction: column;
  }

  .option-card {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    /* The global label rule adds a bottom margin; none here, so stacked
       options touch. */
    margin: 0;
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.75rem 0.875rem;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0;
    cursor: pointer;
    transition: border-color 120ms linear, background-color 120ms linear,
      box-shadow 120ms linear;
  }

  .option-card:hover {
    border-color: #9ca3af;
    background-color: #f9fafb;
    z-index: 1;
  }

  .option-card.selected {
    border-color: #1c44b9;
    background-color: #eef2ff;
    box-shadow: 0 0 0 1px #1c44b9;
    z-index: 2;
  }

  .option-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .option-card input[type='radio'] {
    margin: 0.1875rem 0 0;
    flex-shrink: 0;
    accent-color: #1c44b9;
  }

  /* One ring, only for keyboard focus; the native radio's own ring is
     hidden since the card is the control. */
  .option-card input[type='radio']:focus,
  .option-card input[type='radio']:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .option-card:has(input[type='radio']:focus-visible) {
    outline: 2px solid #1c44b9;
    outline-offset: 2px;
    z-index: 3;
  }

  /* Stacked groups: shared horizontal borders, rounded top and bottom. */
  .option-cards.cols-1 .option-card + .option-card {
    margin-top: -1px;
  }

  .option-cards.cols-1 .option-card:first-child {
    border-radius: 0.375rem 0.375rem 0 0;
  }

  .option-cards.cols-1 .option-card:last-child {
    border-radius: 0 0 0.375rem 0.375rem;
  }

  .option-cards.cols-1 .option-body {
    flex-direction: row;
    align-items: baseline;
    gap: 0.625rem;
  }

  .option-cards.cols-1 .option-label {
    min-width: 7.5rem;
    flex-shrink: 0;
  }

  /* Side-by-side groups: shared vertical borders, rounded left and right. */
  @media (min-width: 641px) {
    .option-cards.cols-2 .option-card + .option-card,
    .option-cards.cols-3 .option-card + .option-card {
      margin-left: -1px;
    }

    .option-cards.cols-2 .option-card:first-child,
    .option-cards.cols-3 .option-card:first-child {
      border-radius: 0.375rem 0 0 0.375rem;
    }

    .option-cards.cols-2 .option-card:last-child,
    .option-cards.cols-3 .option-card:last-child {
      border-radius: 0 0.375rem 0.375rem 0;
    }
  }

  .option-body {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .option-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }

  .option-card.selected .option-label {
    color: #1c44b9;
  }

  .option-description {
    font-size: 0.75rem;
    line-height: 1.4;
    color: #6b7280;
  }

  .logo-field {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 6rem;
    height: 4rem;
    padding: 0.375rem;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .logo-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .logo-preview.empty {
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

  .link-button {
    padding: 0;
    font-size: 0.8125rem;
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

  .small-button {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #1f2937;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .small-button:hover:not(:disabled) {
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }

  .small-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-hint {
    color: #b91c1c;
  }

  @media (max-width: 640px) {
    .option-cards {
      flex-direction: column;
    }

    .option-cards .option-card + .option-card {
      margin-top: -1px;
    }

    .option-cards .option-card:first-child {
      border-radius: 0.375rem 0.375rem 0 0;
    }

    .option-cards .option-card:last-child {
      border-radius: 0 0 0.375rem 0.375rem;
    }
  }
  }

  .check-list {
    display: flex;
    flex-direction: column;
    max-height: 14rem;
    overflow-y: auto;
    border-radius: 0.375rem;
  }

  .check-list .hint {
    padding: 0.625rem 0.875rem;
  }

  .check-row {
    position: relative;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 400;
    color: #111827;
    background-color: #fff;
    border: 1px solid #d1d5db;
    cursor: pointer;
    transition: border-color 120ms linear, background-color 120ms linear;
  }

  .check-row + .check-row {
    margin-top: -1px;
  }

  .check-row:first-child {
    border-radius: 0.375rem 0.375rem 0 0;
  }

  .check-row:last-child {
    border-radius: 0 0 0.375rem 0.375rem;
  }

  .check-row:hover {
    border-color: #9ca3af;
    background-color: #f9fafb;
    z-index: 1;
  }

  /* Rings are inset: the list scrolls, and a scrolling box clips anything
     drawn outside its rows. */
  .check-row.selected {
    border-color: #1c44b9;
    background-color: #eef2ff;
    box-shadow: inset 0 0 0 1px #1c44b9;
    z-index: 2;
  }

  /* Two selected rows in a row: the lower one drops its inner top line, so
     the shared edge is the same two pixels as every other edge instead of
     three. */
  .check-row.selected + .check-row.selected {
    box-shadow: inset 1px 0 0 #1c44b9, inset -1px 0 0 #1c44b9,
      inset 0 -1px 0 #1c44b9;
  }

  .check-row input[type='checkbox'] {
    margin: 0;
    flex-shrink: 0;
    accent-color: #1c44b9;
  }

  .check-row input[type='checkbox']:focus,
  .check-row input[type='checkbox']:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .check-row:has(input[type='checkbox']:focus-visible) {
    border-color: #1c44b9;
    box-shadow: inset 0 0 0 2px #1c44b9;
    z-index: 3;
  }

  .check-thumb {
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.25rem;
    flex-shrink: 0;
    object-fit: contain;
    border-radius: 0.25rem;
    background-color: #fff;
    border: 1px solid #e5e7eb;
  }

  .check-thumb.empty {
    display: inline-block;
  }

  .check-price {
    margin-left: auto;
    flex-shrink: 0;
    font-size: 0.8125rem;
    color: #374151;
    white-space: nowrap;
  }

  .check-text {
    display: flex;
    flex-direction: column;
    gap: 0.0625rem;
    min-width: 0;
  }

  .check-sub {
    font-size: 0.6875rem;
    color: #6b7280;
  }

  .summary-box {
    margin: 0.75rem 0 0;
    padding: 0.875rem 1rem;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    color: #111827;
  }

  .summary-box .row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.25rem 0;
  }

  .summary-box .muted {
    color: #6b7280;
  }

  .sentence {
    margin: 1rem 0 0;
    padding: 0.875rem 1rem;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: #065f46;
    background-color: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 0.375rem;
  }

  .sentence.muted {
    color: #92400e;
    background-color: #fffbeb;
    border-color: #fde68a;
  }

  .issues-list {
    margin: 0.75rem 0 0;
    display: flex;
    flex-direction: column;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    max-height: 14rem;
    overflow-y: auto;
    background-color: #fff;
  }

  .issue-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .issue-row:last-child {
    border-bottom: none;
  }

  .issue-text {
    color: #111827;
    word-break: break-all;
    min-width: 0;
  }

  .issue-badge {
    flex-shrink: 0;
    padding: 0.125rem 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 9999px;
    line-height: 1.4;
    color: #92400e;
    background-color: #fffbeb;
  }

  .issue-badge.invalid {
    color: #991b1b;
    background-color: #fef2f2;
  }

  .parse-summary {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
    font-size: 0.8125rem;
    color: #4b5563;
  }

  .parse-summary .good {
    color: #065f46;
    font-weight: 500;
  }

  .parse-summary .bad {
    color: #991b1b;
  }

  .error-message {
    margin: 1rem 0 0;
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
    color: #b91c1c;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.375rem;
  }

  .buttons {
    margin: 1.5rem 0 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
  }

  .primary-button,
  .secondary-button,
  .danger-button {
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .primary-button {
    padding: 0.625rem 1.25rem;
    min-width: 10rem;
    color: #fff;
    background-color: #111827;
    border: none;
    border-radius: 0.25rem;
    transition: background-color 150ms linear;
  }

  .primary-button:hover:not(:disabled) {
    background-color: #000;
  }

  .danger-button {
    padding: 0.625rem 1.25rem;
    min-width: 10rem;
    color: #b91c1c;
    background-color: #fee2e2;
    border: 1px solid #fdcfcf;
    border-radius: 0.25rem;
  }

  .danger-button:hover:not(:disabled) {
    color: #a81919;
    border-color: #fcbcbc;
  }

  .secondary-button {
    color: #4b5563;
    background-color: transparent;
    border: none;
  }

  .secondary-button:hover:not(:disabled) {
    color: #1f2937;
    text-decoration: underline;
  }

  .primary-button:disabled,
  .secondary-button:disabled,
  .danger-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .primary-button:focus,
  .secondary-button:focus,
  .danger-button:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  .primary-button:focus-visible,
  .secondary-button:focus-visible,
  .danger-button:focus-visible {
    text-decoration: underline;
  }

  .item-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
  }

  .item-table th {
    padding: 0.375rem 0.5rem;
    text-align: left;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
  }

  .item-table td {
    padding: 0.5rem;
    color: #111827;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
  }

  .item-table td.num,
  .item-table th.num {
    text-align: right;
  }

  .item-table input[type='number'] {
    width: 4.5rem;
    padding: 0.25rem 0.5rem;
  }

  .item-table .sub {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
  }
`;

export const ModalSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
`;
