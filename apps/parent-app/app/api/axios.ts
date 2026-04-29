import Constants from 'expo-constants';
import axios from 'axios';
import { NativeModules, Platform } from 'react-native';

const DEV_API_PORT = '8083';

const extractHost = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  try {
    if (trimmedValue.includes('://')) {
      return new URL(trimmedValue).hostname;
    }

    return trimmedValue.split('/')[0]?.split(':')[0] ?? null;
  } catch {
    return null;
  }
};

const getExpoDevHost = () => {
  const candidates = [
    (Constants as any)?.expoGoConfig?.debuggerHost,
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost,
    NativeModules?.SourceCode?.scriptURL,
  ];

  for (const candidate of candidates) {
    const host = extractHost(candidate);
    if (host) {
      return host;
    }
  }

  return null;
};

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  if (__DEV__) {
    const expoHost = getExpoDevHost();
    if (expoHost) {
      return `http://${expoHost}:${DEV_API_PORT}`;
    }

    return Platform.OS === 'android'
      ? `http://10.0.2.2:${DEV_API_PORT}`
      : `http://localhost:${DEV_API_PORT}`;
  }

  return 'https://api.storks-matching.com';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for better error handling/readability
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error('[API Error]:', message, `(${api.defaults.baseURL ?? 'no baseURL'})`);
    return Promise.reject(error);
  }
);

export default api;
