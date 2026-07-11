"use client";

import { Monitor, MoonStar, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ThemeChoice = "light" | "midnight" | "system";

const OPTIONS: Array<{
  value: ThemeChoice;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: "light",
    label: "Light",
    description: "Classic StackScore workspace",
    icon: Sun,
  },
  {
    value: "midnight",
    label: "StackScore Midnight",
    description: "Deep navy enterprise theme",
    icon: MoonStar,
  },
  {
    value: "system",
    label: "System",
    description: "Follow OS appearance (dark uses Midnight)",
    icon: Monitor,
  },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const active = (theme ?? "light") as ThemeChoice;
  const ActiveIcon =
    OPTIONS.find((option) => option.value === active)?.icon ??
    (resolvedTheme === "midnight" || resolvedTheme === "dark" ? MoonStar : Sun);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        aria-label="Change color theme"
      >
        {mounted ? <ActiveIcon className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = active === option.value;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(selected && "bg-accent text-accent-foreground")}
              >
                <Icon className="size-4" aria-hidden />
                <div className="min-w-0">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemePreferencePanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-24 animate-pulse rounded-lg bg-muted/40" aria-hidden />;
  }

  const active = (theme ?? "light") as ThemeChoice;

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = active === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={selected ? "default" : "outline"}
            className="h-auto flex-col items-start gap-2 px-4 py-3 text-left"
            onClick={() => setTheme(option.value)}
            aria-pressed={selected}
          >
            <span className="flex items-center gap-2 font-medium">
              <Icon className="size-4" aria-hidden />
              {option.label}
            </span>
            <span className="text-xs font-normal opacity-80">{option.description}</span>
          </Button>
        );
      })}
    </div>
  );
}
