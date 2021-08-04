import * as crypto from 'crypto';
import { Size, Color, Sku } from '../interfaces';

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const unitedStates = [
  'Alaska',
  'Alabama',
  'Arkansas',
  'Arizona',
  'California',
  'Colorado',
  'Connecticut',
  'District of Columbia',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Iowa',
  'Idaho',
  'Illinois',
  'Indiana',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Massachusetts',
  'Maryland',
  'Maine',
  'Michigan',
  'Minnesota',
  'Missouri',
  'Mississippi',
  'Montana',
  'North Carolina',
  'North Dakota',
  'Nebraska',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'Nevada',
  'New York',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Virginia',
  'Vermont',
  'Washington',
  'Wisconsin',
  'West Virginia',
  'Wyoming',
];

export function slugify(input: string) {
  let result = input;
  // trim and convert to lowercase
  // and replace all spaces with a dash
  result = result.trim().toLowerCase().replace(/\s+/g, '-');
  // remove all non alpha-numeric characters (but keep dashes)
  result = result.replace(/[^0-9a-z-]/g, '');
  // remove all multiple dashes (--, ---, etc.)
  result = result.replace(/^-+|-+(?=-|$)/g, '');
  // remove dash if it's the first character
  result = result.replace(/^-/, '');
  // remove dash if it's the last character
  result = result.replace(/-$/, '');
  return result;
}

export function removeNonAlphanumeric(input: string) {
  return input.replace(/\W/g, '');
}

export function removeNonDigits(input: string) {
  return input.replace(/\D/g, '');
}

export function formatPhoneNumber(input: string) {
  const digits = removeNonDigits(input);
  const digitsArray = digits.split('');
  return digitsArray
    .map((v, i) => {
      if (i === 0) return `(${v}`;
      if (i === 2) return `${v}) `;
      if (i === 5) return `${v}-`;
      return v;
    })
    .join('');
}

export function formatToMoney(input: number, includeDecimal = false) {
  const price = input / 100;

  if (includeDecimal) {
    return `$${price.toFixed(2)}`;
  } else {
    return `$${price}`;
  }
}

const ALPHA_NUM =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function createId(prefix?: string | false, len = 14) {
  const rnd = crypto.randomBytes(len);
  const value = new Array(len);
  const charsLength = ALPHA_NUM.length;

  for (let i = 0; i < len; i++) {
    value[i] = ALPHA_NUM[rnd[i] % charsLength];
  }

  const id = value.join('');

  if (prefix) return `${prefix}_${id}`;

  return id;
}

export function getStoreStatus(
  openDate: string,
  closeDate: string | undefined
) {
  const open = new Date(openDate);
  const close = new Date(closeDate || 'Jan 01 9999');
  const now = new Date();

  if (now < open) {
    return 'upcoming';
  }

  if (now > open && now < close) {
    return 'open';
  }

  if (now > close) {
    return 'closed';
  }

  return;
}

export async function getCloudinarySignature(publicId: string) {
  const response = await fetch(`/api/cloudinary/sign?publicId=${publicId}`);
  const data: { signature: string; timestamp: number } = await response.json();
  const { signature, timestamp } = data;
  return { signature, timestamp };
}

export function createSkusFromSizesAndColors(
  sizes: Size[],
  colors: Color[],
  productId: string
) {
  let skus: Sku[] = [];

  sizes.forEach(s => {
    const skusResult = colors.map(c => {
      const id = createId('sku');
      return { id, productId, size: s, color: c };
    });

    skus = [...skus, ...skusResult];
  });

  return skus;
}
