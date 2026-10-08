import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export const USER_SESSION_COOKIE = 'user_session'
const SESSION_TTL = 60 * 60 * 24 * 30 // 30 days

function getSecret(): Uint8Array {
  const s = process.env.USER_JWT_SECRET || process.env.ADMIN_JWT_SECRET
  if (!s) throw new Error('JWT secret not set')
  return new TextEncoder().encode(s)
}

// ─── Password ─────────────────────────────────────────────────────────────────
export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12)
}
export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

// ─── Session ──────────────────────────────────────────────────────────────────
export interface UserSessionPayload {
  userId: number
  email:  string
  name:   string
  avatar?: string | null
}

export async function createUserToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(getSecret())
}

export async function verifyUserToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as UserSessionPayload
  } catch {
    return null
  }
}

export async function getUserSession(): Promise<UserSessionPayload | null> {
  const jar = await cookies()
  const token = jar.get(USER_SESSION_COOKIE)?.value
  if (!token) return null
  return verifyUserToken(token)
}

export async function setUserSession(payload: UserSessionPayload): Promise<void> {
  const token = await createUserToken(payload)
  const jar = await cookies()
  jar.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   SESSION_TTL,
  })
}

export async function clearUserSession(): Promise<void> {
  const jar = await cookies()
  jar.delete(USER_SESSION_COOKIE)
}
