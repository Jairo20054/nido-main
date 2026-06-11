// frontend/src/components/ui/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <span className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}
