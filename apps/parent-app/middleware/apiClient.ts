import { useSession } from "@clerk/expo";
import { useMemo } from "react";
import { Platform } from "react-native";

const CONFIG = {
  development: {
    apiUrl: Platform.OS === "android" ? "http://10.0.2.2:8089" : "http://localhost:8089",
    wsUrl: Platform.OS === "android" ? "ws://10.0.2.2:8089/ws" : "ws://localhost:8089/ws",
    verificationUrl: Platform.OS === "android" ? "http://10.0.2.2:8085" : "http://localhost:8085",
  },
  production: {
    apiUrl: "https://example.com:8085", // Update with real production URL
    wsUrl: "wss://example.com:8085/ws",
    verificationUrl: "https://example.com:8085", // Update with real production URL
  },
};

const ENV = __DEV__ ? "development" : "production";
export const API_BASE_URL = CONFIG[ENV].apiUrl;
export const WS_BASE_URL = CONFIG[ENV].wsUrl;
export const VERIFICATION_API_BASE_URL = CONFIG[ENV].verificationUrl;

export type ApiClient = {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body?: any) => Promise<T>;
  put: <T>(path: string, body?: any) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
};

export function createApiClient(getToken: () => Promise<string | null>, baseUrl: string): ApiClient {
  const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    console.log(`API REQUEST: ${options.method || "GET"} ${url}`);
    
    try {
      const response = await fetch(url, { ...options, headers });
      console.log(`API RESPONSE: ${response.status} ${url}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API ERROR: ${response.status} - ${errorText}`);
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }

      if (response.status === 204) return {} as T;
      return response.json();
    } catch (error) {
      console.error(`API FETCH FAILED: ${url}`, error);
      throw error;
    }
  };

  return {
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: "DELETE" }),
  };
}

export function useApiClient(isVerification = false) {
  const { session } = useSession();
  const baseUrl = isVerification ? VERIFICATION_API_BASE_URL : API_BASE_URL;
  return useMemo(() => createApiClient(() => session?.getToken() ?? Promise.resolve(null), baseUrl), [session, isVerification]);
}

