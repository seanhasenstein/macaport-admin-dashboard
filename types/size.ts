import { ObjectId } from 'mongodb';

export type SizeGroup = {
  _id: string;
  code: string; // unique
  name: string; // unique
  orderIndex: number; // unique?
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSizeGroup = Omit<
  SizeGroup,
  '_id' | 'createdAt' | 'updatedAt'
>;

export type UpdateSizeGroup = Partial<
  Omit<SizeGroup, 'createdAt' | 'updatedAt'>
>;

// ****************************************************

export type Size = {
  _id: string;
  code: string; // unique
  name: string; // unique
  sizeGroupId: ObjectId;
  orderIndex: number; // unique?
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSize = Omit<Size, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdateSize = Partial<Omit<Size, 'createdAt' | 'updatedAt'>>;
