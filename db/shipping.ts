import { Db, ObjectID } from 'mongodb';
import { ShippingData, ShippingDataForm } from '../interfaces';

export async function getShippingData(db: Db) {
  const result = await db.collection<ShippingData>('shipping').findOne({});

  if (!result) {
    throw new Error('Failed to find the shipping data');
  }

  return result;
}

export async function updateShippingData(db: Db, formValues: ShippingDataForm) {
  const { _id, price, freeMinimum } = formValues;
  const formattedUpdated = {
    price: Number(price) * 100,
    freeMinimum: Number(freeMinimum) * 100,
  };
  const result = await db
    .collection('shipping')
    .findOneAndUpdate(
      { _id: new ObjectID(_id) },
      { $set: formattedUpdated },
      { returnDocument: 'after' }
    );
  return result.value;
}
