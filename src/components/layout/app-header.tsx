"use client";

import { signOut } from "next-auth/react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { formatUserRole } from "@/lib/display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppHeader({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6 shadow-sm">
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-brand">Technology Maturity Assessments</p>
        <p className="text-xs text-muted-foreground">Executive-ready client insights</p>
      </div>
      <BrandLogo showText={false} size={36} className="sm:hidden" />
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted"
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
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
