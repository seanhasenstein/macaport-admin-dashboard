import { EmployeeWithId } from '../../interfaces';

export async function fetchEmployees() {
  const response = await fetch('/api/employees/get-employees');

  const data: { employees: EmployeeWithId[] } = await response.json();

  return data.employees;
}
