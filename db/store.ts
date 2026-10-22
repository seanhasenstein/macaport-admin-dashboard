import { Db, ObjectId, WithoutId } from 'mongodb';
import { formatISO } from 'date-fns';
import {
  Store,
  StoreProduct,
  Color,
  ProductSku,
  StoreStatusFilter,
  StoresTableStore,
} from '../interfaces';
import { createId } from '../utils';

interface StoreWithId extends Omit<Store, '_id'> {
  _id: ObjectId;
}

export async function getStoreById(db: Db, id: string) {
  const result = await db
    .collection('stores')
    .findOne<Store>({ _id: new ObjectId(id) });
  if (!result) throw new Error('Invalid store ID provided.');
  return result;
}

/**
 * Pulls EVERY store with its full embedded `products[]` and `orders[]`.
 * In production that is ~270 MB / ~2.7M JS objects per call (measured
 * 2026-09-28) and takes minutes. Do not use this for anything user-facing;
 * write a filtered/projected query or an aggregation instead.
 */
export async function getStores(db: Db) {
  const result = await db.collection<Store>('stores').find().toArray();
  return result;
}

// ---------------------------------------------------------------------------
// Stores-table aggregation
//
// The homepage and /stores tables render 8 scalar fields per store. Both used
// to fetch every store document (with all embedded products and orders) and
// reduce them in JS. The stages below do the same reduction inside Mongo so
// only ~300 bytes per store cross the wire.
//
// Behavior must match the old JS exactly:
//   - store status: utils/index.ts getStoreStatus (real Date comparison, so we
//     use $dateFromString — openDate/closeDate are ISO strings WITH UTC offsets
//     and a lexicographic compare would be wrong near midnight boundaries)
//   - order tallies: an 'Unfulfilled' order with meta.receiptPrinted === true
//     counts as printed, not unfulfilled (see utils/store.ts
//     getStoresOrderStatusNumbers for the same rule on the store page)
// ---------------------------------------------------------------------------

const FAR_FUTURE = new Date('9999-01-01T00:00:00Z');
const SETTLED_ORDER_STATUSES = ['Shipped', 'Canceled'];

function orderCount(cond: Record<string, unknown>) {
  return { $size: { $filter: { input: '$$orders', as: 'o', cond } } };
}

/**
 * Single pass over the raw store document that emits the table row plus the
 * helper fields (_openAt, _closeAt, _outstanding) later stages need. This
 * must be the first heavy stage so nothing downstream ever sees a full
 * 1 MB document (important for $sort and $facet memory limits).
 */
function storesTableRowStage() {
  return {
    $project: {
      _id: 1,
      name: 1,
      openDate: 1,
      closeDate: 1,
      _openAt: {
        $dateFromString: {
          dateString: '$openDate',
          onError: null,
          onNull: null,
        },
      },
      _closeAt: {
        $dateFromString: {
          dateString: '$closeDate',
          onError: FAR_FUTURE, // '' or garbage → never closes
          onNull: FAR_FUTURE,
        },
      },
      products: { $size: { $ifNull: ['$products', []] } },
      ordersCount: { $size: { $ifNull: ['$orders', []] } },
      _outstanding: {
        $let: {
          vars: { orders: { $ifNull: ['$orders', []] } },
          in: orderCount({
            $not: { $in: ['$$o.orderStatus', SETTLED_ORDER_STATUSES] },
          }),
        },
      },
      ordersStatusTotals: {
        $let: {
          vars: { orders: { $ifNull: ['$orders', []] } },
          in: {
            unfulfilled: orderCount({
              $and: [
                { $eq: ['$$o.orderStatus', 'Unfulfilled'] },
                { $ne: ['$$o.meta.receiptPrinted', true] },
              ],
            }),
            printed: orderCount({
              $or: [
                { $eq: ['$$o.orderStatus', 'Printed'] },
                {
                  $and: [
                    { $eq: ['$$o.orderStatus', 'Unfulfilled'] },
                    { $eq: ['$$o.meta.receiptPrinted', true] },
                  ],
                },
              ],
            }),
            fulfilled: orderCount({ $eq: ['$$o.orderStatus', 'Fulfilled'] }),
            partiallyShipped: orderCount({
              $eq: ['$$o.orderStatus', 'PartiallyShipped'],
            }),
            shipped: orderCount({ $eq: ['$$o.orderStatus', 'Shipped'] }),
            canceled: orderCount({ $eq: ['$$o.orderStatus', 'Canceled'] }),
            total: { $size: '$$orders' },
          },
        },
      },
    },
  };
}

