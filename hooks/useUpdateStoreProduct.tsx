import React from 'react';
import { useRouter } from 'next/router';
import { UseQueryResult } from 'react-query';
import {
  CloudinaryStatus,
  Color,
  FormSize,
  InventoryProduct,
  Note,
  PersonalizationForm,
  ProductSku,
  Store,
  StoreProduct,
} from '../interfaces';
import {
  createId,
  formatFromStripeToPrice,
  getCloudinarySignature,
} from '../utils';
import { formatDbAddonItemsForForm } from '../utils/storeProduct';

const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`;

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
  sizes: FormSize[];
  colors: Color[];
  productSkus: ProductSku[];
  notes: Note[];
};

type Props = {
  inventoryProductQuery: UseQueryResult<InventoryProduct, unknown>;
  storeQuery: UseQueryResult<Store, unknown>;
};

export function useUpdateStoreProduct(props: Props) {
  const router = useRouter();
  const [product, setProduct] = React.useState<StoreProduct>();
  const [primaryImageStatus, setPrimaryImageStatus] =
    React.useState<CloudinaryStatus>('idle');
  const [secondaryImageStatus, setSecondaryImageStatus] =
    React.useState<CloudinaryStatus>('idle');
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
    sizes: [],
    colors: [],
    productSkus: [],
    notes: [],
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
      const colors: Color[] = props.inventoryProductQuery.data.colors.map(
        invProdColor => {
          const storeProdColor = product.colors.find(
            storeProd => storeProd.id === invProdColor.id
          );

          if (storeProdColor) {
            return storeProdColor;
          } else {
            return { ...invProdColor, primaryImage: '', secondaryImages: [] };
          }
        }
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
        sizes: product.sizes.map(s => ({
          ...s,
          price: formatFromStripeToPrice(s.price),
        })),
        colors,
        productSkus: product.productSkus,
        notes: product.notes,
      });
    }
  }, [product, props.inventoryProductQuery.data]);

  const handlePrimaryImageChange = async (
    productId: string,
    color: Color,
    colors: Color[],
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean | undefined
    ) => void,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files === null || e.target.files[0] === undefined) {
      return;
    }

    setPrimaryImageStatus('loading');
    const publicId = `stores/${router.query.id}/${productId}/${
      color.id
    }/${createId('primary')}`;
    const { signature, timestamp } = await getCloudinarySignature(publicId);

    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('api_key', `${process.env.NEXT_PUBLIC_CLOUDINARY_KEY}`);
    formData.append('public_id', publicId);
    formData.append('timestamp', `${timestamp}`);
    formData.append('signature', signature);

    const response = await fetch(url, {
      method: 'post',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to send primary image to cloudinary.');
    }

    const data = await response.json();

    const updatedColors = colors.map(c => {
      if (c.id == color.id) {
        return { ...color, primaryImage: data.secure_url };
      }

      return c;
    });

    setFieldValue('colors', updatedColors);
    setPrimaryImageStatus('idle');
  };

  const handleAddSecondaryImages = async (
    productId: string,
    color: Color,
    colors: Color[],
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean | undefined
    ) => void,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files === null || e.target.files[0] === undefined) {
      return;
    }

    setSecondaryImageStatus('loading');

    const secondaryImagesCopy = [...color.secondaryImages];

    for (let i = 0; i < e.target.files.length; i++) {
      const publicId = `stores/${router.query.id}/${productId}/${
        color.id
      }/${createId('secondary')}`;

      const { signature, timestamp } = await getCloudinarySignature(publicId);

      const formData = new FormData();
      formData.append('file', e.target.files[i]);
      formData.append('api_key', `${process.env.NEXT_PUBLIC_CLOUDINARY_KEY}`);
      formData.append('public_id', publicId);
      formData.append('timestamp', `${timestamp}`);
      formData.append('signature', signature);

      const response = await fetch(url, {
        method: 'post',
        body: formData,
      });

      const data = await response.json();

      secondaryImagesCopy.push(data.secure_url);
    }

    const updatedColors = colors.map(c => {
      if (c.id === color.id) {
        return { ...color, secondaryImages: secondaryImagesCopy };
      }
      return c;
    });

    setFieldValue('colors', updatedColors);
    setSecondaryImageStatus('idle');
  };

  const handleRemoveSecondaryImage = (
    secImgIndex: number,
    color: Color,
    colors: Color[],
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean | undefined
    ) => void
  ) => {
    const secondaryImagesCopy = [...color.secondaryImages];

    secondaryImagesCopy.splice(secImgIndex, 1);

    const updatedColors = colors.map(c => {
      if (c.id === color.id) {
        return { ...color, secondaryImages: secondaryImagesCopy };
      }
      return c;
    });

    setFieldValue('colors', updatedColors);
  };

  const handleAddClick = async (callback: () => void, selector: string) => {
    await callback();
    document.querySelector<HTMLInputElement>(selector)?.focus();
  };

  return {
    initialValues,
    product,
    primaryImageStatus,
    secondaryImageStatus,
    handlePrimaryImageChange,
    handleAddSecondaryImages,
    handleRemoveSecondaryImage,
    handleAddClick,
  };
}
