import { EquipmentWithId } from '../../interfaces';

export async function fetchAllEquipment() {
  const response = await fetch('/api/equipment/get-equipment-items');

  const data: { equipment: EquipmentWithId[] } = await response.json();

  return data.equipment;
}
