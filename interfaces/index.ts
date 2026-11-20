import { NextApiRequest } from 'next';
import { Db, MongoClient } from 'mongodb';
import { Adjustment } from '../core/pricing/priceOrder';
import { OrderBenefitUse } from '../core/memberBenefits/types';

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

export interface SizeChartCategory {
  name: string; // 'Chest', 'Hip', 'Length', etc.
  unit: string; // e.g. 'in', 'cm', etc.
  sizes: {
    label: string;
    value: string;
  }[];
}

export type SizeChart = SizeChartCategory[];

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
  sizeChart?: SizeChart;
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
  allowStorePickup: boolean;
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
  showOnStoresPage: boolean;
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
  allowStorePickup?: boolean;
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
  showOnStoresPage: boolean;
  // The member benefit this store offers, if any. One per store; a string
  // ObjectId into the memberBenefits collection. See
  // core/memberBenefits/types.ts for the contract.
  benefitId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreWithOrderStatusTotals extends Store {
  orderStatusTotals: Record<OrderStatusKey | 'Personalized', number>; // added on query
}

export interface StoresTableOrders {
  unfulfilled: number;
  printed: number;
  fulfilled: number;
  partiallyShipped: number;
  shipped: number;
  canceled: number;
  total: number;
}

/**
 * One row of the homepage / "All stores" table. Deliberately NOT derived from
 * `Store`: the table renders a handful of scalars, and extending `Store` used
 * to drag the full `orders[]` (customer PII, ~1 MB) into every table payload.
 * Produced by the aggregation in db/store.ts, never from a full Store doc.
 */
