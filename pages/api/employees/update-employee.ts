import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { EmployeeWithId, Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { employee } from '../../../db';
import { removeNonDigits } from '../../../utils';

interface ExtendedRequest extends Request {
  body: EmployeeWithId;
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const {
      _id,
      firstName,
      lastName,
      email,
      phone,
      meta,
      createdAt,
      updatedAt,
    } = req.body;

    if (
      !_id ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !createdAt ||
      !updatedAt
    ) {
      res.json({ error: 'Missing required fields' });
      return;
    }

    const update = {
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: removeNonDigits(req.body.phone),
      meta,
      createdAt,
      updatedAt,
    };

    const updateResult = await employee.updateEmployee(req.db, _id, update);
    res.json(updateResult);
  });

export default withAuth(handler);
