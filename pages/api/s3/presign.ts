import { NextApiRequest, NextApiResponse } from 'next';
import { S3 } from 'aws-sdk';
import { withAuth } from '../../../utils/withAuth';
import { getBucketEnv } from '../../../utils';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_REGION
  ) {
    res.status(500).json({ error: 'AWS credentials not configured' });
    return;
  }

  const { storeId, productId, colorId, key, contentType } = req.body ?? {};

  if (!storeId || !productId || !colorId || !key) {
    res.status(400).json({ error: 'Missing required field' });
    return;
  }

  const Bucket = `macaport-store-product-images/${getBucketEnv()}/store-${storeId}/${productId}/${colorId}`;
  const ContentType = contentType || 'application/octet-stream';

  try {
    const uploadUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket,
      Key: key,
      ContentType,
      Expires: 300,
    });

    const publicUrl = uploadUrl.split('?')[0];
    res.status(200).json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error('s3 presign error', err);
    res.status(500).json({ error: 'Failed to create presigned URL' });
  }
}

export default withAuth(handler);
