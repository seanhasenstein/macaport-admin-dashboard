import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request } from '../../../interfaces';
import database from '../../../middleware/db';
// import { store } from '../../../db';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    // this renames inventoryProducts.tag to inventoryProducts.sizeCateory
    // await req.db
    //   .collection('inventoryProducts')
    //   .updateMany({}, { $rename: { tag: 'sizeCategory' } });

    // ********************************************************

    // this renames store.products.tag to store.products.sizeCategory
    // const storeAgg = await req.db.collection('stores').aggregate([
    //   {
    //     $addFields: {
    //       products: {
    //         $map: {
    //           input: '$products',
    //           as: 'product',
    //           in: {
    //             $mergeObjects: [
    //               {
    //                 $arrayToObject: {
    //                   $filter: {
    //                     input: { $objectToArray: '$$product' },
    //                     as: 'product',
    //                     cond: { $ne: ['$$product.k', 'tag'] },
    //                   },
    //                 },
    //               },
    //               { sizeCategory: '$$product.tag' },
    //             ],
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $out: 'stores',
    //   },
    // ]);

    res.json({ success: true });
  });

export default withAuth(handler);
