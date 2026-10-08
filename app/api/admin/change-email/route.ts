import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { getAdminSession, verifyPassword } from '@/lib/admin/auth'

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { newEmail, currentPassword } = (await req.json()) as {
    newEmail?: string
    currentPassword?: string
  }

  if (!newEmail || !currentPassword) {
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) {
    return NextResponse.json({ error: 'Некорректный email' }, { status: 400 })
  }

  const rows = await db
    .select({ id: schema.admins.id, passwordHash: schema.admins.passwordHash })
    .from(schema.admins)
    .where(eq(schema.admins.id, session.adminId))
    .limit(1)

  const admin = rows[0]
  if (!admin) return NextResponse.json({ error: 'Администратор не найден' }, { status: 404 })

  const ok = await verifyPassword(currentPassword, admin.passwordHash)
  if (!ok) return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 })

  // Check email not already taken
  const existing = await db
    .select({ id: schema.admins.id })
    .from(schema.admins)
    .where(eq(schema.admins.email, newEmail.toLowerCase().trim()))
    .limit(1)

  if (existing.length > 0 && existing[0].id !== admin.id) {
    return NextResponse.json({ error: 'Этот email уже используется' }, { status: 409 })
  }

  await db
    .update(schema.admins)
    .set({ email: newEmail.toLowerCase().trim() })
    .where(eq(schema.admins.id, admin.id))

  return NextResponse.json({ ok: true })
}
