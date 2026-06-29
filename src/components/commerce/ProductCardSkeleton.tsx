/** Loading placeholder matching ProductCard's silhouette. */
import { View } from 'react-native';

import { Skeleton } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';

export function ProductCardSkeleton({ width }: { width: number }) {
  const imageHeight = width * (1 / Layout.productCardImageRatio);
  return (
    <View style={{ width, gap: Spacing.md }}>
      <Skeleton width="100%" height={imageHeight} radius={Radius.lg} />
      <Skeleton width="40%" height={10} />
      <Skeleton width="80%" height={14} />
      <Skeleton width="55%" height={12} />
      <Skeleton width="45%" height={16} />
    </View>
  );
}
