import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../../../utils/withAuth';
import { Request } from '../../../../../interfaces';
import database from '../../../../../middleware/db';
import { teacherAppreciation } from '../../../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const result = await teacherAppreciation.getByStoreId(req.db, req.query.id);
    res.json({ teacherAppreciation: result });
  });

export default withAuth(handler);
