/**
 * Avatar — circular user image with initials fallback.
 */
import { View } from 'react-native';
import { Image } from 'expo-image';

import { AvatarSize, type AvatarSizeToken } from '@/constants';
import { useTheme } from '@/core/theme';
import { Text } from './Text';

export type AvatarProps = {
  uri?: string;
  name?: string;
  size?: AvatarSizeToken;
};

const initials = (name?: string) =>
  name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
    : '';

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const { colors } = useTheme();
  const dimension = AvatarSize[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        backgroundColor: colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="subtitle" color="accent">
        {initials(name)}
      </Text>
    </View>
  );
}
