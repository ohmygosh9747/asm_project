"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Users,
  UserPlus,
  LogOut,
  Shield,
  Pencil,
  Trash2,
  Search,
  Crown,
  Mail,
  Calendar,
  RefreshCw,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

interface Admin {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Dashboard() {
  const { user, logout, setCurrentView } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAdmin, setDeleteAdmin] = useState<Admin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admins");
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.admins);
      }
    } catch {
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    logout();
    setCurrentView("login");
    useAuthStore.getState().setHasUsers(true);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail || !createPassword) {
      toast.error("Email and password are required");
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: createEmail, password: createPassword, name: createName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create admin");
        return;
      }
      toast.success("Admin created successfully");
      setCreateOpen(false);
      setCreateEmail("");
      setCreatePassword("");
      setCreateName("");
      fetchAdmins();
    } catch {
      toast.error("Failed to create admin");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdmin) return;
    setEditLoading(true);
    try {
      const body: { email?: string; name?: string; password?: string } = {};
      if (editEmail && editEmail !== editAdmin.email) body.email = editEmail;
      if (editName !== (editAdmin.name || "")) body.name = editName;
      if (editPassword) body.password = editPassword;

      const res = await fetch(`/api/admins/${editAdmin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update admin");
        return;
      }
      toast.success("Admin updated successfully");
      setEditOpen(false);
      setEditAdmin(null);
      fetchAdmins();
    } catch {
      toast.error("Failed to update admin");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteAdmin) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admins/${deleteAdmin.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete admin");
        return;
      }
      toast.success("Admin deleted successfully");
      setDeleteOpen(false);
      setDeleteAdmin(null);
      fetchAdmins();
    } catch {
      toast.error("Failed to delete admin");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditDialog = (admin: Admin) => {
    setEditAdmin(admin);
    setEditEmail(admin.email);
    setEditName(admin.name || "");
    setEditPassword("");
    setEditOpen(true);
  };

  const openDeleteDialog = (admin: Admin) => {
    setDeleteAdmin(admin);
    setDeleteOpen(true);
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.name && admin.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-emerald-200/50 dark:border-emerald-800/50 bg-white dark:bg-slate-900">
          <SidebarHeader className="p-4 border-b border-emerald-200/30 dark:border-emerald-800/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base leading-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Management System
                </p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive
                      className="cursor-pointer bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                    >
                      <Users className="w-4 h-4" />
                      <span>Manage Admins</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-3 border-t border-emerald-200/30 dark:border-emerald-800/30">
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <Avatar className="h-9 w-9 bg-gradient-to-br from-emerald-400 to-teal-500">
                <AvatarFallback className="bg-transparent text-white text-xs font-bold">
                  {user?.name ? getInitials(user.name) : user?.email?.charAt(0).toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" />
                  Super Admin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="flex-1 h-9"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title="Toggle theme"
              >
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
              <Button
                variant="ghost"
                size="icon"
                className="flex-1 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset>
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-emerald-200/30 dark:border-emerald-800/30">
            <div className="flex items-center px-4 md:px-6 py-3">
              <SidebarTrigger className="mr-3" />
              <div className="flex-1">
                <h1 className="text-xl font-bold">Manage Admins</h1>
                <p className="text-xs text-muted-foreground">
                  Create, edit, and manage admin accounts
                </p>
              </div>
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create Admin</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </header>

          <div className="p-4 md:p-6 lg:p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-emerald-200/30 dark:border-emerald-800/30 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{admins.length}</p>
                        <p className="text-xs text-muted-foreground">Normal Admins</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-amber-200/30 dark:border-amber-800/30 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-lg flex items-center justify-center">
                        <Crown className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">1</p>
                        <p className="text-xs text-muted-foreground">Super Admin</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="border-teal-200/30 dark:border-teal-800/30 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-950/30 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{admins.length + 1}</p>
                        <p className="text-xs text-muted-foreground">Total Users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Admins Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-emerald-200/30 dark:border-emerald-800/30">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Admin Accounts</CardTitle>
                      <CardDescription>
                        List of all admin accounts in the system
                      </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search admins..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/30 dark:border-emerald-800/30"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                  ) : admins.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">No Admins Yet</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                        Get started by creating your first admin account. They&apos;ll be able to manage the system.
                      </p>
                      <Button
                        onClick={() => setCreateOpen(true)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create First Admin
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-emerald-100 dark:border-emerald-900/30">
                            <TableHead className="text-emerald-700 dark:text-emerald-400">Name</TableHead>
                            <TableHead className="text-emerald-700 dark:text-emerald-400">Email</TableHead>
                            <TableHead className="text-emerald-700 dark:text-emerald-400">Role</TableHead>
                            <TableHead className="text-emerald-700 dark:text-emerald-400">Created</TableHead>
                            <TableHead className="text-right text-emerald-700 dark:text-emerald-400">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {filteredAdmins.map((admin, index) => (
                              <motion.tr
                                key={admin.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7 bg-gradient-to-br from-emerald-400 to-teal-500">
                                      <AvatarFallback className="bg-transparent text-white text-[10px] font-bold">
                                        {admin.name ? getInitials(admin.name) : admin.email.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    {admin.name || (
                                      <span className="text-muted-foreground italic">No name</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="flex items-center gap-2 text-sm">
                                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                    {admin.email}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className="capitalize bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  >
                                    {admin.role === "SUPER_ADMIN" ? (
                                      <span className="flex items-center gap-1">
                                        <Crown className="w-3 h-3" />
                                        Super Admin
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Admin
                                      </span>
                                    )}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(admin.createdAt)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openEditDialog(admin)}
                                      title="Edit admin"
                                      className="h-8 w-8 hover:bg-emerald-100 dark:hover:bg-emerald-950/30"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openDeleteDialog(admin)}
                                      title="Delete admin"
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </SidebarInset>
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              Create New Admin
            </DialogTitle>
            <DialogDescription>
              Add a new admin account to the system. They will be able to log in with these credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name (Optional)</Label>
              <Input
                id="create-name"
                placeholder="Full name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="admin@example.com"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                {createLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create Admin"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-white" />
              </div>
              Edit Admin
            </DialogTitle>
            <DialogDescription>
              Update the admin account details. Leave password empty to keep the current one.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Full name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="admin@example.com"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave empty to keep current"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                {editLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              Delete Admin
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteAdmin?.email}</strong>? This action
              cannot be undone. The admin will permanently lose access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete Admin"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
