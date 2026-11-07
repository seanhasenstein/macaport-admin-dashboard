import nodemailer from 'nodemailer';

import { BenefitType } from '../core/memberBenefits/types';
import {
  escapeHtml,
  heading,
  lede,
  MACAPORT_ADDRESS,
  noteBox,
  shellHtml,
  standardFooter,
  storePhrase,
  summaryRowHtml,
  table,
} from './emailLayout';

// Only production may email a real customer. Anywhere else, a recipient on
// EMAIL_ALLOWLIST (exact addresses or @domains, comma separated) is
// delivered to, so Macaport staff can test with their own inboxes, and
// everyone else is redirected to EMAIL_REDIRECT_TO with the intended
// recipient in the subject. With neither set, sending refuses rather than
// guessing. The dev database is a copy of production, so the data alone is
// never a safe signal.
export function isProduction() {
  return process.env.VERCEL_ENV === 'production';
}

export function isAllowlisted(
  to: string,
  allowlist = process.env.EMAIL_ALLOWLIST
) {
  const email = to.trim().toLowerCase();
  const domain = email.slice(email.lastIndexOf('@'));
  return (allowlist ?? '')
    .split(',')
    .map(entry => entry.trim().toLowerCase())
    .filter(Boolean)
    .some(entry =>
      entry.startsWith('@') ? entry === domain : entry === email
    );
}

export function resolveRecipient(to: string) {
  if (isProduction()) return { to, redirected: false };
  if (isAllowlisted(to)) return { to, redirected: false };
  const redirect = process.env.EMAIL_REDIRECT_TO;
  if (!redirect) {
    throw new Error(
      'Refusing to send email outside production: set EMAIL_REDIRECT_TO to a test inbox, or add the recipient to EMAIL_ALLOWLIST.'
    );
  }
  return { to: redirect, redirected: true };
}

// One outbound email, through the same SMTP transport the sign-in link
// uses. Server-only. Customer emails pass fromName "Macaport" and a
// replyTo, so they read as Macaport rather than the dashboard and a reply
// reaches someone; the address stays the configured one, which is what the
// mail domain is set up to send as.
export async function sendEmail({
  to,
  subject,
  text,
  html,
  fromName,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  fromName?: string;
  replyTo?: string;
}) {
  const server = process.env.NEXTAUTH_EMAIL_SERVER;
  const configuredFrom = process.env.NEXTAUTH_EMAIL_FROM;
  if (!server || !configuredFrom) {
    throw new Error('Email is not configured (NEXTAUTH_EMAIL_SERVER/FROM).');
  }
  const from = fromName
    ? `${fromName} <${fromAddress(configuredFrom)}>`
    : configuredFrom;
  const recipient = resolveRecipient(to);
  const transport = nodemailer.createTransport(server);
  await transport.sendMail({
    to: recipient.to,
    from,
    replyTo,
    subject: recipient.redirected ? `[TEST → ${to}] ${subject}` : subject,
    text,
    html,
  });
  // Callers surface a redirect in the UI so a tester sees where the message
  // went instead of wondering why the customer never got it.
  return { deliveredTo: recipient.to, redirected: recipient.redirected };
}

// "Macaport Admin Dashboard <noreply@macaport.com>" -> "noreply@macaport.com"
export function fromAddress(from: string) {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).trim();
}

export const SUPPORT_EMAIL = 'support@macaport.com';

export interface RefundEmailItem {
  name: string;
  // "White · L"
  detail: string;
  quantity: number;
}

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function restoredValue(benefitType: BenefitType | null, amount: number) {
  if (benefitType === 'freeItem') {
    return `${amount} free ${amount === 1 ? 'item' : 'items'}`;
  }
  return money(amount);
}

const CARD_TIMING =
  'It usually shows up on your statement within 5 to 10 business days.';

