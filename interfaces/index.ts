import { NextApiRequest } from 'next';
import { Db, MongoClient } from 'mongodb';

export interface StoreFormValues {
  name: string;
  openImmediately: boolean;
  openDate: {
    month: string;
    date: string;
    year: string;
  };
  hasCloseDate: 'true' | 'false';
  closeDate: {
    month: string;
    date: string;
    year: string;
  };
  shippingMethod: 'ship' | 'noship' | 'inhouse';
  primaryShippingLocation: {
    name: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zipcode: string;
  };
  allowDirectShipping: 'true' | 'false';
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  unsavedNote: string;
  notes: string[];
}

export interface Store {
  _id: string;
  name: string;
  openDate: string;
  hasCloseDate: boolean;
  closeDate: string | undefined;
  category: 'macaport' | 'client';
  hasPrimaryShippingLocation: boolean;
  primaryShippingLocation: {
    name: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zipcode: string;
  };
  allowDirectShipping: boolean;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Request extends NextApiRequest {
  db: Db;
  dbClient: MongoClient;
  query: { id: string };
}
