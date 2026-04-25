import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/middleware/apiClient";
import type { ScheduleEntry, AbsenceRequest, AbsenceResponse } from "@/utils/api";

// ─────────────────────────────────────────────────────────────────────────────
// useSchedule — fetches child schedule data from booking-and-payment and
// matching-searching services, and exposes absence reporting.
// ─────────────────────────────────────────────────────────────────────────────

export interface UseScheduleResult {
  schedule: ScheduleEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  reportAbsence: (request: AbsenceRequest) => Promise<AbsenceResponse>;
}

export function useSchedule(childId?: string): UseScheduleResult {
  const bookingApi = useApiClient("booking-and-payment");
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const path = childId
        ? `/schedule?childId=${childId}`
        : "/schedule/my-children";
      const data = await bookingApi.get<ScheduleEntry[]>(path);
      setSchedule(data);
    } catch (err: any) {
      if (__DEV__) console.warn("[useSchedule] Service unavailable", err);
      // In isolation mode, we just show an empty schedule
      setSchedule([]);
    } finally {
      setIsLoading(false);
    }
  }, [bookingApi, childId]);

  const reportAbsence = useCallback(
    async (request: AbsenceRequest): Promise<AbsenceResponse> => {
      try {
        const response = await bookingApi.post<AbsenceResponse>(
          "/absences",
          request
        );
        // Optimistically update local schedule entry
        setSchedule((prev) =>
          prev.map((entry) =>
            entry.childId === request.childId &&
            entry.date === request.date
              ? { ...entry, status: "absent" as const }
              : entry
          )
        );
        return response;
      } catch (err: any) {
        if (__DEV__) console.error("[useSchedule] reportAbsence:", err);
        throw err;
      }
    },
    [bookingApi]
  );

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return {
    schedule,
    isLoading,
    error,
    refresh: fetchSchedule,
    reportAbsence,
  };
}
