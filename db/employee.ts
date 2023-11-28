import { Db, FilterQuery, ObjectId } from 'mongodb';
import { formatISO } from 'date-fns';

import {
  CreateEmployeeInput,
  Employee,
  EmployeeWithId,
  EmployeeWithObjectId,
} from '../interfaces';

export async function findEmployeeById(db: Db, id: string) {
  return await db
    .collection('employees')
    .findOne<EmployeeWithId>({ _id: new ObjectId(id) });
}

export async function findEmployee(db: Db, query: FilterQuery<Employee>) {
  return await db.collection<EmployeeWithId>('employees').findOne(query);
}

export async function findEmployees(db: Db, query: FilterQuery<Employee>) {
  return await db.collection<EmployeeWithId>('employees').find(query).toArray();
}

export async function getAllEmployees(db: Db) {
  return await db.collection<EmployeeWithId>('employees').find().toArray();
}

export async function createEmployee(db: Db, employee: CreateEmployeeInput) {
  const now = formatISO(new Date());
  const result = await db.collection<Employee>('employees').insertOne({
    ...employee,
    createdAt: now,
    updatedAt: now,
  });
  return result.ops[0];
}

export async function updateEmployee(
  db: Db,
  _id: string,
  updatedEmployee: Employee
) {
  const result = await db
    .collection<EmployeeWithObjectId>('employees')
    .findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: { ...updatedEmployee, updatedAt: formatISO(new Date()) } },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );
  return result.value;
}

export async function deleteEmployee(db: Db, id: string) {
  const result = await db
    .collection<EmployeeWithObjectId>('employees')
    .findOneAndDelete({ _id: new ObjectId(id) });
  return result.value;
}
