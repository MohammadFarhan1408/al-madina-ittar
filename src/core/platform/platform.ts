/** Centralized platform flags & helpers — avoid scattering `Platform.OS` checks. */
import { Platform } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';
export const isNative = isIOS || isAndroid;

/** Pick a value per platform with a required default. */
export function select<T>(opts: { ios?: T; android?: T; web?: T; default: T }): T {
  if (isIOS && opts.ios !== undefined) return opts.ios;
  if (isAndroid && opts.android !== undefined) return opts.android;
  if (isWeb && opts.web !== undefined) return opts.web;
  return opts.default;
}
