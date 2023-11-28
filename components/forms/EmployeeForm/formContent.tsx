import * as Yup from 'yup';

import {
  CreateEmployeeInput,
  Employee,
  EmployeeWithId,
} from '../../../interfaces';

export type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export const existingEmailMessage =
  'An employee with this email already exists';

export const existingPhoneMessage =
  'An employee with this phone number already exists';

export const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string().required('Phone is required'),
});

export async function fetchExistingEmployee(
  query: { email: string } | { phone: string }
) {
  const urlParam =
    'email' in query ? `email=${query.email}` : `phone=${query.phone}`;
  console.log('urlParam', urlParam);
  const response = await fetch(`/api/employees/get-employee?${urlParam}`);

  const data: { employee: Employee | null } = await response.json();

  return data.employee;
}

export async function createEmployee(employee: CreateEmployeeInput) {
  const response = await fetch('/api/employees/create-employee', {
    method: 'POST',
    body: JSON.stringify(employee),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create the employee.');
  }

  const data: EmployeeWithId | { error: string } = await response.json();

  if ('error' in data) {
    throw new Error(data.error);
  }

  return data;
}

export async function updateEmployee(employee: EmployeeWithId) {
  const response = await fetch('/api/employees/update-employee', {
    method: 'POST',
    body: JSON.stringify(employee),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to update the employee.');
  }

  const data: EmployeeWithId | { error: string } = await response.json();

  if ('error' in data) {
    throw new Error(data.error);
  }

  return data;
}

export async function deleteEmployee(_id: string) {
  const response = await fetch(`/api/employees/delete-employee?_id=${_id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete the employee.');
  }

  const data: { success: true; employee: Employee } = await response.json();
  return data;
}
