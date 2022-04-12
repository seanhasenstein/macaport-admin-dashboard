import { NextApiResponse } from 'next';
import nc from 'next-connect';
import {
  PersonalizationItem,
  Request,
  Store,
  StoreProduct,
} from '../../interfaces';
import database from '../../middleware/db';
import { store } from '../../db';
import { createId } from '../../utils';
import { withAuth } from '../../utils/withAuth';

interface TempStoreProduct extends StoreProduct {
  includeCustomName?: boolean;
  includeCustomNumber?: boolean;
}

interface TempStore extends Omit<Store, 'products'> {
  products: TempStoreProduct[];
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    const stores: TempStore[] = await store.getStores(req.db);

    const updatedStores: Store[] = stores.map(store => {
      const updatedProducts = store.products.map(product => {
        const { includeCustomName, includeCustomNumber, ...restOfProduct } =
          product;

        const name: PersonalizationItem | undefined =
          product.includeCustomName === true
            ? {
                id: createId('pi'),
                name: 'Name',
                location: 'Back',
                type: 'string',
                list: [] as string[],
                price: 500,
                lines: 1,
                limit: 1,
                subItems: [] as PersonalizationItem[],
              }
            : undefined;

        const number: PersonalizationItem | undefined =
          product.includeCustomNumber === true
            ? {
                id: createId('pi'),
                name: 'Number',
                location: 'Back',
                type: 'number',
                list: [] as string[],
                price: 500,
                lines: 1,
                limit: 1,
                subItems: [] as PersonalizationItem[],
              }
            : undefined;

        const filterUndefinedValues = (
          value: PersonalizationItem | undefined
        ): value is PersonalizationItem => value !== undefined;
        const addons = [name, number].filter(filterUndefinedValues);

        const personalization = {
          active:
            product.includeCustomName === true ||
            product.includeCustomNumber === true
              ? true
              : false,
          maxLines:
            0 +
            (product.includeCustomName === true ? 1 : 0) +
            (product.includeCustomNumber === true ? 1 : 0),
          addons,
        };

        return { ...restOfProduct, personalization };
      });

      return { ...store, products: updatedProducts };
    });

    // update each store in the database
    for (const updatedStore of updatedStores) {
      const { _id, ...update } = updatedStore;
      await store.updateStore(req.db, updatedStore._id, update);
    }

    res.json({ success: true });
  });

export default withAuth(handler);
