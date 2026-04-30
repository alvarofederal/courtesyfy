// src/lib/rate-limit.ts
interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

export async function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutos
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now()
  const key = identifier

  // Limpar entrada expirada
  if (store[key] && store[key].resetAt < now) {
    delete store[key]
  }

  // Criar ou atualizar entrada
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetAt: now + windowMs
    }
    return { allowed: true, remaining: maxAttempts - 1 }
  }

  store[key].count++

  const remaining = Math.max(0, maxAttempts - store[key].count)
  const allowed = store[key].count <= maxAttempts

  return { allowed, remaining }
}

export function resetRateLimit(identifier: string): void {
  delete store[identifier]
}