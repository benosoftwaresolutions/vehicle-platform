export const env = {
  isDev: process.env.NEXT_PUBLIC_ENV === "development",
  isPreview: process.env.NEXT_PUBLIC_ENV === "preview",
  isProduction: process.env.NEXT_PUBLIC_ENV === "production",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const
