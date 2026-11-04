// Who can sign in to the dashboard, and the name to show for each. The
// sign-in link records only an email, so this is where names come from
// wherever the dashboard says who did something. Add a name when it is
// known; until then the email is shown.
export const ADMINS: { email: string; name?: string }[] = [
  { email: 'seanhasenstein@gmail.com', name: 'Sean Hasenstein' },
  { email: 'nick@macaport.com' },
  { email: 'joe@macaport.com' },
  // ally@macaport.com removed on 05/20/26: she no longer works at Macaport.
  { email: 'anne@macaport.com' },
  { email: 'nschaefer@coveme.com' },
  { email: 'aschaefer@macaport.com' },
  { email: 'katrina@macaport.com' },
];

export const ALLOWED_ADMIN_EMAILS = ADMINS.map(a => a.email);

export function adminName(email: string | undefined | null) {
  if (!email) return '';
  const admin = ADMINS.find(a => a.email === email.trim().toLowerCase());
  return admin?.name || email;
}
