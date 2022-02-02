import styled from 'styled-components';
import { useStoreProductMutations } from '../../hooks/useStoreProductMutations';
import useDragNDrop from '../../hooks/useDragNDrop';
import { StoreProduct, Color } from '../../interfaces';

type Props = {
  color: Color;
  product: StoreProduct;
};

export default function SecondaryImages({ color, product }: Props) {
  const { updateSecondaryImgOrder } = useStoreProductMutations({
    color,
    storeProduct: product,
  });

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
    updateSecondaryImgOrder.mutate
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
