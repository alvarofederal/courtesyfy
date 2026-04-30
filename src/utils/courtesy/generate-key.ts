import { randomBytes } from "crypto"

// Alfabeto sem caracteres ambíguos (sem O, 0, I, 1, L)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

/**
 * Gera uma chave no formato XXXX-XXXX-XXXX-XXXX usando crypto seguro.
 * 16 caracteres úteis + 3 hífens = 19 chars totais.
 */
export function generateCourtesyKey(): string {
  const bytes = randomBytes(16)
  const chars: string[] = []
  for (let i = 0; i < 16; i++) {
    chars.push(ALPHABET[bytes[i] % ALPHABET.length])
  }
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8, 12).join("")}-${chars.slice(12, 16).join("")}`
}

/**
 * Normaliza input do usuário: remove espaços, uppercase, garante hífens nas posições certas.
 */
export function normalizeKeyInput(input: string): string {
  const cleaned = input.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  if (cleaned.length !== 16) return cleaned
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}`
}

export const KEY_REGEX = /^[A-HJ-KM-NP-Z2-9]{4}-[A-HJ-KM-NP-Z2-9]{4}-[A-HJ-KM-NP-Z2-9]{4}-[A-HJ-KM-NP-Z2-9]{4}$/

export function isValidKeyFormat(key: string): boolean {
  return KEY_REGEX.test(key)
}
