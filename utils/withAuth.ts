import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';

export function withAuth(originalHandler: any) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    return originalHandler(req, res);
  };
}
