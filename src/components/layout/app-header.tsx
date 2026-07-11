"use client";

import { signOut } from "next-auth/react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CommandPaletteTrigger } from "@/components/command-palette/command-palette-trigger";
import { formatUserRole } from "@/lib/display";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppHeader({
  user,
  pageTitle,
  onMenuClick,
  sidebarCollapsed = false,
  onSidebarToggle,
}: {
  user: { name: string; email: string; role: string };
  pageTitle: string;
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 shadow-[var(--shadow-glow)] lg:h-16 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {onSidebarToggle ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden shrink-0 lg:inline-flex"
            onClick={onSidebarToggle}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        ) : null}
        <BrandLogo showText={false} size={32} className="shrink-0 lg:hidden" />
        <div className="min-w-0 lg:hidden">
          <h1 className="truncate text-base font-semibold text-primary">{pageTitle}</h1>
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="text-sm font-medium text-brand">Technology Maturity Assessments</p>
          <p className="text-xs text-muted-foreground">Executive-ready client insights</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <CommandPaletteTrigger />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Account menu"
          >
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{formatUserRole(user.role)}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="md:hidden">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {formatUserRole(user.role)}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
