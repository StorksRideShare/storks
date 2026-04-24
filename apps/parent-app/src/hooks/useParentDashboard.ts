import { useCallback, useEffect, useRef, useState } from "react";
import { useApiClient } from "@/middleware/apiClient";
import { useParentStore } from "@/src/store/parentStore";
import type { ParentProfile, DriverGroup } from "@/utils/api";

// ─────────────────────────────────────────────────────────────────────────────
// useParentDashboard — fetches parent profile + driver groups from user-service
// and populates the global parentStore.
// ─────────────────────────────────────────────────────────────────────────────

export interface UseParentDashboardResult {
  parent: ParentProfile | null;
  groups: DriverGroup[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useParentDashboard(): UseParentDashboardResult {
  const api = useApiClient("user-service");
  const { setParent, setGroups, setIsLoadingGroups, parent, groups } =
    useParentStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent duplicate concurrent fetches
  const fetchingRef = useRef(false);

  const fetchDashboard = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setIsLoading(true);
    setIsLoadingGroups(true);
    setError(null);

    try {
      const [fetchedParent, fetchedGroups] = await Promise.all([
        api.get<ParentProfile>("/parent/profile"),
        api.get<DriverGroup[]>("/parent/groups"),
      ]);

      const normalizedGroups = fetchedGroups.map(g => ({
        ...g,
        children: g.children ?? []
      }));
      setParent(fetchedParent);
      setGroups(normalizedGroups);
    } catch (err: any) {
      const isOffline =
        err.message?.includes("OFFLINE") ||
        err.message?.includes("NETWORK_ERROR");
      setError(
        isOffline
          ? "You appear to be offline. Pull down to retry."
          : "Failed to load dashboard. Please try again."
      );
      if (__DEV__) console.error("[useParentDashboard]", err);
    } finally {
      setIsLoading(false);
      setIsLoadingGroups(false);
      fetchingRef.current = false;
    }
  }, [api]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    parent,
    groups,
    isLoading,
    error,
    refresh: fetchDashboard,
  };
}
