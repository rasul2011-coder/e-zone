import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { getUserSession, setUserSession, verifyPassword, hashPassword } from '@/lib/auth/user'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getUserSession()
    if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    const body = await req.json() as {
      name?: string
      phone?: string
      currentPassword?: string
      newPassword?: string
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (body.name?.trim()) updates.name = body.name.trim()
    if (body.phone !== undefined) updates.phone = body.phone.trim() || null

    // Password change
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: 'Введите текущий пароль' }, { status: 400 })
      }
      if (body.newPassword.length < 6) {
        return NextResponse.json({ error: 'Новый пароль минимум 6 символов' }, { status: 400 })
      }

      const [user] = await db.select({ passwordHash: schema.users.passwordHash })
        .from(schema.users).where(eq(schema.users.id, session.userId)).limit(1)

      if (!user?.passwordHash) {
        return NextResponse.json({ error: 'Смена пароля недоступна для Google-аккаунтов' }, { status: 400 })
      }

      const ok = await verifyPassword(body.currentPassword, user.passwordHash)
      if (!ok) return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 })

      updates.passwordHash = await hashPassword(body.newPassword)
    }

    const [updated] = await db.update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, session.userId))
      .returning({ name: schema.users.name, phone: schema.users.phone, email: schema.users.email, avatar: schema.users.avatar })

    // Refresh session cookie with new name
    await setUserSession({
      userId: session.userId,
      email:  updated.email,
      name:   updated.name,
      avatar: updated.avatar,
    })

    return NextResponse.json({ ok: true, user: updated })
  } catch (err) {
    console.error('[auth/profile]', err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
