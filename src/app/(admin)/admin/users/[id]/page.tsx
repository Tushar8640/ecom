"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Ban, ShieldCheck, Mail, Phone, Calendar, ShoppingBag, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  adminRole: string | null;
  phone: string | null;
  avatar: string | null;
  isBanned: boolean;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [banDialog, setBanDialog] = useState(false);
  const [roleDialog, setRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        toast.error("User not found");
        router.push("/admin/users");
      }
    } catch { toast.error("Failed to load user"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const toggleBan = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !user.isBanned }),
      });
      if (res.ok) {
        toast.success(user.isBanned ? "User unbanned" : "User banned");
        setBanDialog(false);
        fetchUser();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const changeRole = async () => {
    if (!user || !newRole) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success("Role updated");
        setRoleDialog(false);
        fetchUser();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-sm text-gray-500">User details and management</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {user.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {user.phone || "—"}</p>
            <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Joined {new Date(user.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Role:</span>
              <Badge variant="secondary">{user.role}</Badge>
              {user.adminRole && <Badge variant="outline">{user.adminRole}</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              {user.isBanned ? (
                <Badge variant="destructive">Banned</Badge>
              ) : (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Active</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Loyalty: {user.loyaltyPoints} pts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={user.isBanned ? "default" : "destructive"}
              size="sm"
              className="w-full"
              onClick={() => setBanDialog(true)}
            >
              <Ban className="mr-2 h-4 w-4" />
              {user.isBanned ? "Unban User" : "Ban User"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => { setNewRole(user.role); setRoleDialog(true); }}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Change Role
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Ban Confirmation Dialog */}
      <Dialog open={banDialog} onOpenChange={setBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{user.isBanned ? "Unban User" : "Ban User"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to {user.isBanned ? "unban" : "ban"} <strong>{user.name}</strong>?
            {!user.isBanned && " They will not be able to log in."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialog(false)}>Cancel</Button>
            <Button variant={user.isBanned ? "default" : "destructive"} onClick={toggleBan} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user.isBanned ? "Unban" : "Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleDialog} onOpenChange={setRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
          </DialogHeader>
          <Select value={newRole} onValueChange={(v) => setNewRole(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog(false)}>Cancel</Button>
            <Button onClick={changeRole} disabled={saving || newRole === user.role}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
