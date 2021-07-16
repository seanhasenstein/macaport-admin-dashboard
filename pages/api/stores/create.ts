import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { Request } from '../../../interfaces';
import { Store } from '../../../interfaces';
import database from '../../../middleware/db';
import { store } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    try {
      const result: Store = await store.createStore(req.db, req.body);
      res.json({ store: result });
    } catch (error) {
      console.error(error);
      res.json({ error: error.message });
    }
  });

export default handler;
