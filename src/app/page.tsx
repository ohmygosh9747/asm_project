"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type ViewType } from "@/lib/store";
import {
  LayoutDashboard,
  Users,
  Bell,
  Shield,
  Settings,
  LogOut,
  Search,
  Plus,
  ChevronLeft,
  Moon,
  Sun,
  Printer,
  Download,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Briefcase,
  Phone,
  Mail,
  CalendarDays,
  Menu,
  Edit,
  Building2,
  Globe,
  Award,
  HomeIcon,
  RefreshCw,
  Star,
  Camera,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ============================================================
// TYPES
// ============================================================

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  nationality: string | null;
  dateOfBirth: string | null;
  passportNumber: string | null;
  idNumber: string | null;
  phone: string | null;
  email: string | null;
  position: string | null;
  joinDate: string | null;
  photoUrl: string | null;
  emergencyContact: string | null;
  address: string | null;
  status: string;
  createdBy: string | null;
  rating: number;
  companyName: string | null;
  passportStatus: string | null;
  idStatus: string | null;
  createdAt: string;
  updatedAt: string;
  attendances: Attendance[];
}

interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: string;
  markedBy: string | null;
  createdAt: string;
  employee?: { fullName: string; employeeId: string };
}

interface DeleteRequestItem {
  id: string;
  employeeId: string;
  employeeName: string;
  requestedBy: string;
  reason: string | null;
  status: string;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const NATIONALITIES = [
  "Nigerian", "Ghanaian", "Kenyan", "Ugandan", "Tanzanian",
  "Ethiopian", "Rwandan", "South African", "Egyptian", "Moroccan",
  "Sudanese", "Senegalese", "Cameroonian", "Zimbabwean", "Mozambican",
  "Malagasy", "Zambian", "Angolan", "Algerian", "Tunisian",
  "Congolese", "Somali", "Ivorian", "Malian", "Burkinabe",
  "Indian", "Bangladeshi",
];

const STATUS_OPTIONS = ["Valid", "Expired", "Pending", "N/A"];

// ============================================================
// HELPERS
// ============================================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatDateCV(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr + "T00:00:00");
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function getDayLabel(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

// Star rating component
function StarRating({
  rating,
  size = 14,
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform ${interactive ? "hover:scale-110" : ""}`}
        >
          <Star
            size={size}
            className={
              star <= displayRating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
            }
          />
        </button>
      ))}
    </div>
  );
}

// ============================================================
// LOGIN VIEW
// ============================================================

function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser, setView, setDarkMode } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid credentials. Please try again.");
        return;
      }
      const res = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setDarkMode(userData.darkMode);
        setView("dashboard");
        toast.success("Welcome back!");
      } else {
        toast.error("Failed to fetch user data");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-700 p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-400/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Arabian Shield Manpower
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Private Management Portal
              </p>
            </motion.div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
            >
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                Demo Credentials
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">
                Super Admin: superadmin@asm.com / admin123
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">
                Admin: admin@asm.com / admin123
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================

function Sidebar() {
  const { currentView, setView, user, sidebarOpen, setSidebarOpen } = useAppStore();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" as ViewType },
    { icon: Bell, label: "Notifications", view: "notifications" as ViewType },
    ...(user?.role === "super_admin"
      ? [{ icon: Shield, label: "Delete Requests", view: "delete-requests" as ViewType }]
      : []),
    { icon: Settings, label: "Settings", view: "settings" as ViewType },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50 h-full w-64
          bg-white dark:bg-slate-900 border-r border-emerald-200/50 dark:border-emerald-800/50
          flex flex-col shadow-lg lg:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          transition-transform duration-300
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-emerald-200/30 dark:border-emerald-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ASM
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Arabian Shield Manpower
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <motion.button
              key={item.view}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView(item.view)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  currentView === item.view
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shadow-sm"
                    : "text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-foreground"
                }
              `}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </motion.button>
          ))}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-emerald-200/30 dark:border-emerald-800/30">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-teal-500">
              <AvatarFallback className="bg-transparent text-white text-xs font-bold">
                {getInitials(user?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================
// HEADER
// ============================================================

function Header() {
  const { searchQuery, setSearchQuery, setView, user, setSidebarOpen } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [bellAnimating, setBellAnimating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/notifications?userId=${user.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch(() => {});
    }
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleDarkMode = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (user?.id) {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, darkMode: newTheme === "dark" }),
      });
    }
  };

  const handleNotifClick = () => {
    setBellAnimating(true);
    setTimeout(() => setBellAnimating(false), 800);
    setView("notifications");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-emerald-200/30 dark:border-emerald-800/30">
      <div className="flex items-center px-4 py-3">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/30 dark:border-emerald-800/30"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right-side actions */}
        <div className="flex items-center gap-2 ml-6">
          {/* Dark mode toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="relative">
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <Sun className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Moon className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" onClick={handleNotifClick} className="relative">
            <Bell className={`h-4 w-4 ${bellAnimating ? "animate-bounce" : ""}`} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut({ redirect: false });
              useAppStore.getState().reset();
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// EMPLOYEE ROW (for Dashboard table)
// ============================================================

function EmployeeRow({
  employee,
  onAttendanceChange,
}: {
  employee: Employee;
  onAttendanceChange: () => void;
}) {
  const { setView, setSelectedEmployee, user } = useAppStore();

  const getAttendanceForDay = (daysAgo: number): Attendance | undefined => {
    const dateStr = getDateStr(daysAgo);
    return employee.attendances?.find((a) => a.date === dateStr);
  };

  const handleAttendanceClick = async (daysAgo: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = getAttendanceForDay(daysAgo);
    const currentStatus = current?.status || "present";
    const nextStatus = currentStatus === "present" ? "absent" : "present";
    const dateStr = getDateStr(daysAgo);

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          date: dateStr,
          status: nextStatus,
          markedBy: user?.name || "System",
        }),
      });
      onAttendanceChange();
    } catch {
      toast.error("Failed to update attendance");
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
    >
      {/* Photo */}
      <td className="px-4 py-3">
        <Avatar className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-teal-500">
          {employee.photoUrl && (
            <AvatarImage src={employee.photoUrl} alt={employee.fullName} />
          )}
          <AvatarFallback className="bg-transparent text-white text-xs font-bold">
            {getInitials(employee.fullName)}
          </AvatarFallback>
        </Avatar>
      </td>

      {/* Name & Rating */}
      <td className="px-4 py-3">
        <p className="font-semibold text-sm truncate max-w-[180px]">{employee.fullName}</p>
        <StarRating rating={employee.rating} size={14} />
      </td>

      {/* 3-day attendance */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {[0, 1, 2].map((daysAgo) => {
            const att = getAttendanceForDay(daysAgo);
            const status = att?.status || "present";
            const isPresent = status === "present";
            return (
              <button
                key={daysAgo}
                onClick={(e) => handleAttendanceClick(daysAgo, e)}
                className="flex flex-col items-center gap-1 group"
                title={`${getDayLabel(daysAgo)}: ${status} (click to toggle)`}
              >
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                  {getDayLabel(daysAgo)}
                </span>
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${
                    isPresent
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {isPresent ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </td>

      {/* Position */}
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground truncate block max-w-[150px]">
          {employee.position || "—"}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => {
            setSelectedEmployee(employee.id);
            setView("employee-detail");
          }}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
      </td>
    </motion.tr>
  );
}

// ============================================================
// DASHBOARD VIEW — ROW-BASED LAYOUT
// ============================================================

function DashboardView() {
  const { searchQuery, user, setView, setSelectedEmployee } = useAppStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      params.set("status", "active");
      const res = await fetch(`/api/employees?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Stats
  const todayStr = getDateStr(0);
  const presentToday = employees.filter((e) => {
    const todayAtt = e.attendances?.find((a) => a.date === todayStr);
    return todayAtt?.status === "present" || !todayAtt;
  }).length;
  const absentToday = employees.filter((e) => {
    const todayAtt = e.attendances?.find((a) => a.date === todayStr);
    return todayAtt?.status === "absent";
  }).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Employee Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Manage your workforce effectively
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedEmployee(null);
            setView("employee-form");
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Employees", value: employees.length, icon: Users, bgClass: "bg-emerald-100 dark:bg-emerald-900/30", iconClass: "text-emerald-600 dark:text-emerald-400" },
          { label: "Present Today", value: presentToday, icon: CheckCircle2, bgClass: "bg-green-100 dark:bg-green-900/30", iconClass: "text-green-600 dark:text-green-400" },
          { label: "Absent Today", value: absentToday, icon: XCircle, bgClass: "bg-red-100 dark:bg-red-900/30", iconClass: "text-red-600 dark:text-red-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-emerald-200/30 dark:border-emerald-800/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.bgClass} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconClass}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchEmployees}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Employee table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No employees found</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {searchQuery
              ? "Try adjusting your search"
              : "Click 'Add Employee' to get started"}
          </p>
        </motion.div>
      ) : (
        <Card className="border-emerald-200/30 dark:border-emerald-800/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Photo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name & Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Attendance (3 days)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Position</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {employees.map((emp) => (
                    <EmployeeRow
                      key={emp.id}
                      employee={emp}
                      onAttendanceChange={fetchEmployees}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// EMPLOYEE DETAIL VIEW (CV / PROFILE)
// ============================================================

function EmployeeDetailView() {
  const { selectedEmployeeId, setView, user, pendingDeleteRequestId, pendingDeleteEmployeeId, setPendingDeleteRequest } = useAppStore();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Determine if we're in "review delete request" mode (Super Admin came from notification)
  const isReviewingDelete = user?.role === "super_admin" &&
    !!pendingDeleteRequestId &&
    pendingDeleteEmployeeId === selectedEmployeeId;

  useEffect(() => {
    if (!selectedEmployeeId) return;
    fetch(`/api/employees/${selectedEmployeeId}`)
      .then((r) => r.json())
      .then((data) => {
        setEmployee(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load employee");
        setLoading(false);
      });
  }, [selectedEmployeeId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !employee) return;
    try {
      toast.info("Generating PDF...");
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${employee.fullName.replace(/\s+/g, "_")}_CV.pdf`);
      toast.success("PDF downloaded successfully");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-16">
        <p>Employee not found</p>
        <Button onClick={() => setView("dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const statusBadge = (status: string | null) => {
    if (!status || status === "N/A") return <Badge variant="outline" className="text-xs">N/A</Badge>;
    if (status === "Valid") return <Badge className="bg-emerald-500 text-white text-xs">Valid</Badge>;
    if (status === "Expired") return <Badge className="bg-red-500 text-white text-xs">Expired</Badge>;
    if (status === "Pending") return <Badge className="bg-amber-500 text-white text-xs">Pending</Badge>;
    return <Badge variant="outline" className="text-xs">{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" onClick={() => {
          setPendingDeleteRequest(null, null);
          setView("dashboard");
        }} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {isReviewingDelete ? (
          /* Super Admin reviewing a delete request — show Confirm Delete + Reject */
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={async () => {
                if (!employee || !pendingDeleteRequestId) return;
                setDeleting(true);
                try {
                  // Approve the delete request → soft-delete employee
                  const res = await fetch("/api/delete-requests", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: pendingDeleteRequestId,
                      status: "approved",
                      reviewedBy: user?.id,
                    }),
                  });
                  if (res.ok) {
                    toast.success(`"${employee.fullName}" has been deleted`);
                    setPendingDeleteRequest(null, null);
                    setView("dashboard");
                  } else {
                    toast.error("Failed to confirm deletion");
                  }
                } catch {
                  toast.error("Failed to confirm deletion");
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              Confirm Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={async () => {
                if (!pendingDeleteRequestId) return;
                setDeleting(true);
                try {
                  const res = await fetch("/api/delete-requests", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: pendingDeleteRequestId,
                      status: "rejected",
                      reviewedBy: user?.id,
                    }),
                  });
                  if (res.ok) {
                    toast.success("Deletion request rejected");
                    setPendingDeleteRequest(null, null);
                    setView("dashboard");
                  } else {
                    toast.error("Failed to reject request");
                  }
                } catch {
                  toast.error("Failed to reject request");
                } finally {
                  setDeleting(false);
                }
              }}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        ) : (
          /* Normal mode — show Edit, Print, PDF, Delete */
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              useAppStore.getState().setSelectedEmployee(employee.id);
              setView("employee-form");
            }}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button size="sm" onClick={handleDownloadPDF} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {user?.role === "super_admin" ? "Delete Employee" : "Request Deletion"}
            </DialogTitle>
            <DialogDescription>
              {user?.role === "super_admin"
                ? `Are you sure you want to permanently delete "${employee?.fullName}"? This action cannot be undone.`
                : `Your request to delete "${employee?.fullName}" will be sent to the Super Admin for approval. The employee will only be removed after approval.`}
            </DialogDescription>
          </DialogHeader>
          {user?.role === "admin" && (
            <div className="py-2">
              <Label htmlFor="delete-reason" className="text-sm font-medium">
                Reason for deletion
              </Label>
              <Textarea
                id="delete-reason"
                placeholder="Enter reason for requesting deletion..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={async () => {
                if (!employee) return;
                setDeleting(true);
                try {
                  if (user?.role === "super_admin") {
                    // Super Admin: Directly delete the employee
                    const res = await fetch(`/api/employees/${employee.id}`, {
                      method: "DELETE",
                    });
                    if (res.ok) {
                      toast.success(`"${employee.fullName}" has been deleted permanently`);
                      setDeleteDialogOpen(false);
                      setDeleteReason("");
                      setView("dashboard");
                    } else {
                      toast.error("Failed to delete employee");
                    }
                  } else {
                    // Admin: Create a delete request for Super Admin approval
                    const res = await fetch("/api/delete-requests", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        employeeId: employee.id,
                        employeeName: employee.fullName,
                        requestedBy: user?.id,
                        reason: deleteReason || null,
                      }),
                    });
                    if (res.ok) {
                      toast.success("Deletion request sent to Super Admin for approval");
                      setDeleteDialogOpen(false);
                      setDeleteReason("");
                      setView("dashboard");
                    } else {
                      toast.error("Failed to submit deletion request");
                    }
                  }
                } catch {
                  toast.error(user?.role === "super_admin" ? "Failed to delete employee" : "Failed to submit deletion request");
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              {deleting
                ? "Processing..."
                : user?.role === "super_admin"
                ? "Delete Permanently"
                : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CV Content */}
      <div ref={printRef} className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ASM</h1>
                <p className="text-xs text-emerald-100">Arabian Shield Manpower</p>
              </div>
            </div>

            {/* Center: Title */}
            <div className="text-center">
              <h2 className="text-xl font-bold tracking-wider uppercase">WORKERS PROFILE</h2>
            </div>

            {/* Right: Photo */}
            <Avatar className="h-[120px] w-[120px] rounded-lg bg-white/20 border-4 border-white/30">
              {employee.photoUrl && (
                <AvatarImage src={employee.photoUrl} alt={employee.fullName} className="object-cover" />
              )}
              <AvatarFallback className="bg-transparent text-white text-3xl font-bold">
                {getInitials(employee.fullName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Body sections */}
        <div className="p-6 space-y-6 text-gray-900">
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 mb-3 text-emerald-700">
              <span className="text-emerald-600">&#10003;</span>
              PERSONAL DETAILS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold text-gray-500 min-w-[24px]">1.</span>
                <span className="font-semibold min-w-[110px]">Name :</span>
                <span>{employee.fullName}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-500 min-w-[24px]">2.</span>
                <span className="font-semibold min-w-[110px]">Com. ID :</span>
                <span>{employee.employeeId}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-500 min-w-[24px]">3.</span>
                <span className="font-semibold min-w-[110px] flex items-center gap-1">
                  Passport No :
                  <Lock className="h-3 w-3 text-amber-500" />
                </span>
                <span>{employee.passportNumber || "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-500 min-w-[24px]">4.</span>
                <span className="font-semibold min-w-[110px] flex items-center gap-1">
                  ID. NO :
                  <Lock className="h-3 w-3 text-amber-500" />
                </span>
                <span>{employee.idNumber || "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-500 min-w-[24px]">5.</span>
                <span className="font-semibold min-w-[110px]">Joining Date :</span>
                <span>{formatDateCV(employee.joinDate)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 2: Professional Details */}
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 mb-3 text-emerald-700">
              <span className="text-emerald-600">&#10003;</span>
              PROFESSIONAL DETAILS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold text-gray-500 min-w-[24px]">6.</span>
                <span className="font-semibold min-w-[110px]">Com. Name :</span>
                <span>{employee.companyName || "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-500 min-w-[24px]">7.</span>
                <span className="font-semibold min-w-[110px]">Position :</span>
                <span>{employee.position || "—"}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-500 min-w-[24px]">8.</span>
                <span className="font-semibold min-w-[110px]">Passport Status :</span>
                <span>{statusBadge(employee.passportStatus)}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="font-semibold text-gray-500 min-w-[24px]">9.</span>
                <span className="font-semibold min-w-[110px]">ID. Status :</span>
                <span>{statusBadge(employee.idStatus)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 3: Assessment Grade */}
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 mb-3 text-emerald-700">
              <span className="text-emerald-600">&#10003;</span>
              ASSESSMENT GRADE
            </h3>
            <div className="flex items-center gap-3">
              <StarRating rating={employee.rating} size={20} />
              <span className="text-sm font-semibold text-gray-600">{employee.rating}/5</span>
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 pt-2">
            Arabian Shield Manpower — Confidential Workers Profile
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EMPLOYEE FORM VIEW
// ============================================================

function EmployeeFormView() {
  const { selectedEmployeeId, setView } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = !!selectedEmployeeId;

  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    nationality: "",
    dateOfBirth: "",
    passportNumber: "",
    idNumber: "",
    phone: "",
    email: "",
    position: "",
    joinDate: "",
    companyName: "",
    passportStatus: "",
    idStatus: "",
    rating: 3,
    emergencyContact: "",
    address: "",
    photoUrl: "" as string | null,
  });

  useEffect(() => {
    if (selectedEmployeeId) {
      setLoading(true);
      fetch(`/api/employees/${selectedEmployeeId}`)
        .then((r) => r.json())
        .then((data) => {
          setFormData({
            employeeId: data.employeeId || "",
            fullName: data.fullName || "",
            nationality: data.nationality || "",
            dateOfBirth: data.dateOfBirth || "",
            passportNumber: data.passportNumber || "",
            idNumber: data.idNumber || "",
            phone: data.phone || "",
            email: data.email || "",
            position: data.position || "",
            joinDate: data.joinDate || "",
            companyName: data.companyName || "",
            passportStatus: data.passportStatus || "",
            idStatus: data.idStatus || "",
            rating: data.rating || 3,
            emergencyContact: data.emergencyContact || "",
            address: data.address || "",
            photoUrl: data.photoUrl || null,
          });
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load employee");
          setLoading(false);
        });
    } else {
      setFormData((prev) => ({ ...prev, employeeId: `EMP-${Date.now().toString().slice(-6)}` }));
    }
  }, [selectedEmployeeId]);

  const updateField = (field: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileFormData = new FormData();
    fileFormData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fileFormData });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, photoUrl: data.url }));
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.fullName) {
      toast.error("Employee ID and Full Name are required");
      return;
    }
    setSaving(true);
    try {
      const url = "/api/employees";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit ? { id: selectedEmployeeId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(isEdit ? "Employee updated successfully" : "Employee created successfully");
        setView("dashboard");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save employee");
      }
    } catch {
      toast.error("Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setView(isEdit ? "employee-detail" : "dashboard")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">
            {isEdit ? "Edit Employee" : "Add New Employee"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-emerald-200/30 dark:border-emerald-800/30">
          <CardContent className="p-6 space-y-6">
            {/* Photo upload */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Photo</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 bg-gradient-to-br from-emerald-400 to-teal-500">
                    {formData.photoUrl && (
                      <AvatarImage src={formData.photoUrl} alt="Preview" className="object-cover" />
                    )}
                    <AvatarFallback className="bg-transparent text-white text-xl font-bold">
                      {formData.fullName ? getInitials(formData.fullName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Click the avatar to upload a photo
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee ID */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Award className="h-3.5 w-3.5 text-emerald-500" />
                  Employee ID (Com. ID)
                </Label>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => updateField("employeeId", e.target.value)}
                  placeholder="e.g. EMP-001234"
                  className="w-full"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <User className="h-3.5 w-3.5 text-emerald-500" />
                  Full Name
                </Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Full Name"
                  className="w-full"
                />
              </div>

              {/* Nationality */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  Nationality
                </Label>
                <Select
                  value={formData.nationality || "_none"}
                  onValueChange={(val) => updateField("nationality", val === "_none" ? "" : val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— Select —</SelectItem>
                    {NATIONALITIES.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                  Date of Birth
                </Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Passport Number */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                  Passport Number
                  <Lock className="h-3 w-3 text-amber-500" />
                </Label>
                <Input
                  value={formData.passportNumber}
                  onChange={(e) => updateField("passportNumber", e.target.value)}
                  placeholder="Passport Number"
                  className="w-full"
                />
              </div>

              {/* ID Number */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                  ID Number
                  <Lock className="h-3 w-3 text-amber-500" />
                </Label>
                <Input
                  value={formData.idNumber}
                  onChange={(e) => updateField("idNumber", e.target.value)}
                  placeholder="ID Number"
                  className="w-full"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" />
                  Phone
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Phone"
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Mail className="h-3.5 w-3.5 text-emerald-500" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Email"
                  className="w-full"
                />
              </div>

              {/* Position */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                  Position
                </Label>
                <Input
                  value={formData.position}
                  onChange={(e) => updateField("position", e.target.value)}
                  placeholder="Position"
                  className="w-full"
                />
              </div>

              {/* Join Date */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                  Join Date
                </Label>
                <Input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => updateField("joinDate", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                  Company Name (Com. Name)
                </Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="Company Name"
                  className="w-full"
                />
              </div>

              {/* Passport Status */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  Passport Status
                </Label>
                <Select
                  value={formData.passportStatus || "_none"}
                  onValueChange={(val) => updateField("passportStatus", val === "_none" ? "" : val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— Select —</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ID Status */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  ID Status
                </Label>
                <Select
                  value={formData.idStatus || "_none"}
                  onValueChange={(val) => updateField("idStatus", val === "_none" ? "" : val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— Select —</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating — spans full width */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  Rating
                </Label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={formData.rating}
                    size={24}
                    interactive
                    onChange={(r) => updateField("rating", r)}
                  />
                  <span className="text-sm font-semibold text-muted-foreground">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" />
                  Emergency Contact
                </Label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => updateField("emergencyContact", e.target.value)}
                  placeholder="Emergency Contact"
                  className="w-full"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <HomeIcon className="h-3.5 w-3.5 text-emerald-500" />
                  Address
                </Label>
                <Input
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Address"
                  className="w-full"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setView(isEdit ? "employee-detail" : "dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {saving ? "Saving..." : isEdit ? "Update Employee" : "Create Employee"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

// ============================================================
// DELETE REQUESTS VIEW
// ============================================================

function DeleteRequestsView() {
  const [requests, setRequests] = useState<DeleteRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const { user } = useAppStore();

  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/delete-requests?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch {
      toast.error("Failed to load delete requests");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/delete-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, reviewedBy: user?.id }),
      });
      if (res.ok) {
        toast.success(`Request ${status}`);
        fetchRequests();
      } else {
        toast.error("Failed to update request");
      }
    } catch {
      toast.error("Failed to update request");
    }
  };

  if (user?.role !== "super_admin") {
    return (
      <div className="text-center py-16">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">Access Denied</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">Only super admins can review delete requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Delete Requests</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <Trash2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No delete requests</h3>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card className="border-emerald-200/30 dark:border-emerald-800/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{req.employeeName}</h4>
                          <Badge
                            className={
                              req.status === "pending"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : req.status === "approved"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            }
                          >
                            {req.status}
                          </Badge>
                        </div>
                        {req.reason && (
                          <p className="text-xs text-muted-foreground mt-1">Reason: {req.reason}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(req.createdAt)}</p>
                      </div>
                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(req.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(req.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ============================================================
// NOTIFICATIONS VIEW
// ============================================================

function NotificationsView() {
  const { user, setView, setSelectedEmployee, setPendingDeleteRequest } = useAppStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setNotifications(data);
      }
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) =>
          fetch("/api/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: n.id, read: true }),
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    // Mark as read first
    if (!notif.read) markAsRead(notif.id);

    // Parse the link and navigate accordingly
    if (notif.link) {
      // Format: "employee-detail:EMPLOYEE_ID:delete:REQUEST_ID"
      if (notif.link.startsWith("employee-detail:")) {
        const parts = notif.link.split(":");
        const employeeId = parts[1];
        const action = parts[2]; // "delete" or other actions
        const requestId = parts[3];

        if (employeeId) {
          setSelectedEmployee(employeeId);
          if (action === "delete" && requestId && user?.role === "super_admin") {
            setPendingDeleteRequest(requestId, employeeId);
          }
          setView("employee-detail");
        }
      } else if (notif.link === "delete-requests") {
        setView("delete-requests");
      }
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "danger": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {notifications.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No notifications</h3>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card
                  className={`cursor-pointer transition-colors border-emerald-200/30 dark:border-emerald-800/30 ${
                    !notif.read
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500"
                      : ""
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{typeIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm ${!notif.read ? "font-semibold" : "font-medium"}`}>
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {formatDateTime(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SETTINGS VIEW
// ============================================================

function SettingsView() {
  const { user } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          name,
          darkMode: theme === "dark",
        }),
      });
      if (res.ok) {
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Card className="border-emerald-200/30 dark:border-emerald-800/30">
        <CardHeader>
          <CardTitle className="text-base">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Input value={user?.role?.replace("_", " ") || ""} disabled className="capitalize" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200/30 dark:border-emerald-800/30">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200/30 dark:border-emerald-800/30">
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Arabian Shield Manpower (ASM)</p>
          <p>Private Management Portal v2.0</p>
          <p>Built with Next.js, Prisma, and shadcn/ui</p>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
      >
        {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

function AppLayout() {
  const { currentView } = useAppStore();

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "employee-detail":
        return <EmployeeDetailView />;
      case "employee-form":
        return <EmployeeFormView />;
      case "delete-requests":
        return <DeleteRequestsView />;
      case "notifications":
        return <NotificationsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  // ASM - Arabian Shield Manpower
  const { currentView } = useAppStore();

  if (currentView === "login") {
    return <LoginView />;
  }

  return <AppLayout />;
}
