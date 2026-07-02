import Link from "next/link";
import {
  ArrowLeftRight,
  Building2,
  CalendarRange,
  FolderKanban,
  History,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { clientProjectsPath, clientRecommendationsPath } from "@/lib/clients/paths";
import type { ProfileSectionVisibility } from "@/lib/technology-profile/types";
import { cn } from "@/lib/utils";

type TpQuickActionsProps = {
  clientId: string;
  sections: ProfileSectionVisibility;
  showCompareAssessments?: boolean;
  showProgressReport?: boolean;
};

type NavLink = {
  href: string;
  label: string;
  icon: typeof Building2;
  prominent?: boolean;
};

export function TpQuickActions({
  clientId,
  sections,
  showCompareAssessments = false,
  showProgressReport = false,
}: TpQuickActionsProps) {
  const links: NavLink[] = [
    {
      href: `/clients/${clientId}/business-profile`,
      label: "Business Profile",
      icon: Building2,
    },
  ];

  if (sections.showRecommendationsLink) {
    links.push({
      href: clientRecommendationsPath(clientId),
      label: "Recommendations",
      icon: Lightbulb,
    });
  }

  if (sections.showInternalQuickActions) {
    links.push(
      {
        href: clientProjectsPath(clientId),
        label: "Project Register",
        icon: FolderKanban,
      },
      {
        href: `/clients/${clientId}/quarterly-review`,
        label: "Quarterly Review",
        icon: CalendarRange,
      },
    );

    if (showProgressReport) {
      links.push({
        href: `/clients/${clientId}/progress-report`,
        label: "Progress Report",
        icon: TrendingUp,
      });
    }

    links.push({
      href: `/clients/${clientId}/improvement-plan`,
      label: "Improvement Plan",
      icon: TrendingUp,
      prominent: true,
    });

    links.push({
      href: `/clients/${clientId}/improvement`,
      label: "Improvement Dashboard",
      icon: TrendingUp,
    });
  }

  if (sections.showAssessmentResultsLink) {
    if (showCompareAssessments) {
      links.push({
        href: `/clients/${clientId}/assessments/compare`,
        label: "Compare Assessments",
        icon: ArrowLeftRight,
      });
    }

    links.push({
      href: `/clients/${clientId}/assessments/history`,
      label: "Assessment History",
      icon: History,
    });
  }

  return (
    <nav
      aria-label="Client workspace navigation"
      className="flex flex-wrap gap-2 border-b border-border/60 pb-4"
    >
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={buttonClassName({
              variant: link.prominent ? "default" : "outline",
              size: "sm",
              className: cn("w-full sm:w-auto"),
            })}
          >
            <Icon className="mr-2 h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
