"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectAdminActions } from "@/components/admin/project-admin-actions";
import { ExternalLink, FolderKanban, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDisplayDate, formatPriority } from "@/lib/display";
import {
  ALL_PROJECT_STATUSES,
  OPEN_PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  formatProjectStatus,
} from "@/lib/projects";
import type { SerializedProject } from "@/lib/projects/serialize";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import type { Priority, ProjectStatus } from "@/generated/prisma/client";
import { MobileDataCard, MobileDataRow } from "@/components/ui/mobile-data-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRIORITY_VARIANT: Record<Priority, "destructive" | "warning" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};

const STATUS_VARIANT: Record<
  ProjectStatus,
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  proposed: "outline",
  approved: "secondary",
  scheduled: "secondary",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
};

type ProjectsSummary = {
  total: number;
  open: number;
  completed: number;
  byStatus: Record<string, number>;
  byClient: Array<{ clientId: string; clientName: string; count: number }>;
};

type ProjectsDashboardProps = {
  initialProjects: SerializedProject[];
  summary: ProjectsSummary;
  isAdmin?: boolean;
};

type ViewFilter = "all" | "open" | "completed";

export function ProjectsDashboard({
  initialProjects,
  summary,
  isAdmin = false,
}: ProjectsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");
  const clientFromUrl = searchParams.get("client");
  const [projects, setProjects] = useState(initialProjects);
  const [view, setView] = useState<ViewFilter>("all");
  const [clientFilter, setClientFilter] = useState<string>(clientFromUrl ?? "all");
  const [showCancelled, setShowCancelled] = useState(false);
  const [selectedProject, setSelectedProject] = useState<SerializedProject | null>(null);
  const [editStatus, setEditStatus] = useState<ProjectStatus>("proposed");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientFromUrl) {
      setClientFilter(clientFromUrl);
    }
  }, [clientFromUrl]);

  useEffect(() => {
    if (selectedId) {
      const match = projects.find((project) => project.id === selectedId);
      if (match) {
        setSelectedProject(match);
        setEditStatus(match.status);
        setEditNotes(match.notes ?? "");
      }
    }
  }, [selectedId, projects]);

  function openProject(project: SerializedProject) {
    setSelectedProject(project);
    setEditStatus(project.status);
    setEditNotes(project.notes ?? "");
  }

  function closeProject() {
    setSelectedProject(null);
    if (selectedId) {
      router.replace("/projects");
    }
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (!isAdmin || !showCancelled) {
        if (project.status === "cancelled") return false;
      }
      if (view === "open" && !OPEN_PROJECT_STATUSES.includes(project.status)) return false;
      if (view === "completed" && project.status !== "completed") return false;
      if (clientFilter !== "all" && project.clientId !== clientFilter) return false;
      return true;
    });
  }, [projects, view, clientFilter, isAdmin, showCancelled]);

  async function saveProject() {
    if (!selectedProject) return;

    const previousStatus = selectedProject.status;
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, notes: editNotes }),
      });

      if (!response.ok) {
        const error = await response.json();
        setEditStatus(previousStatus);
        toast.error(error.error ?? "Failed to update project");
        return;
      }

      const updated = (await response.json()) as SerializedProject;
      setProjects((current) =>
        current.map((project) => (project.id === updated.id ? updated : project)),
      );
      setSelectedProject(updated);
      setEditStatus(updated.status);
      toast.success(
        updated.status === "completed" && previousStatus !== "completed"
          ? "Project completed and recommendation marked complete"
          : "Project updated",
      );
      router.refresh();
    } catch {
      setEditStatus(previousStatus);
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell min-w-0">
      <div className="page-header">
        <h2 className="page-title">Projects</h2>
        <p className="page-description">
          Track improvement work created from assessment recommendations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Open Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-brand">{summary.open}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Completed Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-success">{summary.completed}</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-brand">{summary.total}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="stat-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">By Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ALL_PROJECT_STATUSES.map((status) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2 text-sm"
              >
                <span>{PROJECT_STATUS_LABELS[status]}</span>
                <span className="font-semibold tabular-nums">{summary.byStatus[status] ?? 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="stat-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">By Client</CardTitle>
            <CardDescription>Project count per client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.byClient.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No projects yet. Convert recommendations from assessment results into projects.
              </p>
            ) : (
              summary.byClient.map((client) => (
                <button
                  key={client.clientId}
                  type="button"
                  onClick={() => {
                    setClientFilter(client.clientId);
                    setView("all");
                  }}
                  className="flex w-full items-center justify-between rounded-md border border-border/50 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"
                >
                  <span className="font-medium">{client.clientName}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {client.count} project{client.count === 1 ? "" : "s"}
                  </span>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="stat-card">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-brand" />
                Project Workflow
              </CardTitle>
              <CardDescription>Manage status, notes, and completion</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {(["all", "open", "completed"] as ViewFilter[]).map((option) => (
                <Button
                  key={option}
                  variant={view === option ? "default" : "outline"}
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setView(option)}
                >
                  {option === "all" ? "All Projects" : `${option} Projects`}
                </Button>
              ))}
              {clientFilter !== "all" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setClientFilter("all")}
                >
                  Clear client filter
                </Button>
              ) : null}
              {isAdmin ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setShowCancelled((current) => !current)}
                >
                  {showCancelled ? "Hide Cancelled" : "Show Cancelled"}
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {projects.length === 0
                  ? "No projects yet. Open a completed assessment and convert a recommendation into a project."
                  : "No projects match the current filters."}
              </p>
              {projects.length === 0 ? (
                <Link href="/clients" className={buttonClassName({ variant: "outline", size: "sm", className: "mt-4" })}>
                  View Clients
                </Link>
              ) : null}
            </div>
          ) : (
            <>
              <div className="table-mobile">
                {filteredProjects.map((project) => (
                  <MobileDataCard key={project.id} onClick={() => openProject(project)}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">{project.title}</p>
                      <Badge variant={STATUS_VARIANT[project.status]} className="shrink-0">
                        {formatProjectStatus(project.status)}
                      </Badge>
                    </div>
                    <MobileDataRow label="Client">{project.clientName}</MobileDataRow>
                    <MobileDataRow label="Priority">
                      <Badge variant={PRIORITY_VARIANT[project.priority]}>
                        {formatPriority(project.priority)}
                      </Badge>
                    </MobileDataRow>
                    <MobileDataRow label="Score Impact">
                      {project.estimatedImpactPoints !== null
                        ? `+${project.estimatedImpactPoints}`
                        : "—"}
                    </MobileDataRow>
                    <MobileDataRow label="Created">
                      {formatDisplayDate(project.createdAt)}
                    </MobileDataRow>
                    <p className="truncate text-xs text-muted-foreground">
                      {project.recommendationTitle}
                    </p>
                  </MobileDataCard>
                ))}
              </div>

              <div className="table-desktop min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Source Recommendation</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Score Impact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer"
                    onClick={() => openProject(project)}
                  >
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {project.recommendationTitle}
                    </TableCell>
                    <TableCell>
                      <Badge variant={PRIORITY_VARIANT[project.priority]}>
                        {formatPriority(project.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {project.estimatedImpactPoints !== null
                        ? `+${project.estimatedImpactPoints}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[project.status]}>
                        {formatProjectStatus(project.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDisplayDate(project.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selectedProject} onOpenChange={(open) => !open && closeProject()}>
        <SheetContent size="wide">
          {selectedProject ? (
            <>
              <SheetHeader>
                <SheetTitle>{selectedProject.title}</SheetTitle>
                <SheetDescription>
                  {selectedProject.clientName} · {selectedProject.categoryName}
                </SheetDescription>
              </SheetHeader>

              <SheetBody className="flex flex-col">
                <div className="flex min-h-full flex-1 flex-col gap-4 pb-2">
                  <div className="rounded-lg border border-border/60 bg-muted/15 p-3.5 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Source Recommendation</span>
                      <p className="break-words font-medium leading-snug">
                        {selectedProject.recommendationTitle}
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                      <div className="space-y-0.5">
                        <span className="text-xs text-muted-foreground">Impact</span>
                        <p className="font-medium tabular-nums">
                          {selectedProject.estimatedImpactPoints !== null
                            ? `+${selectedProject.estimatedImpactPoints} pts`
                            : "—"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs text-muted-foreground">Created</span>
                        <p>{formatDisplayDate(selectedProject.createdAt)}</p>
                      </div>
                      <div className="col-span-2 space-y-0.5">
                        <span className="text-xs text-muted-foreground">Completed</span>
                        <p>{formatDisplayDate(selectedProject.completedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-status">Status</Label>
                    <Select
                      value={editStatus}
                      items={PROJECT_STATUS_LABELS}
                      disabled={saving}
                      onValueChange={(value) => setEditStatus((value ?? editStatus) as ProjectStatus)}
                    >
                      <SelectTrigger id="project-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        {ALL_PROJECT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {PROJECT_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editStatus === "completed" ? (
                      <p className="text-xs text-muted-foreground">
                        Completing this project will mark the linked recommendation as completed and
                        remove its points from projected score calculations.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col gap-2">
                    <Label htmlFor="project-notes">Notes</Label>
                    <textarea
                      id="project-notes"
                      value={editNotes}
                      onChange={(event) => setEditNotes(event.target.value)}
                      placeholder="Implementation notes, scheduling details, or client context..."
                      className={cn(
                        "flex min-h-[16rem] w-full flex-1 resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm",
                        "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button onClick={saveProject} disabled={saving} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Link
                        href={`/assessments/${selectedProject.assessmentId}/results`}
                        className={buttonClassName({ variant: "outline", className: "w-full" })}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Assessment
                      </Link>
                      <Link
                        href={clientTechnologyProfilePath(selectedProject.clientId)}
                        className={buttonClassName({ variant: "ghost", className: "w-full" })}
                      >
                        View Client
                      </Link>
                    </div>
                  </div>

                  {isAdmin && selectedProject ? (
                    <ProjectAdminActions
                      projectId={selectedProject.id}
                      projectTitle={selectedProject.title}
                      status={selectedProject.status}
                      onUpdated={() => {
                        router.refresh();
                        const response = fetch(`/api/v1/projects/${selectedProject.id}`)
                          .then((res) => res.json())
                          .then((updated) => {
                            setProjects((current) =>
                              current.map((project) =>
                                project.id === updated.id ? updated : project,
                              ),
                            );
                            setSelectedProject(updated);
                            setEditStatus(updated.status);
                          });
                        void response;
                      }}
                      onDeleted={() => {
                        setProjects((current) =>
                          current.filter((project) => project.id !== selectedProject.id),
                        );
                        closeProject();
                        router.refresh();
                      }}
                    />
                  ) : null}
                </div>
              </SheetBody>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
