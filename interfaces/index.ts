import { NextApiRequest } from 'next';
import { Db, MongoClient } from 'mongodb';

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface Size {
  id: string;
  label: string;
  price: number;
}

export interface FormSize {
  id: string;
  label: string;
  price: string;
}

export interface Color {
  id: string;
  label: string;
  hex: string;
  primaryImage: string;
  secondaryImages: string[];
}

export interface Sku {
  id: string;
  productId: string;
  color: Color;
  size: Size;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  details: string[];
  tag: string;
  sizes: Size[];
  colors: Color[];
  skus: Sku[];
  includeCustomName: boolean;
  includeCustomNumber: boolean;
}

export interface StoreForm {
  name: string;
  openDate: string;
  openTime: string;
  closeDate: string;
  closeTime: string;
  permanentlyOpen: boolean;
  allowDirectShipping: boolean;
  hasPrimaryShippingLocation: boolean;
  primaryShippingLocation: {
    name: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zipcode: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  requireGroupSelection: boolean;
  groupTerm: string;
  groups: string[];
  redirectTo?: 'store' | 'add_product';
}

export interface Store {
  _id: string;
  storeId: string;
  name: string;
  openDate: string;
  closeDate: string | null;
  permanentlyOpen: boolean;
  allowDirectShipping: boolean;
  hasPrimaryShippingLocation: boolean;
  primaryShippingLocation: {
    name: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zipcode: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  requireGroupSelection: boolean;
  groupTerm: string;
  groups: string[];
  products: Product[];
  orders: Order[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  sku: Sku;
  name: string;
  image: string;
  price: number;
  quantity: number;
  itemTotal: number;
  customName: string;
  customNumber: string;
}

export type OrderStatus = 'Unfulfilled' | 'Fulfilled' | 'Completed';

export interface Order {
  orderId: string;
  store: {
    id: string;
    name: string;
  };
  stripeId: string;
  items: OrderItem[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  group: string;
  orderStatus: OrderStatus;
  shippingMethod: 'Primary' | 'Direct' | 'None';
  shippingAddress: {
    name?: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zipcode: string;
  };
  summary: {
    subtotal: number;
    shipping: number;
    transactionFee: number;
    salesTax: number;
    total: number;
  };
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export type CloudinaryStatus = 'idle' | 'loading';

export interface Request extends NextApiRequest {
  db: Db;
  dbClient: MongoClient;
  query: {
    id: string;
    sid: string;
    oid: string;
    pid: string;
    cid: string;
  };
}
