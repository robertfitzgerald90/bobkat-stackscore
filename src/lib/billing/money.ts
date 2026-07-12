/** All billing amounts are stored as integer cents. */

export function dollarsToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(centsToDollars(cents));
}

export function lineAmountCents(quantity: number, unitPriceCents: number): number {
  return Math.round(quantity * unitPriceCents);
}
