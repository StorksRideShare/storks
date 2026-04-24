import { useCallback, useEffect } from "react";
import { useApiClient } from "../middleware/apiClient";
import { useDriverAuthStore } from "../store/driverAuthStore";
import { driverApi } from "../services/api";

export function useDriverProfile() {
  const apiClient = useApiClient("user-service");
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
      const [profile, status] = await Promise.all([
        driverApi.getProfile(apiClient),
        driverApi.getAuthStatus(apiClient),
      ]);
      setDriverProfile(profile);
      setAuthStatus(status);
    } catch (err) {
      console.error("Failed to fetch driver profile or status:", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, setDriverProfile, setAuthStatus, setIsLoading]);

  useEffect(() => {
    fetchProfileAndStatus();
  }, [fetchProfileAndStatus]);

  return {
    driverProfile,
    authStatus,
    isLoading,
    refresh: fetchProfileAndStatus,
  };
}
