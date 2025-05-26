import { Db, ObjectId } from 'mongodb';

import {
  CreateInventoryProductV2,
  UpdateInventoryProductV2,
} from '../../types';

// **************************************************************

async function findInventoryProduct(
  db: Db,
  filter: { _id?: string; name?: string; merchandiseCode?: string }
) {
  const query = {
    ...(filter._id && { _id: new ObjectId(filter._id) }),
    ...(filter.name && { name: filter.name }),
    ...(filter.merchandiseCode && { merchandiseCode: filter.merchandiseCode }),
  };

  return await db.collection('inventoryProducts').findOne(query);
}

// **************************************************************

async function createInventoryProduct(db: Db, input: CreateInventoryProductV2) {
  const now = new Date();

  const formattedInput = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db
    .collection('inventoryProducts')
    .insertOne(formattedInput);

  return { _id: result.insertedId.toString(), ...formattedInput };
}

// **************************************************************

export function updateInventoryProduct(
  db: Db,
  updates: UpdateInventoryProductV2
) {
  const { _id, ...restOfUpdates } = updates;
  const now = new Date();

  const formattedUpdate = {
    ...restOfUpdates,
    updatedAt: now,
  };

  return db
    .collection('inventoryProducts')
    .updateOne({ _id: new ObjectId(_id) }, { $set: formattedUpdate });
}

// **************************************************************

export { createInventoryProduct, findInventoryProduct };
