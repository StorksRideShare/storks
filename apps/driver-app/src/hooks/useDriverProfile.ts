import { useCallback, useEffect } from "react";
import { useUser } from "@clerk/expo";
import { useDriverAuthStore } from "../store/driverAuthStore";

export function useDriverProfile() {
  const { user, isLoaded } = useUser();
  const {
    driverProfile,
    authStatus,
    isLoading,
    setDriverProfile,
    setAuthStatus,
    setIsLoading,
  } = useDriverAuthStore();

  const fetchProfileAndStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Mock driver profile using Clerk data
        setDriverProfile({
          id: user.id,
          userId: user.id,
          fullName: user.fullName || "Driver",
          firstName: user.firstName || "Driver",
          lastName: user.lastName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
          phone: "+1234567890",
          profilePictureUrl: user.imageUrl,
          role: "DRIVER",
          onboarded: true,
        });

        setAuthStatus({
          isBanned: false,
          isOnboarded: true,
          userId: user.id,
          role: "DRIVER",
        });
      }
    } catch (err) {
      console.error("Failed to fetch driver profile or status:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, setDriverProfile, setAuthStatus, setIsLoading]);

  useEffect(() => {
    if (isLoaded) {
      fetchProfileAndStatus();
    }
  }, [isLoaded, fetchProfileAndStatus]);

  return {
    driverProfile,
    authStatus,
    isLoading: isLoading || !isLoaded,
    refresh: fetchProfileAndStatus,
  };
}
