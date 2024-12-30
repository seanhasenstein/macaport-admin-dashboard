import { Db, ObjectId, WithoutId } from 'mongodb';
import { formatISO } from 'date-fns';
import { InventoryProduct } from '../interfaces';

export async function getInventoryProductById(db: Db, id: string) {
  const result = await db
    .collection<InventoryProduct>('inventoryProducts')
    .findOne({ inventoryProductId: id });
  return result;
}

export async function getAllInventoryProducts(db: Db) {
  const result = await db
    .collection('inventoryProducts')
    .aggregate<InventoryProduct>([{ $sort: { updatedAt: -1 } }])
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

  const count = await db.collection('inventoryProducts').countDocuments();

  return { inventoryProducts: result, count };
}

export async function getInventoryProductSku(
  db: Db,
  inventoryProductId: string,
  inventorySkuId: string
) {
  const result = await db
    .collection<InventoryProduct>('inventoryProducts')
    .findOne({ inventoryProductId });

  return result?.skus.find(s => s.id === inventorySkuId);
}

type InventoryProductWithoutId = Omit<InventoryProduct, '_id'>;

export async function createInventoryProduct(
  db: Db,
  product: InventoryProductWithoutId
): Promise<InventoryProduct> {
  const now = formatISO(new Date());
  const inventoryProductInput = {
    ...product,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db
    .collection<WithoutId<InventoryProduct>>('inventoryProducts')
    .insertOne(inventoryProductInput);
  return { _id: result.insertedId.toString(), ...inventoryProductInput };
}

interface InventoryProductWithObjectId extends Omit<InventoryProduct, '_id'> {
  _id: ObjectId;
}

export async function updateInventoryProduct(
  db: Db,
  inventoryProductId: string,
  data: InventoryProduct
) {
  const { _id, ...updates } = data;
  const result = await db
    .collection<InventoryProductWithObjectId>('inventoryProducts')
    .findOneAndUpdate(
      { _id: new ObjectId(inventoryProductId) },
      { $set: { ...updates, updatedAt: formatISO(new Date()) } },
      { upsert: true, returnDocument: 'after' }
    );
  return result.value;
}

export async function updateInventoryProductSkusInventory(
  db: Db,
  inventoryProductId: string,
  inventorySkuId: string,
  updatedInventory: number
) {
  const result = await db
    .collection<InventoryProductWithObjectId>('inventoryProducts')
    .updateOne(
      { inventoryProductId },
      { $set: { 'skus.$[sku].inventory': updatedInventory } },
      { arrayFilters: [{ 'sku.id': { $eq: inventorySkuId } }] }
    );
  return result;
}
