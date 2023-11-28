import React from 'react';

import Layout from '../components/Layout';
import EquipmentContent from '../components/EquipmentContent';

export default function Equipment() {
  return (
    <Layout requiresAuth={true} title="Equipment">
      <EquipmentContent />
    </Layout>
  );
}
