"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { PermanentDeleteDialog } from "@/components/admin/permanent-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatUserRole, USER_ROLE_LABELS } from "@/lib/display";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MobileDataCard, MobileDataRow } from "@/components/ui/mobile-data-card";
import type { SafeUser } from "@/lib/users/serialize";
import type { UserRole } from "@/generated/prisma/client";
import type { UserDeletionPreview } from "@/lib/records/types";
import { DELETE_CONFIRMATION_TEXT } from "@/lib/records/types";
import { toast } from "sonner";

const ROLES: UserRole[] = ["admin", "technician", "client"];

type UsersManagementProps = {
  initialUsers: SafeUser[];
  currentUserId: string;
};

export function UsersManagement({ initialUsers, currentUserId }: UsersManagementProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [creating, setCreating] = useState(false);
  const [resetUser, setResetUser] = useState<SafeUser | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deleteUser, setDeleteUser] = useState<SafeUser | null>(null);
  const [deletePreview, setDeletePreview] = useState<UserDeletionPreview | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "technician" as UserRole,
    isActive: true,
  });

  async function refreshUsers() {
    const response = await fetch("/api/v1/users");
    if (response.ok) {
      const data = await response.json();
      setUsers(data.data);
    }
  }

  async function openDeleteUser(user: SafeUser) {
    const response = await fetch(`/api/v1/users/${user.id}/deletion-preview`);
    if (!response.ok) {
      toast.error("Unable to load deletion preview");
      return;
    }
    setDeletePreview(await response.json());
    setDeleteUser(user);
  }

  async function handlePermanentDeleteUser() {
    if (!deleteUser) return;

    setDeletingUser(true);
    const response = await fetch(`/api/v1/users/${deleteUser.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: DELETE_CONFIRMATION_TEXT }),
    });
    setDeletingUser(false);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to delete user");
      return;
    }

    toast.success("User permanently deleted");
    setDeleteUser(null);
    setDeletePreview(null);
    await refreshUsers();
    router.refresh();
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);

    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });

    setCreating(false);

    if (response.ok) {
      toast.success("User created successfully");
      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: "technician",
        isActive: true,
      });
      await refreshUsers();
      router.refresh();
      return;
    }

    const error = await response.json();
    toast.error(error.error ?? "Failed to create user");
  }

  async function updateUser(
    userId: string,
    data: { role?: UserRole; isActive?: boolean },
  ) {
    setUpdatingUserId(userId);

    const response = await fetch(`/api/v1/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setUpdatingUserId(null);

    if (response.ok) {
      const updated = await response.json();
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
      toast.success("User updated");
      router.refresh();
      return;
    }

    const error = await response.json();
    toast.error(error.error ?? "Failed to update user");
  }

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!resetUser) return;

    setResetting(true);
    const response = await fetch(`/api/v1/users/${resetUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPassword }),
    });
    setResetting(false);

    if (response.ok) {
      toast.success(`Password reset for ${resetUser.name}`);
      setResetUser(null);
      setResetPassword("");
      return;
    }

    const error = await response.json();
    toast.error(error.error ?? "Failed to reset password");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create User
          </CardTitle>
          <CardDescription>Add a new Bobkat StackScore account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, password: event.target.value }))
                }
                minLength={10}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    role: (value ?? "technician") as UserRole,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {USER_ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={createForm.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    isActive: value === "active",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end md:col-span-2">
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-mobile space-y-3">
            {users.map((user) => (
              <MobileDataCard key={user.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {user.name}
                      {user.id === currentUserId ? (
                        <Badge variant="outline" className="ml-2 text-xs">
                          You
                        </Badge>
                      ) : null}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      updateUser(user.id, { role: (value ?? user.role) as UserRole })
                    }
                    disabled={updatingUserId === user.id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{formatUserRole(user.role)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {USER_ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={updatingUserId === user.id}
                    onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                  >
                    {user.isActive ? "Disable" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setResetUser(user);
                      setResetPassword("");
                    }}
                  >
                    <KeyRound className="mr-1 h-4 w-4" />
                    Reset Password
                  </Button>
                  {user.id !== currentUserId ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => openDeleteUser(user)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  ) : null}
                </div>
              </MobileDataCard>
            ))}
          </div>

          <div className="table-desktop">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name}
                    {user.id === currentUserId ? (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        updateUser(user.id, { role: (value ?? user.role) as UserRole })
                      }
                      disabled={updatingUserId === user.id}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>{formatUserRole(user.role)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {USER_ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingUserId === user.id}
                        onClick={() =>
                          updateUser(user.id, { isActive: !user.isActive })
                        }
                      >
                        {user.isActive ? "Disable" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setResetUser(user);
                          setResetPassword("");
                        }}
                      >
                        <KeyRound className="mr-1 h-4 w-4" />
                        Reset Password
                      </Button>
                      {user.id !== currentUserId ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteUser(user)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!resetUser} onOpenChange={(open) => !open && setResetUser(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Reset Password</SheetTitle>
            <SheetDescription>
              Set a new password for {resetUser?.name}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Password</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                minLength={10}
                required
              />
            </div>
            <Button type="submit" disabled={resetting} className="w-full">
              {resetting ? "Saving..." : "Reset Password"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <PermanentDeleteDialog
        open={!!deleteUser}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteUser(null);
            setDeletePreview(null);
          }
        }}
        title="Permanently Delete User"
        description="Users are normally disabled instead of deleted. Permanent deletion is only available when the user has no assessment or recommendation ownership history."
        entityName={deleteUser?.name ?? ""}
        countItems={
          deletePreview
            ? [
                { label: "Assessments conducted", count: deletePreview.counts.assessments },
                {
                  label: "Recommendations created",
                  count: deletePreview.counts.recommendationsCreated,
                },
                { label: "Projects assigned", count: deletePreview.counts.projectsAssigned },
                { label: "Documents uploaded", count: deletePreview.counts.documentsUploaded },
                { label: "Notes authored", count: deletePreview.counts.notes },
              ]
            : []
        }
        onConfirm={handlePermanentDeleteUser}
        loading={deletingUser}
      />
    </div>
  );
}
