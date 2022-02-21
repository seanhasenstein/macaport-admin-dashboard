import { NextApiResponse } from 'next';
import { connectToDb } from '../db';
import { Request } from '../interfaces';

export default async function database(
  req: Request,
  _res: NextApiResponse,
  next: () => void
) {
  const db = await connectToDb();
  req.db = db;

  next();
}
