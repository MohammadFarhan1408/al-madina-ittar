/**
 * Responsive utilities for phone / large-phone / tablet / foldable layouts.
 * `useResponsive` is reactive to rotation and foldable posture changes via
 * `useWindowDimensions`.
 */
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { Breakpoint } from '@/constants';

export type DeviceClass = 'phone' | 'largePhone' | 'tablet' | 'largeTablet';

const classify = (width: number): DeviceClass => {
  if (width >= Breakpoint.largeTablet) return 'largeTablet';
  if (width >= Breakpoint.tablet) return 'tablet';
  if (width >= Breakpoint.largePhone) return 'largePhone';
  return 'phone';
};

export type Responsive = {
  width: number;
  height: number;
  deviceClass: DeviceClass;
  isTablet: boolean;
  isLandscape: boolean;
  /** Suggested column count for product grids. */
  gridColumns: number;
};

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const deviceClass = classify(width);
    const isTablet = deviceClass === 'tablet' || deviceClass === 'largeTablet';
    const gridColumns = deviceClass === 'largeTablet' ? 4 : isTablet ? 3 : 2;
    return {
      width,
      height,
      deviceClass,
      isTablet,
      isLandscape: width > height,
      gridColumns,
    };
  }, [width, height]);
}
