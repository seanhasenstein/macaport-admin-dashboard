import { NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { Request } from '../interfaces';
import { memberBenefit } from '../db';

// Routes here are addressed by store id; the benefit is whichever one the
// store points at, so a stale client cannot act on a benefit the store no
// longer offers.
export async function benefitForStore(req: Request, res: NextApiResponse) {
  const storeId = req.query.id;
  if (!storeId || !ObjectId.isValid(storeId)) {
    res.status(400).json({ error: 'A valid store id is required.' });
    return null;
  }
  const store = await req.db
    .collection('stores')
    .findOne({ _id: new ObjectId(storeId) }, { projection: { benefitId: 1 } });
  if (!store) {
    res.status(404).json({ error: 'No store with that id.' });
    return null;
  }
  if (!store.benefitId) {
    res.status(404).json({ error: 'This store has no member benefit.' });
    return null;
  }
  const benefit = await memberBenefit.getById(req.db, store.benefitId);
  if (!benefit) {
    res.status(404).json({ error: 'The member benefit no longer exists.' });
    return null;
  }
  return benefit;
}

import {
  BenefitAccess,
  BenefitFunding,
  BenefitType,
  MemberBenefitCopy,
} from '../core/memberBenefits/types';
import {
  amountErrorMessage,
  fundingAllowed,
  MACAPORT_CREDIT_ERROR,
  INSTRUCTIONS_MAX,
  LABEL_MAX,
  NAME_MAX,
  parseBenefitAmount,
} from './memberBenefit';

const TYPES: BenefitType[] = ['credit', 'discount', 'freeItem'];

export function isBenefitType(value: unknown): value is BenefitType {
  return typeof value === 'string' && TYPES.includes(value as BenefitType);
}

export function readAccess(value: unknown): BenefitAccess {
  return value === 'members' ? 'members' : 'public';
}

export function readFunding(value: unknown): BenefitFunding {
  return value === 'macaport' ? 'macaport' : 'client';
}

// null when the pair is fine, otherwise the message to send back.
export function fundingError(type: BenefitType, funding: BenefitFunding) {
  return fundingAllowed(type, funding) ? null : MACAPORT_CREDIT_ERROR;
}

export function readCopy(body: any): MemberBenefitCopy | string {
  const benefitName = String(body?.benefitName ?? '').trim();
  const memberLabel = String(body?.memberLabel ?? '').trim();
  if (!benefitName) return 'A benefit name is required.';
  if (benefitName.length > NAME_MAX)
    return `Benefit name must be ${NAME_MAX} characters or fewer.`;
  if (!memberLabel) return 'A member label is required.';
  if (memberLabel.length > LABEL_MAX)
    return `Member label must be ${LABEL_MAX} characters or fewer.`;
  const copy: MemberBenefitCopy = { benefitName, memberLabel };
  const instructions = String(body?.instructions ?? '').trim();
  if (instructions.length > INSTRUCTIONS_MAX) {
    return `Instructions must be ${INSTRUCTIONS_MAX} characters or fewer.`;
  }
  const logo = String(body?.logo ?? '').trim();
  if (instructions) copy.instructions = instructions;
  if (logo) copy.logo = logo;
  return copy;
}

export function readAmount(type: BenefitType, value: unknown): number | string {
  const amount = parseBenefitAmount(type, value as string | number);
  if (amount === null) return amountErrorMessage(type);
  return amount;
}

export function readProductIds(
  type: BenefitType,
  value: unknown
): string[] | null {
  if (type !== 'freeItem') return null;
  if (!Array.isArray(value)) return null;
  const ids = value.filter((v): v is string => typeof v === 'string' && !!v);
  return ids.length > 0 ? ids : null;
}
