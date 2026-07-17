# Fyca Pre-Launch Test Plan

Pragmatic manual test plan for a solo founder. Work through P0 before signing the first
real garage; P1 before the first in-person visit; P2 as background polish. Tick boxes as
you go — re-run the full P0 list after any deploy that touches bookings, subscriptions,
or emails.

**Setup you need:** three browser profiles or private windows — (A) admin account,
(B) test garage owner, (C) test customer. Stripe **sandbox** keys active. Stripe test
card: `4242 4242 4242 4242`, any future expiry, any CVC. Failing card: `4000 0000 0000 0341`.
Watch both inboxes (and spam — Resend sender reputation is new).

---

## P0 — Revenue & booking critical (must pass before first real garage)

### 1. Garage onboarding → live

- [ ] Sign up fresh garage owner (B): role select → garage details → dashboard reachable
- [ ] Billing step "Skip for now" works — dashboard loads with no card, trial banner shows correct days
- [ ] Garage does NOT appear in public search before approval
- [ ] Admin (A): garage appears in /admin/pending AND /admin/garages
- [ ] Approve from /admin/pending — `approved` actually flips (garage detail shows approved)
- [ ] "Not live" banner persists until services + availability exist, then disappears
- [ ] Garage now appears in public search (/garages)

### 2. Booking lifecycle

- [ ] Customer (C) books a slot — only slots inside opening hours are offered
- [ ] Garage owner (B) receives "new booking" email; booking shows pending in dashboard
- [ ] Accept: button shows "Accepting…" then "✓ Accepted"; customer gets confirmation email
- [ ] Decline with reason + suggested alternative: customer gets decline email with suggestion
- [ ] Customer accepts alternative → garage notified; customer declines → garage notified
- [ ] Reschedule a confirmed booking → customer gets reschedule email
- [ ] Complete a booking with job value → customer gets completion email; value shows in insights
- [ ] Customer cancels a booking → garage gets cancellation email
- [ ] Walk-in booking created by garage → appears in calendar alongside online bookings

### 3. Booking validation (server-side guards — try to break it)

- [ ] Book the last remaining slot in two tabs at once (capacity 1): second gets "no longer available"
- [ ] Attempt booking for a past date via the UI → rejected
- [ ] Booked-out day shows no available slots; declined bookings free their slot again
- [ ] Unapproved/expired garage cannot receive bookings (needs API attempt or expired test garage)

### 4. Subscription lifecycle (sandbox)

- [ ] Trialing + no card: pricing page shows "free trial is under way… Add a payment method" (NOT "billed automatically")
- [ ] Add card via checkout (4242): Stripe shows subscription `trialing` with remaining trial days (not a fresh 30)
- [ ] DB check: `subscriptionStatus` matches Stripe, `subscriptionEnd` is populated (not null)
- [ ] Pricing page now shows "billed automatically" card; Manage subscription opens Stripe portal
- [ ] Click subscribe again while subscribed → lands in billing portal, NO second subscription created
- [ ] Cancel in portal → status updates; dashboard access behaves per remaining period
- [ ] Trial expiry: set `trialEndsAt` in past in DB (no card) → SubscriptionWall blocks dashboard, £99.99 shown
- [ ] Past-due: use failing card / Stripe test clock → past-due banner with 7-day grace countdown; access blocked after grace

### 5. Money truth

- [ ] Stripe sandbox price = £99.99/month Garage Pro, £7/month Driver Pro — matches site copy everywhere
- [ ] Webhook deliveries in Stripe dashboard all 200 (checkout.completed, subscription.updated, subscription.deleted)

---

## P1 — First-garage experience (before the first in-person visit)

### 6. The forecourt run-through (rehearse the real pitch, on your phone)

- [ ] Full signup → approve from phone (/admin/garages) → services → availability → live, timed. Target: under 10 minutes
- [ ] Settings save shows toast + green button on mobile
- [ ] Garage public page looks right on mobile: logo, services, pricing, book button
- [ ] Booking flow works on a phone (the customer's device, not just desktop)

### 7. Emails

- [ ] All P0 emails rendered correctly (logo, dates in en-GB, no broken layout) — check on mobile mail client
- [ ] From-address is the fyca.co.uk sender, not onboarding@resend.dev
- [ ] Nothing lands in spam from a cold inbox (test with a non-Gmail address too if possible)

### 8. Access boundaries

- [ ] Customer account cannot open /garage-dashboard or /admin
- [ ] Garage owner cannot open /admin
- [ ] Non-admin hitting /admin sees "Access denied" (never a crash)
- [ ] Logged-out user booking → redirected to sign-in, booking preserved or graceful restart

### 9. Driver plans

- [ ] Free driver: 1 vehicle max, adding second prompts upgrade
- [ ] Driver Pro checkout (£7, 4242) → unlimited vehicles unlocked
- [ ] MOT/service dates save and display correctly

---

## P2 — Background polish (evenings, not launch-blocking)

- [ ] Cron reminders: hit /api/cron/reminders and /api/cron/mot-reminders with `Authorization: Bearer CRON_SECRET` — correct emails, wrong secret → 401
- [ ] Reviews: customer can leave one after completed booking; rating updates on public page
- [ ] Inventory + AI insights pages load with real-ish data; no errors with empty data
- [ ] Rate limit: >5 booking attempts in a minute from one IP → 429
- [ ] Weird inputs: 100+ char garage name, emoji in registration, script tags in description — no crash, no rendered HTML
- [ ] Admin: decline pending garage resets owner account cleanly; delete garage cascades without orphan errors
- [ ] Lighthouse/mobile pass on home, /garages, garage public page

---

## Regression list — re-verify after each deploy (this week's fixes)

1. `subscriptionEnd` populates after checkout (was always null)
2. No duplicate subscription from double-checkout (portal redirect instead)
3. Approve buttons on ALL THREE admin surfaces actually approve
4. /admin/pending lists unapproved garages
5. Trial card copy matches card-on-file status
6. Double-booking rejected server-side (409)
7. Save feedback: settings toast, availability toast, Accept button states

---

## Later: automate the top five (post-launch, one evening)

When manual passes get tedious, a Playwright suite covering just these five paths catches
most regressions: garage signup→approve→live, customer booking→accept→email, checkout
(Stripe test mode)→webhook→DB state, trial-expiry wall, double-booking rejection.
Run it against a preview deploy on every PR. Not before launch — real garages first.
