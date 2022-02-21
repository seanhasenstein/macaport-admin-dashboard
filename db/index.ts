import { mongoClientPromise } from './connect';
import * as store from './store';
import * as order from './order';
import * as inventoryProduct from './inventoryProduct';

async function connectToDb() {
  const client = await mongoClientPromise;
  return client.db();
}

export { connectToDb, store, order, inventoryProduct };
