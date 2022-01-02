import { format } from 'date-fns';
import { Store, StoreForm } from '../interfaces';
import {
  formatGroups,
  formatGroupTerm,
  formatPhoneNumber,
  formatStoreTimestamp,
  removeNonDigits,
} from './index';

export const createStoreInitialValues: StoreForm = {
  name: '',
  contact: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  openDate: format(new Date(), 'yyyy-MM-dd'),
  openTime: format(new Date(), 'HH:00'),
  permanentlyOpen: false,
  closeDate: format(new Date(), 'yyyy-MM-dd'),
  closeTime: format(new Date(), 'HH:00'),
  allowDirectShipping: false,
  hasPrimaryShippingLocation: false,
  primaryShippingLocation: {
    name: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    zipcode: '',
  },
  requireGroupSelection: false,
  groupTerm: '',
  groups: [''],
  redirectTo: 'store',
};

export function formatUpdateInitialValues(store: Store): StoreForm {
  return {
    name: store.name,
    contact: {
      ...store.contact,
      phone: formatPhoneNumber(store.contact.phone),
    },
    openDate: format(new Date(store.openDate), 'yyyy-MM-dd'),
    openTime: format(new Date(store.openDate), 'HH:mm'),
    permanentlyOpen: store.permanentlyOpen,
    closeDate: store.closeDate
      ? format(new Date(store.closeDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
    closeTime: store.closeDate
      ? format(new Date(store.closeDate), 'HH:mm')
      : format(new Date(), 'HH:00'),
    allowDirectShipping: store.allowDirectShipping,
    hasPrimaryShippingLocation: store.hasPrimaryShippingLocation,
    primaryShippingLocation: store.primaryShippingLocation,
    requireGroupSelection: store.requireGroupSelection,
    groupTerm: store.groupTerm,
    groups: store.groups,
  };
}

export function formatDataForDb(data: StoreForm) {
  return {
    name: data.name.trim(),
    contact: {
      firstName: data.contact.firstName.trim(),
      lastName: data.contact.lastName.trim(),
      email: data.contact.email.trim().toLowerCase(),
      phone: removeNonDigits(data.contact.phone),
    },
    openDate: formatStoreTimestamp(data.openDate, data.openTime),
    closeDate: !data.permanentlyOpen
      ? formatStoreTimestamp(data.closeDate, data.closeTime)
      : null,
    permanentlyOpen: data.permanentlyOpen,
    allowDirectShipping: data.allowDirectShipping,
    hasPrimaryShippingLocation: data.hasPrimaryShippingLocation,
    primaryShippingLocation: {
      name: data.primaryShippingLocation.name.trim(),
      street: data.primaryShippingLocation.street.trim(),
      street2: data.primaryShippingLocation.street2.trim(),
      city: data.primaryShippingLocation.city.trim(),
      state: data.primaryShippingLocation.state,
      zipcode: data.primaryShippingLocation.zipcode.trim(),
    },
    requireGroupSelection: data.requireGroupSelection,
    groupTerm: formatGroupTerm(data.requireGroupSelection, data.groupTerm),
    groups: formatGroups(data.requireGroupSelection, data.groups),
  };
}
