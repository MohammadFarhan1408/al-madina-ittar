/**
 * Layout dimensions and screen breakpoints.
 */
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const ScreenDimensions = { width, height } as const;

/** Width breakpoints for responsive behaviour (phone / large phone / tablet). */
export const Breakpoint = {
  phone: 0,
  largePhone: 400,
  tablet: 600,
  largeTablet: 900,
} as const;

export const Layout = {
  screenPadding: 20,
  sectionGap: 32,
  maxContentWidth: 1000,
  tabBarHeight: 64,
  /** Bottom padding tab screens add so content clears the floating glass tab bar. */
  tabBarClearance: 112,
  headerHeight: 56,
  heroHeight: 460,
  productCardImageRatio: 0.82,
  categoryCardSize: 96,
  bottomSheetHandleWidth: 44,
} as const;

export type BreakpointToken = keyof typeof Breakpoint;
