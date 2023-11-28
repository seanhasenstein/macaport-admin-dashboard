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
  .delete(async (req, res) => {
    const { _id } = req.query;

    if (!_id) {
      res.json({ error: 'Missing required id' });
      return;
    }

    const query = {
      _id: _id ? _id.trim() : '',
    };

    const queryResult = await calendarEvent.deleteCalendarEvent(
      req.db,
      query._id
    );

    res.json({ success: true, calendarEvent: queryResult });
  });

export default withAuth(handler);
