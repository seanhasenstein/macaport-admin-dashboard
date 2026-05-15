import { createId } from '.';

import {
  PersonalizationItem,
  PersonalizationFormItem,
  PersonalizationForm,
  Personalization,
} from '../interfaces';

export function createBlankPersonalizedItem(prefix: string) {
  const item: PersonalizationFormItem = {
    id: createId(prefix),
    name: '',
    type: 'string',
    list: '',
    location: '',
    price: '0.00',
    lines: 0,
    limit: 0,
    subItems: [],
  };

  return item;
}

function formatAddonItem(item: PersonalizationFormItem) {
  const list =
    item.type === 'list' ? item.list.split(',').map(v => v.trim()) : [];
  const price = Number(item.price) * 100;
  const subItems =
    item.subItems.length === 0 ? [] : formatAddonItems(item.subItems);

  return {
    ...item,
    list,
    price,
    lines: Number(item.lines),
    limit: Number(item.limit),
    subItems,
  };
}

function formatAddonItems(
  items: PersonalizationFormItem[]
): PersonalizationItem[] {
  return items.map(item => formatAddonItem(item));
}

export function formatPersonalizationValues(
  formValues: PersonalizationForm
): Personalization {
  if (formValues.active === false) {
    return {
      active: false,
      maxLines: 0,
      addons: [],
    };
  } else {
    return {
      ...formValues,
      maxLines: Number(formValues.maxLines),
      addons: formatAddonItems(formValues.addons),
    };
  }
}

export function formatDbAddonItemsForForm(
  items: PersonalizationItem[]
): PersonalizationFormItem[] {
  return items.map(addon => {
    const list = addon.list.join(', ');
    const subItems = addon.subItems.map(subItem => {
      const list = subItem.list.join(', ');
      return {
        ...subItem,
        list,
        price: (subItem.price / 100).toFixed(2),
        subItems: [],
      };
    });

    return {
      ...addon,
      list,
      price: (addon.price / 100).toFixed(2),
      subItems,
    };
  });
}

type HandleStoreProductImageUploadType = {
  storeId: string;
  productId: string;
  colorId: string;
  image: File | null;
  key: string;
  errorHandler: (message: string) => void;
};

export async function handleStoreProductImageUpload(
  args: HandleStoreProductImageUploadType
) {
  const { storeId, productId, colorId, image, key, errorHandler } = args;

  if (!image) return;

  const contentType = image.type || 'application/octet-stream';

  try {
    const presignRes = await fetch('/api/s3/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, productId, colorId, key, contentType }),
    });

    if (!presignRes.ok) {
      throw new Error(`Failed to get upload URL (${presignRes.status})`);
    }

    const { uploadUrl, publicUrl } = await presignRes.json();

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: image,
    });

    if (!uploadRes.ok) {
      throw new Error(`S3 upload failed (${uploadRes.status})`);
    }

    return publicUrl;
  } catch (err: any) {
    errorHandler(err.message ?? String(err));
  }
}
