import React from 'react';

export interface ShimmerSkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  width = '100%',
  height = '16px',
  radius = 'var(--radius-sm)',
  className = ''
}) => {
  return (
    <div
      className={`shimmer-sweep overflow-hidden flex-shrink-0 ${className}`}
      style={{
        width,
        height,
        borderRadius: radius
      }}
    />
  );
};
export default ShimmerSkeleton;

