// frontend/src/hooks/useMarketplaceConfig.ts
import { useQuery } from '@tanstack/react-query';
import { api, unwrapApiData } from '../lib/api';
import type { MarketplaceConfigResponse } from '../types/admin';

export function useMarketplaceConfig() {
  return useQuery({
    queryKey: ['admin', 'marketplace-config'],
    queryFn: async () => {
      const response = await api.get('/admin/config/marketplace');
      return unwrapApiData<MarketplaceConfigResponse>(response.data);
    },
    staleTime: 60_000,
  });
}
