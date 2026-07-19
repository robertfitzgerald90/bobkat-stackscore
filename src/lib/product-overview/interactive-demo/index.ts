export { NORTHSTAR_INTERACTIVE_DEMO_SCENARIO, DEMO_MANAGED_IT_PER_DEVICE_MONTHLY_CENTS } from "./scenario";
export { deriveInteractiveDemoView, getInteractiveDemoScenario } from "./derive";
export {
  INTERACTIVE_DEMO_STORAGE_KEY,
  createInitialInteractiveDemoState,
  parseInteractiveDemoState,
  reduceInteractiveDemoState,
  stageLabel,
  type InteractiveDemoAction,
} from "./state";
export type * from "./types";

import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { centsToDollars } from "@/lib/technology-improvement-plan/pricing";
import { VCIO_MONTHLY_AMOUNT_CENTS } from "@/lib/vcio/constants";
import { CORE_SERVICES } from "@/lib/services/catalog";

export { formatCurrency };

export function formatMonthlyCurrency(amount: number): string {
  return `${formatCurrency(amount)}/month`;
}

/** Production-aligned Strategic IT Consulting display price. */
export function getStrategicConsultingMonthlyLabel(): string {
  return formatMonthlyCurrency(centsToDollars(VCIO_MONTHLY_AMOUNT_CENTS));
}

/** Production catalog Managed IT price label. */
export function getManagedItCatalogPriceLabel(): string {
  return CORE_SERVICES.find((service) => service.id === "managed-it-services")?.price
    ?? "Starting at $15/device/month";
}
