// Whether a given email gets a benefit, and how much of it is left.
//
// Pure. The same function answers the card ("you have $40 left"), the cart
// (what to hand the pricing pipeline) and submit-order (is this still true
// now that they are paying). It is the only place the per-type semantics
// live: a credit is a balance, a discount is one use, a free item is a count.

import { BenefitForPricing } from '../pricing/priceOrder';
import { MemberBenefit, MemberBenefitMember } from './types';

export type EligibilityReason =
  // Member with something left.
  | 'eligible'
  // The email is not on the list.
  | 'notMember'
  // The benefit is switched off in the dashboard.
  | 'paused'
  // On the list, but nothing left to use.
  | 'usedUp';

export interface MemberEligibility {
  reason: EligibilityReason;
  eligible: boolean;
  // Present whenever the email is on the list, whatever the reason.
  member?: Pick<MemberBenefitMember, 'email' | 'firstName' | 'lastName'>;
  // Same unit as the benefit's amount: cents, or garments for freeItem.
  allowance: number;
  used: number;
  remaining: number;
  // What the pricing pipeline should be given. null when nothing applies.
  forPricing: BenefitForPricing | null;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function findMember(benefit: MemberBenefit, email: string) {
  const wanted = normalizeEmail(email);
  return benefit.members.find(m => normalizeEmail(m.email) === wanted);
}

export function memberAllowance(
  benefit: MemberBenefit,
  member: MemberBenefitMember
) {
  return member.allowance ?? benefit.amount;
}

export function memberEligibility(
  benefit: MemberBenefit,
  email: string
): MemberEligibility {
  const member = findMember(benefit, email);
  const none = { allowance: 0, used: 0, remaining: 0, forPricing: null };

  if (!member) {
    return { reason: 'notMember', eligible: false, ...none };
  }

  const allowance = memberAllowance(benefit, member);
  const used = member.used ?? 0;
  const remaining = Math.max(0, allowance - used);
  const who = {
    email: normalizeEmail(member.email),
    firstName: member.firstName,
    lastName: member.lastName,
  };

  if (!benefit.active) {
    return {
      reason: 'paused',
      eligible: false,
      member: who,
      allowance,
      used,
      remaining,
      forPricing: null,
    };
  }

  if (remaining <= 0) {
    return {
      reason: 'usedUp',
      eligible: false,
      member: who,
      allowance,
      used,
      remaining: 0,
      forPricing: null,
    };
  }

  return {
    reason: 'eligible',
    eligible: true,
    member: who,
    allowance,
    used,
    remaining,
    forPricing: benefitForPricing(benefit, remaining),
  };
}

function benefitForPricing(
  benefit: MemberBenefit,
  remaining: number
): BenefitForPricing {
  const label = benefit.copy.benefitName;

  switch (benefit.type) {
    case 'credit':
      return { type: 'credit', label, remaining };
    case 'discount':
      // One use. The amount off is the whole allowance, not what is left of
      // it, because using it once consumes it entirely (see usageFor).
      return { type: 'discount', label, amount: remaining };
    case 'freeItem':
      return {
        type: 'freeItem',
        label,
        count: remaining,
        productIds: benefit.productIds ?? null,
      };
  }
}

// How much of the allowance an order draws down, given what the pipeline
// applied. Credit: the cents applied. Free item: the garments covered.
// Discount: the whole allowance, however much of it the cart could absorb,
// so a $25-off used on a $10 cart is still used.
export function usageFor(
  benefit: MemberBenefit,
  eligibility: MemberEligibility,
  applied: { creditApplied: number; freeUnits: number; discountApplied: number }
) {
  switch (benefit.type) {
    case 'credit':
      return applied.creditApplied;
    case 'freeItem':
      return applied.freeUnits;
    case 'discount':
      return applied.discountApplied > 0 ? eligibility.remaining : 0;
  }
}
