import { Db, ObjectID } from 'mongodb';
import { formatISO } from 'date-fns';
import {
  Store,
  StoreProduct,
  Color,
  ProductSku,
  StoreStatusFilter,
} from '../interfaces';
import { createId } from '../utils';
import { paginatedStoresReducer } from '../utils/store';

export async function getStoreById(db: Db, id: string) {
  const result = await db
    .collection('stores')
    .findOne<Store>({ _id: new ObjectID(id) });
  if (!result) throw new Error('Invalid store ID provided.');
  return result;
}

export async function getStores(db: Db) {
  const result = await db.collection<Store>('stores').find().toArray();
  return result;
}

type GetPaginatedStores = {
  db: Db;
  currentPage: number;
  pageSize: number;
  statusFilter: StoreStatusFilter;
  onlyUnfulfilled: boolean;
};

export async function getPaginatedStores({
  db,
  currentPage,
  pageSize,
  statusFilter,
  onlyUnfulfilled,
}: GetPaginatedStores) {
  const limit = pageSize;
  const skip = (currentPage - 1) * limit;
  const result = await db.collection<Store>('stores').aggregate().toArray();

  const filteredResults = paginatedStoresReducer(
    result,
    statusFilter,
    onlyUnfulfilled
  );
  const count = filteredResults.length;
  const skippedLimitedFilteredResults = filteredResults.slice(
    skip,
    skip + limit
  );

  // sort stores first by openDate and then by name
  const sortedResults = skippedLimitedFilteredResults.sort((storeA, storeB) => {
    if (storeA.openDate > storeB.openDate) {
      return -1;
    } else if (storeA.openDate < storeB.openDate) {
      return 1;
    } else {
      if (storeA.name > storeB.name) {
        return 1;
      } else if (storeA.name < storeB.name) {
        return -1;
      } else {
        return 0;
      }
    }
  });

  return {
    stores: sortedResults,
    count,
  };
}

export async function createStore(db: Db, store: Store) {
  const storeId = createId('str');
  const now = formatISO(new Date());
  const result = await db.collection<Store>('stores').insertOne({
    ...store,
    storeId,
    orders: [],
    products: [],
    createdAt: now,
    updatedAt: now,
  });
  return result.ops[0];
}

export async function updateStore(
  db: Db,
  id: string,
  updates: Record<string, any>
) {
  const result = await db
    .collection('stores')
    .findOneAndUpdate(
      { _id: new ObjectID(id) },
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
    .collection('stores')
    .findOneAndUpdate(
      { _id: new ObjectID(storeId) },
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
  const result = await db.collection('stores').findOneAndUpdate(
    { _id: new ObjectID(storeId) },
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
  const result = await db.collection('stores').findOneAndUpdate(
    { _id: new ObjectID(storeId) },
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
  const result = await db.collection('stores').findOneAndUpdate(
    { _id: new ObjectID(storeId) },
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

  const updatedStoreProduct: StoreProduct = result.value.products.find(
    (p: StoreProduct) => p.id === storeProductId
  );

  return updatedStoreProduct;
}

export async function deleteStore(db: Db, id: string) {
  const result = await db
    .collection('stores')
    .findOneAndDelete({ _id: new ObjectID(id) });
  return result;
}
