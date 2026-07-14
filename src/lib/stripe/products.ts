export const TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE = "technology_assessment" as const;
export const STACKSCORE_VCIO_PRODUCT_TYPE = "stackscore_vcio" as const;
export const STACKSCORE_VCIO_SERVICE_TYPE = "STACKSCORE_VCIO" as const;

export type TechnologyAssessmentProductType = typeof TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE;
export type StackScoreVcioProductType = typeof STACKSCORE_VCIO_PRODUCT_TYPE;

export function isTechnologyAssessmentProduct(
  productType: string | null | undefined,
): productType is TechnologyAssessmentProductType {
  return productType === TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE;
}

export function isStackScoreVcioProduct(
  productType: string | null | undefined,
): productType is StackScoreVcioProductType {
  return productType === STACKSCORE_VCIO_PRODUCT_TYPE;
}
