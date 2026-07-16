import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return _stripe
}

export const PLANS = {
  DRIVER_PRO: {
    priceId: process.env.STRIPE_DRIVER_PRO_PRICE_ID!,
    amount: 700,
    name: "Pro Vehicle Owner",
  },
  GARAGE_PRO: {
    priceId: process.env.STRIPE_GARAGE_PRO_PRICE_ID!,
    amount: 9999,
    name: "Garage Pro",
  },
} as const
