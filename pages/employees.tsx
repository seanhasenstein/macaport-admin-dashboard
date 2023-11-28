import React from 'react';

import Layout from '../components/Layout';
import EmployeesContent from '../components/EmployeesContent';

export default function Employees() {
  return (
    <Layout requiresAuth={true} title="Employees">
      <EmployeesContent />
    </Layout>
  );
}
