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
  GraduationCap,
  Languages,
  HeartPulse,
  FileText,
  Menu,
  Edit,
  Building2,
  Globe,
  Award,
  Home,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  department: string | null;
  joinDate: string | null;
  salary: string | null;
  photoUrl: string | null;
  skills: string | null;
  experience: string | null;
  education: string | null;
  languages: string | null;
  emergencyContact: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  createdBy: string | null;
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

const ATTENDANCE_CYCLE = ["present", "absent", "late", "half-day"] as const;

const ATTENDANCE_COLORS: Record<string, string> = {
  present: "bg-emerald-500 text-white",
  absent: "bg-red-500 text-white",
  late: "bg-amber-500 text-white",
  "half-day": "bg-blue-500 text-white",
};

const DEPARTMENTS = [
  "Operations",
  "Engineering",
  "HSE",
  "Human Resources",
  "Finance",
  "Maintenance",
  "IT",
  "Administration",
  "Logistics",
  "Quality Control",
];

const NATIONALITIES = [
  "Saudi Arabian", "Egyptian", "Jordanian", "Omani", "Pakistani",
  "Indian", "Filipino", "Bangladeshi", "Yemeni", "Sudanese",
  "Syrian", "Lebanese", "Emirati", "Kuwaiti", "Bahraini",
  "Qatari", "Iraqi", "Moroccan", "Tunisian", "Algerian",
];

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
      // Fetch user data
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
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : (typeof window !== "undefined" && window.innerWidth >= 1024 ? 0 : -280),
        }}
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
      </motion.aside>
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
      <div className="flex items-center gap-3 px-4 py-3">
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

        <div className="flex items-center gap-2">
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
            <Bell className={`h-4 w-4 ${bellAnimating ? "bell-shake" : ""}`} />
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
// EMPLOYEE CARD
// ============================================================

