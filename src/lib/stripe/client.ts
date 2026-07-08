import Stripe from "stripe";
import { getStripeConfig } from "./config";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const { secretKey } = getStripeConfig();
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}
