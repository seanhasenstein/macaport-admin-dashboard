import { Db } from 'mongodb';
import { TeacherAppreciation } from '../interfaces';

export async function getByStoreId(db: Db, storeId: string) {
  const result = await db
    .collection<TeacherAppreciation>('teacherAppreciation')
    .findOne({ storeId });
  return result;
}

export async function addEligibleEmails(
  db: Db,
  storeId: string,
  emails: string[]
) {
  const result = await db
    .collection<TeacherAppreciation>('teacherAppreciation')
    .findOneAndUpdate(
      { storeId },
      { $addToSet: { eligibleEmails: { $each: emails } } },
      { returnDocument: 'after' }
    );
  if (!result.value) {
    throw new Error('No teacherAppreciation document found for this store.');
  }
  return result.value;
}

export async function removeEligibleEmail(
  db: Db,
  storeId: string,
  email: string
) {
  const result = await db
    .collection<TeacherAppreciation>('teacherAppreciation')
    .findOneAndUpdate(
      { storeId },
      { $pull: { eligibleEmails: email } },
      { returnDocument: 'after' }
    );
  if (!result.value) {
    throw new Error('No teacherAppreciation document found for this store.');
  }
  return result.value;
}

export async function resetUsedEmail(
  db: Db,
  storeId: string,
  email: string
) {
  const result = await db
    .collection<TeacherAppreciation>('teacherAppreciation')
    .findOneAndUpdate(
      { storeId },
      {
        $pull: { usedEmails: email },
        $addToSet: { eligibleEmails: email },
      },
      { returnDocument: 'after' }
    );
  if (!result.value) {
    throw new Error('No teacherAppreciation document found for this store.');
  }
  return result.value;
}

export async function setActive(db: Db, storeId: string, active: boolean) {
  const result = await db
    .collection<TeacherAppreciation>('teacherAppreciation')
    .findOneAndUpdate(
      { storeId },
      { $set: { active } },
      { returnDocument: 'after' }
    );
  if (!result.value) {
    throw new Error('No teacherAppreciation document found for this store.');
  }
  return result.value;
}
