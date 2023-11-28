import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db, MongoClient } from 'mongodb';
import { withAuth } from '../../../utils/withAuth';
import database from '../../../middleware/db';
import { equipment } from '../../../db';

interface ExtendedRequest extends NextApiRequest {
  db: Db;
  dbClient: MongoClient;
  query: {
    id: string;
    name: string;
  };
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const { id, name } = req.query;

    if (!id && !name) {
      res.json({ error: 'Missing required fields' });
      return;
    }

    const query = {
      id: id ? id.trim() : '',
      name: name ? name.trim() : '',
    };

    const queryResult = await equipment.findEquipmentItems(req.db, {
      $or: [{ id: query.id }, { name: query.name }],
    });

    res.json({ equipment: queryResult });
  });

export default withAuth(handler);
