"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/auth-store";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Shield } from "lucide-react";

export default function Home() {
  const { user, isLoading, currentView, setUser, setIsLoading, setCurrentView, setHasUsers } =
    useAuthStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const res = await fetch("/api/auth/check-users");
        const data = await res.json();
        setHasUsers(data.hasUsers);
      } catch {
        setHasUsers(true);
      }
    };
    checkUsers();
  }, [setHasUsers]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
        id: (session.user as { id: string }).id,
        email: session.user.email!,
        name: session.user.name,
        role: (session.user as { role: string }).role,
      });
      setCurrentView("dashboard");
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status, setUser, setCurrentView, setIsLoading]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-700">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-spin rounded-full bg-emerald-400" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 animate-spin rounded-full bg-teal-400" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 animate-spin rounded-full bg-emerald-300" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm text-emerald-200">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && currentView === "dashboard") {
    return <Dashboard />;
  }

  if (currentView === "signup") {
    return <SignupForm />;
  }

  return <LoginForm />;
}
