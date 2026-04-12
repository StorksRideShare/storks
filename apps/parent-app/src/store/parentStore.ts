import { create } from "zustand";
import type {
  ParentProfile,
  DriverGroup,
  ChildProfile,
  TripStatus,
} from "@/utils/api";

// ─────────────────────────────────────────────────────────────────────────────
// Pure state store — NO API calls, NO tokens.
// Data is populated by the useParentDashboard() hook.
// ─────────────────────────────────────────────────────────────────────────────

export interface ParentStoreState {
  // Data
  parent: ParentProfile | null;
  groups: DriverGroup[];
  selectedGroupId: string | null;

  // Loading flags (set by hooks, consumed by screens)
  isLoadingGroups: boolean;

  // Actions — pure state mutations only
  setParent: (parent: ParentProfile | null) => void;
  setGroups: (groups: DriverGroup[]) => void;
  setSelectedGroupId: (id: string | null) => void;
  setIsLoadingGroups: (loading: boolean) => void;

  // Optimistic updates (called before API confirmation; reverted on error)
  optimisticallyMarkAbsent: (
    childId: string,
    routeType: "pickup" | "dropoff" | "both"
  ) => DriverGroup[];
  revertGroups: (previous: DriverGroup[]) => void;

  // Derived selectors
  getSelectedGroup: () => DriverGroup | null;
  getChildById: (childId: string) => ChildProfile | null;
}

export const useParentStore = create<ParentStoreState>((set, get) => ({
  parent: null,
  groups: [],
  selectedGroupId: null,
  isLoadingGroups: false,

  setParent: (parent) => set({ parent }),
  setGroups: (groups) => set({ groups }),
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),
  setIsLoadingGroups: (loading) => set({ isLoadingGroups: loading }),

  optimisticallyMarkAbsent: (childId, routeType) => {
    const { groups } = get();
    // Return the snapshot for rollback
    const snapshot = groups;

    const absentStatus: TripStatus = {
      status: "absent",
      estimatedTime: "--:--",
    };

    const updated = groups.map((group) => ({
      ...group,
      children: group.children.map((child) => {
        if (child.id !== childId) return child;
        return {
          ...child,
          isAbsent: true,
          todayPickup:
            routeType === "pickup" || routeType === "both"
              ? absentStatus
              : child.todayPickup,
          todayDropoff:
            routeType === "dropoff" || routeType === "both"
              ? absentStatus
              : child.todayDropoff,
        };
      }),
    }));

    set({ groups: updated });
    return snapshot;
  },

  revertGroups: (previous) => set({ groups: previous }),

  getSelectedGroup: () => {
    const { groups, selectedGroupId } = get();
    return groups.find((g) => g.id === selectedGroupId) ?? null;
  },

  getChildById: (childId) => {
    const { groups } = get();
    for (const group of groups) {
      const child = group.children.find((c) => c.id === childId);
      if (child) return child;
    }
    return null;
  },
}));
