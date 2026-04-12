import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/middleware/apiClient";
import type { BookingResponse } from "@/utils/api";

// ─────────────────────────────────────────────────────────────────────────────
// useBookings — fetches and manages parent bookings from booking-and-payment.
// ─────────────────────────────────────────────────────────────────────────────

export interface UseBookingsResult {
  bookings: BookingResponse[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export function useBookings(): UseBookingsResult {
  const api = useApiClient("booking-and-payment");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<BookingResponse[]>("/bookings/my");
      setBookings(data);
    } catch (err: any) {
      const isOffline =
        err.message?.includes("OFFLINE") ||
        err.message?.includes("NETWORK_ERROR");
      setError(
        isOffline
          ? "You appear to be offline."
          : "Failed to load bookings. Pull to refresh."
      );
      if (__DEV__) console.error("[useBookings] fetchBookings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      // Optimistic removal
      const previous = bookings;
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Cancelled" as const } : b
        )
      );

      try {
        await api.put(`/bookings/${bookingId}/cancel`);
      } catch (err: any) {
        // Revert on failure
        setBookings(previous);
        if (__DEV__) console.error("[useBookings] cancelBooking:", err);
        throw err; // Re-throw so the screen can show a toast
      }
    },
    [api, bookings]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    isLoading,
    error,
    refresh: fetchBookings,
    cancelBooking,
  };
}
