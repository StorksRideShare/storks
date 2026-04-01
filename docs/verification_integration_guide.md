# Verification Integration Guide

This guide explains how to implement the Uber-style verification flow in the Storks Parent App.

## Overview

The verification flow is designed to be triggered from any screen (e.g., Ride Details) and return the user to the original screen with a success or error status.

## Components available

- `QRShowcase`: For displaying a parent's verification QR.
- `QRScanner`: For scanning a driver's QR.
- `PINShowcase`: For showing a 6-digit PIN.
- `PINInput`: For manual entry of a driver's PIN.

## Implementation Flow

### 1. Triggering Verification

When a user needs to verify a ride, navigate them to the `/verify` path with parameters for the ride and a return path.

```typescript
router.push({
  pathname: "/verify",
  params: {
    rideId: "ride-123",
    type: "pickup", // or dropoff
    returnPath: "/rides/[id]",
  }
});
```

### 2. Handling the Verification

The `verify` screen performs the API call to the `safty-and-verification` service.

```typescript
const handleSuccess = () => {
  router.replace({
    pathname: returnPath,
    params: { verificationStatus: "success" }
  });
};

const handleError = (error: string) => {
  router.replace({
    pathname: returnPath,
    params: { verificationStatus: "error", error }
  });
};
```

### 3. Returning to Previous Screen

In the calling screen (e.g., `RideDetails.tsx`), use the `useLocalSearchParams` to check for the verification status.

```typescript
const { verificationStatus, error } = useLocalSearchParams();

useEffect(() => {
  if (verificationStatus === "success") {
    toast.show({ title: "Ride Verified Successfully" });
    // Update local state or refetch data
  } else if (verificationStatus === "error") {
    toast.show({ title: "Verification Failed", description: error });
  }
}, [verificationStatus]);
```

## Security Best Practices

- **Never storage PINs in plain text** on the device for long periods.
- **Set short-lived expiration** for generated QR codes (e.g., 5 minutes for morning pickup).
- **Verify signatures** on the backend using the shared secret.

## Development Test Page

You can test all components and the API integration on the **Safety Hub** tab in the app.