function storeStatusStage(now: Date) {
  return {
    $addFields: {
      _status: {
        $switch: {
          branches: [
            { case: { $lt: [now, '$_openAt'] }, then: 'upcoming' },
            { case: { $lt: [now, '$_closeAt'] }, then: 'open' },
          ],
          default: 'closed',
        },
      },
    },
  };
}

const stripHelperFieldsStage = {
  $project: {
    _openAt: 0,
    _closeAt: 0,
    _status: 0,
    _outstanding: 0,
    _group: 0,
    _sortKey: 0,
  },
};

/**
 * Homepage work queue: open + upcoming stores, plus closed stores that still
 * have an order that is neither Shipped nor Canceled. Ordered closed → open →
 * upcoming; closed and open by closeDate ascending (no closeDate sorts last),
 * upcoming by openDate ascending.
 */
export async function getHomepageStores(db: Db, now = new Date()) {
  const pipeline = [
    storesTableRowStage(),
    storeStatusStage(now),
    {
      $match: {
        $or: [
          { _status: { $in: ['open', 'upcoming'] } },
          { _outstanding: { $gt: 0 } },
        ],
      },
    },
    {
      $addFields: {
        _group: {
          $switch: {
            branches: [
              { case: { $eq: ['$_status', 'closed'] }, then: 0 },
              { case: { $eq: ['$_status', 'open'] }, then: 1 },
            ],
            default: 2,
          },
        },
        _sortKey: {
          $cond: [{ $eq: ['$_status', 'upcoming'] }, '$_openAt', '$_closeAt'],
        },
      },
    },
    { $sort: { _group: 1, _sortKey: 1, _id: 1 } },
    stripHelperFieldsStage,
  ];

  return db
    .collection<Store>('stores')
    .aggregate<StoresTableStore>(pipeline)
    .toArray();
}

type GetPaginatedStores = {
  db: Db;
  currentPage: number;
  pageSize: number;
  statusFilter: StoreStatusFilter;
  onlyUnfulfilled: boolean;
  now?: Date;
};

/**
 * /stores: optional status filter and "only stores with unfulfilled orders"
 * filter, sorted by openDate descending then name, paginated in Mongo.
 */
export async function getPaginatedStores({
  db,
  currentPage,
  pageSize,
  statusFilter,
  onlyUnfulfilled,
  now = new Date(),
}: GetPaginatedStores) {
  const limit = pageSize;
  const skip = (currentPage - 1) * limit;

  const pipeline = [
    // Cheap pre-filter on the raw docs before the projection pass.
    ...(onlyUnfulfilled
      ? [{ $match: { 'orders.orderStatus': 'Unfulfilled' } }]
      : []),
    storesTableRowStage(),
    storeStatusStage(now),
    ...(statusFilter !== 'all' ? [{ $match: { _status: statusFilter } }] : []),
    { $sort: { _openAt: -1, name: 1, _id: 1 } },
    {
      // $facet buffers its input, so it must only ever see the small
      // projected rows — never move it above storesTableRowStage().
      $facet: {
        count: [{ $count: 'count' }],
        stores: [{ $skip: skip }, { $limit: limit }, stripHelperFieldsStage],
      },
    },
  ];

  const [result] = await db
    .collection<Store>('stores')
    .aggregate<{ count: { count: number }[]; stores: StoresTableStore[] }>(
      pipeline
    )
    .toArray();

  return {
    stores: result?.stores ?? [],
    count: result?.count[0]?.count ?? 0,
  };
}

