// The storefront's shared email layout (logo, white card, footer), copied
// from macaport/macaport utils/email.ts so customer emails from the
// dashboard look like the ones from the storefront. Re-copy these if the
// storefront changes its shell. Server-only, plain strings.

export const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

// Email clients render borders more faintly than a browser does, and several
// strip background colours entirely, which leaves the border as the only
// thing holding a box together.
export const BORDER = '#d4d4d4';
export const BORDER_SOFT = '#e5e5e5';
export const PAGE_BG = '#f0f0f0';

const LOGO_URL =
  'https://macaport-public.s3.us-east-2.amazonaws.com/email-logo.png';
// 400x105 at source. Outlook ignores CSS sizing on images, so the width and
// height attributes derived from this keep the logo the right size there.
const LOGO_RATIO = 400 / 105;

export const MACAPORT_ADDRESS =
  'Macaport LLC, 3080 Frederick Farm Ln. Suite 101, New London, WI 54961';

export function escapeHtml(value: string) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// "Acme Construction Employee Store" stays as is; "Lincoln Elementary"
// becomes "Lincoln Elementary store".
export function storePhrase(storeName: string) {
  const name = storeName.trim();
  return /\b(store|shop)$/i.test(name) ? name : `${name} store`;
}

// Label above value, which holds up on a phone. The value is inserted as is,
// so callers escape it.
export function summaryRowHtml(label: string, value: string, last = false) {
  return `<tr><td style="padding:14px 0;${
    last ? '' : `border-bottom:1px solid ${BORDER_SOFT};`
  }"><div style="margin:0 0 3px;color:#737373;font-family:${FONT};font-size:12px;line-height:1.4;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(
    label
  )}</div><div style="margin:0;color:#171717;font-family:${FONT};font-size:15px;line-height:1.55;">${value}</div></td></tr>`;
}

export const table = (rows: string) =>
  `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tbody>${rows}</tbody></table>`;

export const heading = (text: string) =>
  `<h1 style="margin:0;color:#171717;font-family:${FONT};font-size:22px;line-height:1.25;font-weight:700;letter-spacing:-0.01em;">${text}</h1>`;

export const lede = (text: string) =>
  `<p style="margin:10px 0 0;color:#737373;font-family:${FONT};font-size:15px;line-height:1.6;">${text}</p>`;

export const noteBox = (text: string, top = 22) =>
  `<p style="margin:${top}px 0 0;padding:14px 16px;color:#737373;background-color:#fafafa;border:1px solid ${BORDER};border-radius:10px;font-family:${FONT};font-size:13px;line-height:1.55;">${text}</p>`;

export const footerLine = (content: string, last = false) =>
  `<p style="margin:0 0 ${
    last ? '0' : '10px'
  };color:#a1a1a1;font-family:${FONT};font-size:12px;line-height:1.5;text-align:center;">${content}</p>`;

const link = (href: string, text: string) =>
  `<a href="${href}" style="color:#737373;text-decoration:underline;">${text}</a>`;

// The footer every storefront email ends with, after a line saying why the
// reader got this one.
export function standardFooter(reason: string) {
  return [
    footerLine(reason),
    footerLine(
      `${link(
        'https://www.macaport.com',
        'macaport.com'
      )} &nbsp;&middot;&nbsp; ${link(
        'https://www.macaport.com/privacy-policy',
        'Privacy policy'
      )}`
    ),
    footerLine(MACAPORT_ADDRESS),
    footerLine(
      `&copy; ${new Date().getFullYear()} Macaport LLC. All rights reserved.`,
      true
    ),
  ].join('');
}

export function shellHtml({
  title,
  preheader,
  body,
  footer,
}: {
  title: string;
  preheader: string;
  body: string;
  footer: string;
}) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(
    title
  )}</title></head><body style="margin:0;padding:0;background-color:${PAGE_BG};"><div style="display:none;font-size:1px;color:${PAGE_BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(
    preheader
  )}</div><div style="background-color:${PAGE_BG};margin:0;padding:24px 0;width:100%;"><table role="presentation" border="0" align="center" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td align="center"><div style="margin:0 auto;padding:8px 0 24px;"><img alt="Macaport" src="${LOGO_URL}" width="${Math.round(
    44 * LOGO_RATIO
  )}" height="44" style="display:block;border:0;outline:none;text-decoration:none;height:44px;width:auto;" /></div></td></tr></tbody></table><div style="margin:0 auto;max-width:600px;width:100%;padding:0 16px;box-sizing:border-box;"><table role="presentation" width="100%" align="center" border="0" cellpadding="0" cellspacing="0"><tbody><tr><td width="100%" align="left" valign="top" bgcolor="#FFFFFF" style="background-color:#FFFFFF;border:1px solid ${BORDER};border-radius:12px;box-sizing:border-box;padding:28px 24px 28px;">${body}</td></tr></tbody></table><table role="presentation" width="100%" align="center" border="0" cellpadding="0" cellspacing="0"><tbody><tr><td align="center" style="padding:24px 8px 32px;">${footer}</td></tr></tbody></table></div></div></body></html>`;
}
