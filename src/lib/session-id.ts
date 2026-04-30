// src/lib/session-id.ts
// Cookie de sessao anonima pra ligar view -> click -> conversion no funil.

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export const SESSION_COOKIE = "bm_sid"
const MAX_AGE_S = 60 * 60 * 24 * 30 // 30 dias

/**
 * Garante que o request tem um sessionId. Retorna o id e uma response
 * ja preparada (com Set-Cookie quando necessario).
 *
 * Uso:
 *   const { sessionId, response } = await ensureSessionId(req)
 *   // ... grava algo com sessionId ...
 *   return response  // ou anexar dados a ela
 */
export async function ensureSessionId(
  request: NextRequest
): Promise<{ sessionId: string; response: NextResponse; isNew: boolean }> {
  const existing = request.cookies.get(SESSION_COOKIE)?.value
  if (existing && existing.length >= 16) {
    return {
      sessionId: existing,
      response: NextResponse.json({ ok: true }),
      isNew: false,
    }
  }

  const newId = crypto.randomBytes(24).toString("base64url")
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, newId, {
    httpOnly: false, // precisa ser legivel por JS pro caso de leitura client-side futura
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_S,
    path: "/",
  })
  return { sessionId: newId, response, isNew: true }
}

/** Le o sessionId de um request server-side (sem garantir criacao). */
export function readSessionId(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE)?.value ?? null
}
