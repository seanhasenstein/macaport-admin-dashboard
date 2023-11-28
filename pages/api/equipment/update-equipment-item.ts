import { NextApiResponse } from 'next';
import nc from 'next-connect';
import { formatISO } from 'date-fns';
import { withAuth } from '../../../utils/withAuth';
import { EquipmentWithId, Request } from '../../../interfaces';
import database from '../../../middleware/db';
import { equipment } from '../../../db';

interface ExtendedRequest extends Request {
  body: EquipmentWithId;
}

const handler = nc<ExtendedRequest, NextApiResponse>()
  .use(database)
  .post(async (req, res) => {
    const { _id, id, name, type, description, instructions } = req.body;

    if (!_id || !id || !name || !type) {
      res.json({ error: 'Missing required fields' });
      return;
    }

    const currentItem = await equipment.findEquipmentById(req.db, _id);

    // if the id is being changed, check if the new id is already taken
    if (currentItem?.id !== id) {
      const existingItem = await equipment.findEquipment(req.db, {
        id: id.trim(),
      });

      if (existingItem) {
        res.json({
          error: `The ID ${id} is already taken by another item.`,
        });
        return;
      }
    }

    const update = {
      ...currentItem,
      id: id.trim(),
      name: name.trim(),
      type,
      description: description?.trim(),
      instructions: instructions?.trim(),
      createdAt: currentItem?.createdAt ?? formatISO(new Date()),
      updatedAt: currentItem?.updatedAt ?? formatISO(new Date()),
    };

    const updateResult = await equipment.updateEquipment(req.db, _id, update);
    res.json(updateResult);
  });

export default withAuth(handler);
