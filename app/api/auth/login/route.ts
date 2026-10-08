import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { verifyPassword, setUserSession } from '@/lib/auth/user'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email?: string; password?: string }

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Введите email и пароль' }, { status: 400 })
    }

    const rows = await db.select().from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase().trim())).limit(1)
    const user = rows[0]

    // Constant-time — prevent timing attacks
    const ok = user?.passwordHash
      ? await verifyPassword(password, user.passwordHash)
      : await verifyPassword(password, '$2b$12$invalidhashpadding000000000000000000000000000000000000000')

    if (!user || !ok || !user.isActive) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }

    await setUserSession({ userId: user.id, email: user.email, name: user.name, avatar: user.avatar })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[auth/login]', err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
