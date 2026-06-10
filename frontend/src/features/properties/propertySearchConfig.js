import {
  Bath,
  BedDouble,
  Building2,
  Car,
  Dumbbell,
  Home,
  Landmark,
  MapPin,
  PawPrint,
  ShieldCheck,
  Sofa,
  Trees,
  Warehouse,
} from 'lucide-react';

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartamento', icon: Building2 },
  { value: 'house', label: 'Casa', icon: Home },
  { value: 'studio', label: 'Apartaestudio', icon: Sofa },
  { value: 'room', label: 'Habitacion', icon: BedDouble },
  { value: 'loft', label: 'Loft', icon: Warehouse },
];

export const BUDGET_OPTIONS = [
  { value: 'all', label: 'Cualquier presupuesto', minRent: 0, maxRent: 1000000000 },
  { value: '800000-3000000', label: '$800.000 - $3.000.000+', minRent: 800000, maxRent: 3000000 },
  { value: '0-1500000', label: 'Hasta $1.500.000', minRent: 0, maxRent: 1500000 },
  { value: '1500000-2500000', label: '$1.500.000 - $2.500.000', minRent: 1500000, maxRent: 2500000 },
  { value: '2500000-4000000', label: '$2.500.000 - $4.000.000', minRent: 2500000, maxRent: 4000000 },
];

export const QUICK_FILTERS = [
  { key: 'apartment', label: 'Apartamento', type: 'propertyType', value: 'apartment' },
  { key: 'house', label: 'Casa', type: 'propertyType', value: 'house' },
  { key: 'furnished', label: 'Amoblados', type: 'extra', value: 'furnished' },
  { key: 'petsAllowed', label: 'Acepta mascotas', type: 'extra', value: 'petsAllowed' },
  { key: 'parking', label: 'Con parqueadero', type: 'extra', value: 'parking' },
  { key: 'gatedCommunity', label: 'En conjunto cerrado', type: 'extra', value: 'gatedCommunity' },
];

export const RADIUS_OPTIONS = [
  { value: 0.5, label: '500 m' },
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
];

export const BEDROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
];

export const BATHROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3+' },
];

export const AMENITY_OPTIONS = [
  { value: 'parking', label: 'Parqueadero', icon: Car },
  { value: 'elevator', label: 'Ascensor', icon: Landmark },
  { value: 'balcony', label: 'Balcon', icon: MapPin },
  { value: 'gym', label: 'Gimnasio', icon: Dumbbell },
  { value: 'furnished', label: 'Amoblado', icon: Sofa },
  { value: 'petsAllowed', label: 'Acepta mascotas', icon: PawPrint },
  { value: 'gatedCommunity', label: 'Conjunto cerrado', icon: Trees },
  { value: 'security', label: 'Vigilancia', icon: ShieldCheck },
];

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'rent-asc', label: 'Menor precio' },
  { value: 'rent-desc', label: 'Mayor precio' },
  { value: 'latest', label: 'Mas recientes' },
  { value: 'area-desc', label: 'Mayor area' },
];

export const EXTRA_LABELS = Object.fromEntries(
  AMENITY_OPTIONS.map((option) => [option.value, option.label])
);
