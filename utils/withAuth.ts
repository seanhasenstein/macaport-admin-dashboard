import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

export function withAuth(originalHandler: any) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (!session) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    return originalHandler(req, res);
  };
}
