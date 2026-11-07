// Uploads a member benefit's card logo to S3 through the same presigned-URL
// route the product images use, and returns the public URL to store in
// copy.logo. Browser-only.

export const LOGO_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

export function validateLogoFile(file: File): string | null {
  if (!LOGO_TYPES.includes(file.type)) {
    return 'Logo must be a PNG, JPEG, WebP, GIF or SVG.';
  }
  if (file.size > LOGO_MAX_BYTES) {
    return 'Logo must be 2 MB or smaller.';
  }
  return null;
}

export async function uploadBenefitLogo(storeId: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const key = `${Date.now()}-${safeName}`;

  const presignRes = await fetch('/api/s3/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind: 'benefitLogo',
      storeId,
      key,
      contentType: file.type,
    }),
  });
  if (!presignRes.ok) {
    const data = await presignRes.json().catch(() => ({}));
    throw new Error(
      data.error || `Failed to get upload URL (${presignRes.status})`
    );
  }
  const { uploadUrl, publicUrl } = await presignRes.json();

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!uploadRes.ok) {
    throw new Error(`Upload failed (${uploadRes.status})`);
  }
  return publicUrl as string;
}
