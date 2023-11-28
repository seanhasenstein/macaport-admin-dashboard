import { Db, FilterQuery, ObjectId } from 'mongodb';
import { formatISO } from 'date-fns';

import {
  CreateEquipmentInput,
  Equipment,
  EquipmentWithId,
  EquipmentWithObjectId,
} from '../interfaces';

export async function findEquipmentById(db: Db, id: string) {
  return await db
    .collection('equipment')
    .findOne<EquipmentWithId>({ _id: new ObjectId(id) });
}

export async function findEquipment(db: Db, query: FilterQuery<Equipment>) {
  return await db.collection<EquipmentWithId>('equipment').findOne(query);
}

export async function findEquipmentItems(
  db: Db,
  query: FilterQuery<Equipment>
) {
  return await db
    .collection<EquipmentWithId>('equipment')
    .find(query)
    .toArray();
}

export async function getAllEquipment(db: Db) {
  return await db.collection<EquipmentWithId>('equipment').find().toArray();
}

export async function createEquipment(db: Db, equipment: CreateEquipmentInput) {
  const now = formatISO(new Date());
  const result = await db.collection<Equipment>('equipment').insertOne({
    ...equipment,
    createdAt: now,
    updatedAt: now,
  });
  return result.ops[0];
}

export async function updateEquipment(
  db: Db,
  _id: string,
  updatedEquipment: Equipment
) {
  const result = await db
    .collection<EquipmentWithObjectId>('equipment')
    .findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: { ...updatedEquipment, updatedAt: formatISO(new Date()) } },
      { upsert: true, returnDocument: 'after' }
    );
  return result.value;
}

export async function deleteEquipment(db: Db, id: string) {
  const result = await db
    .collection<EquipmentWithObjectId>('equipment')
    .findOneAndDelete({ _id: new ObjectId(id) });
  return result.value;
}
