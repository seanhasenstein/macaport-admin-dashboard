import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import {
  Formik,
  Form,
  Field,
  FormikErrors,
  useField,
  useFormikContext,
} from 'formik';
import { MemberBenefit } from '../../../core/memberBenefits/types';
import { Store, StoreProduct } from '../../../interfaces';
import { formatToMoney } from '../../../utils';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useEscapeKeydownClose from '../../../hooks/useEscapeKeydownClose';
import { BenefitFormValues } from '../../../hooks/useBenefitMutations';
import {
  amountErrorMessage,
  benefitFormValues,
  benefitTypeLabel,
  fundingAllowed,
  INSTRUCTIONS_MAX,
  MACAPORT_CREDIT_ERROR,
  LABEL_MAX,
  NAME_MAX,
  parseBenefitAmount,
} from '../../../utils/memberBenefit';
import { ModalStyles, ModalSpinner } from '../../modals/modalStyles';
import {
  uploadBenefitLogo,
  validateLogoFile,
} from '../../../utils/benefitLogo';

type Props = {
  store: Store;
  // Editing when set. The type is fixed once created.
  benefit?: MemberBenefit;
  isLoading: boolean;
  errorMessage?: string;
  onSubmit: (values: BenefitFormValues) => void;
  onCancel: () => void;
};

function initialValues(benefit?: MemberBenefit): BenefitFormValues {
  if (!benefit) {
    return {
      type: 'credit',
      amount: '',
      benefitName: '',
      memberLabel: '',
      instructions: '',
      logo: '',
      access: 'public',
      funding: 'client',
      allProducts: true,
      productIds: [],
      members: [],
    };
  }
  return benefitFormValues(benefit);
}

function validate(values: BenefitFormValues) {
  const errors: FormikErrors<BenefitFormValues> = {};
  if (parseBenefitAmount(values.type, values.amount) === null) {
    errors.amount = amountErrorMessage(values.type);
  }
  const name = values.benefitName.trim();
  if (!name) errors.benefitName = 'A benefit name is required.';
  else if (name.length > NAME_MAX) {
    errors.benefitName = `Keep it to ${NAME_MAX} characters.`;
  }
  const label = values.memberLabel.trim();
  if (!label) errors.memberLabel = 'A member label is required.';
  else if (label.length > LABEL_MAX) {
    errors.memberLabel = `Keep it to ${LABEL_MAX} characters.`;
  }
  if (!fundingAllowed(values.type, values.funding)) {
    errors.funding = MACAPORT_CREDIT_ERROR;
  }
  if (values.instructions.trim().length > INSTRUCTIONS_MAX) {
    errors.instructions = `Keep it to ${INSTRUCTIONS_MAX} characters.`;
  }
  if (
    values.type === 'freeItem' &&
    !values.allProducts &&
    values.productIds.length === 0
  ) {
    errors.productIds = 'Pick at least one product, or allow all of them.';
  }
  return errors;
}

// After a failed submit, put the cursor in the first field with an error.
// Formik marks every field touched on submit, so the messages are visible
// by the time this runs.
const FIELD_ORDER: (keyof BenefitFormValues)[] = [
  'amount',
  'benefitName',
  'memberLabel',
  'instructions',
  'funding',
  'productIds',
];

function FocusFirstError() {
  const { submitCount, isValidating, errors } =
    useFormikContext<BenefitFormValues>();
  const handled = React.useRef(0);
  // Validation finishes after submitCount changes, so wait for it to settle
  // and act once per submit.
  React.useEffect(() => {
    if (submitCount === handled.current || isValidating) return;
    const first = FIELD_ORDER.find(key => errors[key]);
    if (!first) return;
    handled.current = submitCount;
    const el = document.querySelector<HTMLElement>(
      first === 'productIds'
        ? '.check-list input'
        : first === 'funding'
        ? '[name="funding"]'
        : `[name="${first}"]`
    );
    el?.focus();
  }, [submitCount, isValidating, errors]);
  return null;
}

type Option = { value: string; label: string; description: string };

// What helps when choosing which products a free item can come from: a
// picture to recognise it by, and the price, since the free item is always
// the cheapest qualifying garment in the cart.
function productThumb(product: StoreProduct) {
  return product.colors.find(c => c.primaryImage)?.primaryImage ?? null;
}

