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
  // Web environment check
  if (process.env.NODE_ENV === 'production') {
    return `https://example.com:${port}`;
  }
  return `http://localhost:${port}`;
};

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

export function getApiClient(service: ServiceName = "safty-and-verification") {
  const port = SERVICE_PORTS[service];
  const baseUrl = getBaseUrl(port);
  
  return createApiClient(() => Promise.resolve(localStorage.getItem('token')), baseUrl);
}
