import { create } from 'zustand';
import { ParentState, DriverGroup, TrackingData, Notification, Location, StopStatusUpdate, EtaUpdate } from '../types';
import { parentApi } from '../services/api';

export const useParentStore = create<ParentState>((set, get) => ({
  parent: null,
  groups: [],
  selectedGroup: null,
  trackingData: null,
  notifications: [],
  isLoadingGroups: false,
  isLoadingTracking: false,

  setParent: (parent) => set({ parent }),

  setGroups: (groups) => set({ groups }),

  selectGroup: (groupId) => {
    const group = get().groups.find((g) => g.id === groupId) || null;
    set({ selectedGroup: group });
  },

  setTrackingData: (data) => set({ trackingData: data }),

  markChildAbsent: async (childId, routeType, reason, token) => {
    const { groups } = get();
    
    // Update local state immediately for optimistic UI
    const updatedGroups = groups.map((group) => ({
      ...group,
      children: group.children.map((child) =>
        child.id === childId
          ? {
              ...child,
              isAbsent: true,
              todayPickup: routeType === 'pickup' || routeType === 'both'
                ? { ...child.todayPickup, status: 'absent' as const }
                : child.todayPickup,
              todayDropoff: routeType === 'dropoff' || routeType === 'both'
                ? { ...child.todayDropoff, status: 'absent' as const }
                : child.todayDropoff,
            }
          : child
      ),
    }));

    set({ groups: updatedGroups });

    // Make API call
    try {
      await parentApi.markChildAbsent(childId, routeType, reason, token);
    } catch (error) {
      console.error('Failed to mark child absent:', error);
      // Revert on error
      set({ groups });
    }
  },

  cancelAbsence: async (childId, token) => {
    const { groups } = get();
    
    // Update local state immediately
    const updatedGroups = groups.map((group) => ({
      ...group,
      children: group.children.map((child) =>
        child.id === childId
          ? {
              ...child,
              isAbsent: false,
              todayPickup: { ...child.todayPickup, status: 'pending' as const },
              todayDropoff: { ...child.todayDropoff, status: 'pending' as const },
            }
          : child
      ),
    }));

    set({ groups: updatedGroups });

    // Make API call
    try {
      await parentApi.cancelAbsence(childId, token);
    } catch (error) {
      console.error('Failed to cancel absence:', error);
      // Revert on error
      set({ groups });
    }
  },

  updateDriverLocation: (groupId, location) => {
    const { groups, trackingData } = get();

    // Update driver location in groups
    const updatedGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            driver: {
              ...group.driver,
              currentLocation: location,
              lastLocationUpdate: new Date(),
            },
          }
        : group
    );

    set({ groups: updatedGroups });

    // Update tracking data if tracking this group
    if (trackingData && trackingData.group.id === groupId) {
      set({
        trackingData: {
          ...trackingData,
          driverLocation: location,
        },
      });
    }
  },

  updateStopStatus: (childId, status) => {
    const { groups } = get();

    const updatedGroups = groups.map((group) => ({
      ...group,
      children: group.children.map((child) =>
        child.id === childId
          ? {
              ...child,
              todayPickup: status.routeType === 'pickup'
                ? {
                    ...child.todayPickup,
                    status: status.status,
                    actualTime: status.actualTime,
                  }
                : child.todayPickup,
              todayDropoff: status.routeType === 'dropoff'
                ? {
                    ...child.todayDropoff,
                    status: status.status,
                    actualTime: status.actualTime,
                  }
                : child.todayDropoff,
            }
          : child
      ),
    }));

    set({ groups: updatedGroups });
  },

  updateEta: (childId, eta) => {
    const { groups } = get();

    const updatedGroups = groups.map((group) => ({
      ...group,
      children: group.children.map((child) =>
        child.id === childId
          ? {
              ...child,
              todayPickup: {
                ...child.todayPickup,
                etaMinutes: eta.etaMinutes,
              },
            }
          : child
      ),
    }));

    set({ groups: updatedGroups });
  },

  addNotification: (notification) => {
    const { notifications } = get();
    set({ notifications: [notification, ...notifications] });
  },

  markNotificationRead: (notificationId) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    set({ notifications: updatedNotifications });
  },

  refreshDashboard: async (token) => {
    if (!token) {
      console.warn('refreshDashboard: No token provided');
      return;
    }
    set({ isLoadingGroups: true });
    try {
      const [parent, groups] = await Promise.all([
        parentApi.getParent(token),
        parentApi.getDashboard(token),
      ]);
      set({ parent, groups, isLoadingGroups: false });
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      set({ isLoadingGroups: false });
    }
  },

  startTracking: async (groupId, childId, token) => {
    set({ isLoadingTracking: true });
    try {
      const trackingData = await parentApi.getTrackingData(groupId, childId, token);
      set({ trackingData, isLoadingTracking: false });
    } catch (error) {
      console.error('Failed to start tracking:', error);
      set({ isLoadingTracking: false });
    }
  },

  stopTracking: () => {
    set({ trackingData: null });
  },
}));