function productPriceRange(product: StoreProduct) {
  const prices = product.sizes.map(s => s.price).filter(p => p > 0);
  if (prices.length === 0) return '';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? formatToMoney(min, true)
    : `${formatToMoney(min, true)} – ${formatToMoney(max, true)}`;
}

// A radio group drawn as cards: the whole card is the hit area, and the
// selected one is outlined and tinted so the choice reads at a glance.
function OptionCards({
  name,
  options,
  disabled,
  columns = 2,
  boolean = false,
}: {
  name: string;
  options: Option[];
  disabled?: boolean;
  columns?: 1 | 2 | 3;
  // The field holds true/false; the cards are 'true' and 'false'.
  boolean?: boolean;
}) {
  const [field, , helpers] = useField<string | boolean>(name);
  const current = boolean ? String(field.value) : field.value;
  return (
    <div className={`option-cards cols-${columns}`} role="radiogroup">
      {options.map(option => {
        const id = `${name}-${option.value}`;
        const selected = current === option.value;
        return (
          <label
            key={option.value}
            htmlFor={id}
            className={`option-card${selected ? ' selected' : ''}${
              disabled ? ' disabled' : ''
            }`}
          >
            {boolean ? (
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={selected}
                disabled={disabled}
                onChange={() => helpers.setValue(option.value === 'true')}
              />
            ) : (
              <Field
                type="radio"
                id={id}
                name={name}
                value={option.value}
                disabled={disabled}
              />
            )}
            <span className="option-body">
              <span className="option-label">{option.label}</span>
              <span className="option-description">{option.description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

// The card logo, uploaded to S3 as soon as a file is picked. The form only
// ever holds the resulting URL, which is what the storefront renders.
function LogoField({
  storeId,
  onUploadingChange,
}: {
  storeId: string;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const [field, , helpers] = useField<string>('logo');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = validateLogoFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setUploading(true);
    onUploadingChange(true);
    try {
      const url = await uploadBenefitLogo(storeId, file);
      helpers.setValue(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      onUploadingChange(false);
    }
  };

  const value = field.value;
  const isUrl = /^https?:\/\//.test(value);

  return (
    <div className="field">
      <span className="group-label">Logo, optional</span>
      <div className="logo-field">
        {value ? (
          <div className="logo-preview">
            {isUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="Benefit logo" />
            ) : (
              <span className="logo-path" title={value}>
                {value}
              </span>
            )}
          </div>
        ) : (
          <div className="logo-preview empty">No logo</div>
        )}
        <div className="logo-actions">
          <button
            type="button"
            className="small-button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : value ? 'Replace' : 'Upload image'}
          </button>
          {value && !uploading && (
            <button
              type="button"
              className="link-button danger"
              onClick={() => helpers.setValue('')}
            >
              Remove
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={handleFile}
            hidden
          />
        </div>
      </div>
      <p className="hint">
        Shown on the storefront card. PNG, JPEG, WebP, GIF or SVG, up to 2 MB.
      </p>
      {error && <p className="hint error-hint">{error}</p>}
    </div>
  );
}

export default function BenefitFormModal(props: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const busy = props.isLoading || uploading;
  // Half-filled forms must survive a stray click; Cancel, Escape and the X
  // close it.
  useOutsideClick(true, props.onCancel, ref, true);
  useEscapeKeydownClose(true, props.onCancel, busy);
  const editing = Boolean(props.benefit);

  return (
    <ModalStyles>
      <div ref={ref} className="modal">
        <button
          type="button"
          className="close-button"
          onClick={props.onCancel}
          disabled={busy}
          aria-label="Close"
        >
          <XMarkIcon aria-hidden="true" />
        </button>
        <h3>{editing ? 'Edit member benefit' : 'Create member benefit'}</h3>
        <Formik<BenefitFormValues>
          initialValues={initialValues(props.benefit)}
          validate={validate}
          onSubmit={values => props.onSubmit(values)}
        >
          {({ values, errors, touched, setFieldValue }) => (
            <Form>
              <FocusFirstError />
              <fieldset className="form-fields" disabled={busy}>
                <section className="form-section">
                  <div className="section-head">
                    <h4>What members get</h4>
                    <p>
                      The kind of benefit and how much of it each member starts
                      with.
                    </p>
                  </div>
                  <div className="field">
                    <span className="group-label">Type</span>
                    <OptionCards
                      name="type"
                      columns={1}
                      disabled={editing}
                      options={[
                        {
                          value: 'credit',
                          label: benefitTypeLabel('credit'),
                          description:
                            'A dollar balance each member spends down over any number of orders.',
                        },
                        {
                          value: 'discount',
                          label: benefitTypeLabel('discount'),
                          description: 'A fixed amount off, usable once.',
                        },
                        {
                          value: 'freeItem',
                          label: benefitTypeLabel('freeItem'),
                          description:
                            'Garments per member, taken off the cheapest qualifying items.',
                        },
                      ]}
                    />
                    {editing && (
                      <p className="hint">
                        The type is locked once a benefit exists, because what
                        members have used is counted in its unit.
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="amount">
                      {values.type === 'freeItem'
                        ? 'Garments per member'
                        : 'Amount per member'}
                    </label>
                    <div
                      className={`adorned${
                        values.type === 'freeItem' ? ' suffix' : ' prefix'
                      }`}
                    >
                      {values.type !== 'freeItem' && (
                        <span className="adornment">$</span>
                      )}
                      <Field
                        id="amount"
                        name="amount"
                        type="text"
                        inputMode={
                          values.type === 'freeItem' ? 'numeric' : 'decimal'
                        }
                        autoComplete="off"
                        placeholder={values.type === 'freeItem' ? '1' : '75.00'}
                      />
                      {values.type === 'freeItem' && (
                        <span className="adornment">garments</span>
                      )}
                    </div>
                    {touched.amount && errors.amount ? (
                      <p className="hint error-hint">{errors.amount}</p>
                    ) : values.type === 'freeItem' &&
                      (parseBenefitAmount('freeItem', values.amount) ?? 0) >
                        20 ? (
                      <p className="hint warn-hint">
                        That is a lot of free garments per member. Double-check
                        it before saving.
                      </p>
                    ) : (
                      <p className="hint">
                        {values.type === 'credit'
                          ? 'The balance each member starts with.'
                          : values.type === 'discount'
                          ? 'Taken off the order once.'
                          : 'How many garments each member may take free.'}
                      </p>
                    )}
                  </div>
                </section>

                <section className="form-section">
                  <div className="section-head">
                    <h4>Storefront card</h4>
                    <p>What customers see on the store before they verify.</p>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="benefitName">Benefit name</label>
                      <Field
                        id="benefitName"
                        name="benefitName"
                        type="text"
                        placeholder="Employee Apparel Credit"
                        maxLength={NAME_MAX}
                      />
                      <p className="hint">
                        Titles the card and labels the line on the receipt.
                      </p>
                      {touched.benefitName && errors.benefitName && (
                        <p className="hint error-hint">{errors.benefitName}</p>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="memberLabel">Member label, plural</label>
                      <Field
                        id="memberLabel"
                        name="memberLabel"
                        type="text"
                        placeholder="Employees"
                        maxLength={LABEL_MAX}
                      />
                      <p className="hint">
                        What the people are called on the card.
                      </p>
                      {touched.memberLabel && errors.memberLabel && (
                        <p className="hint error-hint">{errors.memberLabel}</p>
                      )}
                    </div>
                  </div>

                  <div className="field">
                    <div className="label-row">
                      <label htmlFor="instructions">
                        Instructions, optional
                      </label>
                      <span
                        className={`counter${
                          values.instructions.length > INSTRUCTIONS_MAX
                            ? ' over'
                            : ''
                        }`}
                      >
                        {values.instructions.length}/{INSTRUCTIONS_MAX}
                      </span>
                    </div>
                    <Field
                      as="textarea"
                      id="instructions"
                      name="instructions"
                      rows={2}
                      placeholder="Enter your company email to activate your credit."
                    />
                    {errors.instructions ? (
                      <p className="hint error-hint">{errors.instructions}</p>
                    ) : (
                      <p className="hint">
                        A sentence or two on the storefront card. Leave it blank
                        for the default built from the name and label.
                      </p>
                    )}
                  </div>

                  <LogoField
                    storeId={props.store._id}
                    onUploadingChange={setUploading}
                  />
                </section>

                <section className="form-section">
                  <div className="section-head">
                    <h4>Access and billing</h4>
                    <p>
                      Who can shop, and who pays Macaport for what members use.
                    </p>
                  </div>
                  <div className="field">
                    <span className="group-label">Access</span>
                    <OptionCards
                      name="access"
                      options={[
                        {
                          value: 'public',
                          label: 'Public',
                          description:
                            'Anyone can shop. Members who verify get the benefit.',
                        },
                        {
                          value: 'members',
                          label: 'Members only',
                          description:
                            'Nothing but the sign-in card shows until a member has verified.',
                        },
                      ]}
                    />
                  </div>

                  <div className="field">
                    <span className="group-label">Funded by</span>
                    <OptionCards
                      name="funding"
                      options={[
                        {
                          value: 'client',
                          label: 'Client',
                          description:
                            'Macaport invoices the client for exactly what members used.',
                        },
                        {
                          value: 'macaport',
                          label: 'Macaport',
                          description:
                            'Macaport absorbs it as a discount or a free item.',
                        },
                      ]}
                    />
                    {errors.funding && (
                      <p className="hint error-hint">{errors.funding}</p>
                    )}
                  </div>
                </section>

                {values.type === 'freeItem' && (
                  <section className="form-section">
                    <div className="section-head">
                      <h4>Qualifying products</h4>
                      <p>
                        Which store products the free item can be taken from.
                      </p>
                    </div>
                    <div className="field">
                      <OptionCards
                        name="allProducts"
                        boolean
                        options={[
                          {
                            value: 'true',
                            label: 'Every product',
                            description:
                              'Anything in the store can be the free item.',
                          },
                          {
                            value: 'false',
                            label: 'Only these',
                            description:
                              'Pick which products qualify from the list.',
                          },
                        ]}
                      />
                    </div>
                    {!values.allProducts && (
                      <div className="field">
                        <div className="list-toolbar">
                          <span className="counter">
                            {values.productIds.length} of{' '}
                            {props.store.products.length} selected
                          </span>
                          {props.store.products.length > 0 && (
                            <span className="list-actions">
                              <button
                                type="button"
                                className="link-button"
                                onClick={() =>
                                  setFieldValue(
                                    'productIds',
                                    props.store.products.map(p => p.id)
                                  )
                                }
                              >
                                Select all
                              </button>
                              <button
                                type="button"
                                className="link-button"
                                onClick={() => setFieldValue('productIds', [])}
                              >
                                Clear
                              </button>
                            </span>
                          )}
                        </div>
                        <div className="check-list">
                          {props.store.products.length === 0 && (
                            <span className="hint">
                              This store has no products yet.
                            </span>
                          )}
                          {props.store.products.map(product => {
                            const checked = values.productIds.includes(
                              product.id
                            );
                            return (
                              <label
                                key={product.id}
                                htmlFor={`product-${product.id}`}
                                className={`check-row${
                                  checked ? ' selected' : ''
                                }`}
                              >
                                <Field
                                  type="checkbox"
                                  id={`product-${product.id}`}
                                  name="productIds"
                                  value={product.id}
                                />
                                {productThumb(product) ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    className="check-thumb"
                                    src={productThumb(product) as string}
                                    alt=""
                                  />
                                ) : (
                                  <span className="check-thumb empty" />
                                )}
                                <span className="check-text">
                                  {product.name}
                                  <span className="check-sub">
                                    {product.merchandiseCode} ·{' '}
                                    {product.colors.length} color
                                    {product.colors.length === 1
                                      ? ''
                                      : 's'} · {product.sizes.length} size
                                    {product.sizes.length === 1 ? '' : 's'}
                                  </span>
                                </span>
                                <span className="check-price">
                                  {productPriceRange(product)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        {errors.productIds && (
                          <p className="hint error-hint">
                            {String(errors.productIds)}
                          </p>
                        )}
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
                  {editing
                    ? 'Changes reach the storefront as soon as they are saved.'
                    : 'Members are added after the benefit is created.'}
                </p>
                <div className="buttons">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={props.onCancel}
                    disabled={busy}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={busy}
                  >
                    {uploading
                      ? 'Uploading logo...'
                      : props.isLoading
                      ? 'Saving...'
                      : editing
                      ? 'Save changes'
                      : 'Create benefit'}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
        <ModalSpinner isLoading={props.isLoading} />
      </div>
    </ModalStyles>
  );
}
