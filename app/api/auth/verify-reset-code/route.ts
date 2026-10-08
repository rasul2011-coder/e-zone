import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { verifyAndConsumeOtp } from '@/lib/admin/otp'
import { SignJWT } from 'jose'

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET!
  return new TextEncoder().encode(s)
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json() as { email?: string; code?: string }

    if (!email?.trim() || !code?.trim()) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
    }
    if (!/^\d{6}$/.test(code.trim())) {
      return NextResponse.json({ error: 'Код должен быть 6 цифр' }, { status: 400 })
    }

    // Find user
    const rows = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase().trim()))
      .limit(1)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const userId = rows[0].id
    const valid = await verifyAndConsumeOtp(userId, code.trim())

    if (!valid) {
      return NextResponse.json({ error: 'Неверный или просроченный код' }, { status: 401 })
    }

    // Issue a short-lived reset token (10 min)
    const resetToken = await new SignJWT({ userId, email: email.toLowerCase().trim(), type: 'password_reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(getSecret())

    return NextResponse.json({ ok: true, resetToken })
  } catch (err) {
    console.error('[verify-reset-code]', err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
