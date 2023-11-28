import { Db, FilterQuery, ObjectId } from 'mongodb';
import { formatISO } from 'date-fns';

import {
  CreateCalendarEventInput,
  CalendarEvent,
  UpdateCalendarEventInput,
  CalendarEventWithId,
  CalendarEventWithObjectId,
  EmployeeEventForDb,
  EquipmentEventForDb,
} from '../interfaces';

function idMatch(_id: string) {
  return {
    $match: {
      _id: new ObjectId(_id),
    },
  };
}

const employeePopulate = [
  {
    $lookup: {
      from: 'employees',
      localField: 'employees.employeeId',
      foreignField: '_id',
      as: 'fromEmployees',
    },
  },
  {
    $addFields: {
      employees: {
        $map: {
          input: '$employees',
          as: 'employee',
          in: {
            $mergeObjects: [
              '$$employee',
              {
                employee: {
                  $arrayElemAt: [
                    '$fromEmployees',
                    {
                      $indexOfArray: [
                        '$fromEmployees._id',
                        '$$employee.employeeId',
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $project: { fromEmployees: 0 },
  },
];

const equipmentPopulate = [
  {
    $lookup: {
      from: 'equipment',
      localField: 'equipment.equipmentId',
      foreignField: '_id',
      as: 'fromEquipment',
    },
  },
  {
    $addFields: {
      equipment: {
        $map: {
          input: '$equipment',
          as: 'equipmentItem',
          in: {
            $mergeObjects: [
              '$$equipmentItem',
              {
                equipmentItem: {
                  $arrayElemAt: [
                    '$fromEquipment',
                    {
                      $indexOfArray: [
                        '$fromEquipment._id',
                        '$$equipmentItem.equipmentId',
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $project: { fromEquipment: 0 },
  },
];

export async function findCalendarEventById(db: Db, _id: string) {
  const result = await db
    .collection('calendarEvents')
    .aggregate<CalendarEventWithId>([
      idMatch(_id),
      ...employeePopulate,
      ...equipmentPopulate,
    ])
    .toArray();
  return result.length ? result[0] : null;
}

export async function findCalendarEvent(
  db: Db,
  query: FilterQuery<CalendarEvent>
) {
  const result = await db
    .collection('calendarEvents')
    .aggregate<CalendarEventWithId>([
      query,
      ...employeePopulate,
      ...equipmentPopulate,
    ])
    .toArray();
  return result.length ? result[0] : null;
}

export async function findCalendarEvents(
  db: Db,
  query: FilterQuery<CalendarEvent>
) {
  return await db
    .collection('calendarEvents')
    .aggregate<CalendarEventWithId>([
      query,
      ...employeePopulate,
      ...equipmentPopulate,
    ])
    .toArray();
}

export async function getAllCalendarEvents(db: Db) {
  return await db
    .collection<CalendarEventWithId>('calendarEvents')
    .aggregate([...employeePopulate, ...equipmentPopulate])
    .toArray();
}

interface CreateCalendarEventResult
  extends Omit<CalendarEvent, 'employees' | 'equipment'> {
  employees: EmployeeEventForDb[];
  equipment: EquipmentEventForDb[];
}

export async function createCalendarEvent(
  db: Db,
  calendarEvent: CreateCalendarEventInput
) {
  const now = formatISO(new Date());
  const result = await db
    .collection<CreateCalendarEventResult>('calendarEvents')
    .insertOne({
      ...calendarEvent,
      createdAt: now,
      updatedAt: now,
    });
  return result.ops[0];
}

export async function updateCalendarEvent(
  db: Db,
  _id: string,
  updatedEvent: UpdateCalendarEventInput
) {
  const result = await db
    .collection<UpdateCalendarEventInput>('calendarEvents')
    .findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: { ...updatedEvent, updatedAt: formatISO(new Date()) } },
      { upsert: true, returnDocument: 'after' }
    );
  return result.value;
}

export async function deleteCalendarEvent(db: Db, _id: string) {
  const result = await db
    .collection<CalendarEventWithObjectId>('calendarEvents')
    .findOneAndDelete({ _id: new ObjectId(_id) });
  return result.value;
}
