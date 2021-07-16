import { Db, ObjectID } from 'mongodb';
import { Order } from '../interfaces';

export async function getOrderById(db: Db, id: string) {
  try {
    const result = await db
      .collection('orders')
      .findOne({ _id: new ObjectID(id) });
    if (!result) throw new Error('Invalid order ID provided.');

    return result;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred getting the order.');
  }
}

export async function getOrders(db: Db, filter: Record<string, unknown> = {}) {
  try {
    const result = await db
      .collection('orders')
      .aggregate([
        {
          $match: { ...filter },
        },
      ])
      .toArray();
    return await result;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred getting the orders.');
  }
}

export async function updateOrder(db: Db, id: string, updates: Order) {
  try {
    const result = await db
      .collection('orders')
      .findOneAndUpdate({ _id: new ObjectID(id) }, { $set: { ...updates } });
    return result.value;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while updating the order.');
  }
}
