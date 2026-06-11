// frontend/src/hooks/useAdminStats.ts
import { useQuery } from '@tanstack/react-query';
import { api, unwrapApiData } from '../lib/api';
import type { AdminStatsResponse } from '../types/admin';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return unwrapApiData<AdminStatsResponse>(response.data);
    },
    staleTime: 60_000,
  });
}
