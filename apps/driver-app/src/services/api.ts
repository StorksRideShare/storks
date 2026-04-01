import { Route, RouteStop, NavigationRoute, Location, Driver } from '../types';
import polyline from '@mapbox/polyline';

// Mock driver data
const MOCK_DRIVER: Driver = {
  id: 'driver-1',
  fullName: 'Ranidu Sampath',
  phone: '+94771234567',
  vehicleNumber: 'ABC-1223',
  vehicleModel: 'Honda Caravan',
  vehicleCapacity: 12,
  currentLocation: {
    latitude: 6.9271,
    longitude: 79.8612,
  },
};

// Mock route stops for today (matching UI designs)
const MOCK_STOPS: RouteStop[] = [
  {
    id: 'stop-1',
    routeId: 'route-1',
    child: {
      id: 'child-1',
      firstName: 'Ruwan',
      lastName: 'Vihanga',
      pickupAddress: '12/B, Maple Road, Maharagama',
      pickupLocation: { latitude: 6.9067, longitude: 79.8707 },
      dropoffAddress: 'President\'s College - Maharagama',
      dropoffLocation: { latitude: 6.8456, longitude: 79.9242 },
      verificationPin: '123456',
      parentId: 'parent-1',
      parentName: 'Janaka Family',
    },
    stopOrder: 1,
    estimatedTime: '07:00',
    address: '12/B, Maple Road, Maharagama',
    location: { latitude: 6.9067, longitude: 79.8707 },
    status: 'pending',
    distanceKm: 1.4,
    etaMinutes: 4,
    verificationStatus: false,
  },
  {
    id: 'stop-2',
    routeId: 'route-1',
    child: {
      id: 'child-2',
      firstName: 'Vihanga',
      lastName: 'Janaka',
      pickupAddress: 'Ananda College - Colombo',
      pickupLocation: { latitude: 6.9271, longitude: 79.8612 },
      dropoffAddress: 'Ananda College - Colombo',
      dropoffLocation: { latitude: 6.9271, longitude: 79.8612 },
      verificationPin: '654321',
      parentId: 'parent-1',
      parentName: 'Janaka Family',
    },
    stopOrder: 2,
    estimatedTime: '07:15',
    address: 'Ananda College - Colombo',
    location: { latitude: 6.9271, longitude: 79.8612 },
    status: 'pending',
    distanceKm: 1.8,
    etaMinutes: 8,
    verificationStatus: false,
  },
  {
    id: 'stop-3',
    routeId: 'route-1',
    child: {
      id: 'child-3',
      firstName: 'Sandun',
      lastName: 'Perera',
      pickupAddress: '45/C, Lake Road, Nugegoda',
      pickupLocation: { latitude: 6.8728, longitude: 79.8912 },
      dropoffAddress: 'Royal College - Colombo',
      dropoffLocation: { latitude: 6.9100, longitude: 79.8612 },
      verificationPin: '789012',
      parentId: 'parent-2',
      parentName: 'Perera Family',
    },
    stopOrder: 3,
    estimatedTime: '07:25',
    address: '45/C, Lake Road, Nugegoda',
    location: { latitude: 6.8728, longitude: 79.8912 },
    status: 'pending',
    distanceKm: 2.5,
    verificationStatus: false,
  },
];

// Mock today's route
const MOCK_ROUTE: Route = {
  id: 'route-1',
  driverId: 'driver-1',
  routeDate: new Date().toISOString().split('T')[0],
  routeType: 'pickup',
  status: 'in_progress',
  stops: MOCK_STOPS,
  startedAt: new Date(),
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const driverApi = {
  async getDriver(): Promise<Driver> {
    await delay(300);
    return MOCK_DRIVER;
  },

  async getTodayRoute(): Promise<Route> {
    await delay(500);
    return MOCK_ROUTE;
  },

  async startRoute(routeType: 'pickup' | 'dropoff'): Promise<Route> {
    await delay(400);
    return {
      ...MOCK_ROUTE,
      routeType,
      status: 'in_progress',
      startedAt: new Date(),
    };
  },

  async getNavigationRoute(origin: Location, destination: Location): Promise<NavigationRoute> {
    await delay(600);
    
    // Mock polyline (rough route from origin to destination)
    const mockPolyline = 'w{ayA_xrzMnA~@fApAfBrBhCtCdDhDfEjE';
    const coordinates = polyline.decode(mockPolyline).map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));

    // Calculate rough distance and duration
    const distanceMeters = Math.round(Math.random() * 3000 + 1000); // 1-4km
    const durationSeconds = Math.round(distanceMeters / 8); // ~30km/h average speed

    return {
      polyline: mockPolyline,
      distanceMeters,
      durationSeconds,
      coordinates,
      eta: new Date(Date.now() + durationSeconds * 1000),
    };
  },

  async verifyPickup(stopId: string, pin: string): Promise<{ success: boolean; message?: string }> {
    await delay(400);
    
    const stop = MOCK_STOPS.find(s => s.id === stopId);
    if (!stop) {
      return { success: false, message: 'Stop not found' };
    }

    if (pin === stop.child.verificationPin) {
      return { success: true };
    } else {
      return { success: false, message: 'Invalid PIN' };
    }
  },

  async skipStop(stopId: string, reason: string): Promise<void> {
    await delay(300);
    console.log(`Stop ${stopId} skipped: ${reason}`);
  },

  async updateLocation(location: Location): Promise<void> {
    await delay(100);
    // Mock location update
  },

  async completeRoute(routeId: string): Promise<void> {
    await delay(300);
    console.log(`Route ${routeId} completed`);
  },
};

// Export mock data for use in stores
export { MOCK_DRIVER, MOCK_ROUTE, MOCK_STOPS };
