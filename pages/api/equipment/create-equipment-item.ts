import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { withAuth } from '../../../utils/withAuth';
import { CreateEquipmentInput, Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { equipment } from '../../../db';

interface ExtendedRequest extends Request {
  body: CreateEquipmentInput;
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const { id, name, type, description, instructions } = req.body;

    if (!id || !name || !type) {
      res.json({ error: 'Missing required fields' });
      return;
    }

    const existingItem = await equipment.findEquipment(req.db, {
      id: id.trim(),
    });

    if (existingItem) {
      res.json({
        error: `An equipment item with the ID ${id} already exists.`,
      });
      return;
    }

    const input = {
      id: id.trim(),
      name: name.trim(),
      type,
      description: description?.trim(),
      instructions: instructions?.trim(),
    };

    const existingEquipment = await equipment.findEquipment(req.db, {
      $or: [{ id: input.id }, { name: input.name }],
    });

    if (existingEquipment) {
      const sameId = existingEquipment.id === input.id;
      const sameName = existingEquipment.name === input.name;
      const sameIdAndName = sameId && sameName;
      const errorMessage = sameIdAndName
        ? 'id and name'
        : sameId
        ? 'id'
        : 'name';

      res.json({
        error: `Equipment with that ${errorMessage} already exists`,
      });
      return;
    }

    const createResult = await equipment.createEquipment(req.db, input);
    res.json(createResult);
  });

export default withAuth(handler);
