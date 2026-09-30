import type { Metadata } from "next"

// Hard-coded rather than read from an env var on purpose: preview and
// *.vercel.app deployments should still declare fyca.co.uk as the canonical
// home of every page, so search engines never index a duplicate copy.
export const SITE_URL = "https://fyca.co.uk"
export const SITE_NAME = "Fyca"
export const SITE_TAGLINE = "Fyca — Fix Your Car Anywhere"

type PageMetaInput = {
  /** Short page title, e.g. "Pricing". The root layout's template adds " — Fyca". Omit for the homepage. */
  title?: string
  description: string
  /** Path relative to the site root, e.g. "/pricing". Resolved against metadataBase. */
  path: string
}

/**
 * Builds a page's metadata in one place: title, description, canonical URL,
 * and the Open Graph / X card text.
 *
 * Why a helper: Next.js merges metadata *shallowly*. If a page sets
 * `openGraph`, it replaces the layout's `openGraph` object entirely — and if it
 * doesn't, it inherits the layout's (including its title). Declaring the full
 * set per page avoids every page sharing the homepage's preview text.
 * The og:image itself comes from the nearest opengraph-image.tsx file.
 */
export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_TAGLINE

  return {
    title: title ?? { absolute: SITE_TAGLINE },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  }
}
