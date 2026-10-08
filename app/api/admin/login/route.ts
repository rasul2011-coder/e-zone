import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { verifyPassword, generateOtp, setOtpPendingCookie } from '@/lib/admin/auth'
import { storeOtp } from '@/lib/admin/otp'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string
      password?: string
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Введите email и никнейм' },
        { status: 400 },
      )
    }

    // 1. Find admin by email
    const rows = await db
      .select()
      .from(schema.admins)
      .where(eq(schema.admins.email, email.toLowerCase().trim()))
      .limit(1)

    const admin = rows[0]

    // Constant-time comparison to prevent timing attacks
    const passwordOk = admin
      ? await verifyPassword(password, admin.passwordHash)
      : await verifyPassword(password, '$2b$12$invalidhashpadding000000000000000000000000000000000000000')

    if (!admin || !passwordOk || !admin.isActive) {
      return NextResponse.json(
        { error: 'Неверный email или никнейм' },
        { status: 401 },
      )
    }

    // 2. Generate 4-digit OTP and store it
    const otp = generateOtp()
    await storeOtp(admin.id, otp)

    // 3. Send OTP via Telegram bot (not Gmail)
    await sendTelegramMessage(
      `🔐 <b>Код подтверждения для Admin Panel</b>\n\n` +
      `Ваш код: <code>${otp}</code>\n\n` +
      `⏱ Действителен 10 минут.\n` +
      `Никому не сообщайте этот код.`
    )

    // 4. Set short-lived OTP-pending cookie
    await setOtpPendingCookie(admin.id, admin.email)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/login]', err)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера. Попробуйте позже.' },
      { status: 500 },
    )
  }
}
