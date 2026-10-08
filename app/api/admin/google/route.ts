import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/admin/google
 * Redirects the admin browser to Google's OAuth consent screen.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    // Redirect back to login with a friendly error instead of showing JSON
    const origin = req.nextUrl.origin
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent('Google OAuth не настроен. Заполните GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env.local')}`,
    )
  }

  const origin = req.nextUrl.origin
  const redirectUri = `${origin}/api/admin/google/callback`

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  )
}
