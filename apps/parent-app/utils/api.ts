// utils/api.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:8080";

// ------------------------------------------------------------------
// POST /api/users/init
// Called once after signup + TOS. Creates DB record linked to Clerk ID.
// ------------------------------------------------------------------
export async function initUser(token: string, email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/users/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, roleType: "PARENT" }),
  });
  if (!res.ok) throw new Error(`initUser failed: ${res.status}`);
}

// ------------------------------------------------------------------
// GET /api/auth/status
// Called on every login. Returns isBanned + isOnboarded.
// ------------------------------------------------------------------
export interface AuthStatus {
  isBanned: boolean;
  isOnboarded: boolean;
  userId: string;
  role: string;
}

export async function getAuthStatus(token: string): Promise<AuthStatus> {
  const res = await fetch(`${BASE_URL}/api/auth/status`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`getAuthStatus failed: ${res.status}`);
  return res.json();
}

// ------------------------------------------------------------------
// POST /api/onboarding/complete
// Saves profile data and marks user as onboarded in the DB.
// ------------------------------------------------------------------
export interface SecondaryPhone {
  countryCode: string;
  number: string;
}

export interface OnboardingPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;        // DD-MM-YYYY
  primaryCountryCode: string;
  primaryNumber: string;
  secondaryNumbers: SecondaryPhone[];
  profilePictureUrl: string | null;
}

export async function completeOnboarding(
  token: string,
  payload: OnboardingPayload
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/onboarding/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`completeOnboarding failed: ${res.status}`);
}