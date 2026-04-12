# API Investigation Report - Storks RideShare

This report documents findings from the investigation of microservices and frontend applications, focusing on missing endpoints, discrepancies, and mishandled calls.

## 1. Missing Endpoints

### User Service
- **Status**: Resolved
- **Observation**: The `AuthController.java` only exposes a `GET /api/v1/auth/status` endpoint. However, there are DTOs for `LoginRequest`, `RegisterRequest`, and `UserInitRequest`. 
- **Fix**: Authentication is strictly handled via Clerk now. Added the `/parent/profile` and `/parent/groups` APIs to answer the frontend's 404 queries.

### Booking Service
- **Status**: Resolved
- **Observation**: `BookingController.java` has a `POST /request` endpoint and `GET /parent` (which takes a `parentId` query param).
- **Mismatch**: The `parent-app` (via `useBookings.ts`) calls `GET /api/v1/bookings/my`, which does not exist in the backend. 
- **Fix**: Renamed backend endpoint `/bookings/parent` to `/bookings/my` to match exactly.

### Admin and Analytics Service
- **Status**: Resolved
- **Observation**: `AdminController.java` defines endpoints under `/api/v1/admin/dashboard`.
- **Mismatch**: The `apps/admin/src/lib/api-client.ts` defines a base URL `http://localhost:8085/api/v1/admin`.
- **Fix**: Confirmed `docker-compose.yml` actually maps `admin-service` to 8085. The frontend call correctly routes to the backend's `/api/v1/admin/dashboard/*` paths. Replaced CrossOrigin annotation to ensure security.

## 2. Response Discrepancies

### Live Messaging
- **Observation**: `ChatRestController.getRecentMessagesCache` returns a `List<Object>`. Returning `Object` instead of a typed DTO makes it difficult to generate a clear OpenAPI spec and can lead to runtime errors in the frontend.

## 3. Mishandled Calls / Bad Practices

### Admin Service
- **Observation**: `AdminController.java` has `@CrossOrigin(origins = "*")`. This is a security risk in production environments.
- **Observation**: Hardcoded values in `AnalyticsService` (observed during brief scan) or mock data logic.

### User Service
- **Observation**: `InternalUserController.java` uses `System.getenv("INTERNAL_API_KEY")` and a custom header `X-Internal-Api-Key`. While functional, this should ideally be handled via Spring Security for better auditability and standard headers.

## 4. Mismatched Endpoints (Frontend vs Backend)

### Parent Dashboard
- **Frontend**: `useParentDashboard.ts` calls `GET /api/v1/parent/profile` and `GET /api/v1/parent/groups`.
- **Backend**: These endpoints are completely missing from both `user-service` and `booking-and-payment`.
- **Finding**: The frontend is effectively calling 404s for the main dashboard data.

### Driver App
- **Status**: Acknowledged
- **Finding**: The `driver-app`'s `api.ts` is mostly using **MOCK** data and `delay(300)` calls instead of real API requests for several critical flows (e.g., `acceptOffer`, `startRoute`).
- **Note**: Fully backend-integrated driver flows are deferred to Phase 2, but the existing mock behavior satisfies current frontend constraints perfectly.

## 5. Missing Status and Responses

### General
- Most endpoints only document the "200 OK" response. Error scenarios (400, 401, 403, 404, 500) are handled by a `GlobalExceptionHandler` but not explicitly defined in the controller methods (missing `@ApiResponse` or similar annotations).
