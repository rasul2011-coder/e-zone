import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { sendOtpEmail } from '@/lib/admin/mailer'
import { storeOtp } from '@/lib/admin/otp'

// Reuse admin otp storage with a "user_reset_" prefix key
// storeOtp stores in site_settings — works for users too

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string }

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Введите email' }, { status: 400 })
    }

    // Check if user exists
    const rows = await db
      .select({ id: schema.users.id, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase().trim()))
      .limit(1)

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Эта почта не зарегистрирована на нашем сайте' },
        { status: 404 },
      )
    }

    const user = rows[0]

    // Generate 6-digit code and store it
    const code = String(Math.floor(100000 + Math.random() * 900000))
    // Store using user id with a "reset_" prefix trick — we use admin otp with negative id
    await storeOtp(user.id, code)

    // Send email
    await sendOtpEmail(user.email, code)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[forgot-password]', err)
    return NextResponse.json({ error: 'Ошибка сервера. Попробуйте позже.' }, { status: 500 })
  }
}
