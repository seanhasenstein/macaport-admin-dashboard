import { Db, ObjectId, WithoutId } from 'mongodb';

import { Color, CreateColor, UpdateColor } from '../../types';

// **************************************************************

async function findColor(
  db: Db,
  filter: { _id?: string; code?: string; name?: string; hexCode?: string }
) {
  const query = {
    ...(filter._id && { _id: new ObjectId(filter._id) }),
    ...(filter.code && { code: filter.code }),
    ...(filter.name && { name: filter.name }),
    ...(filter.hexCode && { hexCode: filter.hexCode }),
  };

  return await db.collection<WithoutId<Color>>('colors').findOne(query);
}

// **************************************************************

async function createColor(db: Db, input: CreateColor) {
  const now = new Date();

  const formattedInput = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('colors').insertOne(formattedInput);

  return { _id: result.insertedId.toString(), ...formattedInput };
}

// **************************************************************

async function updateColor(db: Db, updates: UpdateColor) {
  const { _id, ...restOfUpdates } = updates;
  const now = new Date();

  const formattedUpdate = {
    ...restOfUpdates,
    updatedAt: now,
  };

  return await db
    .collection('colors')
    .updateOne({ _id: new ObjectId(_id) }, { $set: formattedUpdate });
}

// **************************************************************

export { createColor, findColor, updateColor };
