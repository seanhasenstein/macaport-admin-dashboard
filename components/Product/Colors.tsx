import { useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import useDragNDrop from '../../hooks/useDragNDrop';
import { Store, StoreProduct, Color } from '../../interfaces';
import SecondaryImages from './SecondaryImages';

type Props = {
  storeId: string;
  product: StoreProduct;
};

export default function Colors({ storeId, product }: Props) {
  const queryClient = useQueryClient();

  const colorsMutation = useMutation(
    async (colors: Color[]) => {
      const response = await fetch(
        `/api/stores/update-product?sid=${storeId}&pid=${product.id}`,
        {
          method: 'post',
          body: JSON.stringify({ ...product, colors }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update the colors.');
      }
      const { store }: { store: Store } = await response.json();
      const updatedProduct = store.products.find(p => p.id === product.id);
      return updatedProduct?.colors;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
      },
    }
  );

  const dnd = useDragNDrop(
    product?.colors,
    'prod-color',
    colorsMutation.mutate
  );

  return (
    <ColorsStyles>
      {dnd.list.map((color, index) => (
        <div
          key={color.id}
          draggable={dnd.dragging}
          onDragStart={e => dnd.handleDragStart(e, index)}
          onDragEnter={
            dnd.dragging ? e => dnd.handleDragEnter(e, index) : undefined
          }
          onDragOver={e => e.preventDefault()}
          onDrop={dnd.handleDrop}
          className={dnd.dragging ? dnd.getStyles(index) : 'prod-color'}
        >
          {dnd.list.length > 1 && (
            <button
              type="button"
              onMouseDown={dnd.handleMouseDown}
              onMouseUp={dnd.handleMouseUp}
              className="drag-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </button>
          )}
          <div className="color-details">
            <div className="color-label">
              <div className="label">Label</div>
              <div className="value">{color.label}</div>
            </div>
            <div className="color-hex">
              <div className="label">Hex</div>
              <div className="value">
                <ColorSpan hex={color.hex} />
                {color.hex}
              </div>
            </div>
          </div>
          <div className="color-imgs">
            <div className="primary-img">
              <div className="label">Primary Image</div>
              {color.primaryImage ? (
                <div className="value">
                  <img
                    src={color.primaryImage}
                    alt={`${color.label} primary`}
                  />
                </div>
              ) : null}
            </div>
            <div className="secondary-imgs">
              <div className="label">Secondary Images</div>
              <SecondaryImages
                color={color}
                product={product}
                storeId={storeId}
              />
            </div>
          </div>
        </div>
      ))}
    </ColorsStyles>
  );
}

const ColorsStyles = styled.div`
  background: #fff;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

  .prod-color {
    padding: 0.875rem 1rem;
    max-width: 75rem;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;

    &:not(:last-of-type) {
      border-bottom: 1px solid #e5e7eb;
    }
  }

  .drag-button {
    display: flex;
    flex-direction: column;
    background-color: transparent;
    border: none;
    color: #9ca3af;

    &:hover {
      color: #111827;
      cursor: grab;
    }

    &:active {
      cursor: grabbing;
    }

    svg {
      height: 1.125rem;
      width: 1.125rem;

      &:last-of-type {
        margin-top: -0.75rem;
      }
    }
  }

  .color-details {
    width: 40%;
  }

  .color-imgs {
    display: flex;
    justify-content: space-between;
    width: 60%;
  }

  .primary-img {
    width: 30%;
  }

  .secondary-imgs {
    width: 55%;
  }

  .primary-img {
    .value {
      padding: 0.25rem 0.5rem;
      width: 2.75rem;
      background-color: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 0.25rem;
      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px,
        rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }

    img {
      width: 100%;
    }
  }

  .color-details {
    display: flex;
  }

  .color-label,
  .color-hex {
    width: 50%;
  }

  .label {
    margin: 0 0 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  .value {
    display: flex;
    align-items: center;
    color: #374151;
  }
`;

type ColorProps = {
  hex: string;
};

function ColorSpan(props: ColorProps) {
  return <ColorSpanStyles {...props} />;
}

const ColorSpanStyles = styled.span<ColorProps>`
  margin: 0 0.5rem 0 0;
  display: block;
  height: 1rem;
  width: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  background-color: ${props => props.hex};
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
`;
