"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemePreferencePanel } from "@/components/theme/theme-toggle";

export function AccountAppearanceSection() {
  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="text-base">Appearance</CardTitle>
        <CardDescription>
          Choose Light, StackScore Midnight, or match your system. Your preference is saved on this
          device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ThemePreferencePanel />
      </CardContent>
    </Card>
  );
}
