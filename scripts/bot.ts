import { Bot } from 'grammy'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env.local')
  process.exit(1)
}

const bot = new Bot(token)

bot.command('start', (ctx) =>
  ctx.reply(
    '👋 Привет! Я бот сайта English Zone.\n\n' +
    'Я буду присылать уведомления о новых заявках с сайта.\n\n' +
    'Команды:\n' +
    '/start — приветствие\n' +
    '/help — помощь\n' +
    '/status — статус бота'
  )
)

bot.command('help', (ctx) =>
  ctx.reply(
    '📋 Справка\n\n' +
    'Этот бот уведомляет об заявках с сайта English Zone.\n\n' +
    'Команды:\n' +
    '/start — приветствие\n' +
    '/status — проверить что бот работает'
  )
)

bot.command('status', (ctx) => {
  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })
  return ctx.reply(`✅ Бот работает нормально.\n🕐 Время: ${time}`)
})

// Reply to any non-command message
bot.on('message', (ctx) => {
  if ('text' in ctx.message && ctx.message.text?.startsWith('/')) return
  return ctx.reply(
    '📨 Сообщение получено!\n\nНапиши /help чтобы увидеть команды.'
  )
})

console.log('🤖 Бот запущен в режиме polling...')
console.log('📨 Ожидаю сообщения. Нажми Ctrl+C для остановки.\n')

bot.start()
