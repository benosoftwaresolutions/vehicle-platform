"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * After a booking action succeeds, keep the user where they are and show an
 * in-place confirmation for `delayMs`, THEN refresh server data so the list
 * re-sorts. Avoids the page jumping the instant a button is clicked.
 */
export function useSettledRefresh(delayMs = 2000) {
  const router = useRouter()
  const [done, setDone] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const finish = (label: string) => {
    setDone(label)
    timer.current = setTimeout(() => router.refresh(), delayMs)
  }

  return { done, finish }
}
