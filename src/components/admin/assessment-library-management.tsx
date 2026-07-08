"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
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
import { MobileDataCard, MobileDataRow } from "@/components/ui/mobile-data-card";
import type { LibraryValidationResult } from "@/lib/assessment-library/validate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CategoryRow = {
  id: string;
  code: string;
  name: string;
  v2DisplayName: string | null;
  maxPoints: number;
  isActive: boolean;
  questionCount: number;
};

type QuestionRow = {
  id: string;
  code: string;
  v2QuestionId: string | null;
  categoryName: string;
  questionText: string;
  capability: string | null;
  weight: number;
  riskLevel: string;
  isActive: boolean;
};

type LibraryData = {
  includeArchived?: boolean;
  categories: CategoryRow[];
  questions: QuestionRow[];
  stats: {
    activeCategories: number;
    activeQuestions: number;
    expectedActiveQuestions: number;
    activeTemplates: number;
    archivedCategories: number;
    archivedQuestions: number;
  };
  validation: LibraryValidationResult;
};

type QuestionDetail = QuestionRow & {
  purpose: string | null;
  helpText: string | null;
  evidenceRequired: string | null;
  relatedService: string | null;
  relatedPlaybook: string | null;
  adminNotes: string | null;
  answerOptions: Array<{
    id: string;
    answerText: string;
    scoreValue: number;
    triggersCriticalFlag: boolean;
    triggersRecommendation: boolean;
  }>;
};

