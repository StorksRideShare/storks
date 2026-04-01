// Core entity types
export interface Parent {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  vehicleNumber: string;
  vehicleModel: string;
  currentLocation?: Location;
  lastLocationUpdate?: Date;
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
  isActive: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
}

// Group types (children grouped by driver)
export interface DriverGroup {
  id: string;
  groupName: string;
  groupCode: string;
  driver: Driver;
  children: ChildWithStatus[];
  parentId: string;
}

export interface ChildWithStatus extends Child {
  todayPickup: TripStatus;
  todayDropoff: TripStatus;
  isAbsent: boolean;
}

export interface TripStatus {
  status: 'pending' | 'en_route' | 'arrived' | 'completed' | 'absent' | 'skipped';
  estimatedTime: string; // HH:mm format
  actualTime?: Date;
  etaMinutes?: number;
}

// Tracking types
export interface TrackingData {
  group: DriverGroup;
  driverLocation: Location;
  routePolyline?: string;
  routeCoordinates?: Location[];
  etaMinutes?: number;
  estimatedArrival?: Date;
  currentChild?: ChildWithStatus; // The child being tracked
}

// Absence reporting
export interface AbsenceReport {
  id: string;
  childId: string;
  absenceDate: string;
  routeType: 'pickup' | 'dropoff' | 'both';
  reason?: string;
  reportedAt: Date;
}

// Notification types
export interface Notification {
  id: string;
  type: 'pickup' | 'dropoff' | 'eta' | 'absence' | 'emergency';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  relatedChildId?: string;
  relatedGroupId?: string;
}

// WebSocket event types
export interface DriverLocationUpdate {
  driverId: string;
  groupId: string;
  location: Location;
  speed?: number;
  heading?: number;
  timestamp: Date;
}

export interface StopStatusUpdate {
  stopId: string;
  childId: string;
  childName: string;
  status: TripStatus['status'];
  actualTime?: Date;
  routeType: 'pickup' | 'dropoff';
}

export interface EtaUpdate {
  childId: string;
  groupId: string;
  etaMinutes: number;
  estimatedArrival: Date;
}

// Store state types
export interface ParentState {
  parent: Parent | null;
  groups: DriverGroup[];
  selectedGroup: DriverGroup | null;
  trackingData: TrackingData | null;
  notifications: Notification[];
  isLoadingGroups: boolean;
  isLoadingTracking: boolean;
  
  // Actions
  setParent: (parent: Parent) => void;
  setGroups: (groups: DriverGroup[]) => void;
  selectGroup: (groupId: string) => void;
  setTrackingData: (data: TrackingData | null) => void;
  markChildAbsent: (childId: string, routeType: 'pickup' | 'dropoff' | 'both', reason?: string, token?: string) => Promise<void>;
  cancelAbsence: (childId: string, token?: string) => Promise<void>;
  updateDriverLocation: (groupId: string, location: Location) => void;
  updateStopStatus: (childId: string, status: StopStatusUpdate) => void;
  updateEta: (childId: string, eta: EtaUpdate) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (notificationId: string) => void;
  refreshDashboard: (token?: string) => Promise<void>;
  startTracking: (groupId: string, childId?: string, token?: string) => Promise<void>;
  stopTracking: () => void;
}

export type TripStatusType = TripStatus['status'];
export type RouteType = 'pickup' | 'dropoff';
export type NotificationType = Notification['type'];
