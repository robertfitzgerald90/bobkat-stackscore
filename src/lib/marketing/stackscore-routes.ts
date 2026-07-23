/** Public StackScore product gateway and checkout routes (not Bobkat IT marketing). */
export const STRATEGIC_IT_CONSULTING_CHECKOUT_PATH = "/checkout/strategic-it-consulting";

/** Legacy alias preserved for existing links and Stripe success URLs. */
export const VCIO_OFFER_PATH = "/vcio-offer";

export const VCIO_OFFER_SUCCESS_PATH = "/vcio-offer/success";

export const STACKSCORE_PUBLIC_ROUTES = {
  home: "/",
  login: "/login",
  assessmentOffer: "/assessment-offer",
  assessmentInvitation: "/assessment-invitation",
  technologySnapshot: "/technology-snapshot",
  demo: "/demo",
  strategicItConsultingCheckout: STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,
  vcioOffer: VCIO_OFFER_PATH,
  purchaseSuccess: "/purchase/success",
  activateAccount: "/activate-account",
} as const;
