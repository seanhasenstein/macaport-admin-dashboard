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
  notes: Note[];
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
  inventoryProductId: string;
  inventorySkuId: string;
  size: Size;
  color: Color;
  active: boolean;
  inventory?: number; // added dynamically in serverless fn
  inventorySkuActive?: boolean; // added dynamically in serverless fn
}

// storeProduct personalization addons
export interface PersonalizationItem {
  id: string;
  name: string;
  location: string;
  type: 'list' | 'string' | 'number';
  list: string[];
  price: number;
  lines: number;
  limit: number;
  subItems: PersonalizationItem[];
}

export interface Personalization {
  active: boolean;
  maxLines: number;
  addons: PersonalizationItem[];
}

export interface PersonalizationFormItem
  extends Omit<PersonalizationItem, 'list' | 'price' | 'subItems'> {
  list: string;
  price: string;
  subItems: PersonalizationFormItem[];
}

export interface PersonalizationForm extends Omit<Personalization, 'addons'> {
  addons: PersonalizationFormItem[];
}

export interface StoreProduct {
  id: string;
  inventoryProductId: string;
  artworkId?: string;
  merchandiseCode: string;
  name: string;
  description: string;
  tag: string;
  details: string[];
  productSkus: ProductSku[];
  sizes: Size[];
  colors: Color[];
  personalization: Personalization;
  notes: Note[];
}

export type StoreStatus = 'upcoming' | 'open' | 'closed';

export type StoreStatusFilter = 'all' | 'upcoming' | 'open' | 'closed';

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

export type OrderStatusKey = OrderStatus | 'All';

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

export interface StoreWithOrderStatusTotals extends Store {
  orderStatusTotals: Record<OrderStatusKey, number>; // added on query
}

export interface StoresTableOrders {
  unfulfilled: number;
  printed: number;
  fulfilled: number;
  completed: number;
  canceled: number;
  total: number;
}

export interface StoresTableStore extends Omit<Store, 'products' | 'orders'> {
  products: number;
  orders: StoresTableOrders;
}

export interface PersonalizationAddon {
  id: string;
  itemId: string;
  addon: string;
  value: string;
  location: string;
  lines: number;
  price: number;
  subItems: PersonalizationAddon[];
}

export interface OrderItem {
  sku: ProductSku;
  merchandiseCode: string;
  artworkId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  itemTotal: number;
  personalizationAddons: PersonalizationAddon[];
}

export type OrderStatus =
  | 'Unfulfilled'
  | 'Printed'
  | 'Fulfilled'
  | 'Completed'
  | 'Canceled';

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  salesTax: number;
  total: number;
  stripeFee: number;
}

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
  summary: OrderSummary;
  refund: {
    status: 'None' | 'Partial' | 'Full';
    amount: number;
  };
  notes: Note[]; // admin notes
  note?: string; // customer note
  createdAt: string;
  updatedAt: string;
}

export type CloudinaryStatus = 'idle' | 'loading';

export interface ShippingData {
  _id: string;
  price: number;
  freeMinimum: number;
}

export interface ShippingDataForm {
  _id: string;
  price: string;
  freeMinimum: string;
}

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
    page: string;
    pageSize: string;
    statusFilter: StoreStatusFilter;
    onlyUnfulfilled: string;
  };
}
