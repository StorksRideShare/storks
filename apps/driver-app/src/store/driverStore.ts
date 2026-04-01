import { create } from 'zustand';
import { DriverState, Route, RouteStop, LocationWithDetails, NavigationRoute } from '../types';
import { driverApi } from '../services/api';

export const useDriverStore = create<DriverState>((set, get) => ({
  driver: null,
  currentRoute: null,
  currentLocation: null,
  nextStop: null,
  navigationRoute: null,
  isNavigating: false,
  isTrackingLocation: false,

  setDriver: (driver) => set({ driver }),

  setCurrentRoute: (route) => {
    const nextStop = route.stops.find(
      (stop) => stop.status === 'pending' || stop.status === 'en_route'
    ) || null;
    
    set({ 
      currentRoute: route,
      nextStop,
    });
  },

  updateLocation: (location) => set({ currentLocation: location }),

  setNextStop: (stop) => set({ nextStop: stop }),

  setNavigationRoute: (route) => set({ navigationRoute: route }),

  startNavigation: () => set({ isNavigating: true }),

  stopNavigation: () => set({ isNavigating: false, navigationRoute: null }),

  startLocationTracking: () => set({ isTrackingLocation: true }),

  stopLocationTracking: () => set({ isTrackingLocation: false }),

  verifyStop: async (stopId, pin) => {
    const result = await driverApi.verifyPickup(stopId, pin);
    
    if (result.success) {
      get().completeStop(stopId);
      get().moveToNextStop();
    }
    
    return result.success;
  },

  skipStop: async (stopId, reason) => {
    await driverApi.skipStop(stopId, reason);
    
    const { currentRoute } = get();
    if (!currentRoute) return;

    const updatedStops = currentRoute.stops.map((stop) =>
      stop.id === stopId
        ? { ...stop, status: 'skipped' as const }
        : stop
    );

    set({
      currentRoute: {
        ...currentRoute,
        stops: updatedStops,
      },
    });

    get().moveToNextStop();
  },

  completeStop: (stopId) => {
    const { currentRoute } = get();
    if (!currentRoute) return;

    const updatedStops = currentRoute.stops.map((stop) =>
      stop.id === stopId
        ? {
            ...stop,
            status: 'completed' as const,
            actualTime: new Date(),
            verificationStatus: true,
            verificationTime: new Date(),
          }
        : stop
    );

    set({
      currentRoute: {
        ...currentRoute,
        stops: updatedStops,
      },
    });
  },

  moveToNextStop: () => {
    const { currentRoute } = get();
    if (!currentRoute) return;

    const nextStop = currentRoute.stops.find(
      (stop) => stop.status === 'pending'
    ) || null;

    set({ 
      nextStop,
      isNavigating: false,
      navigationRoute: null,
    });

    // If no more stops, mark route as completed
    if (!nextStop) {
      const allCompleted = currentRoute.stops.every(
        (stop) => stop.status === 'completed' || stop.status === 'skipped' || stop.status === 'absent'
      );

      if (allCompleted) {
        set({
          currentRoute: {
            ...currentRoute,
            status: 'completed',
            completedAt: new Date(),
          },
        });
      }
    }
  },
}));
