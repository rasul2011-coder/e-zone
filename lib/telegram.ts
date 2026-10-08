const TELEGRAM_API = 'https://api.telegram.org'

/**
 * Sends a message to the configured Telegram chat.
 * Safe to call from any Server Component, Route Handler or Server Action.
 * Silently logs a warning if env vars are missing (dev convenience).
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set in .env.local')
  }

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    chatId,
      text,
      parse_mode: 'HTML',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[telegram] sendMessage failed:', err)
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

/** Formats a new application notification */
export function formatApplicationMessage(data: {
  name:      string
  phone:     string
  course?:   string | null
  branch?:   string | null
  comment?:  string | null
  source?:   string | null
}): string {
  const lines = [
    '🔔 <b>Новая заявка!</b>',
    '',
    `👤 Имя:     ${data.name}`,
    `📞 Телефон: ${data.phone}`,
  ]

  if (data.course)  lines.push(`📚 Курс:    ${data.course}`)
  if (data.branch)  lines.push(`🏢 Филиал:  ${data.branch}`)
  if (data.comment) lines.push(`💬 Коммент: ${data.comment}`)
  if (data.source)  lines.push(`🌐 Источник: ${data.source}`)

  lines.push('', `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })}`)

  return lines.join('\n')
}

/** Formats a trial lesson notification */
export function formatTrialLessonMessage(data: {
  name:    string
  phone:   string
  course:  string
  branch:  string
  date:    string
  time:    string
  teacher?: string | null
}): string {
  const lines = [
    '📅 <b>Запись на пробный урок!</b>',
    '',
    `👤 Имя:        ${data.name}`,
    `📞 Телефон:    ${data.phone}`,
    `📚 Курс:       ${data.course}`,
    `🏢 Филиал:     ${data.branch}`,
    `📆 Дата:       ${data.date}`,
    `⏰ Время:      ${data.time}`,
  ]

  if (data.teacher) lines.push(`👩‍🏫 Преподаватель: ${data.teacher}`)

  lines.push('', `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })}`)

  return lines.join('\n')
}
