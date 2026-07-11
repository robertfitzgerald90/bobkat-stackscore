"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  CommunicationsPageHeader,
  CommunicationsPanel,
} from "@/components/communications/communications-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewCampaignForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/v1/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, status: "ready" }),
    });
    setLoading(false);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Unable to create campaign");
      return;
    }
    toast.success("Campaign created");
    router.push(`/admin/communications/campaigns/${payload.id}`);
  }

  return (
    <div className="space-y-6">
      <CommunicationsPageHeader
        title="New Campaign"
        description="Create a campaign to group assessment invitations and track conversion."
      />
      <CommunicationsPanel>
        <form className="max-w-xl space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-description">Description</Label>
            <Input
              id="campaign-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="bg-[#082F5B] hover:bg-[#062646]">
            Create Campaign
          </Button>
        </form>
      </CommunicationsPanel>
    </div>
  );
}
