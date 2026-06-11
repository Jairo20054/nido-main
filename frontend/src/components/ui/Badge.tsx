// frontend/src/components/ui/Badge.tsx
import React from 'react';

type BadgeVariant = 'publicada' | 'pendiente' | 'arrendada' | 'rechazada' | 'active' | 'inactive' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={`nido-badge nido-badge--${variant}`}>{children}</span>;
}
