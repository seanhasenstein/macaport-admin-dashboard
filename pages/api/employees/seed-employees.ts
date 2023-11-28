import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db, MongoClient } from 'mongodb';
import { withAuth } from '../../../utils/withAuth';
import database from '../../../middleware/db';

import { testEmployees } from '../../../data/test-employees';
import { Employee, EmployeeWithId } from '../../../interfaces';
import { formatISO } from 'date-fns';

interface ExtendedRequest extends NextApiRequest {
  db: Db;
  dbClient: MongoClient;
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const formattedTestEmployees = testEmployees.map(employee => {
      return {
        ...employee,
        createdAt: formatISO(new Date()),
        updatedAt: formatISO(new Date()),
      };
    });

    const employees = await req.db
      .collection<Employee>('employees')
      .insertMany(formattedTestEmployees);

    res.json({ employees });
  });

export default withAuth(handler);
