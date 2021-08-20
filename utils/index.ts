import * as crypto from 'crypto';
import { Size, Color, Sku, Product } from '../interfaces';

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

export function formatHexColor(hex: string) {
  const formattedHex = `#${hex.replace(/[^0-9A-Fa-f]/g, '').toLowerCase()}`;
  return formattedHex;
}

export function formatToMoney(input: number, includeDecimal = false) {
  const price = input / 100;

  if (includeDecimal) {
    return `$${price.toFixed(2)}`;
  } else {
    return `$${price}`;
  }
}

export function formatFromStripeToPrice(value: number) {
  return `${value / 100}.00`;
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

export function getStoreStatus(openDate: string, closeDate: string | null) {
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

export function handleProductSkusUpdate(queryData: Product, formData: Product) {
  // update all current skus
  let skus = formData.skus.map(sku => {
    const size = formData.sizes.find(s => s.id === sku.size.id);
    const color = formData.colors.find(c => c.id === sku.color.id);
    const result = { ...sku };
    if (size) result.size = size;
    if (color) result.color = color;
    return result;
  });

  // check for new sizes and creates new skus
  formData.sizes.forEach(size => {
    const sizeAlreadyExists = queryData.skus.some(s => s.size.id === size.id);
    if (!sizeAlreadyExists) {
      const newSizeSkus = createSkusFromSizesAndColors(
        [size],
        // check the prev colors and the new size
        queryData.colors,
        formData.id
      );
      skus = [...skus, ...newSizeSkus];
    }
  });

  // check for new colors and create new skus
  formData.colors.forEach(color => {
    const colorAlreadyExists = queryData.skus.some(
      s => s.color.id === color.id
    );
    if (!colorAlreadyExists) {
      const newColorSkus = createSkusFromSizesAndColors(
        // check new sizes and new the new colors
        formData.sizes,
        [color],
        formData.id
      );
      skus = [...skus, ...newColorSkus];
    }
  });

  const sizesToRemove = queryData.sizes.reduce(
    (acc: Size[], currSize: Size) => {
      const stillExists = formData.sizes.some(s => s.id === currSize.id);
      if (!stillExists) {
        return [...acc, currSize];
      }
      return acc;
    },
    []
  );

  const colorsToRemove = queryData.colors.reduce(
    (acc: Color[], currColor: Color) => {
      const stillExists = formData.colors.some(s => s.id === currColor.id);
      if (!stillExists) {
        return [...acc, currColor];
      }
      return acc;
    },
    []
  );

  // loop over the skus and remove if it includes a size or color from remove array
  const filteredSkus = skus.reduce((acc: Sku[], currSku: Sku) => {
    let keepSku = true;
    sizesToRemove.forEach(size => {
      if (size.id === currSku.size.id) {
        keepSku = false;
      }
    });
    colorsToRemove.forEach(color => {
      if (color.id === currSku.color.id) {
        keepSku = false;
      }
    });

    if (keepSku) {
      return [...acc, currSku];
    }

    return acc;
  }, []);

  return filteredSkus;
}
