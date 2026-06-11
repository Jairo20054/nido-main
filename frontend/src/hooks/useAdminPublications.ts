// frontend/src/hooks/useAdminPublications.ts
import { useQuery } from '@tanstack/react-query';
import { api, unwrapApiData } from '../lib/api';
import type { AdminPublicationsResponse } from '../types/admin';

interface AdminPublicationsParams {
  limit?: number;
  sort?: string;
}

export function useAdminPublications(params: AdminPublicationsParams = {}) {
  const queryParams = {
    limit: params.limit ?? 5,
    sort: params.sort ?? 'createdAt:desc',
  };

  return useQuery({
    queryKey: ['admin', 'publications', queryParams],
    queryFn: async () => {
      const response = await api.get('/admin/publications', { params: queryParams });
      return unwrapApiData<AdminPublicationsResponse>(response.data);
    },
    staleTime: 60_000,
  });
}
