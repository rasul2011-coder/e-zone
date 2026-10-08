import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { db, schema } from '@/lib/db'
import {
  getOtpPendingSession,
  setAdminSession,
  OTP_SESSION_COOKIE,
} from '@/lib/admin/auth'
import { verifyAndConsumeOtp } from '@/lib/admin/otp'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const { code } = (await req.json()) as { code?: string }

    if (!code || !/^\d{4}$/.test(code.trim())) {
      return NextResponse.json(
        { error: 'Введите 4-значный код из письма' },
        { status: 400 },
      )
    }

    // 1. Read OTP-pending cookie
    const pending = await getOtpPendingSession()
    if (!pending) {
      return NextResponse.json(
        { error: 'Сессия истекла. Войдите заново.' },
        { status: 401 },
      )
    }

    // 2. Verify & consume OTP (one-time use)
    const valid = await verifyAndConsumeOtp(pending.adminId, code.trim())
    if (!valid) {
      return NextResponse.json(
        { error: 'Неверный или просроченный код' },
        { status: 401 },
      )
    }

    // 3. Load admin record
    const rows = await db
      .select({
        id:     schema.admins.id,
        email:  schema.admins.email,
        name:   schema.admins.name,
        roleId: schema.admins.roleId,
      })
      .from(schema.admins)
      .where(eq(schema.admins.id, pending.adminId))
      .limit(1)

    const admin = rows[0]
    if (!admin) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // 4. Load role
    const roleRows = await db
      .select({ name: schema.roles.name })
      .from(schema.roles)
      .where(eq(schema.roles.id, admin.roleId))
      .limit(1)
    const role = roleRows[0]?.name ?? 'admin'

    // 5. Record last login
    await db
      .update(schema.admins)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.admins.id, admin.id))

    // 6. Issue session cookie + clear OTP-pending cookie
    await setAdminSession({ adminId: admin.id, email: admin.email, name: admin.name, role })
    const jar = await cookies()
    jar.delete(OTP_SESSION_COOKIE)

    // 7. Notify Telegram (fire-and-forget)
    const loginTime = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })
    sendTelegramMessage(
      `🔐 <b>Вход в Admin Panel</b>\n\n` +
      `👤 Администратор: <b>${admin.name}</b>\n` +
      `📧 Email: ${admin.email}\n` +
      `🛡 Роль: ${role}\n` +
      `🕐 Время: ${loginTime}`
    ).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/verify-otp]', err)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 },
    )
  }
}
