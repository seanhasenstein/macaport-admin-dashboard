// A member benefit: a list of people and something they get in one store.
//
// This is the contract between the storefront and the admin dashboard. The
// dashboard writes documents in this shape to the `memberBenefits` collection
// and points a store at one with `benefitId`; the storefront reads them,
// enforces the money, and records usage. Nothing in the storefront ever
// creates or edits a benefit.
//
// It replaces three hand-built programs that were the same idea copied three
// times: Teacher Appreciation (a free shirt), Sheboygan Lutheran Staff (a
// dollar credit) and Switch Fitness (a fixed discount). Each is one `type`
// here. What used to be "is this store a Switch Fitness store" is now "does
// this store have a benefit, and what kind".
//
// One benefit per store. If a store ever needs two, that is a change to the
// store's `benefitId` becoming a list and to the pricing pipeline's inputs,
// not to this document.

import { Cents } from '../pricing/priceOrder';

export type BenefitType = 'credit' | 'discount' | 'freeItem';

// public: anyone can shop, members get the benefit. members: nothing but the
// sign-in card renders until a member has verified.
export type BenefitAccess = 'public' | 'members';

// Who is paying for it. The storefront never reads this: the customer-side
// math is the same either way (tax on what is left after the benefit). It is
// here so the dashboard can invoice the client for what their members used.
export type BenefitFunding = 'client' | 'macaport';

export interface MemberBenefitCopy {
  // The customer-facing name, e.g. "Employee Apparel Credit". Titles the
  // card, labels the line on the cart and receipt, and names the button.
  benefitName: string;
  // Plural, e.g. "Employees" or "Staff". Every sentence that refers to the
  // people uses it, so the card never has to say "members".
  memberLabel: string;
  // Optional sentence or two on the card. Has a default built from the two
  // above.
  instructions?: string;
  // Optional image path or URL for the card.
  logo?: string;
}

export interface MemberBenefitMember {
  // Lowercased and trimmed on the way in. This is the identity: it is what
  // the client's list names, what the code is emailed to, and what usage is
  // recorded against.
  email: string;
  firstName?: string;
  lastName?: string;
  // Overrides the benefit's `amount` for this member. Same unit as `amount`.
  allowance?: number;
  // Cents for credit and discount, garments for freeItem. Only the storefront
  // writes this, and only through the reservation in reservation.ts.
  used: number;
  // Orders that drew on this member's allowance, newest last.
  orderIds: string[];
}

export interface MemberBenefit {
  _id: string;
  storeId: string;
  type: BenefitType;
  // credit: the balance each member starts with, in cents. discount: the
  // amount off, in cents, usable once. freeItem: garments per member.
  amount: number;
  // freeItem only. Store product ids that qualify; null means all of them.
  productIds: string[] | null;
  access: BenefitAccess;
  funding: BenefitFunding;
  copy: MemberBenefitCopy;
  // Off means the card says the benefit is paused and nothing is applied.
  // The store's own open and close dates gate the store; this gates only the
  // benefit.
  active: boolean;
  members: MemberBenefitMember[];
  createdAt: string;
  updatedAt: string;
}

// What the storefront records on an order that used a benefit. The amounts
// themselves live in summary.adjustments alongside every other adjustment;
// this is the link back to who used what.
export interface OrderBenefitUse {
  benefitId: string;
  type: BenefitType;
  email: string;
  // Cents for credit and discount, garments for freeItem: what this order
  // drew down.
  used: number;
  // What the member had left after this order, in the same unit.
  remainingAfter: number;
}

export type { Cents };
