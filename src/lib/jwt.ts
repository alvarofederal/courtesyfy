// src/lib/jwt.ts
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const ACCESS_TOKEN_EXPIRY = '15m' // 15 minutos (curto por segurança)
const REFRESH_TOKEN_EXPIRY = '7d' // 7 dias

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets não configurados no .env')
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  tokenId: string
}

// ✅ Gerar Access Token (JWT)
export function generateAccessToken(userId: string, email: string, role: string): string {
  const tokenId = nanoid()
  
  return jwt.sign(
    {
      userId,
      email,
      role,
      tokenId,
      type: 'access'
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'basemedical',
      audience: 'basemedical-api'
    }
  )
}

// ✅ Gerar Refresh Token
export async function generateRefreshToken(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = nanoid(64) // Token aleatório seguro
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

  // Armazenar no banco
  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    }
  })

  return token
}

// ✅ Verificar Access Token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'basemedical',
      audience: 'basemedical-api'
    }) as JWTPayload

    return decoded
  } catch (error) {
    return null
  }
}

// ✅ Verificar Refresh Token
export async function verifyRefreshToken(token: string): Promise<{
  valid: boolean
  userId?: string
}> {
  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!refreshToken) {
      return { valid: false }
    }

    // Verificar expiração
    if (refreshToken.expiresAt < new Date()) {
      // Token expirado - deletar
      await prisma.refreshToken.delete({
        where: { id: refreshToken.id }
      })
      return { valid: false }
    }

    // Atualizar lastUsedAt
    await prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { lastUsedAt: new Date() }
    })

    return {
      valid: true,
      userId: refreshToken.userId
    }
  } catch (error) {
    return { valid: false }
  }
}

// ✅ Revogar todos os tokens de um usuário (logout completo)
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId }
  })
}

// ✅ Limpar tokens expirados (cron job)
export async function cleanExpiredTokens(): Promise<void> {
  const now = new Date()
  
  await Promise.all([
    prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: now } }
    }),
    prisma.authToken.deleteMany({
      where: { expiresAt: { lt: now } }
    })
  ])
}