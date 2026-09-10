"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

/**
 * After a booking action succeeds, keep the user where they are and show an
 * in-place confirmation for `delayMs`, THEN refresh server data so the list
 * re-sorts. Avoids the page jumping the instant a button is clicked.
 *
 * `hold: true`  — keep showing the confirmation until the refresh has landed
 *                 (use when the component can't render the new state itself).
 * `hold: false` — drop the confirmation after `delayMs` regardless; the caller
 *                 renders the new state locally while the refresh runs.
 */
export function useSettledRefresh(delayMs = 2000, { hold = true }: { hold?: boolean } = {}) {
  const router = useRouter()
  const [label, setLabel] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const finish = (text: string) => {
    setLabel(text)
    setElapsed(false)
    timer.current = setTimeout(() => {
      setElapsed(true)
      startTransition(() => router.refresh())
    }, delayMs)
  }

  const stillWaiting = hold ? !(elapsed && !isPending) : !elapsed
  const done = label && stillWaiting ? label : null

  return { done, finish }
}
