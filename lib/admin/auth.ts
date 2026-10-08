import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

// ─── Constants ────────────────────────────────────────────────────────────────
// These must match the values in proxy.ts (edge middleware reads them directly)

export const ADMIN_SESSION_COOKIE = 'admin_session'
export const OTP_SESSION_COOKIE   = 'admin_otp_pending'
const SESSION_TTL_SECONDS         = 60 * 60 * 8  // 8 hours
const OTP_TTL_SECONDS             = 60 * 10       // 10 minutes

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error('ADMIN_JWT_SECRET is not set in environment variables')
  return new TextEncoder().encode(secret)
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// ─── OTP — 4-digit ────────────────────────────────────────────────────────────

export function generateOtp(): string {
  // Cryptographically random 4-digit code (1000–9999)
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return String(1000 + (arr[0] % 9000))
}

// ─── Session JWT ──────────────────────────────────────────────────────────────

export interface AdminSessionPayload {
  adminId: number
  email:   string
  name:    string
  role:    string
}

export async function createSessionToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret())
}

export async function verifySessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as AdminSessionPayload
  } catch {
    return null
  }
}

// ─── Pending-OTP JWT (short-lived, set as cookie after step-1 login) ──────────

export interface OtpPendingPayload {
  adminId: number
  email:   string
}

export async function createOtpPendingToken(payload: OtpPendingPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${OTP_TTL_SECONDS}s`)
    .sign(getJwtSecret())
}

export async function verifyOtpPendingToken(token: string): Promise<OtpPendingPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as OtpPendingPayload
  } catch {
    return null
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function setAdminSession(payload: AdminSessionPayload): Promise<void> {
  const token = await createSessionToken(payload)
  const jar = await cookies()
  jar.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   SESSION_TTL_SECONDS,
  })
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies()
  jar.delete(ADMIN_SESSION_COOKIE)
  jar.delete(OTP_SESSION_COOKIE)
}

export async function setOtpPendingCookie(adminId: number, email: string): Promise<void> {
  const token = await createOtpPendingToken({ adminId, email })
  const jar = await cookies()
  jar.set(OTP_SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   OTP_TTL_SECONDS,
  })
}

export async function getOtpPendingSession(): Promise<OtpPendingPayload | null> {
  const jar = await cookies()
  const token = jar.get(OTP_SESSION_COOKIE)?.value
  if (!token) return null
  return verifyOtpPendingToken(token)
}
