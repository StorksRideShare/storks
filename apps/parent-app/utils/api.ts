// utils/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Canonical type definitions for all Storks backend API surfaces.
// HTTP calls are made exclusively through useApiClient() from
// middleware/apiClient.ts — tokens are injected automatically.
// ─────────────────────────────────────────────────────────────────────────────

// ── Generic wrapper ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// ── Auth / User ───────────────────────────────────────────────────────────────

/** GET /auth/status */
export interface AuthStatus {
  isBanned: boolean;
  isOnboarded: boolean;
  userId: string;
  role: string;
}

/** POST /users/sync */
export interface UserInfo {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  onboarded: boolean;
}

export interface UserInitPayload {
  email: string;
  roleType: "PARENT" | "DRIVER" | "ADMIN";
}

export interface UserSearchResult {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export interface SecondaryPhone {
  countryCode: string;
  number: string;
}

export interface OnboardingPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // DD-MM-YYYY
  primaryCountryCode: string;
  primaryNumber: string;
  secondaryNumbers: SecondaryPhone[];
  profilePictureUrl: string | null;
  address: string;
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
}

// ── Bookings / Activity ───────────────────────────────────────────────────────

export type BookingStatus =
  | "Requested"
  | "Accepted"
  | "Confirmed"
  | "Cancelled"
  | "Completed";

export interface BookingResponse {
  id: string;
  groupId: string;
  groupName: string;
  driverName: string;
  vehicle: string;
  plate: string;
  title: string;
  description: string;
  status: BookingStatus;
  bookingType: "Monthly" | "Day";
  totalAmount: number;
  createdAt: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
}

// ── Schedule / Calendar ───────────────────────────────────────────────────────

export interface ScheduleEntry {
  id: string;
  childId: string;
  childName: string;
  date: string; // ISO date YYYY-MM-DD
  pickupTime: string; // HH:mm
  dropoffTime: string; // HH:mm
  pickupLocation: string;
  dropoffLocation: string;
  driverName: string;
  status: "scheduled" | "completed" | "absent" | "cancelled";
}

export interface AbsenceRequest {
  childId: string;
  date: string; // ISO date YYYY-MM-DD
  routeType: "pickup" | "dropoff" | "both";
  reason?: string;
}

export interface AbsenceResponse {
  id: string;
  childId: string;
  date: string;
  routeType: string;
  status: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatParticipant {
  userId: string;
  providerUserId: string;
  firstName: string;
  lastName: string;
  role: "PARENT" | "DRIVER" | "ADMIN";
}

export interface ChatRoom {
  roomId: string;
  chatRoomType: "DIRECT" | "GROUP";
  participants: ChatParticipant[];
  updatedAt: string;
  lastMessageContent?: string;
  lastMessageSentAt?: string;
}

export interface CreateChatRoomPayload {
  targetUserId: string;
}

// ── Dashboard / Groups ────────────────────────────────────────────────────────

export interface ParentProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
}

export interface DriverProfile {
  id: string;
  fullName: string;
  phone: string;
  vehicleNumber: string;
  vehicleModel: string;
  rating?: number;
  currentLocation?: { latitude: number; longitude: number };
  lastLocationUpdate?: string;
}

export interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string;
  schoolName?: string;
  pickupAddress: string;
  dropoffAddress: string;
  verificationPin: string;
  isActive: boolean;
  isAbsent: boolean;
  todayPickup: TripStatus;
  todayDropoff: TripStatus;
}

export interface TripStatus {
  status: "pending" | "en_route" | "arrived" | "completed" | "absent" | "skipped";
  estimatedTime: string;
  actualTime?: string;
  etaMinutes?: number;
}

export interface DriverGroup {
  id: string;
  groupName: string;
  groupCode: string;
  driver: DriverProfile;
  children: ChildProfile[];
  parentId: string;
  rideId?: string;
}

// ── Offers / Matching ─────────────────────────────────────────────────────────

export interface OfferDetail {
  offerId: string;
  driverName: string;
  driverRating?: number;
  vehicleModel: string;
  vehicleNumber: string;
  pricePerKm: number;
  monthlyRate: number;
  dayRate: number;
  usesStorksPricing: boolean;
}

export interface ChildGroup {
  groupId: string;
  groupName: string;
  children: Array<{
    id: string;
    firstName: string;
    preferredName?: string;
  }>;
}

export interface BookingRequestPayload {
  offerId: string;
  groupId: string;
  bookingType: "Monthly" | "Day";
  bookingDate?: string; // Required for Day bookings
  acknowledgedTerms: boolean;
}