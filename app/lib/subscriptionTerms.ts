import { COMPANY } from "@/app/lib/company"

// Plain-English subscription terms shown next to every subscribe button and on
// Stripe's checkout page. Keep in step with /terms, /pricing and Stripe prices.
export const TERMS_VERSION = "2026-10-27"

const vat = COMPANY.vatRegistered ? " incl. VAT" : ""

export function subscriptionTermsSummary(plan: string): string {
  if (plan === "driver_pro") {
    return `Pro is £7/month${vat} and renews automatically each month until you cancel. It starts straight away; cancel within 14 days for a refund, minus the days you've used. Cancel any time in Manage billing.`
  }
  if (plan === "garage_pro") {
    return `Garage Pro is £99.99/month${vat}. You'll be billed automatically when your free trial ends, then monthly until you cancel. Cancel any time in your dashboard; cancellation takes effect at the end of the billing month.`
  }
  return "This subscription renews automatically until you cancel."
}
