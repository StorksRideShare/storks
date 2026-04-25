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

// ── Child profiles ────────────────────────────────────────────────────────────

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export interface WeeklySchedulePayload {
  dayOfWeek: DayOfWeek;
  customDropoffAddress?: string;
  customPickupAddress?: string;
}

export interface CreateChildPayload {
  firstName: string;
  lastName: string;
  preferredName?: string;
  pronouns?: string;
  dateOfBirth?: string;           // DD-MM-YYYY
  schoolName?: string;
  schoolAddress?: string;
  grade?: string;
  frontPictureUrl?: string;
  sidePictureUrl?: string;
  identificationDescription?: string;
  disabilities?: string[];
  medicalNotes?: string[];
  weeklySchedule?: WeeklySchedulePayload[];
}

export interface ChildProfile {
  childId: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth?: string;
  age?: number;
  schoolName?: string;
  frontPictureUrl?: string;
  qrHash?: string;
  disabilities?: string[];
  medicalNotes?: string[];
  weeklySchedule?: WeeklySchedulePayload[];
}