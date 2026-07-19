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
  variant = "default",
}: {
  user: { name: string; email: string; role: string };
  pageTitle: string;
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  variant?: "default" | "workspaceShell";
}) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const isWorkspaceShell = variant === "workspaceShell";
  const Root = isWorkspaceShell ? "div" : "header";

  return (
    <Root
      className={
        isWorkspaceShell
          ? "flex h-14 shrink-0 items-center justify-between gap-3 bg-sidebar px-4 lg:h-16 lg:px-6"
          : "flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 shadow-[var(--shadow-glow)] lg:h-16 lg:px-6"
      }
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={
            isWorkspaceShell
              ? "shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
              : "shrink-0 lg:hidden"
          }
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
            className={
              isWorkspaceShell
                ? "hidden shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:inline-flex"
                : "hidden shrink-0 lg:inline-flex"
            }
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
          <h1
            className={
              isWorkspaceShell
                ? "truncate text-base font-semibold text-sidebar-foreground"
                : "truncate text-base font-semibold text-primary"
            }
          >
            {pageTitle}
          </h1>
        </div>
        <div className="hidden min-w-0 lg:block">
          <p
            className={
              isWorkspaceShell
                ? "text-sm font-medium text-sidebar-foreground"
                : "text-sm font-medium text-brand"
            }
          >
            Technology Maturity Assessments
          </p>
          <p
            className={
              isWorkspaceShell
                ? "text-xs text-sidebar-foreground/70"
                : "text-xs text-muted-foreground"
            }
          >
            Executive-ready client insights
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <CommandPaletteTrigger
          className={
            isWorkspaceShell
              ? "border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground/90 hover:bg-sidebar-accent/50"
              : undefined
          }
        />
        <ThemeToggle
          className={
            isWorkspaceShell
              ? "border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent/50 focus-visible:ring-sidebar-ring focus-visible:ring-offset-sidebar"
              : undefined
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            className={
              isWorkspaceShell
                ? "flex shrink-0 items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
                : "flex shrink-0 items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            }
            aria-label="Account menu"
          >
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback
                className={
                  isWorkspaceShell
                    ? "bg-sidebar-primary text-xs text-sidebar-primary-foreground"
                    : "bg-primary text-xs text-primary-foreground"
                }
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className={isWorkspaceShell ? "text-sm font-medium text-sidebar-foreground" : "text-sm font-medium"}>
                {user.name}
              </p>
              <p
                className={
                  isWorkspaceShell
                    ? "text-xs text-sidebar-foreground/70"
                    : "text-xs text-muted-foreground"
                }
              >
                {formatUserRole(user.role)}
              </p>
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
    </Root>
  );
}
