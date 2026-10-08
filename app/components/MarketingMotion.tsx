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
// Everything sits inside a `prefers-reduced-motion: no-preference` media query:
// users who ask their OS for less motion get plain native scrolling and no
// animations. Content is server-rendered fully visible; GSAP only hides it once
// JS has loaded, so crawlers and no-JS users always see everything.

import { useRef } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import "lenis/dist/lenis.css"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function MarketingMotion({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null)

  // useGSAP = useLayoutEffect + gsap.context(): every tween/ScrollTrigger made
  // in here is reverted automatically on unmount (e.g. when the user signs in
  // or navigates away), so nothing leaks between pages.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
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

        return () => {
          gsap.ticker.remove(tick)
          gsap.ticker.lagSmoothing(500, 33) // restore GSAP default
          lenis.destroy()
        }
      })
    },
    { scope },
  )

  return <div ref={scope}>{children}</div>
}
