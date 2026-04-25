import { useMemo } from "react";
import { Platform } from "react-native";
import { useAuth } from "@clerk/expo";

// In a real app, this would use an environment variable or a more robust way to get the server IP
const SERVER_IP =
  process.env.EXPO_PUBLIC_SERVER_IP ||
  (Platform.OS === "android" ? "10.0.2.2" : "localhost");

export const API_BASE_URL = `http://${SERVER_IP}:8080`;

/** WebSocket base URL for the live-messaging service */
export const WS_BASE_URL = `ws://${SERVER_IP}:8086/ws`;

export type ServiceName =
  | "admin-and-analytics"
  | "booking-and-payment"
  | "location-and-navigation"
  | "user-service"
  | "matching-searching"
  | "live-messaging"
  | "safety-and-verification";

const SERVICE_PORTS: Record<ServiceName, number> = {
  "admin-and-analytics": 8080,
  "booking-and-payment": 8081,
  "location-and-navigation": 8082,
  "user-service": 8083,
  "matching-searching": 8084,
  "live-messaging": 8086,
  "safety-and-verification": 8089,
};

const getBaseUrl = (port: number) => {
  if (process.env.NODE_ENV === "production") {
    return `https://api.storks.com:${port}`;
  }
  return `http://${SERVER_IP}:${port}`;
};

export type ApiClient = {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  put: <T>(path: string, body?: unknown) => Promise<T>;
  patch: <T>(path: string, body?: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
};

export function createApiClient(
  getToken: () => Promise<string | null>,
  baseUrl: string,
  prefix: string = "/api/v1",
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
        console.warn("Clerk: Device is offline, proceeding without token or failing if required");
        throw new Error("OFFLINE: Your session could not be verified because the device is offline.");
      }
      throw e;
    }

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    // Construct URL with prefix if path doesn't start with http
    let url: string;
    if (path.startsWith("http")) {
      url = path;
    } else {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      url = `${baseUrl}${prefix}${normalizedPath}`;
    }

    console.log(`API REQUEST: ${options.method || "GET"} ${url}`);

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API Error ${response.status}: ${errorText || response.statusText}`,
        );
      }

      if (response.status === 204) return {} as T;
      const json = await response.json();

      // Unwrap ApiResponse if present
      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        if (!json.success) {
          throw new Error(json.message || "API request failed");
        }
        return json.data as T;
      }

      return json as T;
    } catch (error) {
      console.error(`[API] Fetch failed: ${url}`, error);
      throw error;
    }
  };

  return {
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) =>
      request(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) =>
      request(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: (path, body) =>
      request(path, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: "DELETE" }),
  };
}

export function useApiClient(
  service: ServiceName = "location-and-navigation",
  prefix: string = "/api/v1",
) {
  const { getToken } = useAuth();

  const port = SERVICE_PORTS[service];
  const baseUrl = getBaseUrl(port);

  return useMemo(
    () => createApiClient(getToken, baseUrl, prefix),
    [getToken, service, baseUrl, prefix],
  );
}
