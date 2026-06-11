// frontend/src/hooks/useAdminLandlords.ts
import { useQuery } from '@tanstack/react-query';
import { api, unwrapApiData } from '../lib/api';
import type { AdminLandlord } from '../types/admin';

interface AdminLandlordsParams {
  limit?: number;
  sort?: string;
}

interface RawLandlord {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  propertyCount?: number;
  propertiesCount?: number;
  status?: 'active' | 'inactive' | 'neutral';
}

export function useAdminLandlords(params: AdminLandlordsParams = {}) {
  const queryParams = {
    limit: params.limit ?? 5,
    sort: params.sort ?? 'propertiesCount:desc',
  };

  return useQuery({
    queryKey: ['admin', 'landlords', queryParams],
    queryFn: async () => {
      const response = await api.get('/admin/landlords', { params: queryParams });
      const rows = unwrapApiData<RawLandlord[]>(response.data);

      return {
        items: rows.map((row) => ({
          id: row.id,
          name: row.fullName || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Arrendador Nido',
          fullName: row.fullName,
          email: row.email || '',
          propertiesCount: row.propertiesCount ?? row.propertyCount ?? 0,
          propertyCount: row.propertyCount,
          status: row.status || 'active',
        })) as AdminLandlord[],
      };
    },
    staleTime: 60_000,
  });
}
