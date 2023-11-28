import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { ObjectId } from 'mongodb';
import { withAuth } from '../../../utils/withAuth';
import {
  CalendarEventWithId,
  EmployeeEvent,
  EquipmentEvent,
  Request,
} from '../../../interfaces';
import database from '../../../middleware/db';
import { calendarEvent } from '../../../db';

interface ExtendedRequest extends Request {
  body: CalendarEventWithId;
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const {
      _id,
      name,
      type,
      dates,
      primaryLocation,
      secondaryLocations,
      employees,
      equipment,
      instructions,
      createdAt,
      updatedAt,
    } = req.body;
    const { name: primaryLocationName, address } = primaryLocation;
    const { street, street2, city, state, zip } = address;

    if (!_id || !name || !type || !dates || !primaryLocation) {
      res.json({ error: 'Missing required fields' });
      return;
    }

    function formatEmployeesForDb(employees: EmployeeEvent[]) {
      return employees.map(employee => {
        const { _id, type, dates, locationId } = employee;
        return {
          _id: new ObjectId(_id),
          type,
          dates,
          locationId,
        };
      });
    }

    function formatEquipmentForDb(equipment: EquipmentEvent[]) {
      return equipment.map(item => {
        const { _id, dates, locationId } = item;
        return {
          _id: new ObjectId(_id),
          dates,
          locationId,
        };
      });
    }

    const update = {
      _id: new ObjectId(_id),
      name: name.trim(),
      type,
      dates,
      primaryLocation: {
        id: primaryLocation.id,
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
        const { id, name, address } = location;
        const { street, street2, city, state, zip } = address;
        return {
          id,
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
      employees: formatEmployeesForDb(employees),
      equipment: formatEquipmentForDb(equipment),
      instructions: instructions?.map(instruction => instruction.trim()),
      createdAt,
      updatedAt,
    };

    const updateResult = await calendarEvent.updateCalendarEvent(
      req.db,
      _id,
      update
    );

    let populatedResult;

    if (updateResult) {
      populatedResult = await calendarEvent.findCalendarEventById(
        req.db,
        updateResult._id.toString()
      );
    }

    res.json(populatedResult || null);
  });

export default withAuth(handler);
