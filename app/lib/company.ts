// ---------------------------------------------------------------------------
// Fyca's legal identity — the single source of truth.
//
// UK law (Companies Act 2006 for a limited company, the Companies (Trading
// Disclosures) Regulations, and the Business Names rules for a sole trader
// using a trading name) requires the business's legal name and an address to
// appear on the website and in business emails. The terms, privacy policy,
// site footer and email footer all read from here, so filling this in once
// updates every place.
//
// The name shows as soon as legalName is set; the address is added wherever
// it appears once filled in. ADD A BUSINESS ADDRESS BEFORE LAUNCH (a virtual
// office / business address service is fine; it needn't be a home address).
//
//   Sole trader:     legalName: "Ben O'Connor trading as Fyca", companyNumber: ""
//   Limited company: legalName: "Fyca Ltd", companyNumber: "12345678",
//                    address = the registered office address
// ---------------------------------------------------------------------------

export const COMPANY = {
  tradingName: "Fyca",
  legalName: "Ben O'Connor trading as Fyca", // sole trader; becomes "Fyca Ltd" etc. if incorporated
  companyNumber: "",   // Companies House number — leave blank for a sole trader
  address: "",         // TODO: business address (sole trader) or registered office (Ltd)
  vatNumber: "",       // e.g. "GB123456789"
  vatRegistered: false, // Not VAT-registered. Flip to true (and add vatNumber) if you register.
  supportEmail: "hello@fyca.co.uk",
  privacyEmail: "privacy@fyca.co.uk",
  website: "fyca.co.uk",
} as const

/** True once the legal name has been filled in. */
export const hasLegalIdentity = Boolean(COMPANY.legalName)

/** One line for footers, e.g. "Fyca Ltd · Company no. 123 · 1 High St, Chester · VAT GB…" */
export function legalIdentityLine(): string | null {
  if (!hasLegalIdentity) return null
  return [
    COMPANY.legalName,
    COMPANY.companyNumber && `Registered in England and Wales, company no. ${COMPANY.companyNumber}`,
    COMPANY.address && (COMPANY.companyNumber ? `Registered office: ${COMPANY.address}` : COMPANY.address),
    COMPANY.vatNumber && `VAT no. ${COMPANY.vatNumber}`,
  ].filter(Boolean).join(" · ")
}
