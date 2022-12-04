import { Db, ObjectID } from 'mongodb';
import { formatISO } from 'date-fns';
import { InventoryProduct } from '../interfaces';

export async function getInventoryProductById(db: Db, id: string) {
  const result = await db
    .collection('inventoryProducts')
    .findOne({ inventoryProductId: id });
  if (!result) throw new Error('Invalid inventory product ID.');
  return result;
}

export async function getAllInventoryProducts(db: Db) {
  const result = await db
    .collection<InventoryProduct>('inventoryProducts')
    .aggregate([{ $sort: { updatedAt: -1 } }])
    .toArray();
  return result;
}

export async function getPaginatedInventoryProducts(
  db: Db,
  currentPage: string,
  pageSize: string
) {
  const limit = Number(pageSize);
  const skip = (Number(currentPage) - 1) * limit;
  const result = await db
    .collection('inventoryProducts')
    .aggregate([
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ])
    .toArray();

  const count = await db.collection('inventoryProducts').count();

  return { inventoryProducts: result, count };
}

export async function getInventoryProductSku(
  db: Db,
  inventoryProductId: string,
  inventorySkuId: string
) {
  const result: InventoryProduct = await db
    .collection('inventoryProducts')
    .findOne({ inventoryProductId });

  return result.skus.find(s => s.id === inventorySkuId);
}

export async function createInventoryProduct(
  db: Db,
  product: InventoryProduct
) {
  const now = formatISO(new Date());
  const inventoryProduct = {
    ...product,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db
    .collection('inventoryProducts')
    .insertOne(inventoryProduct);
  return result.ops[0];
}

export async function updateInventoryProduct(
  db: Db,
  id: string,
  data: InventoryProduct
) {
  const { _id, ...updates } = data;
  const result = await db
    .collection('inventoryProducts')
    .findOneAndUpdate(
      { _id: new ObjectID(id) },
      { $set: { ...updates, updatedAt: formatISO(new Date()) } },
      { upsert: true, returnDocument: 'after' }
    );
  return result.value;
}

export async function updateInventoryProductSku(
  db: Db,
  inventoryProductId: string,
  inventorySkuId: string,
  updatedInventory: number
) {
  const result = await db
    .collection('inventoryProducts')
    .updateOne(
      { inventoryProductId },
      { $set: { 'skus.$[sku].inventory': updatedInventory } },
      { arrayFilters: [{ 'sku.id': { $eq: inventorySkuId } }] }
    );
  return result;
}
