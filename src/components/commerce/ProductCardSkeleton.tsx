/** Loading placeholder matching ProductCard's silhouette. */
import { View } from 'react-native';

import { Skeleton } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';

export function ProductCardSkeleton({ width }: { width: number }) {
  const imageHeight = width / Layout.productCardImageRatio;
  return (
    <View style={{ width, gap: Spacing.md }} accessibilityLabel="Loading" accessible>
      <Skeleton width="100%" height={imageHeight} radius={Radius.sm} />
      <View style={{ gap: Spacing.sm }}>
        <Skeleton width="35%" height={8} />
        <Skeleton width="80%" height={13} />
        <Skeleton width="40%" height={13} />
      </View>
    </View>
  );
}
