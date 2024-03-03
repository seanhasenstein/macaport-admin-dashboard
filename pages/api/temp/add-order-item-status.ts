import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { ObjectId } from 'mongodb';
import { withAuth } from '../../../utils/withAuth';
import { Order, OrderItemStatus, Request, Store } from '../../../interfaces';
import database from '../../../middleware/db';
import { createId, getStoreStatus } from '../../../utils';

function returnOrderItemStatus(status: OrderItemStatus) {
  const statusArray: OrderItemStatus[] = [
    'Unfulfilled',
    'Fulfilled',
    'Shipped',
    'Canceled',
  ];

  const meta = statusArray.reduce(
    (
      acc: Record<OrderItemStatus, { user: string; updatedAt: string }>,
      currStatus
    ) => {
      if (currStatus === status) {
        return {
          ...acc,
          [currStatus]: {
            user: 'system',
            updatedAt: new Date().toISOString(),
          },
        };
      } else {
        return {
          ...acc,
          [currStatus]: {
            user: '',
            updatedAt: '',
          },
        };
      }
    },
    {
      Unfulfilled: {
        user: '',
        updatedAt: '',
      },
      Fulfilled: {
        user: '',
        updatedAt: '',
      },
      Shipped: {
        user: '',
        updatedAt: '',
      },
      Canceled: {
        user: '',
        updatedAt: '',
      },
    }
  );

  return {
    current: status,
    meta,
  };
}

interface StoreWithId extends Omit<Store, '_id'> {
  _id: ObjectId;
}

const handler = nc<Request, NextApiResponse>()
  .use(database)
  .get(async (req, res) => {
    // query all stores
    const allStores = await req.db
      .collection<StoreWithId>('stores')
      .find({})
      .toArray();

    for (let i = 0; i < allStores.length; i++) {
      const store = allStores[i];
      const { openDate, closeDate } = store;
      const storeStatus = getStoreStatus(openDate, closeDate);
      const storeIsClosed = storeStatus === 'closed';
      const allOrdersAreCompletedOrCanceled = store.orders.every(o =>
        ['Completed', 'Canceled'].includes(o.orderStatus)
      );

      const updatedOrders: Order[] = store.orders.map(order => {
        const updatedOrderItems = order.items.map(orderItem => {
          const orderItemId = createId('cartItem');
          // WHEN ORDER IS CANCELED
          if (order.orderStatus === 'Canceled') {
            return {
              ...orderItem,
              id: orderItemId,
              status: returnOrderItemStatus('Canceled'),
            };
            // WHEN ORDER IS NOT CANCELED
          } else {
            // WHEN STORE IS CLOSED AND ALL ORDERS ARE COMPLETED OR CANCELED
            if (storeIsClosed && allOrdersAreCompletedOrCanceled) {
              return {
                ...orderItem,
                id: orderItemId,
                status: returnOrderItemStatus('Shipped'),
              };
              // WHEN THE STORE IS UPCOMING OR OPEN
              // OR
              // WHEN STORE IS CLOSED AND HAS AT LEAST ONE ORDER THAT IS NOT COMPLETED OR CANCELED
            } else {
              switch (order.orderStatus) {
                case 'Unfulfilled':
                  return {
                    ...orderItem,
                    id: orderItemId,
                    status: returnOrderItemStatus('Unfulfilled'),
                  };
                case 'Printed':
                  return {
                    ...orderItem,
                    id: orderItemId,
                    status: returnOrderItemStatus('Unfulfilled'),
                  };
                case 'Fulfilled':
                  return {
                    ...orderItem,
                    id: orderItemId,
                    status: returnOrderItemStatus('Fulfilled'),
                  };
                case 'Completed':
                  return {
                    ...orderItem,
                    id: orderItemId,
                    status: returnOrderItemStatus('Fulfilled'),
                  };
                default:
                  return {
                    ...orderItem,
                    id: orderItemId,
                    status: returnOrderItemStatus('Unfulfilled'),
                  };
              }
            }
          }
        });

        return { ...order, items: updatedOrderItems };
      });

      await req.db
        .collection<StoreWithId>('stores')
        .updateOne({ _id: store._id }, { $set: { orders: updatedOrders } });
    }

    res.json({ result: 'success' });
  });

export default withAuth(handler);
