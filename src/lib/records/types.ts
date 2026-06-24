export type ClientDeletionPreview = {
  entityType: "client";
  entityId: string;
  entityName: string;
  counts: {
    assessments: number;
    assessmentResponses: number;
    recommendations: number;
    projects: number;
    scoreHistory: number;
    documents: number;
    notes: number;
  };
};

export type AssessmentDeletionPreview = {
  entityType: "assessment";
  entityId: string;
  entityName: string;
  clientName: string;
  counts: {
    responses: number;
    recommendations: number;
    categoryScores: number;
    scoreHistory: number;
    documents: number;
    notes: number;
    derivedAssessments: number;
  };
};

export type ProjectDeletionPreview = {
  entityType: "project";
  entityId: string;
  entityName: string;
  clientName: string;
  counts: {
    documents: number;
    notes: number;
  };
};

export type RecommendationDeletionPreview = {
  entityType: "recommendation";
  entityId: string;
  entityName: string;
  clientName: string;
  hasProject: boolean;
};

export type UserDeletionPreview = {
  entityType: "user";
  entityId: string;
  entityName: string;
  counts: {
    assessments: number;
    recommendationsCreated: number;
    projectsAssigned: number;
    documentsUploaded: number;
    notes: number;
  };
};

export const DELETE_CONFIRMATION_TEXT = "DELETE" as const;
