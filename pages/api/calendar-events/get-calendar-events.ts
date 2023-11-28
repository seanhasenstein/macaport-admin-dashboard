import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db, MongoClient } from 'mongodb';
import { withAuth } from '../../../utils/withAuth';
import database from '../../../middleware/db';
import { calendarEvent } from '../../../db';

interface ExtendedRequest extends NextApiRequest {
  db: Db;
  dbClient: MongoClient;
  query: {
    _id: string;
  };
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const queryResult = await calendarEvent.getAllCalendarEvents(req.db);
    res.json({ calendarEvents: queryResult });
  });

export default withAuth(handler);
