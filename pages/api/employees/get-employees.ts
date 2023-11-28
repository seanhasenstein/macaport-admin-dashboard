import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db, MongoClient } from 'mongodb';
import { withAuth } from '../../../utils/withAuth';
import database from '../../../middleware/db';
import { employee } from '../../../db';

interface ExtendedRequest extends NextApiRequest {
  db: Db;
  dbClient: MongoClient;
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const queryResult = await employee.findEmployees(req.db, {});
    res.json({ employees: queryResult });
  });

export default withAuth(handler);
