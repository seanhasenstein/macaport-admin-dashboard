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
    const { _id } = req.query;

    if (!_id) {
      res.json({ error: 'Missing required fields' });
      return;
    }

    const query = {
      _id,
    };

    const queryResult = await calendarEvent.findCalendarEventById(req.db, _id);
    res.json(queryResult);
  });

export default withAuth(handler);
