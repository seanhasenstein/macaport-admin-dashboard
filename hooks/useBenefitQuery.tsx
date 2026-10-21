import { useQuery } from 'react-query';
import { MemberBenefit } from '../core/memberBenefits/types';

export function benefitQueryKey(storeId: string | undefined) {
  return ['benefit', storeId];
}

export function useBenefitQuery(storeId: string | undefined, enabled = true) {
  return useQuery<MemberBenefit | null>(
    benefitQueryKey(storeId),
    async () => {
      const response = await fetch(`/api/stores/${storeId}/benefit`);
      if (!response.ok) {
        throw new Error('Failed to fetch the member benefit.');
      }
      const data: { benefit: MemberBenefit | null } = await response.json();
      return data.benefit;
    },
    {
      enabled: Boolean(storeId) && enabled,
      staleTime: 1000 * 60,
    }
  );
}
