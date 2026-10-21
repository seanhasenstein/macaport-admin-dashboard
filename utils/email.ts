import nodemailer from 'nodemailer';

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
// uses. Server-only.
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const server = process.env.NEXTAUTH_EMAIL_SERVER;
  const from = process.env.NEXTAUTH_EMAIL_FROM;
  if (!server || !from) {
    throw new Error('Email is not configured (NEXTAUTH_EMAIL_SERVER/FROM).');
  }
  const recipient = resolveRecipient(to);
  const transport = nodemailer.createTransport(server);
  await transport.sendMail({
    to: recipient.to,
    from,
    subject: recipient.redirected ? `[TEST → ${to}] ${subject}` : subject,
    text,
    html,
  });
  // Callers surface a redirect in the UI so a tester sees where the message
  // went instead of wondering why the customer never got it.
  return { deliveredTo: recipient.to, redirected: recipient.redirected };
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function refundEmail({
  firstName,
  orderId,
  storeName,
  sentence,
}: {
  firstName: string;
  orderId: string;
  storeName: string;
  sentence: string;
}) {
  const text = `Hi ${firstName},\n\nAn update on your ${storeName} order #${orderId}.\n\n${sentence}\n\nIf you have any questions, reply to this email.\n\nMacaport`;
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#242a37;max-width:560px;margin:0 auto;padding:24px;">
  <p>Hi ${escapeHtml(firstName)},</p>
  <p>An update on your ${escapeHtml(storeName)} order <strong>#${escapeHtml(
    orderId
  )}</strong>.</p>
  <p>${escapeHtml(sentence)}</p>
  <p>If you have any questions, reply to this email.</p>
  <p>Macaport</p>
</div>`;
  return {
    subject: `Refund for your ${storeName} order #${orderId}`,
    text,
    html,
  };
}
