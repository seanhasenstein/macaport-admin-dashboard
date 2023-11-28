import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { CreateCalendarEventInput, Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { calendarEvent } from '../../../db';
import { createId } from '../../../utils';

interface ExtendedRequest extends Request {
  body: CreateCalendarEventInput;
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const {
      name,
      type,
      dates,
      primaryLocation,
      secondaryLocations,
      employees,
      equipment,
      instructions,
    } = req.body;
    const { name: primaryLocationName, address } = primaryLocation;
    const { street, street2, city, state, zip } = address;

    if (!name || !type || !dates || !primaryLocation) {
      res.json({ error: 'Missing required fields' });
      return;
    }

    const input = {
      name: name.trim(),
      type,
      dates,
      primaryLocation: {
        id: createId(),
        name: primaryLocationName.trim(),
        address: {
          street: street.trim(),
          street2: street2.trim(),
          city: city.trim(),
          state: state.trim(),
          zip: zip.trim(),
        },
      },
      secondaryLocations: secondaryLocations?.map(location => {
        const { name, address } = location;
        const { street, street2, city, state, zip } = address;
        const locationId = createId();
        return {
          id: locationId,
          name: name.trim(),
          address: {
            street: street.trim(),
            street2: street2.trim(),
            city: city.trim(),
            state: state.trim(),
            zip: zip.trim(),
          },
        };
      }),
      employees,
      equipment,
      instructions: instructions?.map(instruction => instruction.trim()),
    };

    const createResult = await calendarEvent.createCalendarEvent(req.db, input);

    res.json(createResult);
  });

export default withAuth(handler);
