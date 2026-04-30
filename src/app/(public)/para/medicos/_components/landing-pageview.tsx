"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/tracking-client"

/** Dispara `landing_view` 1x ao montar a landing. */
export function LandingPageview({ landing }: { landing: string }) {
  useEffect(() => {
    trackEvent({ event: "landing_view", landing })
  }, [landing])

  return null
}
