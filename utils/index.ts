import * as crypto from 'crypto';
import { formatISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import {
  Size,
  InventorySize,
  Color,
  InventoryColor,
  InventorySku,
  OrderItem,
  ProductSku,
  StoreProduct,
} from '../interfaces';

export function calculateStripeFee(value: number) {
  return value * 0.029 + 30;
}

export function calculateTotalItems(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function formatStoreTimestamp(date: string, time: string) {
  const hour = Number(time.slice(0, 2));
  const minute = Number(time.slice(3));
  const timezone = 'America/Chicago';
  const zonedTime = utcToZonedTime(date, timezone);
  zonedTime.setHours(hour, minute);
  return formatISO(zonedTime);
}

export function formatGroupTerm(requirement: boolean, groupTerm: string) {
  if (requirement === true) {
    if (groupTerm.trim().length === 0) return 'group';
    if (groupTerm.trim().length > 0) return groupTerm.toLowerCase();
  }
  return '';
}

export function formatGroups(requirment: boolean, groups: string[]) {
  if (requirment === false) {
    return [];
  }
  return groups.map(g => g.trim()).filter(g => g !== '');
}

export function getQueryParameter(input: string | string[] | undefined) {
  if (!input) return;

  return Array.isArray(input) ? input[0] : input;
}

export function slugify(input: string) {
  let result = input;
  result = result.trim().toLowerCase().replace(/\s+/g, '-');
  result = result.replace(/[^0-9a-z-]/g, '');
  result = result.replace(/^-+|-+(?=-|$)/g, '');
  result = result.replace(/^-/, '');
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

export function formatHexColors(colorsArray: InventoryColor[]) {
  const colors = colorsArray.map(c => {
    const formattedHex = `#${c.hex.replace(/[^0-9A-Fa-f]/g, '').toLowerCase()}`;
    return { ...c, hex: formattedHex };
  });
  return colors;
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

export function createInventoryProductSkus(
  sizes: InventorySize[],
  colors: InventoryColor[],
  inventoryProductId: string
) {
  let skus: InventorySku[] = [];

  colors.forEach(c => {
    const skuResult = sizes.map(s => {
      const id = createId('inv_sku');
      return {
        id,
        inventoryProductId,
        size: s,
        color: c,
        inventory: 0,
        active: true,
      };
    });

    skus = [...skus, ...skuResult];
  });

  return skus;
}

interface CreateStoreProductSkus {
  sizes: Size[];
  colors: Color[];
  storeProductId: string;
  inventoryProductSkus: InventorySku[];
}

export function createStoreProductSkus({
  sizes,
  colors,
  storeProductId,
  inventoryProductSkus,
}: CreateStoreProductSkus) {
  let skus: ProductSku[] = [];

  colors.forEach(c => {
    const skusResult = sizes.map(s => {
      const id = createId('prod_sku');
      const inventoryProductSku = inventoryProductSkus.find(
        ips => ips.color.id === c.id && ips.size.id === s.id
      );

      if (!inventoryProductSku) {
        throw new Error('Unable to find valie inventoryProductSku');
      }

      return {
        id,
        storeProductId,
        inventoryProductId: inventoryProductSku.inventoryProductId,
        inventorySkuId: inventoryProductSku?.id,
        size: s,
        color: c,
        active: false,
      };
    });

    skus = [...skus, ...skusResult];
  });

  return skus;
}

export function updateProductSkus(
  previousProductSkus: ProductSku[],
  formData: StoreProduct
) {
  return previousProductSkus.map(sku => {
    const size = formData.sizes.find(s => s.id === sku.size.id);
    const color = formData.colors.find(c => c.id === sku.color.id);

    let updatedSku = { ...sku };

    if (size) {
      updatedSku = { ...updatedSku, size };
    }

    if (color) {
      updatedSku = { ...updatedSku, color };
    }

    return updatedSku;
  });
}

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
