import { Order } from '../interfaces';

export const fakeOrders: Order[] = [
  {
    _id: '1',
    orderId: 'order-1',
    storeId: 'New London HS XC',
    items: [
      {
        productId: 'prod_1',
        name: 'Cotton T-Shirt',
        color: 'White',
        size: 's',
        price: 2000,
        quantity: 2,
        itemTotal: 4000,
      },
      {
        productId: 'prod_2',
        name: 'Dri-Fit Hooded Sweatshirt',
        color: 'Navy',
        size: 'l',
        price: 3500,
        quantity: 1,
        itemTotal: 3500,
      },
    ],
    customer: {
      firstName: 'Sean',
      lastName: 'Hasenstein',
      email: 'fake@email.com',
      phone: '1234567890',
    },
    orderStatus: 'Unfulfilled',
    shippingMethod: 'Direct',
    shippingAddress: {
      street: '1234 Test St',
      street2: '',
      city: 'Test',
      state: 'WI',
      zipcode: '12345',
    },
    summary: {
      subtotal: 7500,
      shipping: 400,
      transactionFee: 276,
      total: 8176,
    },
    transactionId: 'tr-1',
    createdAt: 'Tue Jul 06 2021 14:47:02 GMT-0500 (Central Daylight Time)',
    updatedAt: 'Tue Jul 06 2021 14:47:02 GMT-0500 (Central Daylight Time)',
  },
  {
    _id: '2',
    orderId: 'order-2',
    storeId: 'Hortonville HS XC',
    items: [
      {
        productId: 'prod_3',
        name: 'Dri-Fit T-Shirt',
        color: 'Black',
        size: 's',
        price: 2400,
        quantity: 1,
        itemTotal: 2400,
      },
    ],
    customer: {
      firstName: 'Joe',
      lastName: 'Anderson',
      email: 'fake@email.com',
      phone: '1234567890',
    },
    orderStatus: 'Fulfilled',
    shippingMethod: 'Primary',
    shippingAddress: {
      street: '',
      street2: '',
      city: '',
      state: '',
      zipcode: '',
    },
    summary: {
      subtotal: 2400,
      shipping: 0,
      transactionFee: 69,
      total: 2469,
    },
    transactionId: 'tr-2',
    createdAt: 'Tue Jul 06 2021 14:47:02 GMT-0500 (Central Daylight Time)',
    updatedAt: 'Tue Jul 06 2021 14:47:02 GMT-0500 (Central Daylight Time)',
  },
  {
    _id: '3',
    orderId: 'order-3',
    storeId: '8th Street Ale House',
    items: [
      {
        productId: 'prod_3',
        name: 'Dri-Fit T-Shirt',
        color: 'Black',
        size: 's',
        price: 2400,
        quantity: 1,
        itemTotal: 2400,
      },
      {
        productId: 'prod_2',
        name: 'Dri-Fit Long Sleeve T-Shirt',
        color: 'Gray',
        size: 'm',
        price: 2800,
        quantity: 1,
        itemTotal: 2800,
      },
    ],
    customer: {
      firstName: 'Tom',
      lastName: 'Smith',
      email: 'fake@email.com',
      phone: '1234567890',
    },
    orderStatus: 'Completed',
    shippingMethod: 'None',
    shippingAddress: {
      street: '',
      street2: '',
      city: '',
      state: '',
      zipcode: '',
    },
    summary: {
      subtotal: 5200,
      shipping: 0,
      transactionFee: 152,
      total: 5352,
    },
    transactionId: 'tr-3',
    createdAt: 'Tue Jul 06 2021 14:47:02 GMT-0500 (Central Daylight Time)',
    updatedAt: 'Tue Jul 06 2021 14:47:02 GMT-0500 (Central Daylight Time)',
  },
];