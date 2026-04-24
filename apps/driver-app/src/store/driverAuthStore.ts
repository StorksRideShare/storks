import { create } from "zustand";
import { DriverProfile, AuthStatus } from "../services/api";

export interface DriverAuthStoreState {
  driverProfile: DriverProfile | null;
  authStatus: AuthStatus | null;
  isLoading: boolean;
  
  setDriverProfile: (profile: DriverProfile | null) => void;
  setAuthStatus: (status: AuthStatus | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useDriverAuthStore = create<DriverAuthStoreState>((set) => ({
  driverProfile: null,
  authStatus: null,
  isLoading: false,

  setDriverProfile: (profile) => set({ driverProfile: profile }),
  setAuthStatus: (status) => set({ authStatus: status }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
