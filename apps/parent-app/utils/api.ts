// utils/api.ts
// ─────────────────────────────────────────────────────────────────
// Type definitions for Storks backend API responses and payloads.
// All actual HTTP calls are made through useApiClient() from
// middleware/apiClient.ts which handles auth token injection,
// logging and error normalisation automatically.
// ─────────────────────────────────────────────────────────────────

// GET /api/auth/status
export interface AuthStatus {
  isBanned: boolean;
  isOnboarded: boolean;
  userId: string;
  role: string;
}

// POST /api/users/init
export interface UserInitPayload {
  email: string;
  roleType: "PARENT" | "STORK" | "ADMIN";
}

// POST /api/onboarding/complete
export interface SecondaryPhone {
  countryCode: string;
  number: string;
}

export interface OnboardingPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;           // DD-MM-YYYY
  primaryCountryCode: string;
  primaryNumber: string;
  secondaryNumbers: SecondaryPhone[];
  profilePictureUrl: string | null;
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
}