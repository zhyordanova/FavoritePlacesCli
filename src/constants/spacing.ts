/**
 * Layout Spacing Tokens
 * Centralized spacing values used throughout the app for consistent margins, paddings, and gaps.
 */

export const Spacing = {
  xs: 4, // Extra small (compact spacing)
  sm: 6, // Small (button icons, tight spacing)
  md: 8, // Medium (form inputs, moderate spacing)
  lg: 12, // Large (section spacing, gaps between components)
  xl: 20, // Extra large (section padding)
  xxl: 24, // 2XL (screen padding, horizontal margins)
} as const;

// Convenience aliases for semantic use
export const LayoutSpacing = {
  screenPadding: Spacing.xxl, // 24 - horizontal padding for screens
  sectionGap: Spacing.lg, // 12 - gap between sections
  elementSpacing: Spacing.md, // 8 - spacing between form elements
  compactSpacing: Spacing.xs, // 4 - tight spacing
  buttonPadding: { vertical: 8, horizontal: 12 },
  formLabelSpacing: Spacing.md, // 8 - margin above form labels
  previewMargin: Spacing.lg, // 12 - margin around preview boxes
} as const;
