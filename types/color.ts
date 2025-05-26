export interface Color {
  _id: string;
  code: string; // unique
  name: string; // unique
  orderIndex: number; // unique?
  hex: string; // unique
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateColor = Omit<Color, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdateColor = Partial<Omit<Color, 'createdAt' | 'updatedAt'>>;
