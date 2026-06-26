import type { TipInvestmentDraft, TipInvestmentView } from "./types";

export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function computeInvestmentView(draft: TipInvestmentDraft): TipInvestmentView {
  const labor = centsToDollars(draft.laborCents);
  const hardware = centsToDollars(draft.hardwareCents);
  const services = centsToDollars(draft.servicesCents);
  const subtotal = labor + hardware + services;
  const marginPercent = Math.min(100, Math.max(0, draft.marginPercent));
  const marginAmount = Math.round(subtotal * (marginPercent / 100) * 100) / 100;
  const clientTotal = Math.round((subtotal + marginAmount) * 100) / 100;

  return {
    labor,
    hardware,
    services,
    subtotal: Math.round(subtotal * 100) / 100,
    marginPercent,
    marginAmount,
    clientTotal,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function clientSafeInvestmentSummary(view: TipInvestmentView) {
  return {
    totalInvestment: view.clientTotal,
    formattedTotal: formatCurrency(view.clientTotal),
  };
}
