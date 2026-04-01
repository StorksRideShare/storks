import { useSession } from "@clerk/expo";
import { useMemo } from "react";
import { Platform } from "react-native";

const SERVER_IP =
  process.env.EXPO_PUBLIC_SERVER_IP ||
  (Platform.OS === "android" ? "10.0.2.2" : "localhost");

export const API_BASE_URL = `http://${SERVER_IP}:8080`; // Standard base URL for bookings/auth

export type ServiceName =
  | "admin-and-analytics"
  | "booking-and-payment"
  | "location-and-navigation"
  | "user-service"
  | "matching-searching"
  | "live-messaging"
  | "safty-and-verification"
  | "available-8086"
  | "available-8087"
  | "available-8088";

const SERVICE_PORTS: Record<ServiceName, number> = {
  "admin-and-analytics": 8080,
  "booking-and-payment": 8081,
  "location-and-navigation": 8082,
  "user-service": 8083,
  "matching-searching": 8084,
  "live-messaging": 8085,
  "available-8086": 8086,
  "available-8087": 8087,
  "available-8088": 8088,
  "safty-and-verification": 8089,
};

const getBaseUrl = (port: number) => {
  if (!__DEV__) {
    return `https://example.com:${port}`;
  }
  return `http://${SERVER_IP}:${port}`;
};

export type ApiClient = {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  put: <T>(path: string, body?: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
};

export function createApiClient(
  getToken: () => Promise<string | null>,
  baseUrl: string,
): ApiClient {
  const request = async <T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> => {
    let token: string | null = null;
    try {
      token = await getToken();
    } catch (e: any) {
      if (e.name === "ClerkOfflineError" || e.message?.includes("offline")) {
        console.warn(
          "Clerk: Device is offline, proceeding without token or failing if required",
        );
        // For our services, most require auth. We can either throw here or let the backend throw 401.
        // But throwing a clear error here is better for UI handling.
        throw new Error(
          "OFFLINE: Your session could not be verified because the device is offline.",
        );
      }
      throw e;
    }
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    console.log(`API REQUEST: ${options.method || "GET"} ${url}`);

    try {
      const response = await fetch(url, { ...options, headers });
      if (__DEV__) console.log(`[API] ${response.status} ${url}`);

      if (!response.ok) {
        const errorText = await response.text();
        if (__DEV__)
          console.error(`[API] Error ${response.status}: ${errorText}`);
        throw new Error(
          `API Error ${response.status}: ${errorText || response.statusText}`,
        );
      }

      if (response.status === 204) return {} as T;
      return response.json() as Promise<T>;
    } catch (error) {
      if (__DEV__) console.error(`[API] Fetch failed: ${url}`, error);
      throw error;
    }
  };

  return {
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) =>
      request(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) =>
      request(path, { method: "PUT", body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: "DELETE" }),
  };
}

export function useApiClient(service: ServiceName = "safty-and-verification") {
  const { session } = useSession();
  const port = SERVICE_PORTS[service];
  const baseUrl = getBaseUrl(port);

  return useMemo(
    () =>
      createApiClient(
        () => session?.getToken() ?? Promise.resolve(null),
        baseUrl,
      ),
    [session, service, baseUrl],
  );
}
