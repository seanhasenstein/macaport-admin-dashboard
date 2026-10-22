import { Db, ObjectId } from 'mongodb';
import { ShippingData, ShippingDataForm } from '../interfaces';

// The settings document, or null on a database that has never had one
// (a freshly created environment).
export async function findShippingData(db: Db) {
  return db.collection<ShippingData>('shipping').findOne({});
}

export async function getShippingData(db: Db) {
  const result = await db.collection<ShippingData>('shipping').findOne({});

  if (!result) {
    throw new Error('Failed to find the shipping data');
  }

  return result;
}

interface ShippingDataWithObjectId extends Omit<ShippingData, '_id'> {
  _id: ObjectId;
}

export async function updateShippingData(db: Db, formValues: ShippingDataForm) {
  const { _id, price, freeMinimum, invoiceGraceDays } = formValues;
  const formattedUpdated = {
    price: Number(price) * 100,
    freeMinimum: Number(freeMinimum) * 100,
    invoiceGraceDays: Math.max(0, Math.round(Number(invoiceGraceDays) || 0)),
  };
  // The first save on a fresh database creates the one settings document.
  const result = await db
    .collection<ShippingDataWithObjectId>('shipping')
    .findOneAndUpdate(
      ObjectId.isValid(_id) ? { _id: new ObjectId(_id) } : {},
      { $set: formattedUpdated },
      { returnDocument: 'after', upsert: true }
    );
  return result.value;
}
