import { API_BASE_URL } from '../../middleware/apiClient';
import {
  AbsenceReport,
  DriverGroup,
  Location,
  Parent,
  TrackingData
} from '../types';

async function apiRequest<T>(
  path: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

export const parentApi = {
  async getParent(token: string): Promise<Parent> {
    return apiRequest<Parent>('/status', 'GET', undefined, token);
  },

  async getDashboard(token: string): Promise<DriverGroup[]> {
    return apiRequest<DriverGroup[]>('/dashboard', 'GET', undefined, token);
  },

  async getGroup(groupId: string, token: string): Promise<DriverGroup | null> {
    return apiRequest<DriverGroup>(`/groups/${groupId}`, 'GET', undefined, token);
  },

  async getTrackingData(groupId: string, childId?: string, token?: string): Promise<TrackingData | null> {
    const query = childId ? `?childId=${childId}` : '';
    return apiRequest<TrackingData>(`/tracking/${groupId}${query}`, 'GET', undefined, token);
  },

  async markChildAbsent(
    childId: string,
    routeType: 'pickup' | 'dropoff' | 'both',
    reason?: string,
    token?: string
  ): Promise<AbsenceReport> {
    return apiRequest<AbsenceReport>('/absences', 'POST', {
      childId,
      routeType,
      reason,
      absenceDate: new Date().toISOString().split('T')[0],
    }, token);
  },

  async cancelAbsence(childId: string, token?: string): Promise<void> {
    return apiRequest<void>(`/absences/${childId}/cancel`, 'POST', undefined, token);
  },

  async completeOnboarding(payload: any, token: string): Promise<any> {
    return apiRequest<any>('/onboarding/complete', 'POST', payload, token);
  },

  async updateDriverLocation(groupId: string, location: Location, token?: string): Promise<void> {
    return apiRequest<void>(`/groups/${groupId}/location`, 'POST', location, token);
  },
};
