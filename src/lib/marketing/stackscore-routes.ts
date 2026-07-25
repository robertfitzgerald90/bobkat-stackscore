/** Public StackScore product gateway and checkout routes (not Bobkat IT marketing). */
export const STRATEGIC_IT_CONSULTING_CHECKOUT_PATH = "/checkout/strategic-it-consulting";

/** Legacy alias preserved for existing links and Stripe success URLs. */
export const VCIO_OFFER_PATH = "/vcio-offer";

/** @deprecated Prefer SUBSCRIPTION_ACTIVATED_PATH — kept for redirects/bookmarks. */
export const VCIO_OFFER_SUCCESS_PATH = "/vcio-offer/success";

export const ASSESSMENT_PURCHASED_PATH = "/assessment-purchased";

export const SUBSCRIPTION_ACTIVATED_PATH = "/subscription-activated";

/** @deprecated Prefer ASSESSMENT_PURCHASED_PATH — kept for redirects/bookmarks. */
export const PURCHASE_SUCCESS_PATH = "/purchase/success";

export const STACKSCORE_PUBLIC_ROUTES = {
  home: "/",
  login: "/login",
  assessmentOffer: "/assessment-offer",
  assessmentInvitation: "/assessment-invitation",
  technologySnapshot: "/technology-snapshot",
  demo: "/demo",
  strategicItConsultingCheckout: STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,
  vcioOffer: VCIO_OFFER_PATH,
  assessmentPurchased: ASSESSMENT_PURCHASED_PATH,
  subscriptionActivated: SUBSCRIPTION_ACTIVATED_PATH,
  /** @deprecated */
  purchaseSuccess: PURCHASE_SUCCESS_PATH,
  activateAccount: "/activate-account",
} as const;
