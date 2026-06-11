// frontend/src/types/admin.ts
export interface AdminStatItem {
  value: number;
  delta: number | null;
}

export interface AdminStatsResponse {
  properties: AdminStatItem;
  users: AdminStatItem;
  requests: AdminStatItem;
  saved: AdminStatItem;
}

export type AdminPublicationStatus = 'publicada' | 'pendiente' | 'arrendada' | 'rechazada';

export interface AdminPublication {
  id: string;
  title: string;
  status: AdminPublicationStatus;
  createdAt: string;
}

export interface AdminPublicationsResponse {
  pipeline: Record<AdminPublicationStatus, number>;
  items: AdminPublication[];
}

export interface AdminLandlord {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  propertiesCount: number;
  propertyCount?: number;
  status: 'active' | 'inactive' | 'neutral';
}

export interface AdminLandlordsResponse {
  items: AdminLandlord[];
}

export interface MarketplaceConfigResponse {
  heading: string;
  description: string;
  ctaLabel: string;
}
