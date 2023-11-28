import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { CreateEmployeeInput, Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { employee } from '../../../db';
import { removeNonDigits } from '../../../utils';

interface ExtendedRequest extends Request {
  body: CreateEmployeeInput;
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      res.json({ error: 'Missing required fields' });
      return;
    }

    const input = {
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: removeNonDigits(req.body.phone),
      meta: {
        isAdmin: false,
      },
    };

    const existingEmployee = await employee.findEmployee(req.db, {
      $or: [{ email: input.email }, { phone: input.phone }],
    });

    if (existingEmployee) {
      const sameEmail = existingEmployee.email === input.email;
      const samePhone = existingEmployee.phone === input.phone;
      const sameEmailAndPhone = sameEmail && samePhone;
      const errorMessage = sameEmailAndPhone
        ? 'email and phone'
        : sameEmail
        ? 'email'
        : 'phone';

      res.json({
        error: `An employee with that ${errorMessage} already exists`,
      });
      return;
    }

    const createResult = await employee.createEmployee(req.db, input);
    res.json(createResult);
  });

export default withAuth(handler);
