import React from 'react';
import { PropertyMap } from './PropertyMap';
import type { NearbyProperty } from '../../types/geo';

type NearbyPropertiesMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  properties?: NearbyProperty[];
};

export function NearbyPropertiesMap({ latitude, longitude, address, properties = [] }: NearbyPropertiesMapProps) {
  return (
    <PropertyMap
      latitude={latitude}
      longitude={longitude}
      address={address}
      nearbyProperties={properties}
      showNearby
      heightClassName="nido-map--detail"
    />
  );
}
