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
  sectionGap: 48,
  maxContentWidth: 1000,
  tabBarHeight: 60,
  /** Bottom padding tab screens add so content clears the floating glass tab bar. */
  tabBarClearance: 112,
  headerHeight: 56,
  heroHeight: 460,
  /** Width ÷ height of product imagery (4:5 portrait, editorial). */
  productCardImageRatio: 0.8,
  categoryCardSize: 88,
  bottomSheetHandleWidth: 44,
} as const;

export type BreakpointToken = keyof typeof Breakpoint;
