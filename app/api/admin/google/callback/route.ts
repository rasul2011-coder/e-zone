import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { generateOtp, setOtpPendingCookie } from '@/lib/admin/auth'
import { storeOtp } from '@/lib/admin/otp'
import { sendTelegramMessage } from '@/lib/telegram'

interface GoogleTokenResponse {
  access_token: string
  id_token:     string
  token_type:   string
  expires_in:   number
}

interface GoogleUserInfo {
  sub:            string
  email:          string
  name:           string
  picture?:       string
  email_verified: boolean
}

/**
 * GET /api/admin/google/callback
 * After Google consent:
 * 1. Exchange code → tokens → user info
 * 2. Match email against admins table
 * 3. Send OTP via Telegram (same 2FA flow as email/password)
 * 4. Redirect to /admin/verify
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin

  const code  = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(error ?? 'access_denied')}`,
    )
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent('Google OAuth не настроен')}`,
    )
  }

  const redirectUri = `${origin}/api/admin/google/callback`

  // ── 1. Exchange code for tokens ───────────────────────────────────────────
  let tokens: GoogleTokenResponse
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })
    if (!tokenRes.ok) throw new Error(await tokenRes.text())
    tokens = await tokenRes.json() as GoogleTokenResponse
  } catch (err) {
    console.error('[google/callback] token exchange failed:', err)
    return NextResponse.redirect(`${origin}/admin/login?error=token_failed`)
  }

  // ── 2. Fetch Google profile ───────────────────────────────────────────────
  let googleUser: GoogleUserInfo
  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (!userRes.ok) throw new Error(await userRes.text())
    googleUser = await userRes.json() as GoogleUserInfo
  } catch (err) {
    console.error('[google/callback] userinfo failed:', err)
    return NextResponse.redirect(`${origin}/admin/login?error=userinfo_failed`)
  }

  if (!googleUser.email_verified) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent('Email Google не подтверждён')}`,
    )
  }

  // ── 3. Match Google email to a registered admin ───────────────────────────
  const rows = await db
    .select({ id: schema.admins.id, email: schema.admins.email, isActive: schema.admins.isActive })
    .from(schema.admins)
    .where(eq(schema.admins.email, googleUser.email.toLowerCase().trim()))
    .limit(1)

  const admin = rows[0]

  if (!admin || !admin.isActive) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent('Этот Google аккаунт не зарегистрирован как администратор')}`,
    )
  }

  // ── 4. Generate OTP and send via Telegram (same 2FA as email/password) ────
  const otp = generateOtp()
  await storeOtp(admin.id, otp)

  await sendTelegramMessage(
    `🔐 <b>Код подтверждения для Admin Panel</b>\n\n` +
    `Вход через Google: <b>${googleUser.email}</b>\n\n` +
    `Ваш код: <code>${otp}</code>\n\n` +
    `⏱ Действителен 10 минут.\n` +
    `Никому не сообщайте этот код.`
  )

  // ── 5. Set OTP-pending cookie and redirect to verify ─────────────────────
  await setOtpPendingCookie(admin.id, admin.email)

  return NextResponse.redirect(`${origin}/admin/verify`)
}
