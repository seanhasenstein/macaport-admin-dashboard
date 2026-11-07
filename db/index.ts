import { mongoClientPromise } from './connect';
import * as store from './store';
import * as order from './order';
import * as inventoryProduct from './inventoryProduct';
import * as shipping from './shipping';
import * as memberBenefit from './memberBenefit';
import * as clientInvoice from './clientInvoice';

async function connectToDb() {
  const client = await mongoClientPromise;
  return client.db();
}

export {
  clientInvoice,
  connectToDb,
  inventoryProduct,
  memberBenefit,
  order,
  shipping,
  store,
};
