import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { hashPassword, setUserSession } from '@/lib/auth/user'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json() as {
      name?: string; email?: string; password?: string
    }

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 400 })
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 400 })
    }

    // Check duplicate
    const existing = await db.select({ id: schema.users.id })
      .from(schema.users).where(eq(schema.users.email, email.toLowerCase().trim())).limit(1)
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Этот email уже зарегистрирован' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const [user] = await db.insert(schema.users).values({
      name:         name.trim(),
      email:        email.toLowerCase().trim(),
      passwordHash,
    }).returning()

    await setUserSession({ userId: user.id, email: user.email, name: user.name, avatar: null })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[auth/signup]', err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
