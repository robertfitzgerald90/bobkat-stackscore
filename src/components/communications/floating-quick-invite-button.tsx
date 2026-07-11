"use client";

import { UserPlus } from "lucide-react";
import { useQuickInviteOptional } from "@/components/communications/quick-invite-provider";
import { cn } from "@/lib/utils";

export function FloatingQuickInviteButton({ className }: { className?: string }) {
  const quickInvite = useQuickInviteOptional();
  if (!quickInvite) return null;

  return (
    <button
      type="button"
      aria-label="Quick Invite"
      title="Quick Invite (Ctrl+I)"
      onClick={() => quickInvite.openQuickInvite()}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#082F5B] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#062646] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082F5B] focus-visible:ring-offset-2",
        className,
      )}
    >
      <UserPlus className="size-5" />
      Quick Invite
    </button>
  );
}
