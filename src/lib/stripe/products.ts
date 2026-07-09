export const TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE = "technology_assessment" as const;

export type TechnologyAssessmentProductType = typeof TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE;

export function isTechnologyAssessmentProduct(
  productType: string | null | undefined,
): productType is TechnologyAssessmentProductType {
  return productType === TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE;
}
