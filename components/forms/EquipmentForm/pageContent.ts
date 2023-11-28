import * as Yup from 'yup';

import {
  CreateEquipmentInput,
  Equipment,
  EquipmentWithId,
} from '../../../interfaces';

export const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  id: Yup.string().required('Id is required'),
  type: Yup.string()
    .required('A type is required')
    .test('is-default', 'A type is required', value => value !== 'default'),
});

export type FormValues = {
  id: string;
  name: string;
  type: string;
  description: string;
  instructions: string;
};

export async function createEquipmentMutation(equipment: CreateEquipmentInput) {
  const response = await fetch('/api/equipment/create-equipment-item', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(equipment),
  });

  if (!response.ok) {
    throw new Error('An error occurred while creating the equipment.');
  }

  // todo: add { error: string } for duplicate id/name

  const data: EquipmentWithId = await response.json();
  return data;
}

export async function updateEquipmentMutation(equipment: EquipmentWithId) {
  const response = await fetch('/api/equipment/update-equipment-item', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(equipment),
  });

  if (!response.ok) {
    throw new Error('An error occurred while updating the equipment.');
  }

  // todo: add { error: string } for duplicate id/name

  const data: EquipmentWithId = await response.json();
  return data;
}

export async function deleteEquipmentMutation(_id: string) {
  const response = await fetch(
    `/api/equipment/delete-equipment-item?_id=${_id}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete the equipment item.');
  }

  const data: { success: true; equipment: Equipment } = await response.json();
  return data;
}
