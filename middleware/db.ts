import { NextApiResponse } from 'next';
import { connectToDb } from '../db/connect';
import { Request } from '../interfaces';

declare global {
  namespace NodeJS {
    interface Global {
      mongo: any;
    }
  }
}

export default async function database(
  req: Request,
  res: NextApiResponse,
  next: () => void
) {
  const { db, dbClient } = await connectToDb();
  req.db = db;
  req.dbClient = dbClient;

  next();
}
