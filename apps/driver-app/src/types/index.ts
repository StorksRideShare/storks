// Core entity types
export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  vehicleNumber: string;
  vehicleModel: string;
  vehicleCapacity?: number;
  currentLocation?: Location;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string;
  schoolName?: string;
  pickupAddress: string;
  pickupLocation: Location;
  dropoffAddress: string;
  dropoffLocation: Location;
  verificationPin: string;
  parentId: string;
  parentName: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationWithDetails extends Location {
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
}

// Route and stop types
export interface Route {
  id: string;
  driverId: string;
  routeDate: string;
  routeType: 'pickup' | 'dropoff';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  stops: RouteStop[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface RouteStop {
  id: string;
  routeId: string;
  child: Child;
  stopOrder: number;
  estimatedTime: string; // HH:mm format
  actualTime?: Date;
  address: string;
  location: Location;
  status: 'pending' | 'absent' | 'en_route' | 'arrived' | 'completed' | 'skipped';
  distanceKm?: number;
  etaMinutes?: number;
  verificationStatus: boolean;
  verificationTime?: Date;
}

// Navigation types
export interface NavigationRoute {
  polyline: string; // Encoded polyline
  distanceMeters: number;
  durationSeconds: number;
  eta?: Date;
  coordinates: Location[]; // Decoded coordinates
}

export interface RouteStep {
  distance: string;
  duration: string;
  instruction: string;
}

// Store state types
export interface DriverState {
  driver: Driver | null;
  currentRoute: Route | null;
  currentLocation: LocationWithDetails | null;
  nextStop: RouteStop | null;
  navigationRoute: NavigationRoute | null;
  isNavigating: boolean;
  isTrackingLocation: boolean;
  
  // Actions
  setDriver: (driver: Driver) => void;
  setCurrentRoute: (route: Route) => void;
  updateLocation: (location: LocationWithDetails) => void;
  setNextStop: (stop: RouteStop | null) => void;
  setNavigationRoute: (route: NavigationRoute | null) => void;
  startNavigation: () => void;
  stopNavigation: () => void;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  verifyStop: (stopId: string, pin: string) => Promise<boolean>;
  skipStop: (stopId: string, reason: string) => Promise<void>;
  completeStop: (stopId: string) => void;
  moveToNextStop: () => void;
}

export type StopStatus = RouteStop['status'];
export type RouteType = Route['routeType'];
export type RouteStatus = Route['status'];
