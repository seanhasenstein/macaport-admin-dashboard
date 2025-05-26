import { mongoClientPromise } from './connect';
import * as store from './store';
import * as order from './order';
import * as inventoryProduct from './inventoryProduct';
import * as shipping from './shipping';

// v2
import * as color from './v2/color';
import * as inventoryProductV2 from './v2/inventoryProduct';

async function connectToDb() {
  const client = await mongoClientPromise;
  return client.db();
}

export {
  connectToDb,
  inventoryProduct,
  order,
  shipping,
  store,
  color,
  inventoryProductV2,
};