export function AssessmentLibraryManagement() {
  const [data, setData] = useState<LibraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLegacy, setShowLegacy] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editQuestion, setEditQuestion] = useState<QuestionDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    questionText: "",
    capability: "",
    purpose: "",
    evidenceRequired: "",
    helpText: "",
    adminNotes: "",
    isActive: true,
  });

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    const query = showLegacy ? "?includeArchived=true" : "";
    const response = await fetch(`/api/v1/admin/assessment-library${query}`);
    if (response.ok) {
      setData(await response.json());
    } else {
      toast.error("Failed to load assessment library");
    }
    setLoading(false);
  }, [showLegacy]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  function toggleCategory(code: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function openQuestionEditor(questionId: string) {
    const response = await fetch(`/api/v1/admin/assessment-library/questions/${questionId}`);
    if (!response.ok) {
      toast.error("Failed to load question details");
      return;
    }
    const detail: QuestionDetail = await response.json();
    setEditQuestion(detail);
    setEditForm({
      questionText: detail.questionText,
      capability: detail.capability ?? "",
      purpose: detail.purpose ?? "",
      evidenceRequired: detail.evidenceRequired ?? "",
      helpText: detail.helpText ?? "",
      adminNotes: detail.adminNotes ?? "",
      isActive: detail.isActive,
    });
  }

  async function saveQuestion() {
    if (!editQuestion) return;
    setSaving(true);
    const response = await fetch(
      `/api/v1/admin/assessment-library/questions/${editQuestion.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, legacyMode: showLegacy }),
      },
    );
    setSaving(false);

    if (response.ok) {
      toast.success("Question updated");
      setEditQuestion(null);
      await loadLibrary();
    } else {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      toast.error(payload?.error ?? "Failed to save question");
    }
  }

  async function toggleCategoryActive(category: CategoryRow) {
    const response = await fetch(
      `/api/v1/admin/assessment-library/categories/${category.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive, legacyMode: true }),
      },
    );
    if (response.ok) {
      toast.success(category.isActive ? "Category deactivated" : "Category activated");
      await loadLibrary();
    } else {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      toast.error(payload?.error ?? "Failed to update category");
    }
  }

  if (loading || !data) {
    return <p className="text-muted-foreground">Loading assessment library...</p>;
  }

  const questionsByCategory = data.questions.reduce<Record<string, QuestionRow[]>>(
    (acc, question) => {
      const key = question.categoryName;
      if (!acc[key]) acc[key] = [];
      acc[key].push(question);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {data.stats.activeQuestions} / {data.stats.expectedActiveQuestions} pillar questions
          </Badge>
          <Badge variant="secondary">{data.stats.activeCategories} active pillars</Badge>
          <Badge variant="secondary">{data.stats.activeTemplates} recommendation templates</Badge>
          {showLegacy ? (
            <Badge variant="outline">
              {data.stats.archivedQuestions} archived v1 questions
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showLegacy ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowLegacy((value) => !value)}
          >
            <Archive className="mr-2 h-4 w-4" />
            {showLegacy ? "Hide archived v1" : "Show archived v1"}
          </Button>
          <Button variant="outline" size="sm" onClick={loadLibrary}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {showLegacy ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          Legacy mode: viewing archived v1 categories and questions for historical assessments only.
          Customer assessments use the active DOC-151 pillar bank.
        </div>
      ) : null}

      <Card
        className={cn(
          data.validation.valid
            ? "border-primary/30 bg-primary/5"
            : "border-destructive/40 bg-destructive/5",
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {data.validation.valid ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            Pillar Library Validation
          </CardTitle>
          <CardDescription>
            {data.validation.valid
              ? `All ${data.stats.expectedActiveQuestions} DOC-151 pillar questions are active and aligned with the catalog.`
              : `${data.validation.errors.length} pillar library issue(s) detected.`}
          </CardDescription>
        </CardHeader>
        {!data.validation.valid && (
          <CardContent>
            <ul className="space-y-1 text-sm text-destructive">
              {data.validation.errors.slice(0, 5).map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Categories & Questions
          </CardTitle>
          <CardDescription>
            {showLegacy
              ? "Active DOC-151 pillars plus archived v1 categories. Question IDs are immutable."
              : "Eight technology pillars (DOC-151) power customer assessments. Question IDs are immutable."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.categories.map((category) => {
            const expanded = expandedCategories.has(category.code);
            const categoryQuestions = questionsByCategory[category.name] ?? [];

            return (
              <div key={category.id} className="rounded-lg border">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.code)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.code} · {category.maxPoints} pts
                      {category.v2DisplayName ? ` · ${category.v2DisplayName}` : ""}
                    </p>
                  </div>
                  <Badge variant={category.isActive ? "secondary" : "outline"}>
                    {category.questionCount} questions
                  </Badge>
                  {!category.isActive ? (
                    <Badge variant="outline">Archived</Badge>
                  ) : null}
                  {showLegacy ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoryActive(category);
                      }}
                    >
                      {category.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  ) : null}
                </button>

                {expanded ? (
                  <div className="border-t px-2 pb-2">
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Question ID</TableHead>
                            <TableHead>Capability</TableHead>
                            <TableHead>Question</TableHead>
                            <TableHead className="text-right">Pts</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryQuestions.map((question) => (
                            <TableRow key={question.id}>
                              <TableCell className="font-mono text-xs">{question.code}</TableCell>
                              <TableCell className="max-w-[140px] truncate text-sm">
                                {question.capability ?? "—"}
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-sm">
                                {question.questionText}
                              </TableCell>
                              <TableCell className="text-right">{question.weight}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openQuestionEditor(question.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="space-y-2 p-2 md:hidden">
                      {categoryQuestions.map((question) => (
                        <MobileDataCard key={question.id}>
                          <MobileDataRow label="Question ID">{question.code}</MobileDataRow>
                          <MobileDataRow label="Capability">
                            {question.capability ?? "—"}
                          </MobileDataRow>
                          <p className="text-sm">{question.questionText}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => openQuestionEditor(question.id)}
                          >
                            Edit
                          </Button>
                        </MobileDataCard>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Sheet open={!!editQuestion} onOpenChange={(open) => !open && setEditQuestion(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editQuestion?.code}</SheetTitle>
            <SheetDescription>
              {editQuestion?.categoryName} — administrative edits do not affect completed assessments.
            </SheetDescription>
          </SheetHeader>
          {editQuestion ? (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionText">Question Text</Label>
                <Input
                  id="questionText"
                  value={editForm.questionText}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, questionText: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capability">Capability (DOC-114)</Label>
                <Input
                  id="capability"
                  value={editForm.capability}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, capability: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <textarea
                  id="purpose"
                  className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.purpose}
                  onChange={(e) => setEditForm((f) => ({ ...f, purpose: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evidenceRequired">Evidence Required</Label>
                <textarea
                  id="evidenceRequired"
                  className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.evidenceRequired}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, evidenceRequired: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="helpText">Assessor Help Text</Label>
                <textarea
                  id="helpText"
                  className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.helpText}
                  onChange={(e) => setEditForm((f) => ({ ...f, helpText: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <textarea
                  id="adminNotes"
                  className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm((f) => ({ ...f, adminNotes: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  disabled={!showLegacy && !editQuestion.isActive && /^Q\d{2}$/.test(editQuestion.code)}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                Active in assessment bank
              </label>
              {!showLegacy && /^Q\d{2}$/.test(editQuestion.code) ? (
                <p className="text-xs text-muted-foreground">
                  Archived v1 questions can only be reactivated in legacy mode.
                </p>
              ) : null}
              {editQuestion.answerOptions?.length ? (
                <div className="space-y-2 rounded-md border p-3">
                  <p className="text-sm font-medium">Answer Options</p>
                  {editQuestion.answerOptions.map((option) => (
                    <div key={option.id} className="flex justify-between text-sm">
                      <span>{option.answerText}</span>
                      <span className="text-muted-foreground">{option.scoreValue} pts</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <Button className="w-full" onClick={saveQuestion} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
