import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { setUserSession } from '@/lib/auth/user'

interface GoogleTokens { access_token: string }
interface GoogleUser   { sub: string; email: string; name: string; picture?: string; email_verified: boolean }

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const code   = req.nextUrl.searchParams.get('code')
  const error  = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error ?? 'cancelled')}`)
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri  = `${origin}/api/auth/google/callback`

  // Exchange code
  let tokens: GoogleTokens
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    })
    if (!r.ok) throw new Error(await r.text())
    tokens = await r.json()
  } catch (e) {
    console.error('[auth/google/callback]', e)
    return NextResponse.redirect(`${origin}/login?error=token_failed`)
  }

  // Get profile
  let gUser: GoogleUser
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    gUser = await r.json()
  } catch {
    return NextResponse.redirect(`${origin}/login?error=userinfo_failed`)
  }

  if (!gUser.email_verified) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Email не подтверждён')}`)
  }

  // Only allow login — do NOT create new users via Google
  const existing = await db.select().from(schema.users)
    .where(eq(schema.users.email, gUser.email.toLowerCase())).limit(1)

  if (existing.length === 0) {
    // No account found — redirect with error
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Такого аккаунта нет. Сначала зарегистрируйтесь через email.')}`,
    )
  }

  const user = existing[0]

  if (!user.isActive) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Аккаунт заблокирован.')}`,
    )
  }

  // Update google info if needed
  await db.update(schema.users)
    .set({ googleId: gUser.sub, avatar: gUser.picture ?? null, updatedAt: new Date() })
    .where(eq(schema.users.id, user.id))

  await setUserSession({ userId: user.id, email: user.email, name: user.name, avatar: user.avatar ?? null })

  // Redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`)
}
