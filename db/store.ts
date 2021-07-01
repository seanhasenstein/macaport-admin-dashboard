import { Db } from 'mongodb';
import { Store } from '../interfaces';

export async function addStore(db: Db, store: Store) {
  try {
    const result = await db.collection('stores').insertOne(store);
    return result.ops[0];
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while adding the store.');
  }
}

export async function getStore(db: Db, id: string) {
  try {
    const result = await db.collection('stores').findOne({ _id: id });
    if (!result) throw new Error('Invalid store ID was provided.');
    return {
      ...result,
      _id: result._id.toString(),
      createdAt: result.createdAt.toString(),
      updatedAt: result.updatedAt.toString(),
    };
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while getting the store.');
  }
}
