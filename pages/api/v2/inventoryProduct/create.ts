import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { Db } from 'mongodb';

import { withAuth } from '../../../../utils/withAuth';

import database from '../../../../middleware/db';

import { inventoryProductV2 } from '../../../../db';

import {
  InventoryColorV2,
  InventorySizeV2,
  InventorySkuV2,
  SizeChartV2,
} from '../../../../types/inventoryProduct';
import { createId } from '../../../../utils';

interface Request extends NextApiRequest {
  db: Db;
  body: {
    merchandiseCode?: string;
    name?: string;
    description?: string;
    sizeRange?: string;
    tags?: string[];
    details?: string[];
    sizes?: InventorySizeV2[];
    colors?: InventoryColorV2[];
    skus?: InventorySkuV2[];
    sizeChart?: SizeChartV2;
  };
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    try {
      const {
        merchandiseCode,
        name,
        description,
        sizeRange,
        tags,
        details,
        sizes,
        colors,
        sizeChart,
      } = req.body;

      if (!merchandiseCode || !name || !sizes?.length || !colors?.length) {
        return res.status(400).send('Missing required fields.');
      }

      // check for existing merchandise code
      const existingProduct = await inventoryProductV2.findInventoryProduct(
        req.db,
        { merchandiseCode }
      );

      if (existingProduct) {
        return res
          .status(400)
          .send(
            'An inventory product with this merchandise code already exists.'
          );
      }

      const inventoryProductId = createId('inv_prod');

      // remove non-hex characters from color hex values and set to lowercase
      const formattedColors = colors.map(color => {
        const hex = `#${color.hex.replace(/[^0-9A-Fa-f]/g, '').toLowerCase()}`;
        return { ...color, hex };
      });

      const skus = colors.reduce(
        (accumulator, currentColor) => {
          const skus = sizes.map(size => ({
            id: createId('inv_sku'),
            inventoryProductId,
            size,
            color: currentColor,
            inventory: 0,
            active: true,
          }));

          return [...accumulator, ...skus];
        },
        [] as {
          // todo: add type
          id: string;
          inventoryProductId: string;
          size: InventorySizeV2;
          color: InventoryColorV2;
          inventory: number;
          active: boolean;
        }[]
      );

      const input = {
        merchandiseCode: merchandiseCode.trim(),
        name: name.trim(),
        ...(description && { description: description.trim() }),
        ...(sizeRange && { sizeRange: sizeRange.trim() }),
        ...(tags && { tags: tags.map(tag => tag.trim()) }),
        ...(details && { details: details.map(detail => detail.trim()) }),
        // sizes,
        // colors: formattedColors,
        skus,
        ...(sizeChart && { sizeChart }),
      };

      const result = await inventoryProductV2.createInventoryProduct(
        req.db,
        input
      );

      res.json({ inventoryProduct: result });
    } catch (error: unknown) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  });

export default withAuth(handler);