// The refund note, in the storefront's email layout. It goes out when the
// refund is recorded, which is before anyone has refunded the card in
// Stripe, so the card line says the refund is coming, never that it is done.
export function refundEmail({
  orderId,
  storeName,
  card,
  creditRestored,
  benefitType,
  benefitLabel,
  items,
}: {
  orderId: string;
  storeName: string;
  card: number;
  creditRestored: number;
  benefitType: BenefitType | null;
  benefitLabel: string;
  items: RefundEmailItem[];
}) {
  const store = storePhrase(storeName);
  const restored = restoredValue(benefitType, creditRestored);
  const title =
    card > 0
      ? 'Your refund is on its way'
      : `Your ${benefitLabel} has been restored`;
  const preheader =
    card > 0
      ? `We're refunding ${money(card)} to your card for order #${orderId}.`
      : `${restored} is back on your ${benefitLabel} for order #${orderId}.`;

  const rows: Array<[string, string]> = [];
  if (card > 0) {
    rows.push([
      'Refund to your card',
      `<strong>${money(
        card
      )}</strong><br /><span style="color:#737373;font-size:13px;">${CARD_TIMING}</span>`,
    ]);
  }
  if (creditRestored > 0) {
    rows.push([
      `Restored to your ${benefitLabel}`,
      `<strong>${escapeHtml(
        restored
      )}</strong><br /><span style="color:#737373;font-size:13px;">Ready to use on your next order.</span>`,
    ]);
  }
  if (items.length > 0) {
    rows.push([
      items.length === 1 ? 'Item returned' : 'Items returned',
      items
        .map((i, n) => {
          const meta = [
            i.detail,
            i.quantity > 1 ? `Qty ${i.quantity}` : '',
          ].filter(Boolean);
          return `<div style="margin:${n === 0 ? 0 : 10}px 0 0;">${escapeHtml(
            i.name
          )}${
            meta.length
              ? `<br /><span style="color:#737373;font-size:13px;">${escapeHtml(
                  meta.join(' · ')
                )}</span>`
              : ''
          }</div>`;
        })
        .join(''),
    ]);
  }

  const body = `${heading(escapeHtml(title))}${lede(
    `For order <strong style="color:#171717;white-space:nowrap;">#${escapeHtml(
      orderId
    )}</strong> from the ${escapeHtml(store)}.`
  )}<div style="margin:12px 0 0;">${table(
    rows
      .map(([label, value], i) =>
        summaryRowHtml(label, value, i === rows.length - 1)
      )
      .join('')
  )}</div>${noteBox(
    `Questions about this refund? Reply to this email, or write to <a href="mailto:${SUPPORT_EMAIL}" style="color:#737373;">${SUPPORT_EMAIL}</a>.`
  )}`;

  const footer = standardFooter(
    `You are receiving this because of your order <span style="white-space:nowrap;">#${escapeHtml(
      orderId
    )}</span> from the ${escapeHtml(store)} at macaport.com.`
  );

  const lines = [
    `${title}`,
    '',
    `For order #${orderId} from the ${store}.`,
    '',
  ];
  if (card > 0) {
    lines.push(`Refund to your card: ${money(card)}`, CARD_TIMING, '');
  }
  if (creditRestored > 0) {
    lines.push(
      `Restored to your ${benefitLabel}: ${restored}`,
      'Ready to use on your next order.',
      ''
    );
  }
  if (items.length > 0) {
    lines.push(items.length === 1 ? 'Item returned:' : 'Items returned:');
    for (const i of items) {
      lines.push(
        `- ${i.name}${i.detail ? `, ${i.detail}` : ''}${
          i.quantity > 1 ? ` x ${i.quantity}` : ''
        }`
      );
    }
    lines.push('');
  }
  lines.push(
    `Questions about this refund? Reply to this email, or write to ${SUPPORT_EMAIL}.`,
    '',
    'Macaport',
    MACAPORT_ADDRESS
  );

  return {
    subject:
      card > 0
        ? `Your refund for ${store} order #${orderId}`
        : `Your ${benefitLabel} is restored for order #${orderId}`,
    text: lines.join('\n'),
    html: shellHtml({ title, preheader, body, footer }),
  };
}
