import React from 'react';
import styled from 'styled-components';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import LoadingSpinner from '../../LoadingSpinner';

type Props = {
  existingEligible: string[];
  existingUsed: string[];
  isLoading: boolean;
  errorMessage?: string;
  onSubmit: (emails: string[]) => void;
  onCancel: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ParsedInput = {
  valid: string[];
  invalid: string[];
  alreadyEligible: string[];
  alreadyUsed: string[];
};

function parseEmailInput(
  raw: string,
  existingEligible: string[],
  existingUsed: string[]
): ParsedInput {
  const tokens = raw
    .split(/[\s,;]+/)
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  const uniqueTokens = Array.from(new Set(tokens));
  const eligibleSet = new Set(existingEligible.map(e => e.toLowerCase()));
  const usedSet = new Set(existingUsed.map(e => e.toLowerCase()));

  const valid: string[] = [];
  const invalid: string[] = [];
  const alreadyEligible: string[] = [];
  const alreadyUsed: string[] = [];

  for (const token of uniqueTokens) {
    if (!EMAIL_REGEX.test(token)) {
      invalid.push(token);
      continue;
    }
    if (usedSet.has(token)) {
      alreadyUsed.push(token);
      continue;
    }
    if (eligibleSet.has(token)) {
      alreadyEligible.push(token);
      continue;
    }
    valid.push(token);
  }

  return { valid, invalid, alreadyEligible, alreadyUsed };
}

export default function AddEligibleEmailsModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [show, setShow] = React.useState(true);
  const [bulkInput, setBulkInput] = React.useState('');

  useOutsideClick(
    show,
    () => {
      setShow(false);
      props.onCancel();
    },
    ref,
    props.isLoading
  );
  useEscapeKeydownClose(
    show,
    () => {
      setShow(false);
      props.onCancel();
    },
    props.isLoading
  );

  const parsed = parseEmailInput(
    bulkInput,
    props.existingEligible,
    props.existingUsed
  );

  const hasNotes =
    parsed.alreadyEligible.length > 0 ||
    parsed.alreadyUsed.length > 0 ||
    parsed.invalid.length > 0;

  const handleSubmit = () => {
    if (parsed.valid.length === 0) return;
    props.onSubmit(parsed.valid);
  };

  return (
    <Styles>
      <div ref={ref} className="modal">
        <h3>Add eligible emails</h3>
        <p>
          Paste emails separated by commas, spaces, or new lines. Duplicates
          and invalid entries are detected automatically.
        </p>
        <textarea
          value={bulkInput}
          onChange={e => setBulkInput(e.target.value)}
          placeholder="jane@example.com&#10;john@example.com"
          rows={6}
          autoFocus
          disabled={props.isLoading}
        />

        {bulkInput.trim() && (
          <>
            <div className="parse-summary">
              <span className="parse-valid">{parsed.valid.length} new</span>
              {parsed.alreadyEligible.length > 0 && (
                <span className="parse-already-eligible">
                  {parsed.alreadyEligible.length} already eligible
                </span>
              )}
              {parsed.alreadyUsed.length > 0 && (
                <span className="parse-already-used">
                  {parsed.alreadyUsed.length} already used
                </span>
              )}
              {parsed.invalid.length > 0 && (
                <span className="parse-invalid">
                  {parsed.invalid.length} invalid
                </span>
              )}
            </div>
            {hasNotes && (
              <div className="issues-list">
                {parsed.alreadyUsed.map(e => (
                  <div key={e} className="issue-row">
                    <span className="issue-email">{e}</span>
                    <span className="issue-badge used">Already used</span>
                  </div>
                ))}
                {parsed.alreadyEligible.map(e => (
                  <div key={e} className="issue-row">
                    <span className="issue-email">{e}</span>
                    <span className="issue-badge eligible">
                      Already eligible
                    </span>
                  </div>
                ))}
                {parsed.invalid.map(e => (
                  <div key={e} className="issue-row">
                    <span className="issue-email">{e}</span>
                    <span className="issue-badge invalid">Invalid format</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {props.errorMessage && (
          <div className="error-message">{props.errorMessage}</div>
        )}

        <div className="buttons">
          <button
            type="button"
            className="secondary-button"
            onClick={props.onCancel}
            disabled={props.isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={handleSubmit}
            disabled={parsed.valid.length === 0 || props.isLoading}
          >
            {props.isLoading
              ? 'Adding...'
              : parsed.valid.length === 0
              ? 'Add emails'
              : `Add ${parsed.valid.length} email${
                  parsed.valid.length === 1 ? '' : 's'
                }`}
          </button>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </Styles>
  );
}

const Styles = styled.div`
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
    width: 100%;
    text-align: left;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  }

  h3 {
    margin: 0 0 0.625rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  p {
    margin: 0 0 1rem;
    font-size: 0.9375rem;
    color: #4b5563;
    line-height: 1.5;
  }

  textarea {
    width: 100%;
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
    color: #111827;
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: none;
    font-family: inherit;
    resize: vertical;
    line-height: 1.4;
  }

  textarea:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    border-color: #1c44b9;
    box-shadow: rgb(255, 255, 255) 0px 0px 0px 0px,
      #1c44b9 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
  }

  .parse-summary {
    margin: 0.75rem 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
    font-size: 0.8125rem;
  }

  .parse-valid {
    color: #065f46;
    font-weight: 500;
  }

  .parse-already-eligible {
    color: #92400e;
  }

  .parse-already-used {
    color: #991b1b;
    font-weight: 500;
  }

  .parse-invalid {
    color: #991b1b;
  }

  .issues-list {
    margin: 0.875rem 0 0;
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

  .issue-email {
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
  }

  .issue-badge.used {
    color: #991b1b;
    background-color: #fef2f2;
  }

  .issue-badge.eligible {
    color: #92400e;
    background-color: #fffbeb;
  }

  .issue-badge.invalid {
    color: #4b5563;
    background-color: #f3f4f6;
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
  .secondary-button {
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
  .secondary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .primary-button:focus,
  .secondary-button:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  .primary-button:focus-visible,
  .secondary-button:focus-visible {
    text-decoration: underline;
  }
`;

const ModalSpinner = styled(LoadingSpinner)`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
`;
