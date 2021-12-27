import { useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import useDragNDrop from '../../hooks/useDragNDrop';
import { Store, Product, Color } from '../../interfaces';

type Props = {
  color: Color;
  product: Product;
  storeId: string;
};

export default function SecondaryImages({ color, product, storeId }: Props) {
  const queryClient = useQueryClient();
  const secondaryImagesMutation = useMutation(
    async (secondaryImages: string[]) => {
      const response = await fetch(
        `/api/stores/update-color?sid=${storeId}&pid=${product.id}&colorId=${color.id}`,
        {
          method: 'post',
          body: JSON.stringify({ ...color, secondaryImages }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update the secondary images.');
      }
      const { store }: { store: Store } = await response.json();
      const updatedProduct = store.products.find(p => p.id === product.id);
      const updatedColor = updatedProduct?.colors.find(c => c.id === color.id);
      return updatedColor?.secondaryImages;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  const {
    list,
    dragging,
    handleDragStart,
    handleDragEnter,
    handleDrop,
    getStyles,
    handleMouseDown,
    handleMouseUp,
  } = useDragNDrop(
    color.secondaryImages,
    'secondary-img',
    secondaryImagesMutation.mutate
  );

  return (
    <SecondaryImagesStyles>
      {list.map((secImg, index) => (
        <div
          key={index}
          draggable={dragging}
          onDragStart={e => handleDragStart(e, index)}
          onDragEnter={dragging ? e => handleDragEnter(e, index) : undefined}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className={dragging ? getStyles(index) : 'secondary-img'}
        >
          <button
            type="button"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <img src={secImg} alt={`${color.label} secondary ${index}`} />
          </button>
        </div>
      ))}
    </SecondaryImagesStyles>
  );
}

const SecondaryImagesStyles = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;

  .secondary-img {
    padding: 0.25rem 0.5rem;
    width: 2.75rem;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
      rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;

    img {
      width: 100%;
    }
  }

  button {
    margin: 0;
    padding: 0;
    display: flex;
    background-color: transparent;
    border: none;
    box-shadow: none;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
`;
