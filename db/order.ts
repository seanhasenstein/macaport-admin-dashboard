import { Db } from 'mongodb';

export async function getOrder(db: Db, filter: Record<string, unknown>) {
  try {
    const result = await db
      .collection('orders')
      .aggregate([
        { $match: { ...filter } },
        {
          $set: {
            _id: { $toString: '$_id' },
          },
        },
      ])
      .toArray();
    if (!result) throw new Error('Invalid order ID provided.');
    return result[0];
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while querying for the order.');
  }
}
