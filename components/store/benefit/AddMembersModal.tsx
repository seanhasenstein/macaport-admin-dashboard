import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import {
  MemberInput,
  parseMemberText,
  rejectedReasonLabel,
  reviewMembers,
} from '../../../utils/memberBenefit';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';

type Props = {
  memberLabel: string;
  existingEmails: string[];
  isLoading: boolean;
  errorMessage?: string;
  onSubmit: (members: MemberInput[]) => void;
  onCancel: () => void;
};

// Paste or upload. Everything is normalized, deduplicated and checked here
// before the save button lights up, and the rows that will not be saved are
// listed with the reason.
export default function AddMembersModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [text, setText] = React.useState('');
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);

  // Pasted lists are easy to lose; only Cancel, Escape and the X close.
  useOutsideClick(true, props.onCancel, ref, true);
  useEscapeKeydownClose(true, props.onCancel, props.isLoading);

  React.useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const review = React.useMemo(
    () => reviewMembers(parseMemberText(text), props.existingEmails),
    [text, props.existingEmails]
  );

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setText(String(reader.result ?? ''));
      setFileName(file.name);
    };
    reader.onerror = () => setFileError('Could not read that file.');
    reader.readAsText(file);
  };

  const rejectedByReason = {
    invalid: review.rejected.filter(r => r.reason === 'invalid').length,
    duplicate: review.rejected.filter(r => r.reason === 'duplicate').length,
    existing: review.rejected.filter(r => r.reason === 'existing').length,
  };
  const named = review.members.filter(m => m.firstName || m.lastName).length;

  return (
    <ModalStyles>
      <div ref={ref} className="modal">
        <button
          type="button"
          className="close-button"
          onClick={props.onCancel}
          disabled={props.isLoading}
          aria-label="Close"
        >
          <XMarkIcon aria-hidden="true" />
        </button>
        <h3>Add {props.memberLabel.toLowerCase()}</h3>
        <fieldset className="form-fields" disabled={props.isLoading}>
          <section className="form-section">
            <div className="section-head">
              <h4>Upload or paste the list</h4>
              <p>
                A CSV with an <strong>email</strong> column and optional{' '}
                <strong>firstName</strong> and <strong>lastName</strong>{' '}
                columns, or one email per line. Emails are trimmed and
                lowercased.
              </p>
            </div>
            <div className="field">
              <label htmlFor="members-file">CSV file</label>
              <input
                id="members-file"
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFile}
              />
              {fileName && <p className="hint">Loaded {fileName}.</p>}
              {fileError && <p className="hint error-hint">{fileError}</p>}
            </div>
            <div className="field">
              <label htmlFor="members-text">Or paste here</label>
              <textarea
                id="members-text"
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={
                  'email,firstName,lastName\njane@example.com,Jane,Doe\n\nor just one email per line'
                }
                rows={8}
              />
            </div>
          </section>

          {text.trim() && (
            <section className="form-section">
              <div className="section-head">
                <h4>What will be saved</h4>
                <p>
                  Rows that will not be saved are listed with the reason.
                  Nothing is written until you click Add.
                </p>
              </div>
              <div className="parse-summary">
                <span className="good">
                  {review.members.length} to add
                  {named > 0 ? ` (${named} with a name)` : ''}
                </span>
                {rejectedByReason.existing > 0 && (
                  <span>{rejectedByReason.existing} already members</span>
                )}
                {rejectedByReason.duplicate > 0 && (
                  <span>{rejectedByReason.duplicate} duplicates</span>
                )}
                {rejectedByReason.invalid > 0 && (
                  <span className="bad">
                    {rejectedByReason.invalid} invalid
                  </span>
                )}
              </div>
              {review.rejected.length > 0 && (
                <div className="issues-list">
                  {review.rejected.map((row, i) => (
                    <div key={`${row.line}-${i}`} className="issue-row">
                      <span className="issue-text">
                        Line {row.line}: {row.raw || '(empty)'}
                      </span>
                      <span
                        className={`issue-badge${
                          row.reason === 'invalid' ? ' invalid' : ''
                        }`}
                      >
                        {rejectedReasonLabel(row.reason)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </fieldset>

        {props.errorMessage && (
          <div className="error-message">{props.errorMessage}</div>
        )}

        <div className="form-footer">
          <p className="footer-note">
            New members start with nothing used. Existing members are left as
            they are.
          </p>
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
              onClick={() => props.onSubmit(review.members)}
              disabled={review.members.length === 0 || props.isLoading}
            >
              {props.isLoading
                ? 'Adding...'
                : review.members.length === 0
                ? 'Add members'
                : `Add ${review.members.length} member${
                    review.members.length === 1 ? '' : 's'
                  }`}
            </button>
          </div>
        </div>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
