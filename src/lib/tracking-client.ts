// src/lib/tracking-client.ts
// Helper client-side. Usa sendBeacon pra nao bloquear cliques.

const ENDPOINT = "/api/track"
const SOURCE_KEY = "landing_source"
const SOURCE_TTL_MS = 24 * 60 * 60 * 1000 // 24h

export type ClientTrackPayload = {
  event: string
  landing?: string
  cta?: string
  method?: string
}

export type LandingSource = {
  landing: string
  cta?: string
  ts: number
}

/**
 * Dispara um evento. Fire-and-forget.
 * Usa sendBeacon quando disponivel (mais confiavel em navigation).
 */
export function trackEvent(payload: ClientTrackPayload): void {
  try {
    const body = JSON.stringify(payload)
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" })
      navigator.sendBeacon(ENDPOINT, blob)
      return
    }
    // fallback: fetch keepalive
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    })
  } catch {
    // analytics nao pode quebrar UX
  }
}

/** Persiste origem da landing pra atribuir conversao depois (24h). */
export function rememberLandingSource(landing: string, cta?: string): void {
  try {
    const payload: LandingSource = { landing, cta, ts: Date.now() }
    localStorage.setItem(SOURCE_KEY, JSON.stringify(payload))
  } catch {}
}

/** Recupera a origem se ainda valida; null caso contrario (e limpa expirados). */
export function consumeLandingSource(): LandingSource | null {
  try {
    const raw = localStorage.getItem(SOURCE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LandingSource
    if (!parsed?.landing || !parsed?.ts) {
      localStorage.removeItem(SOURCE_KEY)
      return null
    }
    if (Date.now() - parsed.ts > SOURCE_TTL_MS) {
      localStorage.removeItem(SOURCE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/** Remove a origem (apos consumir na conversao). */
export function clearLandingSource(): void {
  try {
    localStorage.removeItem(SOURCE_KEY)
  } catch {}
}
