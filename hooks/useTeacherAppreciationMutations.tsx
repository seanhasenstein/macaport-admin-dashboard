import { useMutation, useQueryClient } from 'react-query';
import { TeacherAppreciation } from '../interfaces';

type Props = {
  storeId: string | undefined;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
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

export function useTeacherAppreciationMutations({ storeId }: Props) {
  const queryClient = useQueryClient();
  const cacheKey = ['teacherAppreciation', storeId];

  const setCache = (data: TeacherAppreciation) => {
    queryClient.setQueryData(cacheKey, data);
  };

  const addEligibleEmails = useMutation(
    async (emails: string[]) => {
      const data = await postJson<{ teacherAppreciation: TeacherAppreciation }>(
        `/api/stores/${storeId}/teacher-appreciation/add-eligible`,
        { emails }
      );
      return data.teacherAppreciation;
    },
    {
      onSuccess: setCache,
      onSettled: () => queryClient.invalidateQueries(cacheKey),
    }
  );

  const removeEligibleEmail = useMutation(
    async (email: string) => {
      const data = await postJson<{ teacherAppreciation: TeacherAppreciation }>(
        `/api/stores/${storeId}/teacher-appreciation/remove-eligible`,
        { email }
      );
      return data.teacherAppreciation;
    },
    {
      onSuccess: setCache,
      onSettled: () => queryClient.invalidateQueries(cacheKey),
    }
  );

  const resetUsedEmail = useMutation(
    async (email: string) => {
      const data = await postJson<{ teacherAppreciation: TeacherAppreciation }>(
        `/api/stores/${storeId}/teacher-appreciation/reset-used`,
        { email }
      );
      return data.teacherAppreciation;
    },
    {
      onSuccess: setCache,
      onSettled: () => queryClient.invalidateQueries(cacheKey),
    }
  );

  const setActive = useMutation(
    async (active: boolean) => {
      const data = await postJson<{ teacherAppreciation: TeacherAppreciation }>(
        `/api/stores/${storeId}/teacher-appreciation/set-active`,
        { active }
      );
      return data.teacherAppreciation;
    },
    {
      onMutate: async (active: boolean) => {
        await queryClient.cancelQueries(cacheKey);
        const previous =
          queryClient.getQueryData<TeacherAppreciation>(cacheKey);
        if (previous) {
          queryClient.setQueryData(cacheKey, { ...previous, active });
        }
        return { previous };
      },
      onError: (_err, _vars, context) => {
        if (context?.previous) {
          queryClient.setQueryData(cacheKey, context.previous);
        }
      },
      onSuccess: setCache,
      onSettled: () => queryClient.invalidateQueries(cacheKey),
    }
  );

  return {
    addEligibleEmails,
    removeEligibleEmail,
    resetUsedEmail,
    setActive,
  };
}