export interface StoresTableStore {
  _id: string;
  name: string;
  openDate: string;
  closeDate: string | null;
  products: number;
  ordersCount: number;
  ordersStatusTotals: StoresTableOrders;
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

export type OrderItemStatus =
  | 'Unfulfilled'
  | 'Fulfilled'
  | 'Backordered'
  | 'Shipped'
  | 'Canceled';

export interface OrderItem {
  id: string;
  sku: ProductSku;
  merchandiseCode: string;
  artworkId?: string;
  name: string;
  image: string;
  // Per unit, including personalization.
  price: number;
  quantity: number;
  // Line total after any free-item adjustment. Use this for the line, never
  // price * quantity.
  itemTotal: number;
  personalizationAddons: PersonalizationAddon[];
  // Per unit. Written by the storefront; older orders may not carry it.
  personalizationTotal?: number;
  status: {
    current: OrderItemStatus;
    meta: Record<OrderItemStatus, { user: string; updatedAt: string }>;
  };
}

export type OrderStatus =
  | 'Unfulfilled'
  | 'Printed' // todo - remove
  | 'Fulfilled'
  | 'PartiallyShipped'
  | 'Shipped'
  | 'Canceled'
  | 'Completed'; // todo - remove

export type ShippingMethod = 'Primary' | 'Direct' | 'Store Pickup' | 'None';

export interface OrderSummary {
  // Everything at its listed price, before any adjustment.
  subtotal: number;
  // Everything that changed the price, in the order it was applied. Absent
  // on orders placed before member benefits existed until the storefront's
  // migration has rewritten them, so read it through orderAdjustments() in
  // utils/memberBenefit.ts rather than directly.
  adjustments?: Adjustment[];
  shipping: number;
  salesTax: number;
  // A total under Stripe's minimum that was forgiven. Absent on old orders.
  waived?: number;
  total: number;
  stripeFee: number;
  // Legacy: the single discount figure the three old programs wrote.
  discount?: number;
}

export interface ReturnedItem {
  id: string;
  quantity: number;
}

export interface OrderRefund {
  status: 'None' | 'Partial' | 'Full';
  // Cents refunded to the card so far. Kept equal to `card` for new refunds;
  // cancel writes the order total here.
  amount: number;
  // Cents Macaport refunds to the card in Stripe by hand, cumulative.
  card?: number;
  // Cumulative amount restored to the member's allowance, in the benefit's
  // unit (cents, or garments for freeItem).
  creditRestored?: number;
  // Everything sent back so far, by order item id.
  returnedItems?: ReturnedItem[];
  updatedAt?: string;
  // Cents of `card` someone has confirmed they refunded in Stripe. The
  // dashboard never calls Stripe, so this is how a recorded card refund is
  // closed off. Anything in `card` beyond it is still owed to the customer.
  stripeRefunded?: number;
  stripeRefundedAt?: string;
  stripeRefundedBy?: string;
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
  orderStatus: OrderStatus; // todo - replace with status
  // status: OrderStatus;
  shippingMethod: ShippingMethod;
  shippingAddress: {
    name?: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zipcode: string;
  };
  summary: OrderSummary;
  refund: OrderRefund;
  note?: string;
  // Who used what, when a member benefit was applied. The money is in
  // summary.adjustments; this is the link back to the member.
  benefit?: OrderBenefitUse;
  // The client invoice this order's benefit amount was billed on, if any.
  // Set when the invoice is created, cleared when it is voided.
  clientInvoiceId?: string | null;
  // Set when Macaport decides not to bill the client for this order at all.
  // Reversible from the benefit panel.
  clientInvoiceExcluded?: {
    reason: string;
    by: string;
    at: string;
  } | null;
  // Legacy, read-only: written by the three old programs. Only
  // orderAdjustments() reads them, and only while summary.adjustments is
  // absent. Nothing here writes them.
  teacherAppreciation?: {
    id: string;
    email: string;
  };
  switchFitnessDiscount?: {
    id: string;
    email: string;
  };
  sheboyganLutheranStaffDiscount?: {
    id: string;
    email: string;
    discount: number;
  };
  meta: {
    receiptPrinted: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Client invoices ***************************************
//
// What Macaport bills a client for a client-funded member benefit. One
// document per invoice, with every order's amount frozen at the moment it
// was issued, so a later refund shows as a difference rather than silently
// changing what was billed. The number comes from QuickBooks; the dashboard
// only records it. Dates are yyyy-MM-dd as typed.

export type ClientInvoiceStatus = 'open' | 'paid' | 'void';

export interface ClientInvoiceLine {
  orderId: string;
  customer: string;
  orderDate: string;
  // Cents the benefit covered on this order, net of refunds, when issued.
  // Negative on an adjustment line.
  amount: number;
  // 'order' bills an order. 'adjustment' credits back part of an earlier
  // invoice whose order was refunded or canceled after it was issued.
  kind?: 'order' | 'adjustment';
  adjustsInvoiceId?: string;
  adjustsInvoiceNumber?: string;
}

export interface ClientInvoice {
  _id: string;
  storeId: string;
  storeName: string;
  benefitId: string;
  benefitName: string;
  number: string;
  issuedAt: string;
  dueAt?: string | null;
  note?: string;
  lines: ClientInvoiceLine[];
  // Face value: the client pays exactly what the credit paid, tax already
  // inside it. Nothing is added, so subtotal and total are the same figure.
  subtotal: number;
  total: number;
  status: ClientInvoiceStatus;
  // Cents of post-issue drift on this invoice that a later invoice has
  // already credited back, per order. Drift still owed is the difference
  // between an order's net amount now and its line amount minus this.
  settledDrift?: Record<string, number>;
  paidAt?: string | null;
  paymentReference?: string;
  paidBy?: string;
  voidedAt?: string | null;
  voidedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CloudinaryStatus = 'idle' | 'loading';

// Macaport-wide settings. Named for the shipping fields it started with.
export interface ShippingData {
  _id: string;
  price: number;
  freeMinimum: number;
  // Days after an order ships before its benefit amount can be invoiced to
  // the client, so a return inside the window never has to be clawed back.
  // Absent on old documents; see DEFAULT_INVOICE_GRACE_DAYS.
  invoiceGraceDays?: number;
}

export interface ShippingDataForm {
  _id: string;
  price: string;
  freeMinimum: string;
  invoiceGraceDays: string;
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
    inventoryProductId: string;
  };
}

// Search types

export type OrderSearchResult = {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  store: {
    _id: string;
    name: string;
  };
  shippingMethod: ShippingMethod;
  totalItems: number;
  uniqueItems: number;
  orderTotal: number;
  // "Credit $63.30" and the like, when the order used a member benefit.
  benefitTag?: string | null;
  status: string;
  createdAt: string;
};

export type StoreSearchResult = {
  _id: string;
  name: string;
  openDate: string;
  closeDate?: string;
  permanentlyOpen: boolean;
  productsCount: number;
  ordersCount: number;
};

export type InventoryProductSearchResult = {
  _id: string;
  name: string;
  merchandiseCode: string;
  tag?: string;
  colorsCount: number;
  sizesCount: number;
  updatedAt: string;
};
