"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

/**
 * After a booking action succeeds, keep the user where they are and show an
 * in-place confirmation for `delayMs`, THEN refresh server data so the list
 * re-sorts. Avoids the page jumping the instant a button is clicked.
 * Once the refresh has landed, `done` becomes null so the component falls
 * back to rendering its real (refreshed) state.
 */
export function useSettledRefresh(delayMs = 2000) {
  const router = useRouter()
  const [label, setLabel] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const finish = (text: string) => {
    setLabel(text)
    timer.current = setTimeout(() => {
      setRefreshing(true)
      startTransition(() => router.refresh())
    }, delayMs)
  }

  // Show the confirmation until the refresh has actually landed.
  const done = label && !(refreshing && !isPending) ? label : null

  return { done, finish }
}
