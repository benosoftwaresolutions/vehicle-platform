import { NextResponse } from "next/server"

// ---------------------------------------------------------------------------
// Small input-validation helpers for API routes and server actions.
//
// Why: anything sent to an API route or server action can be hand-crafted —
// the form's maxLength or type="number" only applies to people using the form.
// Without checks, a 5 MB "vehicle make", a non-string that crashes .trim(),
// or "abc" in a number field (NaN → Prisma error → 500) all reach the database.
//
// Each helper returns a clean value or throws ValidationError with a message
// that is safe to show the user. Routes turn that into a 400 with
// validationErrorResponse(); server actions just let it throw.
// ---------------------------------------------------------------------------

export class ValidationError extends Error {}

type Opts = { required?: boolean }

/** Trimmed string up to `max` chars. Empty → null (or error if required). */
export function text(value: unknown, field: string, max: number, { required = false }: Opts = {}): string | null {
  if (value === undefined || value === null) {
    if (required) throw new ValidationError(`${field} is required`)
    return null
  }
  if (typeof value !== "string") throw new ValidationError(`${field} must be text`)
  const v = value.trim()
  if (!v) {
    if (required) throw new ValidationError(`${field} is required`)
    return null
  }
  if (v.length > max) throw new ValidationError(`${field} must be ${max} characters or fewer`)
  return v
}

/** Like text(), but for fields that must be present — return type is string, not string | null. */
export function requiredText(value: unknown, field: string, max: number): string {
  return text(value, field, max, { required: true }) as string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Email address (loose format check — the real test is whether mail arrives). */
export function email(value: unknown, field: string, opts: Opts = {}): string | null {
  const v = text(value, field, 254, opts)
  if (v && !EMAIL_RE.test(v)) throw new ValidationError(`${field} must be a valid email address`)
  return v
}

type NumOpts = Opts & { min?: number; max?: number; integer?: boolean }

/** A finite number within [min, max]. Accepts numbers or numeric strings. Empty → null. */
export function number(value: unknown, field: string, { required = false, min = 0, max = Number.MAX_SAFE_INTEGER, integer = false }: NumOpts = {}): number | null {
  if (value === undefined || value === null || value === "") {
    if (required) throw new ValidationError(`${field} is required`)
    return null
  }
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : NaN
  if (!Number.isFinite(n)) throw new ValidationError(`${field} must be a number`)
  if (integer && !Number.isInteger(n)) throw new ValidationError(`${field} must be a whole number`)
  if (n < min) throw new ValidationError(`${field} must be ${min} or more`)
  if (n > max) throw new ValidationError(`${field} must be ${max.toLocaleString("en-GB")} or less`)
  return n
}

/** For PATCH bodies: undefined means "field not sent, leave it unchanged". */
export function ifSent<T>(value: unknown, parse: (v: unknown) => T): T | undefined {
  return value === undefined ? undefined : parse(value)
}

/** In a route's catch: returns a 400 for validation errors, or null to let other errors through. */
export function validationErrorResponse(err: unknown): NextResponse | null {
  return err instanceof ValidationError
    ? NextResponse.json({ error: err.message }, { status: 400 })
    : null
}
