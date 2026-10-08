import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { getAdminSession, verifyPassword, hashPassword } from '@/lib/admin/auth'

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = (await req.json()) as {
    currentPassword?: string
    newPassword?: string
  }

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Новый пароль должен быть не менее 6 символов' }, { status: 400 })
  }

  const rows = await db
    .select({ id: schema.admins.id, passwordHash: schema.admins.passwordHash })
    .from(schema.admins)
    .where(eq(schema.admins.id, session.adminId))
    .limit(1)

  const admin = rows[0]
  if (!admin) return NextResponse.json({ error: 'Администратор не найден' }, { status: 404 })

  const ok = await verifyPassword(currentPassword, admin.passwordHash)
  if (!ok) return NextResponse.json({ error: 'Текущий пароль неверный' }, { status: 401 })

  const newHash = await hashPassword(newPassword)
  await db
    .update(schema.admins)
    .set({ passwordHash: newHash })
    .where(eq(schema.admins.id, admin.id))

  return NextResponse.json({ ok: true })
}
