import { create } from "zustand";

export type ViewType =
  | "login"
  | "dashboard"
  | "employee-detail"
  | "employee-form"
  | "delete-requests"
  | "notifications"
  | "settings";

interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  darkMode: boolean;
}

interface AppState {
  currentView: ViewType;
  selectedEmployeeId: string | null;
  searchQuery: string;
  darkMode: boolean;
  user: AppUser | null;
  sidebarOpen: boolean;
  pendingDeleteRequestId: string | null;
  pendingDeleteEmployeeId: string | null;

  setView: (view: ViewType) => void;
  setSelectedEmployee: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setDarkMode: (dark: boolean) => void;
  setUser: (user: AppUser | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setPendingDeleteRequest: (requestId: string | null, employeeId: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentView: "login" as ViewType,
  selectedEmployeeId: null as string | null,
  searchQuery: "",
  darkMode: false,
  user: null as AppUser | null,
  sidebarOpen: false,
  pendingDeleteRequestId: null as string | null,
  pendingDeleteEmployeeId: null as string | null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setView: (view) => set({ currentView: view, sidebarOpen: false }),
  setSelectedEmployee: (id) => set({ selectedEmployeeId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDarkMode: (dark) => set({ darkMode: dark }),
  setUser: (user) => set({ user }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setPendingDeleteRequest: (requestId, employeeId) =>
    set({ pendingDeleteRequestId: requestId, pendingDeleteEmployeeId: employeeId }),
  reset: () => set(initialState),
}));
