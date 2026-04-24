import { useSession } from "@clerk/expo";
import { ClerkOfflineError } from "@clerk/react/errors";
import { useMemo } from "react";
import { Platform } from "react-native";

const SERVER_IP =
  process.env.EXPO_PUBLIC_SERVER_IP ||
  (Platform.OS === "android" ? "10.0.2.2" : "localhost");

export const API_BASE_URL = `http://${SERVER_IP}:8080`;

/** WebSocket base URL for the live-messaging service (port 8085) */
export const WS_BASE_URL = `ws://${SERVER_IP}:8085/ws`;

export type ServiceName =
  | "admin-and-analytics"
  | "booking-and-payment"
  | "location-and-navigation"
  | "user-service"
  | "matching-searching"
  | "live-messaging"
  | "safety-and-verification";

const SERVICE_PORTS: Record<ServiceName, number> = {
  "admin-and-analytics": 8085,
  "booking-and-payment": 8088,
  "location-and-navigation": 8082,
  "user-service": 8083,
  "matching-searching": 8084,
  "live-messaging": 8086,
  "safety-and-verification": 8089,
};

const getBaseUrl = (port: number) => {
  if (!__DEV__) {
    return `https://api.storks.app:${port}`;
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
      if (ClerkOfflineError.is(e)) {
        throw new Error(
          "OFFLINE: Your session could not be verified because the device is offline.",
        );
      }
      throw e;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    // Paths passed to get/post/etc must NOT include the prefix —
    // the prefix is injected here to prevent doubled /api/v1/api/v1 paths.
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${baseUrl}${prefix}${normalizedPath}`;

    if (__DEV__) console.log(`[API] ${options.method || "GET"} ${url}`);

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (networkError) {
      if (__DEV__) console.error(`[API] Network failure: ${url}`, networkError);
      throw new Error("NETWORK_ERROR: Unable to reach the server.");
    }

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

    const json = await response.json();

    // Unwrap standard ApiResponse wrapper { success, data, message }
    if (
      json &&
      typeof json === "object" &&
      "success" in json &&
      "data" in json
    ) {
      if (!json.success) {
        throw new Error(json.message || "API request failed");
      }
      return json.data as T;
    }

    return json as T;
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
  service: ServiceName = "user-service",
  prefix: string = "/api/v1",
) {
  const { session } = useSession();
  const port = SERVICE_PORTS[service];
  const baseUrl = getBaseUrl(port);


  const sessionId = session?.id;

  return useMemo(
    () =>
      createApiClient(
        () => session?.getToken() ?? Promise.resolve(null),
        baseUrl,
        prefix,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId, baseUrl, prefix],
  );
}
