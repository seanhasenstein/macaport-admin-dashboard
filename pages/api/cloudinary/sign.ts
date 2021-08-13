import { NextApiRequest, NextApiResponse } from 'next';
import Cloudinary from 'cloudinary';
import { withAuth } from '../../../utils/withAuth';

const cloudinary = Cloudinary.v2;

function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.CLOUDINARY_SECRET) {
    res.status(500).json({ error: 'Cloudinary secret not provided.' });
    return;
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      public_id: req.query.publicId,
    },
    process.env.CLOUDINARY_SECRET
  );

  res.status(200).json({ signature, timestamp });
}

export default withAuth(handler);
