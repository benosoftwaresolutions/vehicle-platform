const TRIAL_DAYS = 30
const GRACE_PERIOD_DAYS = 7

export function garageTrialDaysLeft(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0
  const ms = trialEndsAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export function garageGraceDaysLeft(pastDueAt: Date | null | undefined): number {
  if (!pastDueAt) return GRACE_PERIOD_DAYS
  const gracePeriodEnd = new Date(pastDueAt.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
  const ms = gracePeriodEnd.getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export function isGarageAccessAllowed(garage: {
  subscriptionStatus: string
  trialEndsAt: Date | null
  subscriptionEnd: Date | null
  pastDueAt?: Date | null
}): boolean {
  if (garage.subscriptionStatus === "active") {
    if (garage.subscriptionEnd && garage.subscriptionEnd < new Date()) return false
    return true
  }
  if (garage.subscriptionStatus === "trialing") {
    return garageTrialDaysLeft(garage.trialEndsAt) > 0
  }
  if (garage.subscriptionStatus === "past_due") {
    return garageGraceDaysLeft(garage.pastDueAt) > 0
  }
  return false
}

export function trialEndsAtFromNow(): Date {
  const d = new Date()
  d.setDate(d.getDate() + TRIAL_DAYS)
  return d
}

export function isDriverPro(user: { plan: string; subscriptionStatus: string | null; subscriptionEnd: Date | null }): boolean {
  if (user.plan !== "driver_pro") return false
  if (user.subscriptionStatus !== "active") return false
  if (user.subscriptionEnd && user.subscriptionEnd < new Date()) return false
  return true
}

export const DRIVER_FREE_VEHICLE_LIMIT = 1
