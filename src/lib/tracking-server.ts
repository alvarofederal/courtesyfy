// src/lib/tracking-server.ts
// Helpers server-side para gravar TrackingEvent.

import prisma from "@/lib/prisma"

export type TrackPayload = {
  event: string
  landing?: string | null
  cta?: string | null
  method?: string | null
  sessionId?: string | null
  userId?: string | null
  referrer?: string | null
  userAgent?: string | null
}

export async function recordTrackingEvent(payload: TrackPayload) {
  try {
    await prisma.trackingEvent.create({
      data: {
        event: payload.event.slice(0, 60),
        landing: payload.landing?.slice(0, 40) ?? null,
        cta: payload.cta?.slice(0, 40) ?? null,
        method: payload.method?.slice(0, 20) ?? null,
        sessionId: payload.sessionId?.slice(0, 64) ?? null,
        userId: payload.userId?.slice(0, 40) ?? null,
        referrer: payload.referrer?.slice(0, 500) ?? null,
        userAgent: payload.userAgent ?? null,
      },
    })
  } catch (err) {
    // tracking nunca pode quebrar fluxo de negocio
    console.error("[tracking] failed to record event:", err)
  }
}
