import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { Request, InventoryProduct } from '../../../interfaces';
import database from '../../../middleware/db';
import { inventoryProduct, store as dbStore } from '../../../db';
import { updateStoreProductSkus } from '../../../utils/inventoryProduct';

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const update: InventoryProduct = req.body;
    const result: InventoryProduct =
      await inventoryProduct.updateInventoryProduct(
        req.db,
        req.body._id,
        update
      );

    const allStores = await dbStore.getStores(req.db);

    for (const store of allStores) {
      if (
        store.products?.some(
          p => p.inventoryProductId === update.inventoryProductId
        )
      ) {
        const updatedStoreProducts = store.products.map(p => {
          if (p.inventoryProductId === update.inventoryProductId) {
            const updatedProductSkus = updateStoreProductSkus(store, p, update);
            const sizes = update.sizes.map(s => {
              const prevSize = p.sizes.find(ps => ps.id === s.id);
              return { ...prevSize, ...s, price: prevSize?.price || 0 };
            });
            const colors = update.colors.map(c => {
              const prevColor = p.colors.find(pc => pc.id === c.id);
              return {
                ...prevColor,
                ...c,
                primaryImage: prevColor?.primaryImage || '',
                secondaryImages: prevColor?.secondaryImages || [],
              };
            });

            return {
              ...p,
              merchandiseCode: update.merchandiseCode,
              sizes,
              colors,
              productSkus: updatedProductSkus,
            };
          }

          return p;
        });

        // invoke a db storeUpdate
        await dbStore.updateStore(req.db, store._id, {
          products: updatedStoreProducts,
        });
      }
    }

    res.json({ inventoryProduct: result });
  });

export default withAuth(handler);
