"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLIENT_STATUS_LABELS } from "@/lib/display";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    industry: "",
    employeeCount: "",
    status: "prospect",
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch("/api/v1/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        employeeCount: form.employeeCount ? Number(form.employeeCount) : null,
      }),
    });

    setLoading(false);

    if (response.ok) {
      const client = await response.json();
      router.push(clientTechnologyProfilePath(client.id));
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h2 className="page-title">New Client</h2>
        <p className="page-description">Add a business to assess</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryContactName">Contact Name</Label>
                <Input
                  id="primaryContactName"
                  required
                  value={form.primaryContactName}
                  onChange={(e) => setForm({ ...form, primaryContactName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContactEmail">Contact Email</Label>
                <Input
                  id="primaryContactEmail"
                  type="email"
                  required
                  value={form.primaryContactEmail}
                  onChange={(e) => setForm({ ...form, primaryContactEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employees</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={form.employeeCount}
                  onChange={(e) => setForm({ ...form, employeeCount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                items={CLIENT_STATUS_LABELS}
                onValueChange={(value) =>
                  setForm({ ...form, status: value ?? "prospect" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">{CLIENT_STATUS_LABELS.prospect}</SelectItem>
                  <SelectItem value="active">{CLIENT_STATUS_LABELS.active}</SelectItem>
                  <SelectItem value="inactive">{CLIENT_STATUS_LABELS.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Creating..." : "Create Client"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
