import { Db, ObjectID, ObjectId } from 'mongodb';

import {
  Store,
  OrderStatus,
  Order,
  OrderItemStatus,
  OrderItem,
} from '../interfaces';
import { getNextOrderItemStatus } from '../utils/orderItem';
import { handleUpdateOrderStatus } from '../utils/order';

export async function getOrderById(db: Db, storeId: string, orderId: string) {
  try {
    const result: Store = await db
      .collection('stores')
      .findOne({ _id: new ObjectID(storeId) });

    if (!result) throw new Error('Invalid store ID provided.');
    const order = result.orders.find(r => r.orderId === orderId);
    if (!order) throw new Error('No order found.');
    return order;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred getting the order.');
  }
}

export async function updateOrderStatus(
  db: Db,
  storeId: string,
  orderId: string,
  orderStatus: OrderStatus
) {
  try {
    const result = await db.collection('stores').findOneAndUpdate(
      { _id: new ObjectID(storeId) },
      { $set: { 'orders.$[order].orderStatus': orderStatus } },
      {
        arrayFilters: [{ 'order.orderId': orderId }],
        returnDocument: 'after',
      }
    );
    return result.value;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred updating the order status.');
  }
}

export async function cancelOrder(
  db: Db,
  storeId: string,
  orderId: string,
  order: Order,
  userId: string
) {
  const updatedItems = order.items.map(i => ({
    ...i,
    ...(i.status.current !== 'Canceled' &&
      i.status.current !== 'Shipped' && {
        status: {
          current: 'Canceled' as const,
          meta: {
            ...i.status.meta,
            Canceled: { user: userId, updatedAt: new Date().toISOString() },
          },
        },
      }),
    // todo: these were set to 0 but I think it would be good to keep the original values, can we do this?
    // quantity: 0,
    // itemTotal: 0,
  }));
  const updatedOrder: Order = {
    ...order,
    orderStatus: 'Canceled',
    items: updatedItems,
    summary: {
      ...order.summary,
      // todo: handle this based on refund status?
      subtotal: 0,
      salesTax: 0,
      shipping: 0,
      total: 0,
    },
    // todo: should we handle this differently?
    refund: {
      status: 'Full',
      amount: order.summary.total,
    },
  };

  const result = await db
    .collection('stores')
    .findOneAndUpdate(
      { _id: new ObjectID(storeId) },
      { $set: { 'orders.$[order]': updatedOrder } },
      { arrayFilters: [{ 'order.orderId': orderId }], returnDocument: 'after' }
    );

  return result.value;
}

interface OrderItemStatusInput {
  storeId: string;
  orderId: string;
  orderItemId: string;
  order: Order;
  orderItems: OrderItem[];
  userId: string;
  statusToSet?: OrderItemStatus;
}

interface StoreWithId extends Omit<Store, '_id'> {
  _id: ObjectId;
}

export async function updateOrderItemStatus(
  db: Db,
  input: OrderItemStatusInput
) {
  const {
    storeId,
    orderId,
    orderItemId,
    order,
    orderItems,
    userId,
    statusToSet,
  } = input;

  const orderItem = orderItems.find(item => item.id === orderItemId);

  if (orderItem) {
    const nextStatus = statusToSet
      ? statusToSet
      : getNextOrderItemStatus(orderItem.status.current);

    const previousMeta = orderItem.status.meta;

    const updatedStatus = {
      current: nextStatus,
      meta: {
        ...previousMeta,
        [nextStatus]: { user: userId, updatedAt: new Date().toISOString() },
      },
    };

    const updatedOrderItems = orderItems.map(item => {
      if (item.id === orderItemId) {
        return { ...item, status: updatedStatus };
      }
      return item;
    });
    const updatedOrder = handleUpdateOrderStatus(order, updatedOrderItems);
    const updatedOrderStatus = updatedOrder.orderStatus;

    const result = await db.collection<StoreWithId>('stores').findOneAndUpdate(
      { _id: new ObjectID(storeId) },
      {
        $set: {
          'orders.$[order].items.$[item].status': updatedStatus,
          'orders.$[order].orderStatus': updatedOrderStatus,
        },
      },
      {
        arrayFilters: [
          { 'order.orderId': orderId },
          { 'item.id': orderItemId },
        ],
        returnDocument: 'after',
      }
    );

    return result.value;
  }
}

export async function addReceiptPrintedToAllUnfulfilledOrders(
  db: Db,
  storeId: string
) {
  const store = await db
    .collection<StoreWithId>('stores')
    .findOne({ _id: new ObjectID(storeId) });

  if (store) {
    const updatedOrders = store.orders.map(order => {
      if (order.orderStatus === 'Unfulfilled') {
        return {
          ...order,
          meta: {
            ...order.meta,
            receiptPrinted: true,
          },
        };
      } else {
        return order;
      }
    });

    const result = await db
      .collection<StoreWithId>('stores')
      .findOneAndUpdate(
        { _id: new ObjectID(storeId) },
        { $set: { orders: updatedOrders } },
        { returnDocument: 'after' }
      );

    return result.value;
  }
}
