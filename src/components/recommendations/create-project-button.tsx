"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FolderKanban, Loader2 } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";
import { formatProjectStatus } from "@/lib/projects";
import type { ClientRecommendationRow } from "@/lib/recommendations/client-list";
import { cn } from "@/lib/utils";

type CreateProjectFromRecommendationButtonProps = {
  clientId: string;
  recommendation: ClientRecommendationRow;
  onCreated?: (projectId: string) => void;
  className?: string;
};

export function CreateProjectFromRecommendationButton({
  clientId,
  recommendation,
  onCreated,
  className,
}: CreateProjectFromRecommendationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (recommendation.project) {
    return (
      <a
        href={`/projects?selected=${recommendation.project.id}`}
        className={buttonClassName({
          variant: "outline",
          size: "sm",
          className: cn("w-full shrink-0 sm:w-auto", className),
        })}
      >
        <FolderKanban className="mr-2 h-4 w-4" />
        {formatProjectStatus(recommendation.project.status)}
      </a>
    );
  }

  if (recommendation.status === "completed" || recommendation.status === "declined") {
    return null;
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/clients/${clientId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          title: recommendation.title,
          description: recommendation.description,
          priority: recommendation.priority,
          categoryId: recommendation.categoryId,
          estimatedImpactPoints: recommendation.estimatedImpactPoints,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 409) {
          toast.error("A project already exists for this recommendation.");
        } else {
          toast.error(error.error ?? "Failed to create project");
        }
        return;
      }

      const project = await response.json();
      toast.success("Project created from recommendation");
      onCreated?.(project.id);
      router.refresh();
    } catch {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={loading}
      className={buttonClassName({
        variant: "default",
        size: "sm",
        className: cn("w-full shrink-0 sm:w-auto", className),
      })}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Create Project
    </button>
  );
}
