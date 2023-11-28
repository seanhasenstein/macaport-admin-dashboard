import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db, MongoClient } from 'mongodb';
import { withAuth } from '../../../utils/withAuth';
import database from '../../../middleware/db';
import { employee } from '../../../db';
import { removeNonDigits } from '../../../utils';

interface ExtendedRequest extends NextApiRequest {
  db: Db;
  dbClient: MongoClient;
  query: {
    email: string;
    phone: string;
  };
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const { email, phone } = req.query;

    if (!email && !phone) {
      res.json({ error: 'Missing required fields' });
      return;
    }

    const query = {
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? removeNonDigits(phone) : '',
    };

    const queryResult = await employee.findEmployee(req.db, {
      $or: [{ email: query.email }, { phone: query.phone }],
    });

    res.json({ employee: queryResult });
  });

export default withAuth(handler);
