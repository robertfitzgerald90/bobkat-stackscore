"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentResponseFilters } from "@/components/assessments/responses/assessment-response-filters";
import { AssessmentResponseSummary } from "@/components/assessments/responses/assessment-response-summary";
import { AssessmentSectionAccordion } from "@/components/assessments/responses/assessment-section-accordion";
import type { CategoryScoreSummary } from "@/lib/assessments/results-summary";
import {
  buildResponseSummaryStats,
  DEFAULT_RESPONSE_FILTERS,
  filterResponseCategories,
  type ResponseCategory,
  type ResponseFilterState,
} from "@/lib/assessments/response-view";
import { isConsultantMode } from "@/lib/navigation/portal-mode";
import type { PillarScoreSnapshot } from "@/lib/scoring/v2";

type AssessmentCustomerResponsesProps = {
  assessmentId: string;
  userRole: string;
  customerSelfAssessment: boolean;
  pillarSnapshots?: PillarScoreSnapshot[] | null;
  categoryScores: CategoryScoreSummary[];
};

export function AssessmentCustomerResponses({
  assessmentId,
  userRole,
  customerSelfAssessment,
  pillarSnapshots = null,
  categoryScores,
}: AssessmentCustomerResponsesProps) {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<ResponseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ResponseFilterState>(DEFAULT_RESPONSE_FILTERS);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const isStaff = isConsultantMode(userRole);
  const focusQuestionId = searchParams.get("question");
  const focusSectionCode = searchParams.get("section");

  const load = useCallback(async () => {
    const response = await fetch(`/api/v1/assessments/${assessmentId}/questions`);
    if (response.ok) {
      const data = (await response.json()) as { categories: ResponseCategory[] };
      setCategories(data.categories);
    }
    setLoading(false);
  }, [assessmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!categories.length || (!focusQuestionId && !focusSectionCode)) return;

    const nextOpen: Record<string, boolean> = {};
    for (const category of categories) {
      const matchesSection = focusSectionCode && category.code === focusSectionCode;
      const matchesQuestion = focusQuestionId
        ? category.questions.some((question) => question.id === focusQuestionId)
        : false;
      if (matchesSection || matchesQuestion) {
        nextOpen[category.id] = true;
      }
    }
    if (Object.keys(nextOpen).length > 0) {
      setOpenSections((current) => ({ ...current, ...nextOpen }));
    }
  }, [categories, focusQuestionId, focusSectionCode]);

  useEffect(() => {
    if (!focusQuestionId) return;
    const element = document.getElementById(`response-${focusQuestionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focusQuestionId, openSections, categories]);

  const filteredCategories = useMemo(
    () => filterResponseCategories(categories, filters),
    [categories, filters],
  );

  const summaryStats = useMemo(() => buildResponseSummaryStats(categories), [categories]);

  function toggleSection(sectionId: string) {
    setOpenSections((current) => ({ ...current, [sectionId]: !current[sectionId] }));
  }

  function expandAll() {
    const next = Object.fromEntries(categories.map((category) => [category.id, true]));
    setOpenSections(next);
  }

  function collapseAll() {
    setOpenSections({});
  }

  if (!isStaff && !customerSelfAssessment) {
    return null;
  }

  return (
    <Card id="assessment-customer-responses">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base">Customer Responses</CardTitle>
          <CardDescription>
            Review the detailed answers submitted during this assessment.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={expandAll}>
            Expand all
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={collapseAll}>
            Collapse all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AssessmentResponseSummary stats={summaryStats} />
        <AssessmentResponseFilters
          categories={categories}
          filters={filters}
          onChange={setFilters}
        />

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading responses...
          </div>
        ) : filteredCategories.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No responses match the current filters.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <AssessmentSectionAccordion
                key={category.id}
                category={category}
                open={Boolean(openSections[category.id])}
                onToggle={() => toggleSection(category.id)}
                isStaff={isStaff}
                customerSelfAssessment={customerSelfAssessment}
                pillarSnapshots={pillarSnapshots}
                categoryScores={categoryScores}
                highlightQuestionId={focusQuestionId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
