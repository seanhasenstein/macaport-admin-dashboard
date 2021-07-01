import { NextApiRequest } from 'next';
import { Db, MongoClient } from 'mongodb';

export interface Store {
  _id?: string;
  name: string;
  openDate: string;
  hasClosingDate: boolean;
  closeDate: string | undefined;
  hasPrimaryShippingLocation: boolean;
  primaryShippingLocation?: {
    name: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zipcode: string;
  };
  allowDirectShipping: boolean;
  contact?: {
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
