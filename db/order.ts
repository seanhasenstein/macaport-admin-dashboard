import { Db, ObjectID } from 'mongodb';
import { Store, Note, OrderStatus } from '../interfaces';

export async function getOrderById(db: Db, storeId: string, orderId: string) {
  try {
    const result: Store = await db
      .collection('stores')
      .findOne({ _id: new ObjectID(storeId) });

    if (!result) throw new Error('Invalid store ID provided.');
    const order = result.orders.find(r => r.orderId === orderId);
    if (!order) throw new Error('No order found.');
    return order;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred getting the order.');
  }
}

export async function updateOrderStatus(
  db: Db,
  storeId: string,
  orderId: string,
  orderStatus: OrderStatus
) {
  try {
    const result = await db.collection('stores').findOneAndUpdate(
      { _id: new ObjectID(storeId) },
      { $set: { 'orders.$[order].orderStatus': orderStatus } },
      {
        arrayFilters: [{ 'order.orderId': orderId }],
        returnDocument: 'after',
      }
    );
    return result.value;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred updating the order status.');
  }
}

export async function updateOrderNotes(
  db: Db,
  storeId: string,
  orderId: string,
  notes: Note[]
) {
  try {
    const result = await db.collection('stores').findOneAndUpdate(
      { _id: new ObjectID(storeId) },
      { $set: { 'orders.$[order].notes': notes } },
      {
        arrayFilters: [{ 'order.orderId': orderId }],
        upsert: true,
        returnDocument: 'after',
      }
    );
    return result.value;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred updating the order notes.');
  }
}
