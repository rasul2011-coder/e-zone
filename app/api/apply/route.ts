import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { sendTelegramMessage, formatApplicationMessage } from '@/lib/telegram'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string
      phone: string
      email?: string
      course?: string  // course name from form
      branch?: string  // branch name from form
      comment?: string
      preferred_time?: string
      source?: string
    }

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }

    // Get or create default status "Новая"
    const statuses = await db.select().from(schema.applicationStatuses).limit(10)
    let newStatus = statuses.find(s => s.name === 'Новая')
    if (!newStatus) {
      const [inserted] = await db.insert(schema.applicationStatuses)
        .values({ name: 'Новая', description: 'Новая заявка' })
        .returning()
      newStatus = inserted
    }

    // Find course by name if provided
    let courseId: number | null = null
    if (body.course?.trim()) {
      const courses = await db.select().from(schema.courses)
        .where(eq(schema.courses.name, body.course.trim()))
        .limit(1)
      if (courses.length > 0) {
        courseId = courses[0].id
      }
    }

    // Find branch by name if provided
    let branchId: number | null = null
    if (body.branch?.trim()) {
      const branches = await db.select().from(schema.branches)
        .where(eq(schema.branches.name, body.branch.trim()))
        .limit(1)
      if (branches.length > 0) {
        branchId = branches[0].id
      }
    }

    // Insert application
    const [inserted] = await db.insert(schema.applications).values({
      name:            body.name.trim(),
      phone:           body.phone.trim(),
      email:           body.email?.trim() || null,
      courseId:        courseId,
      branchId:        branchId,
      courseName:      body.course || null,  // Save course name as text too
      preferredTime:   body.preferred_time || null,
      comment:         body.comment || null,
      source:          body.source || 'website',
      statusId:        newStatus.id,
      privacyAccepted: true,
      paymentAmount:   null,
      paymentReceipt:  null,
      isPaid:          false,
    }).returning()

    // Send Telegram notification
    const msg =
      `🔔 <b>Новая заявка!</b>\n\n` +
      `👤 Имя: <b>${body.name}</b>\n` +
      `📞 Телефон: ${body.phone}\n` +
      (body.email ? `📧 Email: ${body.email}\n` : '') +
      (body.course ? `📚 Курс: ${body.course}\n` : '') +
      (body.branch ? `🏢 Филиал: ${body.branch}\n` : '') +
      (body.preferred_time ? `⏰ Время: ${body.preferred_time}\n` : '') +
      (body.comment ? `💬 Комментарий: ${body.comment}\n` : '') +
      `\n🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })}`

    sendTelegramMessage(msg).catch((e) => {
      console.error('Telegram error:', e)
    })

    return NextResponse.json({ ok: true, id: inserted.id })
  } catch (err) {
    console.error('[api/apply] Error:', err)
    return NextResponse.json({ error: 'Ошибка сервера. Попробуйте позже.' }, { status: 500 })
  }
}
