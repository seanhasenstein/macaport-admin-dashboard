import React from 'react';

import Layout from '../components/Layout';
import CalendarEventsContent from '../components/CalendarEventsContent';

export default function CalendarEvents() {
  return (
    <Layout requiresAuth={true} title="Events">
      <CalendarEventsContent />
    </Layout>
  );
}
