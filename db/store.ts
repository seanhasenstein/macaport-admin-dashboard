import { Db, ObjectID } from 'mongodb';
import { Product, Store } from '../interfaces';
import { createId } from '../utils';

export async function createStore(db: Db, store: Store) {
  try {
    const storeId = createId('str');
    const result = await db
      .collection('stores')
      .insertOne({ ...store, storeId });
    return result.ops[0];
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while adding the store.');
  }
}

export async function updateStore(db: Db, id: string, updates: Store) {
  try {
    const result = await db
      .collection('stores')
      .findOneAndUpdate({ _id: new ObjectID(id) }, { $set: { ...updates } });
    return result.value;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while updating the store.');
  }
}

export async function getStoreById(db: Db, id: string) {
  try {
    const result = await db
      .collection('stores')
      .findOne({ _id: new ObjectID(id) });
    if (!result) throw new Error('Invalid store ID provided.');

    return result;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred getting the store.');
  }
}

export async function getStores(db: Db, filter: Record<string, unknown> = {}) {
  try {
    const result = await db
      .collection('stores')
      .aggregate([
        {
          $match: { ...filter },
        },
      ])
      .toArray();
    return await result;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred getting the stores.');
  }
}

export async function addProductToStore(
  db: Db,
  storeId: string,
  product: Product
) {
  try {
    const result = await db
      .collection('stores')
      .findOneAndUpdate(
        { _id: new ObjectID(storeId) },
        { $push: { products: product } },
        { upsert: true, returnDocument: 'after' }
      );
    return result.value;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred adding the product.');
  }
}
