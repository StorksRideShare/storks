import { Platform } from "react-native";

const host =
  process.env.EXPO_PUBLIC_MATCHING_API_HOST ||
  (Platform.OS === "android" ? "10.0.2.2" : "localhost");
const port = process.env.EXPO_PUBLIC_MATCHING_API_PORT || "8084";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_MATCHING_API_URL || `http://${host}:${port}`;

export type Driver = {
  id: number;
  name: string;
  vehicle: string;
  plate: string;
  availableSeats: number;
  totalSeats: number;
  ac: boolean;
  nfc: boolean;
  verified: boolean;
};

export type Child = {
  id?: number;
  name: string;
  age: number;
  pickupLocation: string;
  dropLocation: string;
};

export type Group = {
  groupName: string;
  memberName: string;
  age: number;
  pickupLocation: string;
  dropLocation: string;
  driverName: string;
  hasDriver: boolean;
  status: string;
  bookingDate?: string;
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }
  if (response.status === 204) return {} as T;
  return response.json() as Promise<T>;
}

export async function getGroup(groupId: number): Promise<Group> {
  const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`);
  return parseJson<Group>(response);
}

export async function getChildren(groupId: number): Promise<Child[]> {
  const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/children`);
  return parseJson<Child[]>(response);
}

export async function addChild(groupId: number, payload: Child): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/children`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await parseJson(response);
}

export async function searchDrivers(filters: {
  seats?: number;
  ac?: boolean;
  nfc?: boolean;
}): Promise<Driver[]> {
  const params = new URLSearchParams();
  if (typeof filters.seats === "number") params.set("seats", String(filters.seats));
  if (typeof filters.ac === "boolean") params.set("ac", String(filters.ac));
  if (typeof filters.nfc === "boolean") params.set("nfc", String(filters.nfc));
  const query = params.toString();
  const url = `${API_BASE_URL}/api/drivers/search${query ? `?${query}` : ""}`;
  const response = await fetch(url);
  return parseJson<Driver[]>(response);
}

export async function getDriver(driverId: number): Promise<Driver> {
  const response = await fetch(`${API_BASE_URL}/api/drivers/${driverId}`);
  return parseJson<Driver>(response);
}

export async function bookDriver(driverId: number, groupId: number): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/api/drivers/${driverId}/book?groupId=${groupId}`,
    { method: "POST" },
  );
  return parseJson<string>(response);
}
