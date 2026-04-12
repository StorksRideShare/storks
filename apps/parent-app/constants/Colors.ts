// Storks Brand Color System
// Single source of truth for all brand colors in the app.
// Import this instead of using raw hex values in screens.

export const StorkColors = {
  brand: "#E66B00", // The ONE canonical Storks orange — use everywhere
  brandLight: "#F4874A",
  surface: "#1A1919", // Elevated card surface
  bg: "#0F0E0E", // Primary screen background
  bgAlt: "#171412", // Auth/onboarding background (slightly warmer)
  border: "#333333", // Dividers and card borders
  borderBrand: "#E66B00", // Brand-coloured borders (inputs, focus)
  muted: "#7A726E", // Placeholder text, secondary labels
  white: "#FFFFFF",
  black: "#000000",
  success: "#4CAF50",
  error: "#FF6B6B",
  warning: "#F59E0B",
  info: "#60A5FA",
} as const;

export type StorkColor = (typeof StorkColors)[keyof typeof StorkColors];

// Legacy colour map — kept for compatibility with any code still using Colors.dark.*
// Prefer StorkColors directly in all new code.
const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: StorkColors.brand,
    icon: StorkColors.muted,
    tabIconDefault: StorkColors.muted,
    tabIconSelected: StorkColors.brand,
  },
  dark: {
    text: "#ECEDEE",
    background: StorkColors.bg,
    tint: StorkColors.brand,
    icon: StorkColors.muted,
    tabIconDefault: StorkColors.muted,
    tabIconSelected: StorkColors.brand,
  },
};

export default Colors;
