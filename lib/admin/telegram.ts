import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'

const TELEGRAM_API = 'https://api.telegram.org'

async function getSetting(key: string): Promise<string | null> {
  const rows = await db
    .select({ value: schema.siteSettings.value })
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.key, key))
    .limit(1)
  return rows[0]?.value ?? null
}

/**
 * Sends a 6-digit OTP to the admin's Telegram account.
 * Reads ADMIN_TELEGRAM_BOT_TOKEN and ADMIN_TELEGRAM_USER_ID from site_settings.
 */
export async function sendAdminOtp(code: string): Promise<void> {
  const [token, chatId] = await Promise.all([
    getSetting('ADMIN_TELEGRAM_BOT_TOKEN'),
    getSetting('ADMIN_TELEGRAM_USER_ID'),
  ])

  if (!token || !chatId) {
    throw new Error(
      'ADMIN_TELEGRAM_BOT_TOKEN or ADMIN_TELEGRAM_USER_ID is not configured in site_settings',
    )
  }

  const text = [
    '🔐 <b>Код подтверждения входа в админку</b>',
    '',
    `Ваш одноразовый код:`,
    '',
    `<b>${code}</b>`,
    '',
    '⏱ Код действителен 5 минут.',
    'Никому не сообщайте этот код.',
  ].join('\n')

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
    throw new Error(`Telegram sendMessage failed: ${err}`)
  }
}
