import React from 'react';
import { useQuery, QueryFunction, UseQueryOptions } from 'react-query';

export default function useLazyQuery<T>(
  key: string[],
  fn: QueryFunction<T | null, string[]>,
  options: UseQueryOptions<T | null, unknown, T | null, string[]> | undefined
) {
  const [enabled, setEnabled] = React.useState(false);
  return [() => setEnabled(true), useQuery(key, fn, { ...options, enabled })];
}
