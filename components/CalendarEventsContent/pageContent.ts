import { CalendarEventWithId } from '../../interfaces';

export async function fetchCalendarEvents() {
  const response = await fetch('/api/calendar-events/get-calendar-events');

  const data: { calendarEvents: CalendarEventWithId[] } = await response.json();

  return data.calendarEvents;
}
