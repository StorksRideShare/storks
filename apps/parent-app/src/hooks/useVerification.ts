import { useState, useCallback } from "react";
import { useApiClient } from "@/middleware/apiClient";

export interface QRPayload {
  type: string;
  ride_id: string;
  group_id: string;
  child_id?: string;
  expires_at: number;
  hash: string;
}

export interface VerificationResult {
  qrPayload: QRPayload | null;
  pin: string | null;
  isLoading: boolean;
  error: string | null;
  fetchMorningVerification: (groupId: string, rideId: string) => Promise<void>;
  fetchAfternoonVerification: (groupId: string) => Promise<void>;
}

export function useVerification(): VerificationResult {
  const api = useApiClient("safety-and-verification");
  const [qrPayload, setQrPayload] = useState<QRPayload | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMorningVerification = useCallback(async (groupId: string, rideId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch both QR and PIN for morning
      const [qrRes, otpRes] = await Promise.all([
        api.post<{ qr_payload: QRPayload }>("/qr/request?type=morning", { group_id: groupId, ride_id: rideId }),
        api.post<{ pin: string }>("/otp/request?type=morning", { group_id: groupId, ride_id: rideId })
      ]);
      setQrPayload(qrRes.qr_payload);
      setPin(otpRes.pin);
    } catch (err: any) {
      setError(err.message || "Failed to fetch morning verification data");
      setQrPayload(null);
      setPin(null);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const fetchAfternoonVerification = useCallback(async (groupId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Afternoon usually only has PINs for children in the group
      const otpRes = await api.post<{ pins: Array<{ child_id: string, pin: string }> }>("/otp/request?type=afternoon", { group_id: groupId });
      // For simplicity in the UI, we'll just use the first PIN or handle accordingly
      if (otpRes.pins && otpRes.pins.length > 0) {
        setPin(otpRes.pins[0].pin);
      }
      setQrPayload(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch afternoon verification data");
      setPin(null);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  return {
    qrPayload,
    pin,
    isLoading,
    error,
    fetchMorningVerification,
    fetchAfternoonVerification
  };
}
