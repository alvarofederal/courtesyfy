"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { rememberLandingSource, trackEvent } from "@/lib/tracking-client"

type Props = {
  cta: "hero" | "offer" | "final"
  landing: string
  href: string
  className?: string
  style?: React.CSSProperties
  children: ReactNode
}

/**
 * CTA com tracking proprietario (DB).
 *
 * - Dispara `landing_cta_click` (sendBeacon, nao bloqueia clique)
 * - Persiste a origem em localStorage por 24h, pra atribuir conversao depois
 *   (mesmo apos verificacao de email/OAuth).
 */
export function TrackedCTA({ cta, landing, href, className, style, children }: Props) {
  function handleClick() {
    trackEvent({ event: "landing_cta_click", landing, cta })
    rememberLandingSource(landing, cta)
  }

  return (
    <Link href={href} onClick={handleClick} className={className} style={style}>
      {children}
    </Link>
  )
}
