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

export async function getInventoryProducts(
  db: Db,
  filter: Record<string, unknown> = {}
) {
  const result = await db
    .collection('inventoryProducts')
    .aggregate([
      {
        $match: { ...filter },
      },
    ])
    .toArray();
  return await result;
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
