import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceHubLink = {
  href: string;
  title: string;
  description: string;
};

type WorkspaceHubLinksProps = {
  links: WorkspaceHubLink[];
};

export function WorkspaceHubLinks({ links }: WorkspaceHubLinksProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "group flex min-w-0 items-start justify-between gap-3 rounded-lg border border-border/60 px-3 py-3",
            "transition-colors hover:border-primary/30 hover:bg-muted/30",
          )}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold group-hover:text-primary">{link.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{link.description}</p>
          </div>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
        </Link>
      ))}
    </div>
  );
}
