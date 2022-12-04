import { StoreProduct } from '../interfaces';

export function getActiveProductColors(storeProduct: StoreProduct) {
  // loop over productSkus to return an array of all active colors
  const includedColorsArray = storeProduct.productSkus.reduce(
    (accumulator: string[], currentSku) => {
      // if the currentSku.color is already in the accumulator
      // then simply return
      if (accumulator.includes(currentSku.color.id)) {
        return accumulator;
        // if the currentSku.color is NOT in the accumulator
        // then we need to check the currentSku is active
        // and the inventoryProductSku is active
        // if YES, then add the currentSku.color.id to the accumulator array
        // if NO, then only return the accumulator
      } else if (
        currentSku.active === true &&
        currentSku.inventorySkuActive === true
      ) {
        return [...accumulator, currentSku.color.id];
      } else {
        return accumulator;
      }
    },
    []
  );

  // return all product.colors that are in the includedColorsArray
  return storeProduct.colors.filter(color =>
    includedColorsArray.includes(color.id)
  );
}