function EmployeeCard({ employee, onAttendanceChange }: { employee: Employee; onAttendanceChange: () => void }) {
  const { setView, setSelectedEmployee, user } = useAppStore();

  const getAttendanceForDay = (daysAgo: number): Attendance | undefined => {
    const dateStr = getDateStr(daysAgo);
    return employee.attendances?.find((a) => a.date === dateStr);
  };

  const handleBadgeClick = async (daysAgo: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = getAttendanceForDay(daysAgo);
    const currentStatus = current?.status || "present";
    const nextIndex = (ATTENDANCE_CYCLE.indexOf(currentStatus as typeof ATTENDANCE_CYCLE[number]) + 1) % ATTENDANCE_CYCLE.length;
    const nextStatus = ATTENDANCE_CYCLE[nextIndex];
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
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        setSelectedEmployee(employee.id);
        setView("employee-detail");
      }}
      className="cursor-pointer"
    >
      <Card className="h-full overflow-hidden border-emerald-200/30 dark:border-emerald-800/30 hover:border-emerald-400/50 dark:hover:border-emerald-600/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0">
              <AvatarFallback className="bg-transparent text-white font-bold">
                {getInitials(employee.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{employee.fullName}</h3>
              <p className="text-xs text-muted-foreground truncate">{employee.position}</p>
              <div className="flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-muted-foreground">{employee.department}</span>
              </div>
            </div>
          </div>

          {/* Attendance badges */}
          <div className="flex gap-2 mt-3">
            {[0, 1, 2].map((daysAgo) => {
              const att = getAttendanceForDay(daysAgo);
              const status = att?.status || "present";
              return (
                <button
                  key={daysAgo}
                  onClick={(e) => handleBadgeClick(daysAgo, e)}
                  className="flex-1 text-center"
                  title={`${getDayLabel(daysAgo)}: ${status}`}
                >
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    {getDayLabel(daysAgo)}
                  </p>
                  <Badge
                    className={`${ATTENDANCE_COLORS[status] || "bg-gray-400 text-white"} text-[10px] px-2 py-0.5 cursor-pointer hover:opacity-90 transition-opacity`}
                  >
                    {status === "present" ? "✓" : status === "absent" ? "✗" : status === "late" ? "⏰" : "½"}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================
// DASHBOARD VIEW
// ============================================================

function DashboardView() {
  const { searchQuery, user, setView, setSelectedEmployee } = useAppStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteEmpId, setDeleteEmpId] = useState("");
  const [deleteReason, setDeleteReason] = useState("");

  const fetchEmployees = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (departmentFilter) params.set("department", departmentFilter);
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
  }, [searchQuery, departmentFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDeleteRequest = async () => {
    if (!deleteEmpId) return;
    const emp = employees.find((e) => e.id === deleteEmpId);
    if (!emp) return;
    try {
      await fetch("/api/delete-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: emp.id,
          employeeName: emp.fullName,
          requestedBy: user?.id,
          reason: deleteReason,
        }),
      });
      toast.success("Delete request submitted for approval");
      setShowDeleteDialog(false);
      setDeleteReason("");
    } catch {
      toast.error("Failed to submit delete request");
    }
  };

  // Stats
  const totalActive = employees.length;
  const deptCounts: Record<string, number> = {};
  employees.forEach((e) => {
    if (e.department) deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Employees", value: totalActive, icon: Users, bgClass: "bg-emerald-100 dark:bg-emerald-900/30", iconClass: "text-emerald-600 dark:text-emerald-400" },
          { label: "Departments", value: Object.keys(deptCounts).length, icon: Building2, bgClass: "bg-teal-100 dark:bg-teal-900/30", iconClass: "text-teal-600 dark:text-teal-400" },
          { label: "Active Today", value: totalActive, icon: CheckCircle2, bgClass: "bg-green-100 dark:bg-green-900/30", iconClass: "text-green-600 dark:text-green-400" },
          { label: "New This Month", value: employees.filter((e) => {
            const d = new Date(e.createdAt);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length, icon: Award, bgClass: "bg-amber-100 dark:bg-amber-900/30", iconClass: "text-amber-600 dark:text-amber-400" },
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={departmentFilter || "all"} onValueChange={(val) => setDepartmentFilter(val === "all" ? "" : val)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEmployees}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Employee grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-emerald-200/30 dark:border-emerald-800/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
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
            {searchQuery || departmentFilter
              ? "Try adjusting your search or filters"
              : "Click 'Add Employee' to get started"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {employees.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <EmployeeCard employee={emp} onAttendanceChange={fetchEmployees} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Request Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Employee Deletion</DialogTitle>
            <DialogDescription>
              This will send a deletion request to the super admin for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason</Label>
              <Textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Provide a reason for deletion..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRequest}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// EMPLOYEE DETAIL VIEW (CV / PROFILE)
// ============================================================

function EmployeeDetailView() {
  const { selectedEmployeeId, setView, user } = useAppStore();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

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

  const InfoRow = ({ icon: Icon, label, value, encrypted }: { icon: React.ElementType; label: string; value: string | null | undefined; encrypted?: boolean }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium flex items-center gap-1">
          {value || "—"}
          {encrypted && <Lock className="h-3 w-3 text-amber-500" />}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" onClick={() => setView("dashboard")} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
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
        </div>
      </div>

      {/* CV Content */}
      <div ref={printRef} className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 bg-white/20 border-4 border-white/30">
              <AvatarFallback className="bg-transparent text-white text-2xl font-bold">
                {getInitials(employee.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{employee.fullName}</h2>
              <p className="text-emerald-100 text-lg">{employee.position}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-emerald-100">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> {employee.department}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> {employee.nationality}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> ID: {employee.employeeId}
                </span>
              </div>
            </div>
          </div>
          {/* Company branding */}
          <div className="mt-4 pt-3 border-t border-white/20 text-xs text-emerald-100">
            Arabian Shield Manpower — Confidential Employee Profile
          </div>
        </div>

        {/* Body sections */}
        <div className="p-6 space-y-6">
          {/* Two column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <Card className="border-emerald-200/30 dark:border-emerald-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-500" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow icon={CalendarDays} label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
                <InfoRow icon={Globe} label="Nationality" value={employee.nationality} />
                <InfoRow icon={Lock} label="Passport Number" value={employee.passportNumber} encrypted />
                <InfoRow icon={Lock} label="ID Number" value={employee.idNumber} encrypted />
                <InfoRow icon={Home} label="Address" value={employee.address} />
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border-emerald-200/30 dark:border-emerald-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow icon={Phone} label="Phone" value={employee.phone} />
                <InfoRow icon={Mail} label="Email" value={employee.email} />
                <InfoRow icon={HeartPulse} label="Emergency Contact" value={employee.emergencyContact} />
              </CardContent>
            </Card>

            {/* Employment Info */}
            <Card className="border-emerald-200/30 dark:border-emerald-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-500" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow icon={Award} label="Employee ID" value={employee.employeeId} />
                <InfoRow icon={Briefcase} label="Position" value={employee.position} />
                <InfoRow icon={Building2} label="Department" value={employee.department} />
                <InfoRow icon={CalendarDays} label="Join Date" value={formatDate(employee.joinDate)} />
                <InfoRow icon={Lock} label="Salary" value={employee.salary ? `SAR ${employee.salary}` : null} encrypted />
              </CardContent>
            </Card>

            {/* Skills & Languages */}
            <Card className="border-emerald-200/30 dark:border-emerald-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-500" />
                  Skills & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee.skills && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {employee.skills.split(",").map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {employee.languages && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Languages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {employee.languages.split(",").map((lang, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          <Languages className="h-3 w-3 mr-1" />
                          {lang.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full-width sections */}
          {employee.experience && (
            <Card className="border-emerald-200/30 dark:border-emerald-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-500" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{employee.experience}</p>
              </CardContent>
            </Card>
          )}

          {employee.education && (
            <Card className="border-emerald-200/30 dark:border-emerald-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-500" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{employee.education}</p>
              </CardContent>
            </Card>
          )}

          {employee.notes && (
            <Card className="border-emerald-200/30 dark:border-emerald-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{employee.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Attendance History */}
          {employee.attendances && employee.attendances.length > 0 && (
            <Card className="border-emerald-200/30 dark:border-emerald-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-emerald-500" />
                  Recent Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {employee.attendances.slice(0, 14).map((att) => (
                    <div key={att.id} className="text-center">
                      <p className="text-[10px] text-muted-foreground">{att.date}</p>
                      <Badge className={`${ATTENDANCE_COLORS[att.status] || ""} text-[10px]`}>
                        {att.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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

  const [form, setForm] = useState({
    employeeId: "",
    fullName: "",
    nationality: "",
    dateOfBirth: "",
    passportNumber: "",
    idNumber: "",
    phone: "",
    email: "",
    position: "",
    department: "",
    joinDate: "",
    salary: "",
    skills: "",
    experience: "",
    education: "",
    languages: "",
    emergencyContact: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (selectedEmployeeId) {
      setLoading(true);
      fetch(`/api/employees/${selectedEmployeeId}`)
        .then((r) => r.json())
        .then((data) => {
          setForm({
            employeeId: data.employeeId || "",
            fullName: data.fullName || "",
            nationality: data.nationality || "",
            dateOfBirth: data.dateOfBirth || "",
            passportNumber: data.passportNumber || "",
            idNumber: data.idNumber || "",
            phone: data.phone || "",
            email: data.email || "",
            position: data.position || "",
            department: data.department || "",
            joinDate: data.joinDate || "",
            salary: data.salary || "",
            skills: data.skills || "",
            experience: data.experience || "",
            education: data.education || "",
            languages: data.languages || "",
            emergencyContact: data.emergencyContact || "",
            address: data.address || "",
            notes: data.notes || "",
          });
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load employee");
          setLoading(false);
        });
    } else {
      // Auto-generate employee ID
      setForm((prev) => ({ ...prev, employeeId: `EMP-${Date.now().toString().slice(-6)}` }));
    }
  }, [selectedEmployeeId]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.fullName) {
      toast.error("Employee ID and Full Name are required");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit ? "/api/employees" : "/api/employees";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit ? { id: selectedEmployeeId, ...form } : form;

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

  const fields: { key: string; label: string; icon: React.ElementType; encrypted?: boolean; type?: string; }[][] = [
    [
      { key: "employeeId", label: "Employee ID", icon: Award },
      { key: "fullName", label: "Full Name", icon: User },
    ],
    [
      { key: "nationality", label: "Nationality", icon: Globe },
      { key: "dateOfBirth", label: "Date of Birth", icon: CalendarDays, type: "date" },
    ],
    [
      { key: "passportNumber", label: "Passport Number", icon: Lock, encrypted: true },
      { key: "idNumber", label: "ID Number", icon: Lock, encrypted: true },
    ],
    [
      { key: "phone", label: "Phone", icon: Phone },
      { key: "email", label: "Email", icon: Mail, type: "email" },
    ],
    [
      { key: "position", label: "Position", icon: Briefcase },
      { key: "department", label: "Department", icon: Building2 },
    ],
    [
      { key: "joinDate", label: "Join Date", icon: CalendarDays, type: "date" },
      { key: "salary", label: "Salary (SAR)", icon: Lock, encrypted: true },
    ],
    [
      { key: "emergencyContact", label: "Emergency Contact", icon: HeartPulse },
      { key: "address", label: "Address", icon: Home },
    ],
  ];

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
            {/* Two-column field rows */}
            {fields.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {row.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <field.icon className="h-3.5 w-3.5 text-emerald-500" />
                      {field.label}
                      {field.encrypted && <Lock className="h-3 w-3 text-amber-500" />}
                    </Label>
                    {field.key === "department" ? (
                      <Select
                        value={form[field.key]}
                        onValueChange={(val) => updateField(field.key, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.key === "nationality" ? (
                      <Select
                        value={form[field.key]}
                        onValueChange={(val) => updateField(field.key, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          {NATIONALITIES.map((n) => (
                            <SelectItem key={n} value={n}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type || "text"}
                        value={form[field.key as keyof typeof form]}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.label}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Skills */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <Award className="h-3.5 w-3.5 text-emerald-500" />
                Skills (comma-separated)
              </Label>
              <Textarea
                value={form.skills}
                onChange={(e) => updateField("skills", e.target.value)}
                placeholder="e.g. Project Management, Leadership, Communication"
                rows={2}
              />
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                Experience
              </Label>
              <Textarea
                value={form.experience}
                onChange={(e) => updateField("experience", e.target.value)}
                placeholder="e.g. 10 years in structural engineering"
                rows={2}
              />
            </div>

            {/* Education */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-500" />
                Education
              </Label>
              <Input
                value={form.education}
                onChange={(e) => updateField("education", e.target.value)}
                placeholder="e.g. BSc Civil Engineering, KFUPM"
              />
            </div>

            {/* Languages */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <Languages className="h-3.5 w-3.5 text-emerald-500" />
                Languages (comma-separated)
              </Label>
              <Input
                value={form.languages}
                onChange={(e) => updateField("languages", e.target.value)}
                placeholder="e.g. Arabic, English"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                Notes
              </Label>
              <Textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
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
        <p className="text-sm text-muted-foreground/70 mt-1">
          Only super admins can manage delete requests
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Delete Requests</h2>
          <p className="text-sm text-muted-foreground">
            Review and manage employee deletion requests
          </p>
        </div>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", ""].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(s);
                setLoading(true);
              }}
              className={statusFilter === s ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <AlertTriangle className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No requests found</h3>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {requests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-emerald-200/30 dark:border-emerald-800/30">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          req.status === "pending"
                            ? "bg-amber-100 dark:bg-amber-900/30"
                            : req.status === "approved"
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}>
                          {req.status === "pending" ? (
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          ) : req.status === "approved" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{req.employeeName}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested {formatDateTime(req.createdAt)}
                          </p>
                          {req.reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Reason: {req.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            req.status === "pending"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : req.status === "approved"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {req.status}
                        </Badge>
                        {req.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-950"
                              onClick={() => handleAction(req.id, "approved")}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-950"
                              onClick={() => handleAction(req.id, "rejected")}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
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
// NOTIFICATIONS VIEW
// ============================================================

function NotificationsView() {
  const { user } = useAppStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
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
      toast.error("Failed to mark notification");
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      await markAsRead(n.id);
    }
    toast.success("All notifications marked as read");
  };

  const typeColors: Record<string, string> = {
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    danger: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  };

  const typeIcons: Record<string, React.ElementType> = {
    info: Bell,
    warning: AlertTriangle,
    success: CheckCircle2,
    danger: XCircle,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Stay updated on important events
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Bell className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No notifications</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            You&apos;re all caught up!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif, i) => {
              const Icon = typeIcons[notif.type] || Bell;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className={`border-emerald-200/30 dark:border-emerald-800/30 cursor-pointer transition-all hover:shadow-md ${
                      !notif.read ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500" : ""
                    }`}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif.id);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[notif.type] || typeColors.info}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{notif.title}</p>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {formatDateTime(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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
  const { user, setDarkMode } = useAppStore();
  const { theme, setTheme } = useTheme();

  const toggleDarkMode = async (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    setDarkMode(checked);
    if (user?.id) {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, darkMode: checked }),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your application preferences
        </p>
      </div>

      <div className="space-y-4 max-w-lg">
        {/* Profile */}
        <Card className="border-emerald-200/30 dark:border-emerald-800/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-500" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-teal-500">
                <AvatarFallback className="bg-transparent text-white font-bold">
                  {getInitials(user?.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 capitalize">
                  {user?.role?.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-emerald-200/30 dark:border-emerald-800/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-emerald-500" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Sun className="h-5 w-5 text-emerald-500" />
                )}
                <div>
                  <p className="font-medium text-sm">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-emerald-200/30 dark:border-emerald-800/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Application:</span> Arabian Shield Manpower Management
            </p>
            <p className="text-sm">
              <span className="font-medium">Version:</span> 1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Secure workforce management with encrypted data storage and role-based access control.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP (with sidebar layout)
// ============================================================

function AppLayout() {
  const { currentView } = useAppStore();

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
              {currentView === "dashboard" && <DashboardView />}
              {currentView === "employee-detail" && <EmployeeDetailView />}
              {currentView === "employee-form" && <EmployeeFormView />}
              {currentView === "delete-requests" && <DeleteRequestsView />}
              {currentView === "notifications" && <NotificationsView />}
              {currentView === "settings" && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// PAGE EXPORT
// ============================================================

export default function ASMPage() {
  const { currentView } = useAppStore();

  if (currentView === "login") {
    return <LoginView />;
  }

  return <AppLayout />;
}
