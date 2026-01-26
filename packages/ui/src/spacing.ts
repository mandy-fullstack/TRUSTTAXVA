/**
 * Design-system spacing scale (4px base).
 * Use these values for margin, padding, gap. Avoid arbitrary numbers.
 *
 * Scale:  0   1   2   3   4   5   6   8  10  12  16  20  24
 * px:    0   4   8  12  16  20  24  32  40  48  64  80  96
 */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/** Semantic aliases for common use. */
export const space = {
  none: spacing[0],
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[3],
  lg: spacing[4],
  xl: spacing[5],
  '2xl': spacing[6],
  '3xl': spacing[8],
  '4xl': spacing[10],
  '5xl': spacing[12],
  '6xl': spacing[16],
  '7xl': spacing[20],
} as const;

export type SpaceKey = keyof typeof space;
export type SpacingKey = keyof typeof spacing;
