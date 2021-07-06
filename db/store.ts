import { Db, ObjectID } from 'mongodb';
import { Store } from '../interfaces';
import { createId } from '../utils';

export async function addStore(db: Db, store: Store) {
  try {
    const storeId = createId('str');
    console.log(storeId);
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

export async function getStore(db: Db, storeId: string) {
  try {
    const result = await db.collection('stores').findOne({ storeId });
    if (!result) throw new Error('Invalid store ID was provided.');
    return {
      ...result,
      _id: result._id.toString(),
      createdAt: result.createdAt.toString(),
      updatedAt: result.updatedAt.toString(),
    };
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
        {
          $set: {
            _id: {
              $toString: '$_id',
            },
          },
        },
      ])
      .toArray();
    return await result;
  } catch (error) {
    console.log(error);
    throw new Error('An error occurred getting the stores.');
  }
}
