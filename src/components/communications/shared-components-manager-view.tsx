"use client";

import Link from "next/link";
import type { CommunicationBrandConfig } from "@/lib/communications/brand-types";
import {
  SHARED_COMPONENT_DEFINITIONS,
  getSharedComponentPreviewValues,
  type SharedComponentId,
} from "@/lib/communications/shared-components";
import { CommunicationsPageHeader, CommunicationsPanel } from "@/components/communications/communications-shell";
import { buttonClassName } from "@/components/ui/button";

type SharedComponentsManagerViewProps = {
  brand: CommunicationBrandConfig;
};

export function SharedComponentsManagerView({ brand }: SharedComponentsManagerViewProps) {
  return (
    <div className="space-y-8">
      <CommunicationsPageHeader
        title="Shared Components"
        description="Reusable email building blocks. Changes to brand settings and component overrides propagate to every template automatically."
        actions={
          <Link href="/admin/communications/settings" className={buttonClassName({ variant: "outline" })}>
            Edit Brand Settings
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {SHARED_COMPONENT_DEFINITIONS.map((component) => {
          const preview = getSharedComponentPreviewValues(brand, component.id as SharedComponentId);
          return (
            <CommunicationsPanel key={component.id} title={component.name}>
              <p className="text-sm text-secondary-token">{component.description}</p>
              <div className="mt-4 space-y-2">
                {Object.entries(preview).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-3 rounded-lg border border-[#1e3a5f]/10 bg-[#082F5B]/[0.02] px-3 py-2"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {label}
                    </span>
                    <span className="max-w-[60%] text-right text-sm text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Editable: {component.editableFields.join(" · ")}
              </p>
            </CommunicationsPanel>
          );
        })}
      </div>
    </div>
  );
}
