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
}

export interface StoreForm {
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
  redirectTo?: 'store' | 'add_product';
}

export interface Store {
  _id: string;
  storeId: string;
  name: string;
  openDate: string;
  hasCloseDate: boolean;
  closeDate: string | null;
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
  products: Product[];
  orders: Order[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  sku: Sku;
  name: string;
  image: string;
  price: number;
  quantity: number;
  itemTotal: number;
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
    storeId: string;
    orderId: string;
    prodId: string;
    colorId: string;
  };
}
