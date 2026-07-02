"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLIENT_STATUS_LABELS } from "@/lib/display";
import {
  DEFAULT_NEW_CLIENT_FORM_VALUES,
  submitNewClient,
  type CreatedClient,
  type NewClientFormValues,
} from "@/lib/clients/create-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type NewClientFormProps = {
  onSuccess: (client: CreatedClient) => void;
  submitLabel?: string;
};

export function NewClientForm({
  onSuccess,
  submitLabel = "Create Client",
}: NewClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<NewClientFormValues>(DEFAULT_NEW_CLIENT_FORM_VALUES);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const result = await submitNewClient(form);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Client created");
    setForm(DEFAULT_NEW_CLIENT_FORM_VALUES);
    onSuccess(result.client);
  }

  return (
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
      <div className="grid gap-4 sm:grid-cols-2">
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
      <div className="grid gap-4 sm:grid-cols-2">
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
            setForm({ ...form, status: (value ?? "prospect") as NewClientFormValues["status"] })
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
        {loading ? "Creating..." : submitLabel}
      </Button>
    </form>
  );
}
