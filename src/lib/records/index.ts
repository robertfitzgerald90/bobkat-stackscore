/** Server-only exports. Client components must import from `@/lib/records/types`. */
export { logSystemNote } from "@/lib/records/activity";
export {
  archiveAssessment,
  archiveClient,
  archiveRecommendation,
  cancelProject,
  deleteAssessmentPermanently,
  deleteClientPermanently,
  deleteProjectPermanently,
  deleteRecommendationPermanently,
  deleteUserPermanently,
  getAssessmentDeletionPreview,
  getClientDeletionPreview,
  getProjectDeletionPreview,
  getRecommendationDeletionPreview,
  getUserDeletionPreview,
  restoreClient,
} from "@/lib/records/cleanup";
export {
  DELETE_CONFIRMATION_TEXT,
  type AssessmentDeletionPreview,
  type ClientDeletionPreview,
  type ProjectDeletionPreview,
  type RecommendationDeletionPreview,
  type UserDeletionPreview,
} from "@/lib/records/types";
