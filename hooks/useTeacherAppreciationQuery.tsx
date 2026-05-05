import { useQuery } from 'react-query';
import { TeacherAppreciation } from '../interfaces';

export function useTeacherAppreciationQuery(
  storeId: string | undefined,
  enabled: boolean
) {
  return useQuery<TeacherAppreciation | null>(
    ['teacherAppreciation', storeId],
    async () => {
      const response = await fetch(
        `/api/stores/${storeId}/teacher-appreciation`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch teacher appreciation data.');
      }
      const data: { teacherAppreciation: TeacherAppreciation | null } =
        await response.json();
      return data.teacherAppreciation;
    },
    {
      enabled: Boolean(storeId) && enabled,
      staleTime: 1000 * 60,
    }
  );
}
