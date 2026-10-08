import { NextRequest, NextResponse } from 'next/server'

const TOKEN   = process.env.TELEGRAM_BOT_TOKEN!
const API     = `https://api.telegram.org/bot${TOKEN}`

async function sendMessage(chatId: number, text: string) {
  await fetch(`${API}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

// Telegram sends POST requests to this endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = body?.message

    if (!message) return NextResponse.json({ ok: true })

    const chatId: number = message.chat.id
    const text: string   = message.text ?? ''

    // ─── Command handlers ─────────────────────────────────────────────────────
    if (text === '/start') {
      await sendMessage(chatId,
        '👋 Привет! Я бот сайта <b>English Zone</b>.\n\n' +
        'Я буду присылать уведомления о новых заявках с сайта.\n\n' +
        'Доступные команды:\n' +
        '/start — приветствие\n' +
        '/help — помощь\n' +
        '/status — статус бота'
      )
      return NextResponse.json({ ok: true })
    }

    if (text === '/help') {
      await sendMessage(chatId,
        '📋 <b>Справка</b>\n\n' +
        'Этот бот уведомляет об заявках с сайта English Zone.\n\n' +
        'Команды:\n' +
        '/start — приветствие\n' +
        '/status — проверить что бот работает'
      )
      return NextResponse.json({ ok: true })
    }

    if (text === '/status') {
      await sendMessage(chatId,
        '✅ Бот работает нормально.\n' +
        `🕐 Время сервера: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })}`
      )
      return NextResponse.json({ ok: true })
    }

    // ─── Default reply ────────────────────────────────────────────────────────
    await sendMessage(chatId,
      '📨 Сообщение получено!\n\n' +
      'Я бот для уведомлений English Zone — отвечаю только на команды.\n' +
      'Напиши /help чтобы увидеть доступные команды.'
    )

  } catch (err) {
    console.error('[telegram webhook]', err)
  }

  return NextResponse.json({ ok: true })
}
