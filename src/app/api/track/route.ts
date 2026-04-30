// src/app/api/track/route.ts
// Endpoint publico para registrar eventos de tracking.
// Rate-limit por IP pra evitar flood.

export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { recordTrackingEvent } from "@/lib/tracking-server"
import { checkRateLimit } from "@/lib/rate-limit"
import { ensureSessionId } from "@/lib/session-id"

const ALLOWED_EVENTS = new Set([
  "landing_view",
  "landing_cta_click",
  "landing_conversion",
])

const schema = z.object({
  event: z.string().min(1).max(60),
  landing: z.string().min(1).max(40).optional(),
  cta: z.string().min(1).max(40).optional(),
  method: z.string().min(1).max(20).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // 60 eventos por minuto por IP (generoso, mas barra script kiddie)
    const { allowed } = await checkRateLimit(`track:${ip}`, 60, 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: "rate_limit" }, { status: 429 })
    }

    const body = await request.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
    }

    if (!ALLOWED_EVENTS.has(parsed.data.event)) {
      return NextResponse.json({ error: "unknown_event" }, { status: 400 })
    }

    const { sessionId, response } = await ensureSessionId(request)

    await recordTrackingEvent({
      event: parsed.data.event,
      landing: parsed.data.landing ?? null,
      cta: parsed.data.cta ?? null,
      method: parsed.data.method ?? null,
      sessionId,
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
    })

    return response
  } catch (err) {
    console.error("[/api/track] error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
