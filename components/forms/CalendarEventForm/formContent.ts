import * as Yup from 'yup';
import {
  CalendarEvent,
  CalendarEventWithId,
  CreateCalendarEventInput,
} from '../../../interfaces';

export const validationSchema = Yup.object({
  name: Yup.string().required('An event name is required'),
  type: Yup.string().required('Type is required'),
  dates: Yup.array()
    .of(
      Yup.object({
        startTime: Yup.string().required('Start time is required'),
        endTime: Yup.string().required('End time is required'),
      })
    )
    .min(1, 'At least one date is required'),
  primaryLocation: Yup.object({
    name: Yup.string().required('Primary location name is required'),
    address: Yup.object({
      street: Yup.string().required('Street is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string()
        .required('State is required')
        .test(
          'is-default',
          'A state is required',
          value => value !== 'default'
        ),
      zip: Yup.string().required('Zip is required'),
    }),
  }),
  secondaryLoacations: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Location name is required'),
      address: Yup.object({
        street: Yup.string().required('Street is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string()
          .required('State is required')
          .test(
            'is-default',
            'A state is required',
            value => value !== 'default'
          ),
        zip: Yup.string().required('Zip is required'),
      }),
    })
  ),
});

export async function createCalendarEvent(event: CreateCalendarEventInput) {
  const response = await fetch('/api/calendar-events/create-calendar-event', {
    method: 'POST',
    body: JSON.stringify(event),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create the calendar event.');
  }

  const data: CalendarEventWithId = await response.json();
  return data;
}

export async function updateCalendarEvent(event: CalendarEventWithId) {
  const response = await fetch('/api/calendar-events/update-calendar-event', {
    method: 'POST',
    body: JSON.stringify(event),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to update the calendar event.');
  }

  const data: CalendarEventWithId = await response.json();
  return data;
}

export async function deleteCalendarEvent(_id: string) {
  const response = await fetch(
    `/api/calendar-events/delete-calendar-event?_id=${_id}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete the calendar event.');
  }

  const data: { success: true; calendarEvent: CalendarEvent } =
    await response.json();
  return data;
}
