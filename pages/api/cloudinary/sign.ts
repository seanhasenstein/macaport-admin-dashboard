import { NextApiRequest, NextApiResponse } from 'next';
import Cloudinary from 'cloudinary';

const cloudinary = Cloudinary.v2;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: check for authentication

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
