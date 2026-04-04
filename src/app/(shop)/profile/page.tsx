"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { toast } from "sonner";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  MapPin,
  Shield,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Profile {
  name: string;
  email: string;
  phone: string;
}

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

const emptyAddress: Omit<Address, "id"> = {
  label: "Home",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Dhaka",
  isDefault: false,
};

const districts = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

const labelOptions = ["Home", "Office", "Other"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  /* ---- profile state ---- */
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  /* ---- addresses state ---- */
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressForm, setAddressForm] = useState<Omit<Address, "id">>(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [addressDeleting, setAddressDeleting] = useState(false);

  /* ---- password state ---- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  /* ---- danger zone state ---- */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [accountDeleting, setAccountDeleting] = useState(false);

  /* ================================================================ */
  /*  Fetch on mount                                                   */
  /* ================================================================ */

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.status === 401) {
          router.push("/login?callbackUrl=/profile");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
          });
        }
      } catch {
        // fail silently
      } finally {
        setProfileLoading(false);
      }
    }

    async function fetchAddresses() {
      try {
        const res = await fetch("/api/user/addresses");
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses || data || []);
        }
      } catch {
        // fail silently
      } finally {
        setAddressesLoading(false);
      }
    }

    fetchProfile();
    fetchAddresses();
  }, [router]);

  /* ================================================================ */
  /*  Handlers — Profile                                               */
  /* ================================================================ */

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setProfileSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  }

  /* ================================================================ */
  /*  Handlers — Addresses                                             */
  /* ================================================================ */

  function openNewAddress() {
    setEditingId(null);
    setAddressForm(emptyAddress);
    setAddressDialogOpen(true);
  }

  function openEditAddress(addr: Address) {
    setEditingId(addr.id);
    setAddressForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setAddressDialogOpen(true);
  }

  async function handleAddressSave() {
    if (!addressForm.fullName.trim() || !addressForm.address.trim() || !addressForm.city.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setAddressSaving(true);
    try {
      const url = editingId
        ? `/api/user/addresses/${editingId}`
        : "/api/user/addresses";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save address");
        return;
      }

      toast.success(editingId ? "Address updated" : "Address added");
      setAddressDialogOpen(false);

      // Refresh addresses
      const listRes = await fetch("/api/user/addresses");
      if (listRes.ok) {
        const listData = await listRes.json();
        setAddresses(listData.addresses || listData || []);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAddressSaving(false);
    }
  }

  async function handleAddressDelete() {
    if (!deleteTarget) return;
    setAddressDeleting(true);
    try {
      const res = await fetch(`/api/user/addresses/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete address");
        return;
      }
      toast.success("Address deleted");
      setDeleteTarget(null);
      setAddresses((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAddressDeleting(false);
    }
  }

  /* ================================================================ */
  /*  Handlers — Password                                              */
  /* ================================================================ */

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  }

  /* ================================================================ */
  /*  Handlers — Delete Account                                        */
  /* ================================================================ */

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;
    setAccountDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete account");
        return;
      }
      toast.success("Account deleted");
      dispatch(logout());
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAccountDeleting(false);
    }
  }

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  if (profileLoading) return <LoadingSpinner className="py-24" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight">My Account</h1>

      <Tabs defaultValue="personal" className="mt-8">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="personal">
            <User className="mr-1.5 h-4 w-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="mr-1.5 h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-1.5 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="danger">
            <AlertTriangle className="mr-1.5 h-4 w-4" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* ---- Tab 1: Personal Info ---- */}
        <TabsContent value="personal">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name, email, and phone number.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSave}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full Name</Label>
                  <Input
                    id="profile-name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
                <Button type="submit" disabled={profileSaving}>
                  {profileSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        {/* ---- Tab 2: Addresses ---- */}
        <TabsContent value="addresses">
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>
                  Manage your delivery addresses.
                </CardDescription>
              </div>
              <Button size="sm" onClick={openNewAddress}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add New Address
              </Button>
            </CardHeader>
            <CardContent>
              {addressesLoading ? (
                <LoadingSpinner />
              ) : addresses.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No saved addresses yet.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <Card key={addr.id} className="relative">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary">{addr.label}</Badge>
                          {addr.isDefault && (
                            <Badge variant="default">Default</Badge>
                          )}
                        </div>
                        <p className="font-medium">{addr.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {addr.phone}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {addr.address}, {addr.city}
                          {addr.state && `, ${addr.state}`}, {addr.zipCode},{" "}
                          {addr.country}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditAddress(addr)}
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTarget(addr)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Create / Edit Dialog */}
          <Dialog
            open={addressDialogOpen}
            onOpenChange={(open) => !open && setAddressDialogOpen(false)}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Address" : "New Address"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Select
                    value={addressForm.label}
                    onValueChange={(v) =>
                      setAddressForm((f) => ({ ...f, label: v as string }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {labelOptions.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={addressForm.fullName}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Input
                    value={addressForm.address}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((f) => ({ ...f, city: e.target.value }))
                      }
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm((f) => ({ ...f, state: e.target.value }))
                      }
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ZIP Code</Label>
                    <Input
                      value={addressForm.zipCode}
                      onChange={(e) =>
                        setAddressForm((f) => ({
                          ...f,
                          zipCode: e.target.value,
                        }))
                      }
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Select
                      value={addressForm.country}
                      onValueChange={(v) =>
                        setAddressForm((f) => ({ ...f, country: v as string }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={addressForm.isDefault}
                    onCheckedChange={(checked) =>
                      setAddressForm((f) => ({ ...f, isDefault: !!checked }))
                    }
                  />
                  <Label className="cursor-pointer">
                    Set as default address
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline" />}
                >
                  Cancel
                </DialogClose>
                <Button onClick={handleAddressSave} disabled={addressSaving}>
                  {addressSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? "Update" : "Add"} Address
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Address Delete Confirmation Dialog */}
          <Dialog
            open={!!deleteTarget}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Address</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the address &quot;
                  {deleteTarget?.label}&quot; for {deleteTarget?.fullName}? This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleAddressDelete}
                  disabled={addressDeleting}
                >
                  {addressDeleting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ---- Tab 3: Security ---- */}
        <TabsContent value="security">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" disabled={passwordSaving}>
                  {passwordSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Change Password
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        {/* ---- Tab 4: Danger Zone ---- */}
        <TabsContent value="danger">
          <Card className="mt-4 border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                <h3 className="font-semibold text-red-700 dark:text-red-400">
                  Delete Account
                </h3>
                <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  className="mt-4"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delete Account Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setDeleteDialogOpen(false);
                setDeleteConfirmText("");
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This will permanently delete your account, orders, addresses,
                  and all associated data. This action is irreversible.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label>
                  Type <span className="font-mono font-bold">DELETE</span> to
                  confirm
                </Label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setDeleteConfirmText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || accountDeleting}
                >
                  {accountDeleting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Permanently Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
