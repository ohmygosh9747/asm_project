"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type ViewType, type WarningItem, type FineItem } from "@/lib/store";
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
  Pencil,
  Building2,
  Globe,
  Award,
  HomeIcon,
  RefreshCw,
  Star,
  Camera,
  Eye,
  Trash2,
  MinusCircle,
  DollarSign,
  Banknote,
  FileWarning,
  FileX,
  X,
  MessageCircle,
  FileText,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  dayName: string | null;
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

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function getDayNameFromDateStr(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "Unknown";
  const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  return DAY_NAMES[d.getDay()];
}

function getDayLabel(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

// Star rating component with partial fill support
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
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.min(100, Math.max(0, (displayRating - (star - 1)) * 100));
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform ${interactive ? "hover:scale-110" : ""}`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`star-fill-${star}-${size}`}>
                  <stop offset={`${fillPercent}%`} stopColor="#fbbf24" />
                  <stop offset={`${fillPercent}%`} stopColor={fillPercent > 0 ? "#d1d5db" : "#e5e7eb"} />
                </linearGradient>
              </defs>
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={`url(#star-fill-${star}-${size})`}
                stroke={fillPercent > 0 ? "#fbbf24" : "#d1d5db"}
                strokeWidth="0.5"
              />
            </svg>
          </button>
        );
      })}
      <span className="text-[10px] font-semibold text-muted-foreground ml-1">{rating.toFixed(1)}</span>
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
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const getAttendanceForDay = (daysAgo: number): Attendance | undefined => {
    const dateStr = getDateStr(daysAgo);
    return employee.attendances?.find((a) => a.date === dateStr);
  };

  const [overtimeInput, setOvertimeInput] = useState<string>("");
  const [showOvertimeInput, setShowOvertimeInput] = useState(false);

  const markAttendance = async (daysAgo: number, status: string, overtimeHours?: number) => {
    const dateStr = getDateStr(daysAgo);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          date: dateStr,
          dayName: getDayNameFromDateStr(dateStr),
          status,
          markedBy: user?.name || "System",
          overtimeHours: status === "overtime" ? overtimeHours || 0 : undefined,
        }),
      });
      if (res.ok) {
        const label = status === "no_site" ? "No Site" : status === "overtime" ? `OT: ${overtimeHours || 0}h` : status.charAt(0).toUpperCase() + status.slice(1);
        toast.success(`Marked ${label}`);
      } else {
        toast.error("Failed to update attendance");
      }
      setOpenDay(null);
      setDropdownPos(null);
      setShowOvertimeInput(false);
      setOvertimeInput("");
      onAttendanceChange();
    } catch {
      toast.error("Failed to update attendance");
    }
  };

  // Attendance status visual helper
  const getStatusStyle = (status: string | null | undefined, isToday: boolean, overtimeHours?: number) => {
    if (status === "present") return { bg: "bg-emerald-500", text: "text-white", icon: <CheckCircle2 className="h-4 w-4" />, label: "Present" };
    if (status === "absent") return { bg: "bg-red-500", text: "text-white", icon: <XCircle className="h-4 w-4" />, label: "Absent" };
    if (status === "no_site") return { bg: "bg-gray-400", text: "text-white", icon: <MinusCircle className="h-4 w-4" />, label: "No Site" };
    if (status === "overtime") return { bg: "bg-blue-500", text: "text-white", icon: <Clock className="h-4 w-4" />, label: `OT: ${overtimeHours || 0}h` };
    if (isToday) return { bg: "bg-red-500", text: "text-white", icon: <XCircle className="h-4 w-4" />, label: "Absent" };
    return { bg: "bg-gray-300 dark:bg-gray-600", text: "text-white", icon: <MinusCircle className="h-4 w-4" />, label: "—" };
  };

  const handleToggleDropdown = (daysAgo: number) => {
    if (openDay === daysAgo) {
      setOpenDay(null);
      setDropdownPos(null);
    } else {
      const trigger = triggerRefs.current[daysAgo];
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + 6,
          left: rect.left + rect.width / 2,
        });
        setOpenDay(daysAgo);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (openDay === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside the dropdown
      if (target.closest('[data-attendance-dropdown]')) return;
      // Don't close if clicking the trigger button
      if (target.closest('[data-attendance-trigger]')) return;
      setOpenDay(null);
      setDropdownPos(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDay]);

  // The fixed-position dropdown rendered via portal
  const renderDropdown = () => {
    if (openDay === null || !dropdownPos) return null;
    const att = getAttendanceForDay(openDay);
    const isToday = openDay === 0;
    const effectiveStatus = att?.status || (isToday ? "absent" : null);
    const dateStr = getDateStr(openDay);
    const dayName = getDayNameFromDateStr(dateStr);

    return createPortal(
      <div
        data-attendance-dropdown
        className="fixed z-[9999]"
        style={{
          top: dropdownPos.top,
          left: dropdownPos.left,
          transform: "translateX(-50%)",
        }}
      >
        <div className="bg-popover border border-border rounded-lg shadow-xl p-2.5 w-[150px]">
          <p className="text-[10px] text-muted-foreground font-medium px-1.5 pb-2 border-b border-border mb-2">
            {dayName}, {dateStr}
          </p>
          <div className="space-y-2">
            {[
              { status: "present", label: "Present", bg: "bg-emerald-500 hover:bg-emerald-600", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
              { status: "absent", label: "Absent", bg: "bg-red-500 hover:bg-red-600", icon: <XCircle className="h-3.5 w-3.5" /> },
              { status: "no_site", label: "No Site", bg: "bg-gray-400 hover:bg-gray-500", icon: <MinusCircle className="h-3.5 w-3.5" /> },
            ].map((opt) => (
              <button
                key={opt.status}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-white ${opt.bg} transition-colors ${effectiveStatus === opt.status ? "ring-2 ring-offset-1 ring-white/70 dark:ring-offset-slate-800" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  markAttendance(openDay, opt.status);
                }}
              >
                {opt.icon}
                {opt.label}
                {effectiveStatus === opt.status && <span className="ml-auto text-[9px] opacity-80">✓</span>}
              </button>
            ))}
            {/* Overtime option */}
            {!showOvertimeInput ? (
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors ${effectiveStatus === "overtime" ? "ring-2 ring-offset-1 ring-white/70 dark:ring-offset-slate-800" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOvertimeInput(true);
                }}
              >
                <Clock className="h-3.5 w-3.5" />
                Overtime
                {effectiveStatus === "overtime" && <span className="ml-auto text-[9px] opacity-80">✓</span>}
              </button>
            ) : (
              <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    placeholder="Hrs"
                    value={overtimeInput}
                    onChange={(e) => setOvertimeInput(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && overtimeInput) {
                        markAttendance(openDay, "overtime", parseFloat(overtimeInput));
                      }
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">hrs</span>
                </div>
                <button
                  className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    if (overtimeInput && parseFloat(overtimeInput) > 0) {
                      markAttendance(openDay, "overtime", parseFloat(overtimeInput));
                    } else {
                      toast.error("Enter overtime hours");
                    }
                  }}
                >
                  <Clock className="h-3 w-3" />
                  Confirm OT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
      >
        {/* Photo */}
        <td className="px-4 py-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0">
            {employee.photoUrl ? (
              <img src={employee.photoUrl} alt={employee.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white text-xs font-bold">
                {getInitials(employee.fullName)}
              </div>
            )}
          </div>
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
              const isToday = daysAgo === 0;
              const effectiveStatus = att?.status || (isToday ? "absent" : null);
              const style = getStatusStyle(effectiveStatus, isToday, (att as any)?.overtimeHours);

              return (
                <div key={daysAgo}>
                  <button
                    ref={(el) => { triggerRefs.current[daysAgo] = el; }}
                    data-attendance-trigger
                    className="flex flex-col items-center gap-1 group"
                    title={`${getDayLabel(daysAgo)}: ${style.label} (click to mark)`}
                    onClick={() => handleToggleDropdown(daysAgo)}
                  >
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                      {getDayLabel(daysAgo)}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${style.bg} ${style.text}`}
                    >
                      {style.icon}
                    </span>
                  </button>
                </div>
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
      {renderDropdown()}
    </>
  );
}

// ============================================================
// DASHBOARD VIEW — ROW-BASED LAYOUT
// ============================================================

function DashboardView() {
  const { searchQuery, user, setView, setSelectedEmployee } = useAppStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

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

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [positionFilter, searchQuery]);

  // Extract unique positions from employees for the filter dropdown
  const uniquePositions = useMemo(() => {
    const positions = employees
      .map((e) => e.position)
      .filter((p): p is string => !!p && p.trim() !== "");
    return Array.from(new Set(positions)).sort();
  }, [employees]);

  // Filter employees by position
  const filteredEmployees = useMemo(() => {
    if (positionFilter === "all") return employees;
    return employees.filter((e) => e.position === positionFilter);
  }, [employees, positionFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEmployees = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [filteredEmployees, safeCurrentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [safeCurrentPage, totalPages]);

  // Stats — today defaults to absent if no record
  const todayStr = getDateStr(0);
  const presentToday = employees.filter((e) => {
    const todayAtt = e.attendances?.find((a) => a.date === todayStr);
    return todayAtt?.status === "present";
  }).length;
  const absentToday = employees.filter((e) => {
    const todayAtt = e.attendances?.find((a) => a.date === todayStr);
    return !todayAtt || todayAtt.status === "absent";
  }).length;
  const noSiteToday = employees.filter((e) => {
    const todayAtt = e.attendances?.find((a) => a.date === todayStr);
    return todayAtt?.status === "no_site";
  }).length;

  const overtimeToday = employees.filter((e) => {
    const todayAtt = e.attendances?.find((a) => a.date === todayStr);
    return todayAtt?.status === "overtime";
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
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total Employees", value: employees.length, icon: Users, bgClass: "bg-emerald-100 dark:bg-emerald-900/30", iconClass: "text-emerald-600 dark:text-emerald-400" },
          { label: "Present Today", value: presentToday, icon: CheckCircle2, bgClass: "bg-green-100 dark:bg-green-900/30", iconClass: "text-green-600 dark:text-green-400" },
          { label: "Absent Today", value: absentToday, icon: XCircle, bgClass: "bg-red-100 dark:bg-red-900/30", iconClass: "text-red-600 dark:text-red-400" },
          { label: "No Site Today", value: noSiteToday, icon: MinusCircle, bgClass: "bg-gray-100 dark:bg-gray-800/30", iconClass: "text-gray-600 dark:text-gray-400" },
          { label: "Overtime Today", value: overtimeToday, icon: Clock, bgClass: "bg-blue-100 dark:bg-blue-900/30", iconClass: "text-blue-600 dark:text-blue-400" },
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

      {/* Refresh & Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Filter by Position:</Label>
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {uniquePositions.map((pos) => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
      ) : filteredEmployees.length === 0 ? (
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
              : positionFilter !== "all"
              ? "No employees match this position filter"
              : "Click 'Add Employee' to get started"}
          </p>
        </motion.div>
      ) : (
        <>
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
                    {paginatedEmployees.map((emp) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {(safeCurrentPage - 1) * PAGE_SIZE + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(safeCurrentPage * PAGE_SIZE, filteredEmployees.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredEmployees.length}</span>{" "}
                employees
              </p>
              <div className="flex items-center gap-1">
                {/* First page */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safeCurrentPage === 1}
                  onClick={() => goToPage(1)}
                  title="First page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <ChevronLeft className="h-3.5 w-3.5 -ml-3" />
                </Button>
                {/* Previous */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safeCurrentPage === 1}
                  onClick={() => goToPage(safeCurrentPage - 1)}
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {/* Page numbers */}
                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    variant={page === safeCurrentPage ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 ${
                      page === safeCurrentPage
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : ""
                    }`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                {/* Next */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => goToPage(safeCurrentPage + 1)}
                  title="Next page"
                >
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
                {/* Last page */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => goToPage(totalPages)}
                  title="Last page"
                >
                  <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                  <ChevronLeft className="h-3.5 w-3.5 rotate-180 -ml-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// ATTENDANCE CALENDAR COMPONENT
// ============================================================

const CALENDAR_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function AttendanceCalendar({ employeeId }: { employeeId: string }) {
  const { user } = useAppStore();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; id: string; dayName: string; overtimeHours?: number }>>({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [overtimeInput, setOvertimeInput] = useState<string>("");
  const [showOvertimeInput, setShowOvertimeInput] = useState(false);

  // Generate year options (5 years back + current year)
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) years.push(y);
    return years;
  }, []);

  // Fetch attendance for the selected month/year
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/attendance?employeeId=${employeeId}&month=${selectedMonth}&year=${selectedYear}`
      );
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, { status: string; id: string; dayName: string; overtimeHours?: number }> = {};
        data.forEach((a: any) => {
          map[a.date] = { status: a.status, id: a.id, dayName: a.dayName || "", overtimeHours: a.overtimeHours || undefined };
        });
        setAttendanceMap(map);
      }
    } catch {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [employeeId, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Build calendar grid for the selected month/year
  const calendarDays = useMemo(() => {
    const days: { day: number; dateStr: string; dayName: string; status: string | null; attendanceId: string | null; isCurrentMonth: boolean; overtimeHours?: number }[] = [];
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const totalDays = lastDay.getDate();
    const startDow = firstDay.getDay(); // 0=Sun

    // Previous month padding
    const prevMonthLast = new Date(selectedYear, selectedMonth - 1, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevMonthLast - i;
      const pm = selectedMonth - 1 === 0 ? 12 : selectedMonth - 1;
      const py = selectedMonth - 1 === 0 ? selectedYear - 1 : selectedYear;
      const dd = String(d).padStart(2, "0");
      const mm = String(pm).padStart(2, "0");
      const dateStr = `${dd}-${mm}-${py}`;
      days.push({ day: d, dateStr, dayName: getDayNameFromDateStr(dateStr), status: null, attendanceId: null, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dd = String(d).padStart(2, "0");
      const mm = String(selectedMonth).padStart(2, "0");
      const dateStr = `${dd}-${mm}-${selectedYear}`;
      const att = attendanceMap[dateStr];
      days.push({
        day: d,
        dateStr,
        dayName: getDayNameFromDateStr(dateStr),
        status: att?.status || null,
        attendanceId: att?.id || null,
        isCurrentMonth: true,
        overtimeHours: att?.overtimeHours,
      });
    }

    // Next month padding to complete the grid
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nm = selectedMonth + 1 === 13 ? 1 : selectedMonth + 1;
      const ny = selectedMonth + 1 === 13 ? selectedYear + 1 : selectedYear;
      const dd = String(d).padStart(2, "0");
      const mm = String(nm).padStart(2, "0");
      const dateStr = `${dd}-${mm}-${ny}`;
      days.push({ day: d, dateStr, dayName: getDayNameFromDateStr(dateStr), status: null, attendanceId: null, isCurrentMonth: false });
    }

    return days;
  }, [selectedYear, selectedMonth, attendanceMap]);

  // Count present/absent/no_site/overtime/unmarked for current month
  const monthStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let noSite = 0;
    let overtime = 0;
    let totalOvertimeHours = 0;
    let unmarked = 0;
    const totalDays = new Date(selectedYear, selectedMonth, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      const dd = String(d).padStart(2, "0");
      const mm = String(selectedMonth).padStart(2, "0");
      const dateStr = `${dd}-${mm}-${selectedYear}`;
      const att = attendanceMap[dateStr];
      if (!att) unmarked++;
      else if (att.status === "present") present++;
      else if (att.status === "absent") absent++;
      else if (att.status === "no_site") noSite++;
      else if (att.status === "overtime") { overtime++; totalOvertimeHours += (att.overtimeHours || 0); }
      else unmarked++;
    }
    return { present, absent, noSite, overtime, totalOvertimeHours, unmarked };
  }, [selectedYear, selectedMonth, attendanceMap]);

  // Handle marking attendance on a day
  const handleMarkAttendance = async (dateStr: string, dayName: string, status: string, overtimeHours?: number) => {
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          date: dateStr,
          dayName,
          status,
          markedBy: user?.name || "System",
          overtimeHours: status === "overtime" ? overtimeHours || 0 : undefined,
        }),
      });
      setActiveDay(null);
      setShowOvertimeInput(false);
      setOvertimeInput("");
      fetchAttendance();
    } catch {
      toast.error("Failed to update attendance");
    }
  };

  // Today's date string
  const todayStr = (() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  })();

  return (
    <div className="mb-2">
      {/* Section Title */}
      <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 print:text-emerald-600 mb-4 pb-1.5 border-b-2 border-emerald-600 dark:border-emerald-500 print:border-emerald-600">
        Attendance Record
      </h3>

      {/* Controls row: selectors + edit + stats */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {CALENDAR_MONTHS.map((m, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Edit toggle */}
        <Button
          variant={editMode ? "default" : "outline"}
          size="sm"
          className={`h-8 text-xs gap-1.5 ${editMode ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
          onClick={() => { setEditMode(!editMode); setActiveDay(null); }}
        >
          <Pencil className="h-3 w-3" />
          {editMode ? "Done" : "Edit"}
        </Button>

        {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" />}

        {/* Stats */}
        <div className="flex items-center gap-4 ml-auto text-[10px] font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            Present: {monthStats.present}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
            Absent: {monthStats.absent}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-400 inline-block" />
            No Site: {monthStats.noSite}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            OT: {monthStats.overtime} ({monthStats.totalOvertimeHours}h)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-white dark:bg-slate-600 inline-block border border-gray-300 dark:border-slate-500" />
            Unmarked: {monthStats.unmarked}
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-gray-200 dark:border-slate-600 print:border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-700 print:from-gray-50 print:to-gray-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2 border-b border-gray-200 dark:border-slate-600 print:border-gray-200">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 relative">
          {calendarDays.map((dayInfo, idx) => {
            const isToday = dayInfo.dateStr === todayStr && dayInfo.isCurrentMonth;
            const isPresent = dayInfo.status === "present";
            const isAbsent = dayInfo.status === "absent";
            const isNoSite = dayInfo.status === "no_site";
            const isOvertime = dayInfo.status === "overtime";
            const isUnmarked = !dayInfo.status && dayInfo.isCurrentMonth;
            const isActive = activeDay === dayInfo.dateStr;

            // Background color logic
            let cellBg = "";
            let dayNumColor = "";
            if (!dayInfo.isCurrentMonth) {
              cellBg = "bg-gray-50/60 dark:bg-slate-800/40";
              dayNumColor = "text-gray-300 dark:text-gray-600";
            } else if (isPresent) {
              cellBg = "bg-emerald-50 dark:bg-emerald-950/40 print:bg-emerald-50";
              dayNumColor = "text-emerald-700 dark:text-emerald-300 print:text-emerald-700";
            } else if (isAbsent) {
              cellBg = "bg-red-50 dark:bg-red-950/30 print:bg-red-50";
              dayNumColor = "text-red-700 dark:text-red-400 print:text-red-700";
            } else if (isNoSite) {
              cellBg = "bg-gray-100 dark:bg-slate-700/50 print:bg-gray-100";
              dayNumColor = "text-gray-600 dark:text-gray-400 print:text-gray-600";
            } else if (isOvertime) {
              cellBg = "bg-blue-50 dark:bg-blue-950/30 print:bg-blue-50";
              dayNumColor = "text-blue-700 dark:text-blue-400 print:text-blue-700";
            } else {
              cellBg = "bg-white dark:bg-slate-800 print:bg-white";
              dayNumColor = "text-gray-700 dark:text-gray-300 print:text-gray-700";
            }

            // Left accent bar color
            let accentColor = "";
            if (dayInfo.isCurrentMonth && isPresent) accentColor = "bg-emerald-500";
            else if (dayInfo.isCurrentMonth && isAbsent) accentColor = "bg-red-500";
            else if (dayInfo.isCurrentMonth && isNoSite) accentColor = "bg-gray-400";
            else if (dayInfo.isCurrentMonth && isOvertime) accentColor = "bg-blue-500";

            return (
              <div
                key={idx}
                className={`
                  relative min-h-[60px] p-1.5 border-b border-r border-gray-100 dark:border-slate-700 print:border-gray-100
                  ${cellBg}
                  ${editMode && dayInfo.isCurrentMonth ? "cursor-pointer" : ""}
                  transition-colors duration-150
                `}
                onClick={() => {
                  if (editMode && dayInfo.isCurrentMonth) {
                    setActiveDay(activeDay === dayInfo.dateStr ? null : dayInfo.dateStr);
                  }
                }}
              >
                {/* Left accent bar */}
                {accentColor && (
                  <div className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-r ${accentColor}`} />
                )}

                {/* Day number */}
                <div className="pl-1.5">
                  <span className={`text-[11px] font-semibold ${dayNumColor} ${
                    isToday ? "bg-emerald-600 text-white w-5 h-5 rounded-full inline-flex items-center justify-center" : ""
                  }`}>
                    {dayInfo.day}
                  </span>
                </div>

                {/* Status indicator */}
                {dayInfo.isCurrentMonth && isPresent && (
                  <div className="pl-1.5 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-medium">P</span>
                  </div>
                )}
                {dayInfo.isCurrentMonth && isAbsent && (
                  <div className="pl-1.5 mt-0.5 flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-500 dark:text-red-400" />
                    <span className="text-[8px] text-red-600 dark:text-red-400 font-medium">A</span>
                  </div>
                )}
                {dayInfo.isCurrentMonth && isNoSite && (
                  <div className="pl-1.5 mt-0.5 flex items-center gap-1">
                    <MinusCircle className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                    <span className="text-[8px] text-gray-500 dark:text-gray-400 font-medium">NS</span>
                  </div>
                )}
                {dayInfo.isCurrentMonth && isOvertime && (
                  <div className="pl-1.5 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                    <span className="text-[8px] text-blue-600 dark:text-blue-400 font-medium">OT: {dayInfo.overtimeHours || 0}h</span>
                  </div>
                )}

                {/* Edit mode: option popup for this day */}
                {editMode && isActive && dayInfo.isCurrentMonth && (
                  <div className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-0.5 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 p-2 w-[150px]">
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium px-1 pb-1.5 border-b border-gray-100 dark:border-slate-600 mb-2">
                      {dayInfo.dayName}, {dayInfo.dateStr}
                    </p>
                    {[
                      { status: "present", label: "Present", bg: "bg-emerald-500 hover:bg-emerald-600", icon: <CheckCircle2 className="h-3 w-3" /> },
                      { status: "absent", label: "Absent", bg: "bg-red-500 hover:bg-red-600", icon: <XCircle className="h-3 w-3" /> },
                      { status: "no_site", label: "No Site", bg: "bg-gray-400 hover:bg-gray-500", icon: <MinusCircle className="h-3 w-3" /> },
                    ].map((opt) => (
                      <button
                        key={opt.status}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] font-medium text-white ${opt.bg} transition-colors my-1 first:mt-0 last:mb-0 ${dayInfo.status === opt.status ? "ring-2 ring-offset-1 ring-white/70 dark:ring-offset-slate-700" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAttendance(dayInfo.dateStr, dayInfo.dayName, opt.status);
                        }}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                    {/* Overtime option */}
                    {!showOvertimeInput ? (
                      <button
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors my-1 ${dayInfo.status === "overtime" ? "ring-2 ring-offset-1 ring-white/70 dark:ring-offset-slate-700" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowOvertimeInput(true);
                        }}
                      >
                        <Clock className="h-3 w-3" />
                        Overtime
                      </button>
                    ) : (
                      <div className="space-y-1.5 my-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0.5"
                            max="24"
                            step="0.5"
                            placeholder="Hrs"
                            value={overtimeInput}
                            onChange={(e) => setOvertimeInput(e.target.value)}
                            className="w-full px-2 py-1.5 text-[11px] rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && overtimeInput) {
                                handleMarkAttendance(dayInfo.dateStr, dayInfo.dayName, "overtime", parseFloat(overtimeInput));
                              }
                            }}
                          />
                          <span className="text-[9px] text-muted-foreground">hrs</span>
                        </div>
                        <button
                          className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                          onClick={() => {
                            if (overtimeInput && parseFloat(overtimeInput) > 0) {
                              handleMarkAttendance(dayInfo.dateStr, dayInfo.dayName, "overtime", parseFloat(overtimeInput));
                            } else {
                              toast.error("Enter overtime hours");
                            }
                          }}
                        >
                          <Clock className="h-3 w-3" />
                          Confirm OT
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {editMode && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 italic">
          Click on any date to mark attendance: Present (green), Absent (red), No Site (grey), or Overtime (blue)
        </p>
      )}
    </div>
  );
}

// ============================================================
// EMPLOYEE DETAIL VIEW (CV / PROFILE)
// ============================================================

function EmployeeDetailView() {
  const { selectedEmployeeId, setView, user, pendingDeleteRequestId, pendingDeleteEmployeeId, setPendingDeleteRequest, activeDeleteRequestId, activeDeleteReason, setActiveDeleteRequest } = useAppStore();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Determine if we're in "review delete request" mode (Super Admin came from notification)
  const isReviewingDelete = user?.role === "super_admin" &&
    (!!pendingDeleteRequestId && pendingDeleteEmployeeId === selectedEmployeeId ||
     !!activeDeleteRequestId);

  // Get the deletion reason from either source
  const deletionReason = activeDeleteReason || null;

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

  // Also check for pending delete requests for this employee (for super admin)
  useEffect(() => {
    if (user?.role !== "super_admin" || !selectedEmployeeId || activeDeleteRequestId) return;
    fetch(`/api/delete-requests?status=pending`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const pendingReq = data.find((req: DeleteRequestItem) => req.employeeId === selectedEmployeeId);
          if (pendingReq) {
            setActiveDeleteRequest(pendingReq.id, pendingReq.reason || null);
          }
        }
      })
      .catch(() => {});
  }, [selectedEmployeeId, user?.role, activeDeleteRequestId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !employee) return;
    try {
      toast.info("Generating PDF...");
      const card = printRef.current;

      // Temporarily remove dark mode from the HTML element for clean PDF
      const htmlEl = document.documentElement;
      const hadDarkClass = htmlEl.classList.contains("dark");
      if (hadDarkClass) htmlEl.classList.remove("dark");

      // Wait a tick for styles to re-render
      await new Promise((r) => setTimeout(r, 100));

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // Restore dark mode
      if (hadDarkClass) htmlEl.classList.add("dark");

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${employee.fullName.replace(/\s+/g, "_")}_CV.pdf`);
      toast.success("PDF downloaded successfully");
    } catch {
      // Ensure dark mode is restored even on error
      const htmlEl = document.documentElement;
      if (!htmlEl.classList.contains("dark")) {
        const { theme } = { theme: "" }; // best-effort restore
        htmlEl.classList.add("dark");
      }
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
          setActiveDeleteRequest(null, null);
          setView("dashboard");
        }} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {isReviewingDelete ? (
          /* Super Admin reviewing a delete request — show Accept Deletion + Reject Deletion */
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
                if (!employee) return;
                const requestId = pendingDeleteRequestId || activeDeleteRequestId;
                if (!requestId) return;
                setDeleting(true);
                try {
                  // Approve the delete request → soft-delete employee
                  const res = await fetch("/api/delete-requests", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: requestId,
                      status: "approved",
                      reviewedBy: user?.id,
                    }),
                  });
                  if (res.ok) {
                    toast.success(`"${employee.fullName}" has been deleted`);
                    setPendingDeleteRequest(null, null);
                    setActiveDeleteRequest(null, null);
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
              Accept Deletion
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={async () => {
                const requestId = pendingDeleteRequestId || activeDeleteRequestId;
                if (!requestId) return;
                setDeleting(true);
                try {
                  const res = await fetch("/api/delete-requests", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: requestId,
                      status: "rejected",
                      reviewedBy: user?.id,
                    }),
                  });
                  if (res.ok) {
                    toast.success("Deletion request rejected");
                    setPendingDeleteRequest(null, null);
                    setActiveDeleteRequest(null, null);
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
              Reject Deletion
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

      {/* Deletion Request Banner (only for super admin reviewing) */}
      {isReviewingDelete && (deletionReason || activeDeleteRequestId) && (
        <div className="no-print bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-800 dark:text-amber-300">Pending Deletion Request</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                A deletion request has been submitted for this employee.
              </p>
              {deletionReason && (
                <div className="mt-2 p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-500 font-semibold mb-1">Reason for Deletion</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{deletionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CV Content */}
      <div ref={printRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden text-gray-900 dark:text-gray-100 print:bg-white print:text-gray-900">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white px-8 py-6">
          <div className="flex items-center gap-6">
            {/* Photo */}
            <div className="h-[100px] w-[100px] rounded-xl overflow-hidden border-[3px] border-white/40 bg-white/20 flex-shrink-0 shadow-lg">
              {employee.photoUrl ? (
                <img
                  src={employee.photoUrl}
                  alt={employee.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(employee.fullName)}
                </div>
              )}
            </div>
            {/* Name, Rating & ID */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-wide leading-tight">{employee.fullName}</h2>
                <StarRating rating={employee.rating} size={18} />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-medium text-emerald-100 bg-white/15 px-2.5 py-0.5 rounded-md">
                  ID: {employee.employeeId}
                </span>
                {employee.position && (
                  <span className="text-sm font-medium text-emerald-100 bg-white/15 px-2.5 py-0.5 rounded-md">
                    {employee.position}
                  </span>
                )}
              </div>
            </div>
            {/* Logo & Title */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center justify-end gap-2 mb-1">
                <Shield className="w-5 h-5 text-emerald-200" />
                <span className="text-sm font-bold tracking-widest">ASM</span>
              </div>
              <p className="text-[10px] text-emerald-200 tracking-wider uppercase">Workers Profile</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-0 bg-white dark:bg-slate-800 print:bg-white">
          {/* Personal Details */}
          <div className="mb-6">
            <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 print:text-emerald-600 mb-4 pb-1.5 border-b-2 border-emerald-600 dark:border-emerald-500 print:border-emerald-600">
              Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Full Name</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{employee.fullName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Company ID</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{employee.employeeId}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1">
                  Passport Number
                  <Lock className="h-2.5 w-2.5 text-amber-500" />
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{employee.passportNumber || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5 flex items-center gap-1">
                  ID Number
                  <Lock className="h-2.5 w-2.5 text-amber-500" />
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{employee.idNumber || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Joining Date</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatDateCV(employee.joinDate)}</p>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="mb-6">
            <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400 print:text-emerald-600 mb-4 pb-1.5 border-b-2 border-emerald-600 dark:border-emerald-500 print:border-emerald-600">
              Professional Details
            </h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Company Name</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{employee.companyName || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Position</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{employee.position || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Passport Status</p>
                <div className="mt-0.5">{statusBadge(employee.passportStatus)}</div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">ID Status</p>
                <div className="mt-0.5">{statusBadge(employee.idStatus)}</div>
              </div>
            </div>
          </div>

          {/* Attendance Calendar */}
          <AttendanceCalendar employeeId={employee.id} />

        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-700/50 print:bg-gray-50 px-8 py-3 border-t border-gray-200 dark:border-slate-600 print:border-gray-200">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 print:text-gray-400 tracking-wider text-center uppercase">
            Arabian Shield Manpower — Confidential Workers Profile
          </p>
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
    rating: 5.0,
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
            rating: data.rating || 5.0,
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

  const [imageUploading, setImageUploading] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageUploading(true);
    const fileFormData = new FormData();
    fileFormData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fileFormData });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, photoUrl: data.url }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, photoUrl: null }));
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
            {/* Photo upload with preview */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <Camera className="h-3.5 w-3.5 text-emerald-500" />
                Employee Photo
              </Label>
              <div className="flex items-start gap-6">
                {/* Image preview area */}
                <div className="relative group">
                  {formData.photoUrl ? (
                    <div className="relative h-32 w-32 rounded-xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 shadow-md">
                      <img
                        src={formData.photoUrl}
                        alt="Employee preview"
                        className="h-full w-full object-cover"
                      />
                      {/* Remove button overlay */}
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                        title="Remove photo"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-dashed border-emerald-300 dark:border-emerald-700 flex flex-col items-center justify-center gap-2">
                      <Camera className="h-8 w-8 text-emerald-400 dark:text-emerald-600" />
                      <span className="text-[10px] text-muted-foreground text-center px-2">No photo</span>
                    </div>
                  )}
                </div>
                {/* Upload controls */}
                <div className="flex flex-col gap-2 pt-1">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      imageUploading
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 cursor-wait"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
                    }`}>
                      {imageUploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          {formData.photoUrl ? "Change Photo" : "Upload Photo"}
                        </>
                      )}
                    </div>
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    JPG, PNG, or WebP. Max 5MB.
                  </p>
                  {formData.photoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-7 text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove Photo
                    </Button>
                  )}
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

              {/* Rating — auto-calculated, display only */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  Rating (Auto-calculated)
                </Label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={formData.rating}
                    size={24}
                    interactive={false}
                  />
                  <span className="text-sm font-semibold text-muted-foreground">
                    {formData.rating.toFixed(1)}/5.0
                  </span>
                  <span className="text-[10px] text-muted-foreground italic">
                    Rating is automatically calculated based on attendance, warnings, fines, and overtime
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
// SEARCHABLE EMPLOYEE DROPDOWN
// ============================================================

function SearchableEmployeeDropdown({
  employees,
  onSelect,
  selectedId,
}: {
  employees: Employee[];
  onSelect: (emp: Employee) => void;
  selectedId: string | null;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const selectedEmployee = employees.find((e) => e.id === selectedId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or employee ID..."
          value={selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.employeeId})` : search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            if (selectedId) onSelect(null as any);
          }}
          onFocus={() => setOpen(true)}
          className="pl-10"
        />
        {selectedEmployee && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSearch("");
              onSelect(null as any);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((emp) => (
            <button
              key={emp.id}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors text-left"
              onClick={() => {
                onSelect(emp);
                setSearch("");
                setOpen(false);
              }}
            >
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0">
                {emp.photoUrl ? (
                  <img src={emp.photoUrl} alt={emp.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white text-[10px] font-bold">
                    {getInitials(emp.fullName)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{emp.fullName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {emp.employeeId} {emp.position ? `• ${emp.position}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && search && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">No employees found</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// WHATSAPP & DOWNLOAD HELPERS FOR NOTICES
// ============================================================

function sendToWhatsApp(phone: string | null, message: string) {
  if (!phone) {
    toast.error("No phone number available for this employee");
    return;
  }
  // Clean phone number - remove spaces, dashes, etc.
  const cleanPhone = phone.replace(/[\s\-()]/g, "");
  // Ensure it starts with country code
  const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone.slice(1) : cleanPhone.startsWith("00") ? cleanPhone.slice(2) : cleanPhone;
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  window.open(url, "_blank");
  toast.success("Opening WhatsApp...");
}

async function downloadNoticeAsPDF(
  elementId: string,
  filename: string,
  isDarkMode: boolean
) {
  try {
    toast.info("Generating PDF...");
    const card = document.getElementById(elementId);
    if (!card) {
      toast.error("Notice element not found");
      return;
    }

    // Temporarily remove dark mode for clean PDF
    const htmlEl = document.documentElement;
    const hadDarkClass = htmlEl.classList.contains("dark");
    if (hadDarkClass) htmlEl.classList.remove("dark");

    // Wait a tick for styles to re-render
    await new Promise((r) => setTimeout(r, 150));

    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;
    const canvas = await html2canvas(card, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    // Restore dark mode
    if (hadDarkClass) htmlEl.classList.add("dark");

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
    toast.success("PDF downloaded successfully");
  } catch {
    // Restore dark mode on error
    const htmlEl = document.documentElement;
    if (!htmlEl.classList.contains("dark") && isDarkMode) {
      htmlEl.classList.add("dark");
    }
    toast.error("Failed to generate PDF");
  }
}

function generateWarningMessage(warning: WarningItem) {
  return `⚠️ WARNING NOTICE\n\n` +
    `Arabian Shield Manpower\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Employee Name: ${warning.employeeName}\n` +
    `Employee ID: ${warning.employee?.employeeId || warning.employeeId}\n` +
    `Position: ${warning.employee?.position || "—"}\n` +
    `Company: ${warning.employee?.companyName || "—"}\n\n` +
    `Reason: ${warning.reason}\n` +
    `${warning.isAutoGenerated ? "(Auto-generated: 3 consecutive absences)\n" : ""}` +
    `${warning.absentDates ? `Absent Dates: ${warning.absentDates}\n` : ""}` +
    `Date of Issue: ${formatDateTime(warning.createdAt)}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `This is an official warning from Arabian Shield Manpower.`;
}

function generateFineMessage(fine: FineItem) {
  return `💰 FINE NOTICE\n\n` +
    `Arabian Shield Manpower\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Employee Name: ${fine.employeeName}\n` +
    `Employee ID: ${fine.employee?.employeeId || fine.employeeId}\n` +
    `Position: ${fine.employee?.position || "—"}\n` +
    `Company: ${fine.employee?.companyName || "—"}\n\n` +
    `Reason: ${fine.reason}\n` +
    `Fine Amount: ${fine.amount.toLocaleString("en-SA", { minimumFractionDigits: 2 })} SAR\n` +
    `Date of Issue: ${formatDateTime(fine.createdAt)}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `This is an official fine notice from Arabian Shield Manpower.`;
}

// ============================================================
// UNIFIED NOTIFICATIONS VIEW (3 TABS)
// ============================================================

function NotificationsView() {
  const {
    user,
    setView,
    setSelectedEmployee,
    setPendingDeleteRequest,
    notificationsTab,
    setNotificationsTab,
    highlightWarningId,
    highlightFineId,
    setHighlightWarning,
    setHighlightFine,
  } = useAppStore();

  // Tab: Requests
  const [requests, setRequests] = useState<DeleteRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  // Tab: Warnings
  const [warnings, setWarnings] = useState<WarningItem[]>([]);
  const [warningsLoading, setWarningsLoading] = useState(true);
  const [createWarningOpen, setCreateWarningOpen] = useState(false);
  const [warningEmployeeId, setWarningEmployeeId] = useState<string | null>(null);
  const [warningReason, setWarningReason] = useState("");
  const [warningSaving, setWarningSaving] = useState(false);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  // Tab: Fines
  const [fines, setFines] = useState<FineItem[]>([]);
  const [finesLoading, setFinesLoading] = useState(true);
  const [createFineOpen, setCreateFineOpen] = useState(false);
  const [fineEmployeeId, setFineEmployeeId] = useState<string | null>(null);
  const [fineReason, setFineReason] = useState("");
  const [fineAmount, setFineAmount] = useState("");
  const [fineSaving, setFineSaving] = useState(false);

  // Refs for scrolling to highlighted items
  const warningRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fineRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch all employees for dropdowns
  useEffect(() => {
    fetch("/api/employees?status=active")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllEmployees(data);
      })
      .catch(() => {});
  }, []);

  // Fetch delete requests
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
      setRequestsLoading(false);
    }
  }, [statusFilter]);

  // Fetch warnings
  const fetchWarnings = useCallback(async () => {
    try {
      const res = await fetch("/api/warnings");
      if (res.ok) {
        const data = await res.json();
        setWarnings(data);
      }
    } catch {
      toast.error("Failed to load warnings");
    } finally {
      setWarningsLoading(false);
    }
  }, []);

  // Fetch fines
  const fetchFines = useCallback(async () => {
    try {
      const res = await fetch("/api/fines");
      if (res.ok) {
        const data = await res.json();
        setFines(data);
      }
    } catch {
      toast.error("Failed to load fines");
    } finally {
      setFinesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchWarnings();
  }, [fetchWarnings]);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  // Scroll to highlighted items
  useEffect(() => {
    if (highlightWarningId && notificationsTab === "warnings") {
      setTimeout(() => {
        warningRefs.current[highlightWarningId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [highlightWarningId, notificationsTab]);

  useEffect(() => {
    if (highlightFineId && notificationsTab === "fines") {
      setTimeout(() => {
        fineRefs.current[highlightFineId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [highlightFineId, notificationsTab]);

  // Clear highlights after a delay
  useEffect(() => {
    if (highlightWarningId) {
      const timer = setTimeout(() => setHighlightWarning(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightWarningId, setHighlightWarning]);

  useEffect(() => {
    if (highlightFineId) {
      const timer = setTimeout(() => setHighlightFine(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightFineId, setHighlightFine]);

  // Delete request handlers
  const handleDeleteRequestAction = async (id: string, status: "approved" | "rejected") => {
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

  // Warning handlers
  const handleCreateWarning = async () => {
    if (!warningEmployeeId || !warningReason.trim()) {
      toast.error("Please select an employee and provide a reason");
      return;
    }
    const emp = allEmployees.find((e) => e.id === warningEmployeeId);
    if (!emp) {
      toast.error("Employee not found");
      return;
    }
    setWarningSaving(true);
    try {
      const res = await fetch("/api/warnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: emp.id,
          employeeName: emp.fullName,
          reason: warningReason.trim(),
          isAutoGenerated: false,
          createdBy: user?.name || "admin",
        }),
      });
      if (res.ok) {
        toast.success("Warning created successfully");
        setCreateWarningOpen(false);
        setWarningEmployeeId(null);
        setWarningReason("");
        fetchWarnings();
      } else {
        toast.error("Failed to create warning");
      }
    } catch {
      toast.error("Failed to create warning");
    } finally {
      setWarningSaving(false);
    }
  };

  const handleMarkWarningRead = async (id: string) => {
    try {
      const res = await fetch("/api/warnings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      if (res.ok) {
        setWarnings((prev) => prev.map((w) => (w.id === id ? { ...w, read: true } : w)));
        // Also remove from popup
        const { popupWarnings, setPopupWarnings } = useAppStore.getState();
        setPopupWarnings(popupWarnings.filter((w) => w.id !== id));
        toast.success("Marked as read");
      }
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  // Fine handlers
  const handleCreateFine = async () => {
    if (!fineEmployeeId || !fineReason.trim() || !fineAmount) {
      toast.error("Please select an employee, provide a reason and amount");
      return;
    }
    const emp = allEmployees.find((e) => e.id === fineEmployeeId);
    if (!emp) {
      toast.error("Employee not found");
      return;
    }
    setFineSaving(true);
    try {
      const res = await fetch("/api/fines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: emp.id,
          employeeName: emp.fullName,
          reason: fineReason.trim(),
          amount: parseFloat(fineAmount),
          createdBy: user?.name || "admin",
        }),
      });
      if (res.ok) {
        toast.success("Fine created successfully");
        setCreateFineOpen(false);
        setFineEmployeeId(null);
        setFineReason("");
        setFineAmount("");
        fetchFines();
      } else {
        toast.error("Failed to create fine");
      }
    } catch {
      toast.error("Failed to create fine");
    } finally {
      setFineSaving(false);
    }
  };

  const handleMarkFineRead = async (id: string) => {
    try {
      const res = await fetch("/api/fines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      if (res.ok) {
        setFines((prev) => prev.map((f) => (f.id === id ? { ...f, read: true } : f)));
        // Also remove from popup
        const { popupFines, setPopupFines } = useAppStore.getState();
        setPopupFines(popupFines.filter((f) => f.id !== id));
        toast.success("Marked as read");
      }
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  // Count unread for badge
  const unreadWarnings = warnings.filter((w) => !w.read).length;
  const unreadFines = fines.filter((f) => !f.read).length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  const tabs = [
    {
      key: "requests" as const,
      label: "Requests",
      icon: Shield,
      count: pendingRequests,
      countClass: "bg-amber-500",
    },
    {
      key: "warnings" as const,
      label: "Warnings",
      icon: AlertTriangle,
      count: unreadWarnings,
      countClass: "bg-amber-600",
    },
    {
      key: "fines" as const,
      label: "Fines",
      icon: DollarSign,
      count: unreadFines,
      countClass: "bg-red-500",
    },
  ];

  const selectedWarningEmployee = allEmployees.find((e) => e.id === warningEmployeeId);
  const selectedFineEmployee = allEmployees.find((e) => e.id === fineEmployeeId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-sm text-muted-foreground">Manage requests, warnings, and fines</p>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 border-b border-emerald-200/30 dark:border-emerald-800/30 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setNotificationsTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
              notificationsTab === tab.key
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-emerald-300 dark:hover:border-emerald-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`h-5 min-w-[20px] px-1.5 rounded-full ${tab.countClass} text-white text-[10px] font-bold flex items-center justify-center`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ====== REQUESTS TAB ====== */}
        {notificationsTab === "requests" && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Delete Requests</h3>
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

            {requestsLoading ? (
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
                            {req.status === "pending" && user?.role === "super_admin" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800"
                                  onClick={() => {
                                    setSelectedEmployee(req.employeeId);
                                    setPendingDeleteRequest(req.id, req.employeeId);
                                    setView("employee-detail");
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  View Employee
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteRequestAction(req.id, "approved")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteRequestAction(req.id, "rejected")}
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
          </motion.div>
        )}

        {/* ====== WARNINGS TAB ====== */}
        {notificationsTab === "warnings" && (
          <motion.div
            key="warnings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Warning Notices</h3>
              <Button
                onClick={() => setCreateWarningOpen(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Create Warning
              </Button>
            </div>

            {/* Create Warning Dialog */}
            <Dialog open={createWarningOpen} onOpenChange={setCreateWarningOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                    Create Warning Notice
                  </DialogTitle>
                  <DialogDescription>
                    Issue a formal warning notice to an employee.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Employee</Label>
                    <SearchableEmployeeDropdown
                      employees={allEmployees}
                      onSelect={(emp) => setWarningEmployeeId(emp?.id || null)}
                      selectedId={warningEmployeeId}
                    />
                  </div>
                  {selectedWarningEmployee && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0">
                          {selectedWarningEmployee.photoUrl ? (
                            <img src={selectedWarningEmployee.photoUrl} alt={selectedWarningEmployee.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(selectedWarningEmployee.fullName)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{selectedWarningEmployee.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {selectedWarningEmployee.employeeId} {selectedWarningEmployee.position ? `• ${selectedWarningEmployee.position}` : ""}
                          </p>
                          {selectedWarningEmployee.companyName && (
                            <p className="text-[10px] text-muted-foreground">{selectedWarningEmployee.companyName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Reason</Label>
                    <Textarea
                      placeholder="Enter reason for the warning..."
                      value={warningReason}
                      onChange={(e) => setWarningReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setCreateWarningOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleCreateWarning}
                    disabled={warningSaving}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {warningSaving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
                    {warningSaving ? "Creating..." : "Issue Warning"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Warnings List */}
            {warningsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : warnings.length === 0 ? (
              <div className="text-center py-16">
                <AlertTriangle className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No warnings</h3>
                <p className="text-sm text-muted-foreground/70 mt-1">Warning notices will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {warnings.map((warning) => {
                    const isHighlighted = highlightWarningId === warning.id;
                    return (
                      <motion.div
                        key={warning.id}
                        ref={(el) => { warningRefs.current[warning.id] = el; }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                      >
                        <Card id={`warning-notice-${warning.id}`} className={`border-2 overflow-hidden transition-all duration-500 ${
                          isHighlighted
                            ? "border-amber-500 shadow-lg shadow-amber-500/20"
                            : !warning.read
                            ? "border-amber-300 dark:border-amber-800 shadow-md"
                            : "border-amber-200/30 dark:border-amber-900/30"
                        }`}>
                          {/* Warning Header */}
                          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileWarning className="h-5 w-5" />
                              <span className="font-bold text-lg tracking-wider">WARNING NOTICE</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {warning.isAutoGenerated && (
                                <Badge className="bg-white/20 text-white text-[10px] border-0">Auto-generated</Badge>
                              )}
                              {!warning.read && (
                                <Badge className="bg-white text-amber-700 text-[10px]">NEW</Badge>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              {/* Employee Photo */}
                              <div className="flex-shrink-0">
                                <div className="h-16 w-16 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-amber-200 dark:border-amber-800">
                                  {warning.employee?.photoUrl ? (
                                    <img src={warning.employee.photoUrl} alt={warning.employeeName} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-white text-lg font-bold">
                                      {getInitials(warning.employeeName)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Employee Details */}
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Employee Name</p>
                                    <p className="text-sm font-semibold">{warning.employeeName}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Employee ID</p>
                                    <p className="text-sm font-semibold">{warning.employee?.employeeId || warning.employeeId}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Position</p>
                                    <p className="text-sm">{warning.employee?.position || "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Company</p>
                                    <p className="text-sm">{warning.employee?.companyName || "—"}</p>
                                  </div>
                                </div>
                                <Separator className="my-2" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reason</p>
                                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{warning.reason}</p>
                                </div>
                                {warning.isAutoGenerated && warning.absentDates && (
                                  <div className="mt-1">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Absent Dates</p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {(() => {
                                        try {
                                          const dates: string[] = JSON.parse(warning.absentDates);
                                          return dates.map((d) => (
                                            <Badge key={d} variant="outline" className="text-[10px] text-red-600 border-red-300 dark:border-red-800">
                                              {d}
                                            </Badge>
                                          ));
                                        } catch {
                                          return <span className="text-xs text-muted-foreground">{warning.absentDates}</span>;
                                        }
                                      })()}
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                  <p className="text-[10px] text-muted-foreground">
                                    Date of Issue: {formatDateTime(warning.createdAt)}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    {!warning.read && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/20"
                                        onClick={() => handleMarkWarningRead(warning.id)}
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                        Mark as Read
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/20"
                                      onClick={() => sendToWhatsApp(warning.employee?.phone || null, generateWarningMessage(warning))}
                                      title="Send via WhatsApp"
                                    >
                                      <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                      WhatsApp
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => downloadNoticeAsPDF(
                                        `warning-notice-${warning.id}`,
                                        `Warning_${warning.employeeName.replace(/\s+/g, "_")}.pdf`,
                                        useAppStore.getState().darkMode
                                      )}
                                      title="Download as PDF (white background)"
                                    >
                                      <Download className="h-3.5 w-3.5 mr-1" />
                                      Download
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => window.print()}
                                    >
                                      <Printer className="h-3.5 w-3.5 mr-1" />
                                      Print
                                    </Button>
                                  </div>
                                </div>
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
          </motion.div>
        )}

        {/* ====== FINES TAB ====== */}
        {notificationsTab === "fines" && (
          <motion.div
            key="fines"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Fine Notices</h3>
              <Button
                onClick={() => setCreateFineOpen(true)}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Create Fine
              </Button>
            </div>

            {/* Create Fine Dialog */}
            <Dialog open={createFineOpen} onOpenChange={setCreateFineOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <Banknote className="h-5 w-5" />
                    Create Fine Notice
                  </DialogTitle>
                  <DialogDescription>
                    Issue a formal fine notice to an employee.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Employee</Label>
                    <SearchableEmployeeDropdown
                      employees={allEmployees}
                      onSelect={(emp) => setFineEmployeeId(emp?.id || null)}
                      selectedId={fineEmployeeId}
                    />
                  </div>
                  {selectedFineEmployee && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0">
                          {selectedFineEmployee.photoUrl ? (
                            <img src={selectedFineEmployee.photoUrl} alt={selectedFineEmployee.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(selectedFineEmployee.fullName)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{selectedFineEmployee.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {selectedFineEmployee.employeeId} {selectedFineEmployee.position ? `• ${selectedFineEmployee.position}` : ""}
                          </p>
                          {selectedFineEmployee.companyName && (
                            <p className="text-[10px] text-muted-foreground">{selectedFineEmployee.companyName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Reason</Label>
                    <Textarea
                      placeholder="Enter reason for the fine..."
                      value={fineReason}
                      onChange={(e) => setFineReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Fine Amount</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(e.target.value)}
                        className="pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">SAR</span>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setCreateFineOpen(false)}>Cancel</Button>
                  <Button
                    onClick={handleCreateFine}
                    disabled={fineSaving}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {fineSaving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <DollarSign className="h-4 w-4 mr-1" />}
                    {fineSaving ? "Creating..." : "Issue Fine"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Fines List */}
            {finesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : fines.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No fines</h3>
                <p className="text-sm text-muted-foreground/70 mt-1">Fine notices will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {fines.map((fine) => {
                    const isHighlighted = highlightFineId === fine.id;
                    return (
                      <motion.div
                        key={fine.id}
                        ref={(el) => { fineRefs.current[fine.id] = el; }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                      >
                        <Card id={`fine-notice-${fine.id}`} className={`border-2 overflow-hidden transition-all duration-500 ${
                          isHighlighted
                            ? "border-red-500 shadow-lg shadow-red-500/20"
                            : !fine.read
                            ? "border-red-300 dark:border-red-800 shadow-md"
                            : "border-red-200/30 dark:border-red-900/30"
                        }`}>
                          {/* Fine Header */}
                          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileX className="h-5 w-5" />
                              <span className="font-bold text-lg tracking-wider">FINE NOTICE</span>
                            </div>
                            {!fine.read && (
                              <Badge className="bg-white text-red-700 text-[10px]">NEW</Badge>
                            )}
                          </div>
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              {/* Employee Photo */}
                              <div className="flex-shrink-0">
                                <div className="h-16 w-16 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-red-200 dark:border-red-800">
                                  {fine.employee?.photoUrl ? (
                                    <img src={fine.employee.photoUrl} alt={fine.employeeName} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-white text-lg font-bold">
                                      {getInitials(fine.employeeName)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Employee Details */}
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Employee Name</p>
                                    <p className="text-sm font-semibold">{fine.employeeName}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Employee ID</p>
                                    <p className="text-sm font-semibold">{fine.employee?.employeeId || fine.employeeId}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Position</p>
                                    <p className="text-sm">{fine.employee?.position || "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Company</p>
                                    <p className="text-sm">{fine.employee?.companyName || "—"}</p>
                                  </div>
                                </div>
                                <Separator className="my-2" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reason</p>
                                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{fine.reason}</p>
                                </div>
                                {/* Fine Amount - prominently displayed */}
                                <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-center">
                                  <p className="text-[10px] uppercase tracking-wider text-red-500 font-semibold">Fine Amount</p>
                                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                                    {fine.amount.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                                    <span className="text-sm font-semibold">SAR</span>
                                  </p>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <p className="text-[10px] text-muted-foreground">
                                    Date of Issue: {formatDateTime(fine.createdAt)}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    {!fine.read && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-700 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                                        onClick={() => handleMarkFineRead(fine.id)}
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                        Mark as Read
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/20"
                                      onClick={() => sendToWhatsApp(fine.employee?.phone || null, generateFineMessage(fine))}
                                      title="Send via WhatsApp"
                                    >
                                      <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                      WhatsApp
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => downloadNoticeAsPDF(
                                        `fine-notice-${fine.id}`,
                                        `Fine_${fine.employeeName.replace(/\s+/g, "_")}.pdf`,
                                        useAppStore.getState().darkMode
                                      )}
                                      title="Download as PDF (white background)"
                                    >
                                      <Download className="h-3.5 w-3.5 mr-1" />
                                      Download
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => window.print()}
                                    >
                                      <Printer className="h-3.5 w-3.5 mr-1" />
                                      Print
                                    </Button>
                                  </div>
                                </div>
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
          </motion.div>
        )}
      </AnimatePresence>
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
// POPUP NOTIFICATION SYSTEM (Super Admin Only)
// ============================================================

function NotificationPopups() {
  const {
    user,
    popupWarnings,
    popupFines,
    setPopupWarnings,
    setPopupFines,
    setView,
    setNotificationsTab,
    setHighlightWarning,
    setHighlightFine,
    setSelectedEmployee,
    setPendingDeleteRequest,
  } = useAppStore();

  const isSuperAdmin = user?.role === "super_admin";

  // Delete request popups state
  const [popupDeleteRequests, setPopupDeleteRequests] = useState<DeleteRequestItem[]>([]);

  // Poll for unread warnings and fines + pending delete requests every 15 seconds
  useEffect(() => {
    if (!isSuperAdmin) return;

    const fetchUnread = async () => {
      try {
        const [warnRes, fineRes, reqRes] = await Promise.all([
          fetch("/api/warnings?read=false"),
          fetch("/api/fines?read=false"),
          fetch("/api/delete-requests?status=pending"),
        ]);

        if (warnRes.ok) {
          const warnData = await warnRes.json();
          if (Array.isArray(warnData)) {
            setPopupWarnings(warnData);
          }
        }

        if (fineRes.ok) {
          const fineData = await fineRes.json();
          if (Array.isArray(fineData)) {
            setPopupFines(fineData);
          }
        }

        if (reqRes.ok) {
          const reqData = await reqRes.json();
          if (Array.isArray(reqData)) {
            setPopupDeleteRequests(reqData);
          }
        }
      } catch {
        // Silently fail
      }
    };

    // Initial fetch
    fetchUnread();

    // Poll every 15 seconds
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [isSuperAdmin, setPopupWarnings, setPopupFines]);

  if (!isSuperAdmin) return null;

  const allPopups = [
    ...popupDeleteRequests.map((r) => ({ ...r, type: "request" as const })),
    ...popupWarnings.map((w) => ({ ...w, type: "warning" as const })),
    ...popupFines.map((f) => ({ ...f, type: "fine" as const })),
  ];

  if (allPopups.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {allPopups.map((item) => (
          <motion.div
            key={`${item.type}-${item.id}`}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto"
          >
            <div className={`rounded-xl shadow-2xl border-2 overflow-hidden ${
              item.type === "request"
                ? "bg-amber-50 dark:bg-amber-950/90 border-amber-400 dark:border-amber-700"
                : item.type === "warning"
                ? "bg-amber-50 dark:bg-amber-950/90 border-amber-400 dark:border-amber-700"
                : "bg-red-50 dark:bg-red-950/90 border-red-400 dark:border-red-700"
            }`}>
              {/* Popup Header */}
              <div className={`px-4 py-2.5 flex items-center gap-2 ${
                item.type === "request"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                  : item.type === "warning"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
              }`}>
                {item.type === "request" ? (
                  <Shield className="h-4 w-4 flex-shrink-0" />
                ) : item.type === "warning" ? (
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <DollarSign className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="text-xs font-bold tracking-wider uppercase">
                  {item.type === "request" ? "Delete Request" : item.type === "warning" ? "New Warning" : "New Fine"}
                </span>
              </div>
              {/* Popup Body */}
              <div className="px-4 py-3">
                <p className="text-sm font-semibold truncate">
                  {item.type === "request" ? (item as DeleteRequestItem).employeeName : (item as WarningItem | FineItem).employeeName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {item.type === "request"
                    ? `Deletion requested${(item as DeleteRequestItem).reason ? `: ${(item as DeleteRequestItem).reason}` : ""}`
                    : (item as WarningItem | FineItem).reason}
                </p>
                {item.type === "fine" && (
                  <p className="text-sm font-bold text-red-700 dark:text-red-400 mt-1">
                    {(item as FineItem).amount.toLocaleString("en-SA", { minimumFractionDigits: 2 })} SAR
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className={`text-xs h-7 ${
                      item.type === "request"
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : item.type === "warning"
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                    onClick={() => {
                      if (item.type === "request") {
                        const req = item as DeleteRequestItem;
                        setSelectedEmployee(req.employeeId);
                        setPendingDeleteRequest(req.id, req.employeeId);
                        setView("employee-detail");
                      } else if (item.type === "warning") {
                        setView("notifications");
                        setNotificationsTab("warnings");
                        setHighlightWarning(item.id);
                      } else {
                        setView("notifications");
                        setNotificationsTab("fines");
                        setHighlightFine(item.id);
                      }
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7"
                    onClick={async () => {
                      if (item.type === "request") {
                        setPopupDeleteRequests(popupDeleteRequests.filter((r) => r.id !== item.id));
                      } else if (item.type === "warning") {
                        try {
                          await fetch("/api/warnings", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: item.id, read: true }),
                          });
                          setPopupWarnings(popupWarnings.filter((w) => w.id !== item.id));
                        } catch {}
                      } else {
                        try {
                          await fetch("/api/fines", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: item.id, read: true }),
                          });
                          setPopupFines(popupFines.filter((f) => f.id !== item.id));
                        } catch {}
                      }
                    }}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
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
      {/* Popup Notification System - visible only for super_admin */}
      <NotificationPopups />
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
