import { NextApiRequest } from 'next';
import { Db, MongoClient } from 'mongodb';

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface InventoryColor {
  id: string;
  label: string;
  hex: string;
}

export interface InventorySize {
  id: string;
  label: string;
}

export interface InventorySku {
  id: string;
  inventoryProductId: string;
  color: InventoryColor;
  size: InventorySize;
  inventory: number;
  active: boolean;
}

export interface InventoryProduct {
  _id: string;
  inventoryProductId: string;
  merchandiseCode: string;
  name: string;
  description: string;
  tag: string;
  details: string[];
  sizes: InventorySize[];
  colors: InventoryColor[];
  skus: InventorySku[];
  createdAt: string;
  updatedAt: string;
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

export interface Size {
  id: string;
  label: string;
  price: number;
}

export interface ProductSku {
  id: string;
  storeProductId: string;
  inventorySkuId: string;
  size: Size;
  color: Color;
  active: boolean;
  inventory?: number; // added dynamically in serverless fn
  inventorySkuActive?: boolean; // added dynamically in serverless fn
}

export interface StoreProduct {
  id: string;
  inventoryProductId: string;
  merchandiseCode: string;
  name: string;
  description: string;
  tag: string;
  details: string[];
  productSkus: ProductSku[];
  sizes: Size[];
  colors: Color[];
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
  products: StoreProduct[];
  orders: Order[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  sku: ProductSku;
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
    spid: string;
    ipid: string;
  };
}
