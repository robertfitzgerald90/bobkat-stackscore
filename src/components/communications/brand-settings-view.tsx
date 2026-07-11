"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CommunicationBrandConfig, SocialLink } from "@/lib/communications/brand-types";
import { CommunicationsPageHeader, CommunicationsPanel } from "@/components/communications/communications-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BrandSettingsViewProps = {
  initialBrand: CommunicationBrandConfig;
};

export function BrandSettingsView({ initialBrand }: BrandSettingsViewProps) {
  const [brand, setBrand] = useState(initialBrand);
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof CommunicationBrandConfig>(key: K, value: CommunicationBrandConfig[K]) {
    setBrand((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/v1/admin/communications/brand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brand),
    });
    setLoading(false);
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(payload?.error ?? "Unable to save brand settings");
      return;
    }
    setBrand(payload.brand);
    toast.success("Brand settings saved");
  }

  return (
    <div className="space-y-8">
      <CommunicationsPageHeader
        title="Communications Settings"
        description="Manage logos, colors, typography, footer content, and support information. These settings feed shared email components."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <CommunicationsPanel title="Brand Identity">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary logo URL" value={brand.primaryLogoUrl} onChange={(value) => updateField("primaryLogoUrl", value)} />
            <Field label="Secondary logo URL" value={brand.secondaryLogoUrl ?? ""} onChange={(value) => updateField("secondaryLogoUrl", value || null)} />
            <Field label="Company name" value={brand.companyName} onChange={(value) => updateField("companyName", value)} />
            <Field label="Product name" value={brand.productName} onChange={(value) => updateField("productName", value)} />
            <Field label="Primary color" value={brand.primaryColor} onChange={(value) => updateField("primaryColor", value)} />
            <Field label="Secondary color" value={brand.secondaryColor} onChange={(value) => updateField("secondaryColor", value)} />
            <Field label="Accent color" value={brand.accentColor} onChange={(value) => updateField("accentColor", value)} />
          </div>
        </CommunicationsPanel>

        <CommunicationsPanel title="Buttons & Typography">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary button background" value={brand.buttonPrimaryBg} onChange={(value) => updateField("buttonPrimaryBg", value)} />
            <Field label="Primary button text" value={brand.buttonPrimaryText} onChange={(value) => updateField("buttonPrimaryText", value)} />
            <Field label="Secondary button background" value={brand.buttonSecondaryBg} onChange={(value) => updateField("buttonSecondaryBg", value)} />
            <Field label="Secondary button text" value={brand.buttonSecondaryText} onChange={(value) => updateField("buttonSecondaryText", value)} />
            <Field label="Heading font" value={brand.fontFamilyHeading} onChange={(value) => updateField("fontFamilyHeading", value)} />
            <Field label="Body font" value={brand.fontFamilyBody} onChange={(value) => updateField("fontFamilyBody", value)} />
          </div>
        </CommunicationsPanel>

        <CommunicationsPanel title="Footer & Support">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Website" value={brand.websiteUrl} onChange={(value) => updateField("websiteUrl", value)} />
            <Field label="Support email" value={brand.supportEmail} onChange={(value) => updateField("supportEmail", value)} />
            <Field label="Support phone" value={brand.supportPhone} onChange={(value) => updateField("supportPhone", value)} />
            <Field label="Footer tagline" value={brand.footerTagline} onChange={(value) => updateField("footerTagline", value)} />
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                value={brand.address}
                onChange={(event) => updateField("address", event.target.value)}
                className="mt-2 flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="copyright">Copyright</Label>
              <Input id="copyright" value={brand.copyrightText} onChange={(event) => updateField("copyrightText", event.target.value)} className="mt-2" />
            </div>
          </div>
        </CommunicationsPanel>

        <CommunicationsPanel title="Social Links">
          <SocialLinksEditor
            links={brand.socialLinks}
            onChange={(links) => updateField("socialLinks", links)}
          />
        </CommunicationsPanel>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Brand Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function SocialLinksEditor({
  links,
  onChange,
}: {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}) {
  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div key={`${link.platform}-${index}`} className="grid gap-3 md:grid-cols-3">
          <Input
            value={link.platform}
            placeholder="Platform"
            onChange={(event) => {
              const next = [...links];
              next[index] = { ...next[index], platform: event.target.value };
              onChange(next);
            }}
          />
          <Input
            value={link.label ?? ""}
            placeholder="Label"
            onChange={(event) => {
              const next = [...links];
              next[index] = { ...next[index], label: event.target.value };
              onChange(next);
            }}
          />
          <Input
            value={link.url}
            placeholder="URL"
            onChange={(event) => {
              const next = [...links];
              next[index] = { ...next[index], url: event.target.value };
              onChange(next);
            }}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...links, { platform: "LinkedIn", url: "", label: "LinkedIn" }])}
      >
        Add social link
      </Button>
    </div>
  );
}
