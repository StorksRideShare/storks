import { DriverGroup, ChildWithStatus, TrackingData, Parent, AbsenceReport, Location } from '../types';

// Mock parent data
const MOCK_PARENT: Parent = {
  id: 'parent-1',
  fullName: 'Janaka Perera',
  email: 'janaka@example.com',
  phone: '+94771234567',
};

// Mock groups with children (matching UI designs)
const MOCK_GROUPS: DriverGroup[] = [
  {
    id: 'group-1',
    groupName: 'Vhooti putha',
    groupCode: 'ABC 1223',
    parentId: 'parent-1',
    driver: {
      id: 'driver-1',
      fullName: 'Ranidu Sampath',
      phone: '+94771234567',
      vehicleNumber: 'ABC-1223',
      vehicleModel: 'Honda Caravan',
      currentLocation: { latitude: 6.9271, longitude: 79.8612 },
      lastLocationUpdate: new Date(),
    },
    children: [
      {
        id: 'child-1',
        firstName: 'Vihanga',
        lastName: 'Janaka',
        grade: 'Grade 5',
        schoolName: 'Ananda College',
        pickupAddress: 'Ananda College - Colombo',
        pickupLocation: { latitude: 6.9271, longitude: 79.8612 },
        dropoffAddress: '12/B, Maple Road, Maharagama',
        dropoffLocation: { latitude: 6.9067, longitude: 79.8707 },
        verificationPin: '123456',
        isActive: true,
        isAbsent: false,
        todayPickup: {
          status: 'en_route',
          estimatedTime: '07:15',
          etaMinutes: 8,
        },
        todayDropoff: {
          status: 'pending',
          estimatedTime: '15:30',
        },
      },
    ],
  },
  {
    id: 'group-2',
    groupName: 'Loku',
    groupCode: 'VB 1223',
    parentId: 'parent-1',
    driver: {
      id: 'driver-2',
      fullName: 'Malith Vihanga',
      phone: '+94772345678',
      vehicleNumber: 'VB-1223',
      vehicleModel: 'Toyota HiAce',
      currentLocation: { latitude: 6.8728, longitude: 79.8912 },
      lastLocationUpdate: new Date(),
    },
    children: [
      {
        id: 'child-2',
        firstName: 'Sadun',
        lastName: 'Janaka',
        grade: 'Grade 8',
        schoolName: "President's College",
        pickupAddress: "President's college - Maharagama",
        pickupLocation: { latitude: 6.8456, longitude: 79.9242 },
        dropoffAddress: '25/A, Lake Road, Nugegoda',
        dropoffLocation: { latitude: 6.8728, longitude: 79.8912 },
        verificationPin: '654321',
        isActive: true,
        isAbsent: false,
        todayPickup: {
          status: 'completed',
          estimatedTime: '07:15',
          actualTime: new Date('2026-03-31T07:15:00'),
        },
        todayDropoff: {
          status: 'pending',
          estimatedTime: '15:30',
        },
      },
      {
        id: 'child-3',
        firstName: 'Kanchana',
        lastName: 'Janaka',
        grade: 'Grade 3',
        schoolName: 'Vidyakara Balika',
        pickupAddress: 'Vidyakara Balika - Maharagama',
        pickupLocation: { latitude: 6.8500, longitude: 79.9200 },
        dropoffAddress: '25/A, Lake Road, Nugegoda',
        dropoffLocation: { latitude: 6.8728, longitude: 79.8912 },
        verificationPin: '789012',
        isActive: true,
        isAbsent: true,
        todayPickup: {
          status: 'absent',
          estimatedTime: '07:15',
        },
        todayDropoff: {
          status: 'absent',
          estimatedTime: '15:30',
        },
      },
    ],
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const parentApi = {
  async getParent(): Promise<Parent> {
    await delay(300);
    return MOCK_PARENT;
  },

  async getDashboard(): Promise<DriverGroup[]> {
    await delay(600);
    return MOCK_GROUPS;
  },

  async getGroup(groupId: string): Promise<DriverGroup | null> {
    await delay(400);
    return MOCK_GROUPS.find(g => g.id === groupId) || null;
  },

  async getTrackingData(groupId: string, childId?: string): Promise<TrackingData | null> {
    await delay(500);
    
    const group = MOCK_GROUPS.find(g => g.id === groupId);
    if (!group) return null;

    const currentChild = childId 
      ? group.children.find(c => c.id === childId)
      : group.children.find(c => c.todayPickup.status === 'en_route' || c.todayPickup.status === 'arrived');

    // Mock route polyline
    const mockPolyline = 'w{ayA_xrzMnA~@fApAfBrBhCtCdDhDfEjE';

    return {
      group,
      driverLocation: group.driver.currentLocation || { latitude: 0, longitude: 0 },
      routePolyline: mockPolyline,
      etaMinutes: currentChild?.todayPickup.etaMinutes || 5,
      estimatedArrival: new Date(Date.now() + (currentChild?.todayPickup.etaMinutes || 5) * 60 * 1000),
      currentChild,
    };
  },

  async markChildAbsent(
    childId: string,
    routeType: 'pickup' | 'dropoff',
    reason?: string
  ): Promise<AbsenceReport> {
    await delay(400);
    
    return {
      id: `absence-${Date.now()}`,
      childId,
      absenceDate: new Date().toISOString().split('T')[0],
      routeType,
      reason,
      reportedAt: new Date(),
    };
  },

  async cancelAbsence(childId: string): Promise<void> {
    await delay(300);
    console.log(`Absence cancelled for child: ${childId}`);
  },

  async updateDriverLocation(groupId: string, location: Location): Promise<void> {
    await delay(100);
    // Mock update
  },
};

// Export mock data for use in stores
export { MOCK_PARENT, MOCK_GROUPS };
