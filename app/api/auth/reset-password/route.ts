import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { jwtVerify } from 'jose'
import { db, schema } from '@/lib/db'
import { hashPassword, setUserSession } from '@/lib/auth/user'

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET!
  return new TextEncoder().encode(s)
}

export async function POST(req: NextRequest) {
  try {
    const { resetToken, newPassword } = await req.json() as {
      resetToken?: string
      newPassword?: string
    }

    if (!resetToken || !newPassword) {
      return NextResponse.json({ error: 'Недостаточно данных' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 400 })
    }

    // Verify reset token
    let payload: { userId: number; email: string; type: string }
    try {
      const { payload: p } = await jwtVerify(resetToken, getSecret())
      payload = p as typeof payload
    } catch {
      return NextResponse.json({ error: 'Ссылка устарела. Начните заново.' }, { status: 401 })
    }

    if (payload.type !== 'password_reset') {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 })
    }

    // Update password
    const passwordHash = await hashPassword(newPassword)
    await db
      .update(schema.users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(schema.users.id, payload.userId))

    // Load user and issue session
    const rows = await db
      .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email, avatar: schema.users.avatar })
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1)

    if (rows[0]) {
      const u = rows[0]
      await setUserSession({ userId: u.id, email: u.email, name: u.name, avatar: u.avatar })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[reset-password]', err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
