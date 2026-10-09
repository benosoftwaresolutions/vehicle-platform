"use client"

// Smooth scrolling (Lenis) + scroll-triggered reveals (GSAP ScrollTrigger)
// for the logged-out marketing homepage only.
//
// How it fits together:
//   - Lenis intercepts wheel/trackpad input and eases the real window scroll
//     towards the target, which gives the "weighted" feel. Touch devices keep
//     native scrolling (Lenis default), so mobile behaves exactly as before.
//   - GSAP's ticker drives Lenis, so both run off ONE requestAnimationFrame
//     loop and ScrollTrigger always reads the same scroll position Lenis set.
//   - Any element with `data-reveal` fades/slides in the first time it enters
//     the viewport. Add `data-reveal-stagger` to animate its children one by one.
//
// Performance: GSAP + Lenis are ~50 KB of JS. They're loaded with dynamic
// import() AFTER the page is interactive, so they're never in the critical
// path — the search box works before any animation code has downloaded.
// Because of that, anything already on screen when the code arrives is left
// alone (animating it would make visible content blink out and back in).
//
// Accessibility: users who ask their OS for reduced motion get plain native
// scrolling and no animations — the libraries aren't even downloaded.
// Content is server-rendered fully visible, so crawlers and no-JS users
// always see everything.

import { useEffect } from "react"
import "lenis/dist/lenis.css"

export default function MarketingMotion({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let cleanup: (() => void) | undefined
    let cancelled = false

    Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: Lenis }, { default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return // user navigated away before the code arrived
        gsap.registerPlugin(ScrollTrigger)

        // ── Smooth scroll ──────────────────────────────────────────────────
        const lenis = new Lenis({
          lerp: 0.1, // 0–1: lower = floatier. 0.1 is subtle, not "laggy"
          // Let the mobile menu (<dialog>) scroll natively
          prevent: (node) => node.closest?.(".mobile-menu") != null,
        })
        lenis.on("scroll", ScrollTrigger.update)
        const tick = (time: number) => lenis.raf(time * 1000) // GSAP gives seconds, Lenis wants ms
        gsap.ticker.add(tick)
        gsap.ticker.lagSmoothing(0) // don't let GSAP "skip" time after a stall — Lenis would jump

        // ── Reveals ────────────────────────────────────────────────────────
        // gsap.context records every tween/ScrollTrigger so one revert()
        // undoes them all on unmount (sign-in, navigating away).
        const ctx = gsap.context(() => {
          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
            if (el.getBoundingClientRect().top < window.innerHeight) return // already visible — don't blink it
            const stagger = el.hasAttribute("data-reveal-stagger")
            gsap.from(stagger ? el.children : el, {
              y: 28,
              autoAlpha: 0, // opacity + visibility, so hidden items aren't clickable
              duration: 0.8,
              ease: "power3.out",
              stagger: stagger ? 0.1 : 0,
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            })
          })
        })

        cleanup = () => {
          ctx.revert()
          gsap.ticker.remove(tick)
          gsap.ticker.lagSmoothing(500, 33) // restore GSAP default
          lenis.destroy()
        }
      },
    )

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return <>{children}</>
}
