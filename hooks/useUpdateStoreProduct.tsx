import React from 'react';
import { useRouter } from 'next/router';
import { UseQueryResult } from 'react-query';

import {
  Color,
  FormSize,
  InventoryProduct,
  PersonalizationForm,
  ProductSku,
  Store,
  StoreProduct,
} from '../interfaces';

import { formatDbAddonItemsForForm } from '../utils/storeProduct';

type InitialValues = {
  id: string;
  inventoryProductId: string;
  artworkId: string;
  merchandiseCode: string;
  name: string;
  description: string;
  tag: string;
  details: string[];
  personalization: PersonalizationForm;
  allSizesPrice: number | undefined;
  sizes: FormSize[];
  colors: Color[];
  productSkus: ProductSku[];
};

type Props = {
  inventoryProductQuery: UseQueryResult<InventoryProduct, unknown>;
  storeQuery: UseQueryResult<Store | undefined, unknown>;
};

export function useUpdateStoreProduct(props: Props) {
  const router = useRouter();
  const [product, setProduct] = React.useState<StoreProduct>();
  const [initialValues, setInitialValues] = React.useState<InitialValues>({
    id: '',
    inventoryProductId: '',
    artworkId: '',
    merchandiseCode: '',
    name: '',
    description: '',
    tag: '',
    details: [],
    personalization: {
      active: false,
      maxLines: 0,
      addons: [],
    },
    allSizesPrice: undefined,
    sizes: [],
    colors: [],
    productSkus: [],
  });

  React.useEffect(() => {
    if (props.storeQuery.data) {
      const product = props.storeQuery.data.products.find(
        p => p.id === router.query.pid
      );
      setProduct(product);
    }
  }, [router.query.pid, props.storeQuery.data]);

  React.useEffect(() => {
    if (product && props.inventoryProductQuery.data) {
      type AccumulatorType = {
        colorsWithPrimaryImg: Color[];
        colorsWithoutPrimaryImg: Color[];
      };

      const { colorsWithPrimaryImg, colorsWithoutPrimaryImg } =
        product.colors.reduce(
          (accumulator: AccumulatorType, currentColor) => {
            if (currentColor.primaryImage) {
              accumulator.colorsWithPrimaryImg.push(currentColor);
            } else {
              accumulator.colorsWithoutPrimaryImg.push(currentColor);
            }
            return accumulator;
          },
          { colorsWithPrimaryImg: [], colorsWithoutPrimaryImg: [] }
        );

      const sortedColorsWithoutPrimaryImg = colorsWithoutPrimaryImg.sort(
        (colorA, colorB) => {
          if (colorA.label < colorB.label) return -1;
          if (colorA.label > colorB.label) return 1;
          return 0;
        }
      );

      const colors = [
        ...colorsWithPrimaryImg,
        ...sortedColorsWithoutPrimaryImg,
      ];

      const allSizePricesAreEqual = product.sizes.every(
        s => s.price === product.sizes[0].price
      );

      setInitialValues({
        id: product.id,
        inventoryProductId: product.inventoryProductId,
        artworkId: product.artworkId || '',
        merchandiseCode: product.merchandiseCode,
        name: product.name,
        description: product.description,
        tag: product.tag,
        details: product.details,
        personalization: {
          ...product.personalization,
          addons: formatDbAddonItemsForForm(product.personalization.addons),
        },
        allSizesPrice: allSizePricesAreEqual
          ? product.sizes[0].price / 100
          : undefined,
        sizes: product.sizes.map(s => ({
          ...s,
          price: `${s.price / 100}`,
        })),
        colors,
        productSkus: product.productSkus,
      });
    }
  }, [product, props.inventoryProductQuery.data]);

  const handleAddClick = async (callback: () => void, selector: string) => {
    await callback();
    document.querySelector<HTMLInputElement>(selector)?.focus();
  };

  return {
    initialValues,
    product,
    handleAddClick,
  };
}
