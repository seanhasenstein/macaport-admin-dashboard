import { Db } from 'mongodb';
import { Product } from '../interfaces';

export async function getStoreProduct(db: Db, productId: string) {
  try {
    const result = await db
      .collection('stores')
      .findOne({ 'products.id': productId });
    if (!result) throw new Error('Invalid product ID provided.');
    const product = result.products.find((p: Product) => p.id === productId);
    return product;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred getting the product.');
  }
}
