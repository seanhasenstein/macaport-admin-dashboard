import { NextApiRequest } from 'next';
import { Db, MongoClient } from 'mongodb';

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

interface SecondaryImage {
  id: string;
  url: string;
  alt: string;
}

export interface Size {
  id: string;
  label: string;
  price: number;
}

export interface ProductColor {
  id: string;
  label: string;
  hex: string;
  primaryImage: string;
  secondaryImages: SecondaryImage[];
}

interface SkuColor {
  id: string;
  label: string;
}

export interface Sku {
  id: string;
  productId: string;
  color: SkuColor;
  size: Size;
}

export interface Product {
  id: string;
  productName: string;
  description: string;
  details: string[];
  tag: string;
  sizes: Size[];
  colors: ProductColor[];
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
  products: Product[];
  orders: Order[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  itemTotal: number;
}

export type OrderStatus = 'Unfulfilled' | 'Fulfilled' | 'Completed';

export interface Order {
  _id: string;
  orderId: string;
  storeId: string;
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
    total: number;
  };
  transactionId: string;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Request extends NextApiRequest {
  db: Db;
  dbClient: MongoClient;
  query: { id: string };
}
