import { useMutation, useQueryClient } from 'react-query';
import { MemberBenefit } from '../core/memberBenefits/types';
import { MemberInput } from '../utils/memberBenefit';
import { benefitQueryKey } from './useBenefitQuery';

type Props = {
  storeId: string | undefined;
};

export interface BenefitFormValues {
  type: 'credit' | 'discount' | 'freeItem';
  amount: string;
  benefitName: string;
  memberLabel: string;
  instructions: string;
  logo: string;
  access: 'public' | 'members';
  funding: 'client' | 'macaport';
  allProducts: boolean;
  productIds: string[];
  members: MemberInput[];
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Request failed.');
  }
  return response.json();
}

function toBody(values: BenefitFormValues) {
  return {
    type: values.type,
    amount: values.amount,
    benefitName: values.benefitName,
    memberLabel: values.memberLabel,
    instructions: values.instructions,
    logo: values.logo,
    access: values.access,
    funding: values.funding,
    productIds:
      values.type === 'freeItem' && !values.allProducts
        ? values.productIds
        : null,
    members: values.members,
  };
}

export function useBenefitMutations({ storeId }: Props) {
  const queryClient = useQueryClient();
  const cacheKey = benefitQueryKey(storeId);
  const base = `/api/stores/${storeId}/benefit`;

  const setCache = (data: { benefit: MemberBenefit }) => {
    queryClient.setQueryData(cacheKey, data.benefit);
  };
  const settled = () => queryClient.invalidateQueries(cacheKey);
  // The store pointer changed too.
  const settledWithStore = () => {
    queryClient.invalidateQueries(cacheKey);
    queryClient.invalidateQueries('stores');
  };

  const createBenefit = useMutation(
    (values: BenefitFormValues) =>
      postJson<{ benefit: MemberBenefit }>(`${base}/create`, toBody(values)),
    { onSuccess: setCache, onSettled: settledWithStore }
  );

  const updateBenefit = useMutation(
    (values: BenefitFormValues) =>
      postJson<{ benefit: MemberBenefit }>(`${base}/update`, toBody(values)),
    { onSuccess: setCache, onSettled: settled }
  );

  const setActive = useMutation(
    (active: boolean) =>
      postJson<{ benefit: MemberBenefit }>(`${base}/set-active`, { active }),
    { onSuccess: setCache, onSettled: settled }
  );

  const deleteBenefit = useMutation(
    () => postJson<{ success: boolean }>(`${base}/delete`, {}),
    {
      onSuccess: () => {
        queryClient.setQueryData(cacheKey, null);
      },
      onSettled: settledWithStore,
    }
  );

  const addMembers = useMutation(
    (members: MemberInput[]) =>
      postJson<{ benefit: MemberBenefit; added: number }>(
        `${base}/members/add`,
        { members }
      ),
    { onSuccess: setCache, onSettled: settled }
  );

  const removeMember = useMutation(
    (email: string) =>
      postJson<{ benefit: MemberBenefit }>(`${base}/members/remove`, { email }),
    { onSuccess: setCache, onSettled: settled }
  );

  const restoreUsed = useMutation(
    ({ email, amount }: { email: string; amount: number }) =>
      postJson<{ benefit: MemberBenefit }>(`${base}/members/restore`, {
        email,
        amount,
      }),
    { onSuccess: setCache, onSettled: settled }
  );

  const setAllowance = useMutation(
    ({ email, allowance }: { email: string; allowance: string | null }) =>
      postJson<{ benefit: MemberBenefit }>(`${base}/members/allowance`, {
        email,
        allowance,
      }),
    { onSuccess: setCache, onSettled: settled }
  );

  return {
    createBenefit,
    updateBenefit,
    setActive,
    deleteBenefit,
    addMembers,
    removeMember,
    restoreUsed,
    setAllowance,
  };
}
