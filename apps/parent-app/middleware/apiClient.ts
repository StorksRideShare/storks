import { useSession } from "@clerk/expo";
import { useMemo } from "react";
import { Platform } from "react-native";

// ------------------------------------------------------------------
// Environment-aware URLs
// Port 8080 = Spring Boot admin-and-analytics service
// Use EXPO_PUBLIC_API_BASE_URL in .env to override (recommended)
// ------------------------------------------------------------------
const CONFIG = {
  development: {
    apiUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      (Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080"),
    wsUrl:
      Platform.OS === "android"
        ? "ws://10.0.2.2:8080/ws"
        : "ws://localhost:8080/ws",
    verificationUrl:
      Platform.OS === "android"
        ? "http://10.0.2.2:8085"
        : "http://localhost:8085",
  },
  production: {
    apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.storks.app",
    wsUrl: "wss://api.storks.app/ws",
    verificationUrl: "https://verify.storks.app",
  },
};

const ENV = __DEV__ ? "development" : "production";
export const API_BASE_URL = CONFIG[ENV].apiUrl;
export const WS_BASE_URL = CONFIG[ENV].wsUrl;
export const VERIFICATION_API_BASE_URL = CONFIG[ENV].verificationUrl;

// ------------------------------------------------------------------
// Core API client — equivalent to an Axios instance with interceptors:
//   • Injects Clerk JWT on every request
//   • Logs requests and responses
//   • Normalises errors into thrown Error objects
// ------------------------------------------------------------------
export type ApiClient = {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  put: <T>(path: string, body?: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
};

export function createApiClient(
  getToken: () => Promise<string | null>,
  baseUrl: string
): ApiClient {
  const request = async <T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const token = await getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    if (__DEV__) console.log(`[API] ${options.method ?? "GET"} ${url}`);

    try {
      const response = await fetch(url, { ...options, headers });
      if (__DEV__) console.log(`[API] ${response.status} ${url}`);

      if (!response.ok) {
        const errorText = await response.text();
        if (__DEV__) console.error(`[API] Error ${response.status}: ${errorText}`);
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }

      if (response.status === 204) return {} as T;
      return response.json() as Promise<T>;
    } catch (error) {
      if (__DEV__) console.error(`[API] Fetch failed: ${url}`, error);
      throw error;
    }
  };

  return {
    get:    (path)       => request(path, { method: "GET" }),
    post:   (path, body) => request(path, { method: "POST",   body: JSON.stringify(body) }),
    put:    (path, body) => request(path, { method: "PUT",    body: JSON.stringify(body) }),
    delete: (path)       => request(path, { method: "DELETE" }),
  };
}

// ------------------------------------------------------------------
// React hook — call inside any component to get an API client
// whose token is automatically sourced from the active Clerk session.
// ------------------------------------------------------------------
export function useApiClient(isVerification = false): ApiClient {
  const { session } = useSession();
  const baseUrl = isVerification ? VERIFICATION_API_BASE_URL : API_BASE_URL;
  return useMemo(
    () => createApiClient(() => session?.getToken() ?? Promise.resolve(null), baseUrl),
    [session, isVerification]
  );
}