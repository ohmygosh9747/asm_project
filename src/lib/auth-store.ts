import { create } from "zustand";

export type AppView = "login" | "signup" | "dashboard";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  currentView: AppView;
  hasUsers: boolean | null; // null = not checked yet
  setUser: (user: AuthUser | null) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentView: (view: AppView) => void;
  setHasUsers: (has: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  currentView: "login",
  hasUsers: null,
  setUser: (user) => set({ user, isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setCurrentView: (currentView) => set({ currentView }),
  setHasUsers: (hasUsers) => set({ hasUsers }),
  logout: () => set({ user: null, currentView: "login", isLoading: false }),
}));
