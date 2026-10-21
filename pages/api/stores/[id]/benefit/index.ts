import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { ObjectId } from 'mongodb';
import { withAuth } from '../../../../../utils/withAuth';
import { Request } from '../../../../../interfaces';
import database from '../../../../../middleware/db';
import { memberBenefit } from '../../../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const storeId = req.query.id;
    if (!storeId || !ObjectId.isValid(storeId)) {
      return res.status(400).json({ error: 'A valid store id is required.' });
    }
    const store = await req.db
      .collection('stores')
      .findOne(
        { _id: new ObjectId(storeId) },
        { projection: { benefitId: 1 } }
      );
    const benefit = store?.benefitId
      ? await memberBenefit.getById(req.db, store.benefitId)
      : null;
    res.json({ benefit });
  });

export default withAuth(handler);