/**
 * Only the stores that sell the given inventory product, and only their
 * products array — used when an inventory product is edited.
 */
export async function getStoresWithInventoryProduct(
  db: Db,
  inventoryProductId: string
) {
  return db
    .collection<Store>('stores')
    .find(
      { 'products.inventoryProductId': inventoryProductId },
      { projection: { _id: 1, products: 1 } }
    )
    .toArray() as Promise<Pick<Store, '_id' | 'products'>[]>;
}

type StoreWithoutId = Omit<Store, '_id'>;

export async function createStore(db: Db, storeInput: StoreWithoutId) {
  const storeId = createId('str');
  const now = formatISO(new Date());
  const result = await db.collection<WithoutId<Store>>('stores').insertOne({
    ...storeInput,
    storeId,
    orders: [],
    products: [],
    createdAt: now,
    updatedAt: now,
  });
  return { _id: result.insertedId };
}

export async function updateStore(
  db: Db,
  id: string,
  updates: Record<string, any>
) {
  const result = await db
    .collection<StoreWithId>('stores')
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: formatISO(new Date()) } },
      { upsert: true, returnDocument: 'after' }
    );
  return result.value;
}

export async function addProductToStore(
  db: Db,
  storeId: string,
  product: StoreProduct
) {
  const result = await db
    .collection<StoreWithId>('stores')
    .findOneAndUpdate(
      { _id: new ObjectId(storeId) },
      { $push: { products: product } },
      { upsert: true, returnDocument: 'after' }
    );
  return result.value;
}

export async function updateStoreProduct(
  db: Db,
  storeId: string,
  productId: string,
  updatedProduct: StoreProduct
) {
  const result = await db.collection<StoreWithId>('stores').findOneAndUpdate(
    { _id: new ObjectId(storeId) },
    { $set: { 'products.$[product]': updatedProduct } },
    {
      arrayFilters: [{ 'product.id': productId }],
      returnDocument: 'after',
    }
  );
  return result.value;
}

export async function updateProductColor(
  db: Db,
  storeId: string,
  productId: string,
  colorId: string,
  updatedColor: Color
) {
  const result = await db.collection<StoreWithId>('stores').findOneAndUpdate(
    { _id: new ObjectId(storeId) },
    { $set: { 'products.$[product].colors.$[color]': updatedColor } },
    {
      arrayFilters: [{ 'product.id': productId }, { 'color.id': colorId }],
      returnDocument: 'after',
    }
  );
  return result.value;
}

export async function updateStoreProductSkuStatus(
  db: Db,
  {
    storeId,
    storeProductId,
    productSkuId,
    updatedProductSku,
  }: {
    storeId: string;
    storeProductId: string;
    productSkuId: string;
    updatedProductSku: ProductSku;
  }
) {
  const result = await db.collection<StoreWithId>('stores').findOneAndUpdate(
    { _id: new ObjectId(storeId) },
    {
      $set: {
        'products.$[product].productSkus.$[productSku]': updatedProductSku,
      },
    },
    {
      arrayFilters: [
        { 'product.id': storeProductId },
        { 'productSku.id': productSkuId },
      ],
    }
  );

  const updatedStoreProduct = result?.value?.products.find(
    (p: StoreProduct) => p.id === storeProductId
  );

  return updatedStoreProduct;
}

export async function deleteStore(db: Db, id: string) {
  const result = await db
    .collection<WithoutId<Store>>('stores')
    .findOneAndDelete({ _id: new ObjectId(id) });
  // The store's orders go with it, so nothing references its benefit now.
  const benefitId = result.value?.benefitId;
  if (benefitId && ObjectId.isValid(benefitId)) {
    await db
      .collection('memberBenefits')
      .deleteOne({ _id: new ObjectId(benefitId) });
  }
  return result.value;
}
