"use client";

import { useEffect, useState } from "react";
import { Building2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { DEMO_INDUSTRY_OPTIONS } from "@/lib/product-overview/demo-profiles";
import { DEMO_BUSINESS_GOALS } from "@/lib/product-overview/demo-profiles/personalization";
import type { DemoIndustryId, DemoPersonalization } from "@/lib/product-overview/demo-profiles/types";
import { scrollToSection } from "@/lib/product-overview/polish-classes";

const STEPS = ["Company", "Industry", "Profile", "Goal"] as const;

export function DemoPersonalizationWizard() {
  const {
    personalization,
    personalizationWizardOpen,
    closePersonalizationWizard,
    applyPersonalization,
  } = useProductOverview();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<DemoPersonalization>(personalization);

  useEffect(() => {
    if (personalizationWizardOpen) {
      setForm(personalization);
      setStep(0);
    }
  }, [personalization, personalizationWizardOpen]);

  function updateIndustry(industryId: DemoIndustryId) {
    const option = DEMO_INDUSTRY_OPTIONS.find((item) => item.id === industryId);
    setForm((current) => ({
      ...current,
      industryId,
      companyName: current.companyName === personalization.companyName ? option?.defaultCompanyName ?? current.companyName : current.companyName,
    }));
  }

  function handleSubmit() {
    applyPersonalization(form);
    scrollToSection("product-overview-dashboard", "start");
  }

  return (
    <Dialog open={personalizationWizardOpen} onOpenChange={(open) => !open && closePersonalizationWizard()}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader className="border-b border-border/70 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            Experience StackScore With Your Company
          </DialogTitle>
          <DialogDescription>
            Personalize this isolated demo with your organization details. Nothing is saved or transmitted.
          </DialogDescription>
          <div className="mt-4 flex gap-2">
            {STEPS.map((label, index) => (
              <div
                key={label}
                className={`h-1 flex-1 rounded-full transition-colors ${index <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          {step === 0 ? (
            <>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={form.companyName}
                onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                placeholder="Acme Precision Manufacturing"
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Label htmlFor="industry">Industry</Label>
              <Select value={form.industryId} onValueChange={(value) => updateIndustry(value as DemoIndustryId)}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_INDUSTRY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employees">Employee Count</Label>
                <Input
                  id="employees"
                  type="number"
                  min={1}
                  value={form.employeeCount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      employeeCount: Number(event.target.value) || current.employeeCount,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locations">Number of Locations</Label>
                <Input
                  id="locations"
                  type="number"
                  min={1}
                  value={form.locationCount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      locationCount: Number(event.target.value) || current.locationCount,
                    }))
                  }
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <Label>Primary Business Goal</Label>
              <div className="grid gap-2">
                {DEMO_BUSINESS_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    className={`rounded-xl border px-4 py-3 text-left transition-all ${
                      form.businessGoal === goal.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/70 hover:border-primary/30"
                    }`}
                    onClick={() => setForm((current) => ({ ...current, businessGoal: goal.id }))}
                  >
                    <p className="font-medium text-foreground">{goal.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border/70 px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((current) => current + 1)} disabled={!form.companyName.trim()}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              <Building2 className="mr-1.5 h-4 w-4" aria-hidden />
              Generate Personalized Demo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DemoPersonalizationLauncher({ className }: { className?: string }) {
  const { openPersonalizationWizard } = useProductOverview();

  return (
    <Button type="button" variant="outline" className={className} onClick={openPersonalizationWizard}>
      <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
      Experience StackScore With Your Company
    </Button>
  );
}
