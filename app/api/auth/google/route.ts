import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const clientId     = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    const origin = req.nextUrl.origin
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Google OAuth не настроен')}`)
  }

  const origin      = req.nextUrl.origin
  const redirectUri = `${origin}/api/auth/google/callback`

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
