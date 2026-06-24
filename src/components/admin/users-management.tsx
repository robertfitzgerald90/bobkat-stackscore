"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserPlus } from "lucide-react";
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
import type { SafeUser } from "@/lib/users/serialize";
import type { UserRole } from "@/generated/prisma/client";
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
    </div>
  );
}
