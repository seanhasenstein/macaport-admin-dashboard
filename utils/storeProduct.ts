import {
  PersonalizationItem,
  PersonalizationFormItem,
  PersonalizationForm,
  Personalization,
} from '../interfaces';
import { createId } from '.';

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
