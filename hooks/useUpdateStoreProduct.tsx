import React from 'react';
import { useRouter } from 'next/router';
import { UseQueryResult } from 'react-query';
import {
  CloudinaryStatus,
  Color,
  FormSize,
  Note,
  ProductSku,
  Store,
  StoreProduct,
} from '../interfaces';
import {
  createId,
  formatFromStripeToPrice,
  getCloudinarySignature,
} from '../utils';

const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`;

type InitialValues = {
  id: string;
  merchandiseCode: string;
  inventoryProductId: string;
  name: string;
  description: string;
  tag: string;
  details: string[];
  sizes: FormSize[];
  colors: Color[];
  productSkus: ProductSku[];
  notes: Note[];
};

type Props = {
  storeQuery: UseQueryResult<Store, unknown>;
};

export function useUpdateStoreProduct({ storeQuery }: Props) {
  const router = useRouter();
  const [product, setProduct] = React.useState<StoreProduct>();
  const [includeCustomName, setIncludeCustomName] = React.useState(false);
  const [includeCustomNumber, setIncludeCustomNumber] = React.useState(false);
  const [primaryImages, setPrimaryImages] = React.useState<string[]>([]);
  const [secondaryImages, setSecondaryImages] = React.useState<string[][]>([]);
  const [primaryImageStatus, setPrimaryImageStatus] =
    React.useState<CloudinaryStatus>('idle');
  const [secondaryImageStatus, setSecondaryImageStatus] =
    React.useState<CloudinaryStatus>('idle');
  const [initialValues, setInitialValues] = React.useState<InitialValues>({
    id: '',
    inventoryProductId: '',
    merchandiseCode: '',
    name: '',
    description: '',
    tag: '',
    details: [],
    sizes: [],
    colors: [],
    productSkus: [],
    notes: [],
  });

  React.useEffect(() => {
    if (storeQuery.data) {
      const product = storeQuery.data.products.find(
        p => p.id === router.query.pid
      );
      setProduct(product);
    }
  }, [router.query.pid, storeQuery.data]);

  React.useEffect(() => {
    if (product) {
      setInitialValues({
        id: product.id,
        inventoryProductId: product.inventoryProductId,
        merchandiseCode: product.merchandiseCode,
        name: product.name,
        description: product.description,
        tag: product.tag,
        details: product.details,
        sizes: product.sizes.map(s => ({
          ...s,
          price: formatFromStripeToPrice(s.price),
        })),
        colors: product.colors,
        productSkus: product.productSkus,
        notes: product.notes,
      });

      const primaryImages = product.colors.map((c: Color) => c.primaryImage);

      const secondaryImages = product.colors.map(
        (c: Color) => c.secondaryImages
      );

      setPrimaryImages(primaryImages);
      setSecondaryImages(secondaryImages);
      setIncludeCustomName(product.includeCustomName);
      setIncludeCustomNumber(product.includeCustomNumber);
    }
  }, [product]);

  const handlePrimaryImageChange = async (
    index: number,
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

    const data = await response.json();

    const primeImgCopy = [...primaryImages];
    primeImgCopy[index] = data.secure_url;
    // TODO: can we just use formik state?
    setPrimaryImages(primeImgCopy);

    const updatedColors = colors.map(c => {
      if (c.id == color.id) {
        return { ...color, primaryImage: data.secure_url };
      }

      return c;
    });

    setFieldValue('colors', updatedColors);
    setPrimaryImageStatus('idle');
  };

  const handleSecondaryImagesChange = async (
    index: number,
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
    const secImgsCopy = [...secondaryImages];

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

      secImgsCopy[index] = [...(secImgsCopy[index] || []), data.secure_url];
    }

    // TODO: can we just use formik state?
    setSecondaryImages(secImgsCopy);

    const updatedColors = colors.map(c => {
      if (c.id === color.id) {
        return { ...color, secondaryImages: secImgsCopy[index] };
      }
      return c;
    });
    setFieldValue('colors', updatedColors);
    setSecondaryImageStatus('idle');
  };

  const handleRemoveSecondaryImage = (
    colorIndex: number,
    secImgIndex: number,
    color: Color,
    colors: Color[],
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean | undefined
    ) => void
  ) => {
    const secImgsCopy = [...secondaryImages];
    const secImgIndexCopy = [...secondaryImages[colorIndex]];
    secImgIndexCopy.splice(secImgIndex, 1);
    secImgsCopy[colorIndex] = secImgIndexCopy;
    setSecondaryImages(secImgsCopy);

    const updatedColors = colors.map(c => {
      if (c.id === color.id) {
        return { ...color, secondaryImages: secImgsCopy[colorIndex] };
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
    includeCustomName,
    setIncludeCustomName,
    includeCustomNumber,
    setIncludeCustomNumber,
    primaryImages,
    secondaryImages,
    product,
    primaryImageStatus,
    secondaryImageStatus,
    handlePrimaryImageChange,
    handleSecondaryImagesChange,
    handleRemoveSecondaryImage,
    handleAddClick,
  };
}
