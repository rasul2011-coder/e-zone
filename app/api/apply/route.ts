import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { sendTelegramMessage } from '@/lib/telegram'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string
      phone: string
      email?: string
      course?: string
      branch?: string
      comment?: string
      preferred_time?: string
      source?: string
      paymentAmount?: number
      paymentReceipt?: string
      courseName?: string
      age?: string | number
      role?: string   // 'student' | 'parent'
    }

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }

    // Get or create default status "Новая"
    let newStatus
    try {
      const statuses = await db.select().from(schema.applicationStatuses).limit(10)
      newStatus = statuses.find(s => s.name === 'Новая')
      if (!newStatus) {
        const [inserted] = await db.insert(schema.applicationStatuses)
          .values({ name: 'Новая', description: 'Новая заявка' })
          .returning()
        newStatus = inserted
      }
    } catch (e) {
      console.error('[api/apply] Status error:', e)
      // Try to get any status as fallback
      const [anyStatus] = await db.select().from(schema.applicationStatuses).limit(1)
      if (!anyStatus) throw new Error('No application statuses in DB')
      newStatus = anyStatus
    }

    // Find course by name if provided
    let courseId: number | null = null
    const courseName = body.courseName || body.course
    if (courseName?.trim()) {
      const courses = await db.select().from(schema.courses)
        .where(eq(schema.courses.name, courseName.trim()))
        .limit(1)
      if (courses.length > 0) courseId = courses[0].id
    }

    // Find branch by name if provided
    let branchId: number | null = null
    if (body.branch?.trim()) {
      const branches = await db.select().from(schema.branches)
        .where(eq(schema.branches.name, body.branch.trim()))
        .limit(1)
      if (branches.length > 0) branchId = branches[0].id
    }

    const ageNum = body.age ? parseInt(String(body.age)) : null

    // Insert application
    const now = new Date();
    const [inserted] = await db.insert(schema.applications).values({
      name:            body.name.trim(),
      phone:           body.phone.trim(),
      email:           body.email?.trim() || null,
      courseId,
      branchId,
      courseName:      courseName || null,
      preferredTime:   body.preferred_time || null,
      comment:         body.comment || null,
      source:          body.source || 'website',
      statusId:        newStatus.id,
      privacyAccepted: true,
      paymentAmount:   body.paymentAmount || null,
      paymentReceipt:  body.paymentReceipt || null,
      isPaid:          !!body.paymentReceipt,
      age:             ageNum,
      role:            body.role || null,
      createdAt:       now,
      updatedAt:       now,
    }).returning()

    // Role label для Telegram
    const roleLabel =
      body.role === 'student' ? '🎓 Ученик' :
      body.role === 'parent'  ? '👨‍👧 Родитель' :
      body.role ?? '—'

    // Telegram notification
    const msg =
      `🔔 <b>Новая заявка!</b>\n\n` +
      `👤 Имя:      <b>${body.name.trim()}</b>\n` +
      `📞 Телефон:  ${body.phone.trim()}\n` +
      (body.email        ? `📧 Email:    ${body.email}\n`        : '') +
      (body.role         ? `🙋 Роль:     ${roleLabel}\n`         : '') +
      (ageNum            ? `🎂 Возраст:  ${ageNum} лет\n`        : '') +
      (courseName        ? `📚 Курс:     ${courseName}\n`        : '') +
      (body.branch       ? `🏢 Филиал:   ${body.branch}\n`       : '') +
      (body.paymentAmount ? `💰 Оплата:  ${body.paymentAmount.toLocaleString()} сом\n` : '') +
      (body.paymentReceipt ? `✅ Чек загружен\n`                 : '') +
      (body.comment      ? `💬 Коммент: ${body.comment}\n`       : '') +
      `\n🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })}`

    sendTelegramMessage(msg).catch(e => console.error('Telegram error:', e))

    return NextResponse.json({ ok: true, id: inserted.id })
  } catch (err) {
    console.error('[api/apply] Error:', err)
    return NextResponse.json({ error: 'Ошибка сервера. Попробуйте позже.' }, { status: 500 })
  }
}
