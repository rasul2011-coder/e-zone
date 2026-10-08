import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
// openrouter/free — автоматически выбирает лучшую доступную бесплатную модель
const MODEL = 'openrouter/free'

// ─── System prompts по языку ──────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  ru: `Ты — живой, умный AI-помощник языкового центра English Zone в Бишкеке.

ДАННЫЕ О ЦЕНТРЕ:
- Курсы: General English (Beginner–Upper-Intermediate, 16+), Kids Club (5–15 лет), IELTS Preparation (14+)
- Группы: до 8 человек
- Расписание: Пн–Сб, утренние / дневные / вечерние группы
- Цены: General English от 3 500 сом/мес, Kids Club от 3 000 сом/мес, IELTS Prep от 5 500 сом/мес
- Первый пробный урок — бесплатно, без обязательств
- Бесплатный тест на уровень — 20 минут, онлайн или в офисе

СТИЛЬ ОБЩЕНИЯ — САМОЕ ВАЖНОЕ:
- Анализируй КАК человек пишет: официально, расслабленно, с сленгом, с юмором, коротко, развёрнуто
- Зеркаль его стиль. Если пишет "норм курсы есть?" — отвечай так же легко. Если пишет официально — отвечай официально
- Если пишет с ошибками или сокращениями — не исправляй, отвечай в том же духе
- Если шутит — можешь пошутить в ответ, но кратко
- Никогда не звучи как робот или скрипт колл-центра
- Используй эмодзи если человек их использует, не используй если нет
- Максимум 3–4 предложения в ответе

ТЕМАТИКА — СТРОГО:
1. Отвечай ТОЛЬКО на вопросы о курсах английского, ценах, расписании, методиках, IELTS, записи в English Zone
2. Если вопрос не по теме — скажи это в своём стиле, кратко и без занудства
3. Не придумывай факты. Если не знаешь точно — скажи уточнить у нас напрямую`,

  kg: `Сен — Бишкектеги English Zone тил борборунун жандуу, акылдуу AI-жардамчысысың.

БОРБОР ЖӨНҮНДӨ:
- Курстар: General English (16+), Kids Club (5–15 жаш), IELTS Preparation (14+)
- Топтор: 8 адамга чейин
- Убакыт: Дүй–Ишм, эртең / күндүз / кеч
- Баасы: General English 3 500 сомдон/ай, Kids Club 3 000 сом, IELTS 5 500 сом
- Биринчи сабак акысыз

БАЙЛАНЫШ СТИЛИ — ЭҢ МААНИЛҮҮ:
- Адам кандай жазса, ошондой жооп бер: жеңил болсо — жеңил, расмий болсо — расмий
- Кыска жазса — кыска жооп. Узун жазса — толук жооп
- Эмодзи колдонсо — колдон, колдонбосо — колдонба
- Робот сыяктуу сүйлөбө
- Максималдуу 3–4 сүйлөм

ТЕМА — КАТУУ:
1. БИРӨӨ ГАНАтемаларда жооп бер: English Zone курстары, баалар, убакыт, IELTS, жазылуу
2. Башка нерсе болсо — өз стилиңде кыска айт
3. Так билбесең — түздөн-түз бизден сурануу дегин`,

  en: `You are a sharp, friendly AI assistant for English Zone language centre in Bishkek.

CENTRE INFO:
- Courses: General English (Beginner–Upper-Intermediate, 16+), Kids Club (ages 5–15), IELTS Preparation (14+)
- Groups: up to 8 students
- Schedule: Mon–Sat, morning / afternoon / evening
- Prices: General English from 3,500 KGS/mo, Kids Club from 3,000 KGS/mo, IELTS Prep from 5,500 KGS/mo
- First trial lesson is free, no commitment

COMMUNICATION STYLE — MOST IMPORTANT:
- Read HOW the person writes: casual, formal, slang, brief, detailed
- Mirror their style exactly. If they write "yo any good english courses?" — match that energy
- If they're formal — be professional. If they joke — you can too, briefly
- Never sound like a call centre script or a chatbot
- Use emojis only if they do
- Max 3–4 sentences

TOPIC — STRICT:
1. Answer ONLY about English courses, pricing, schedule, teaching methods, IELTS, enrolling at English Zone
2. Off-topic? Say so briefly in their style, no lecture
3. Don't make up facts — tell them to check with us directly if unsure`,
}

function getSystemPrompt(locale: string): string {
  return SYSTEM_PROMPTS[locale] ?? SYSTEM_PROMPTS['ru']
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { message, history, locale } = (await req.json()) as {
      message: string
      history?: Array<{ role: 'user' | 'model'; text: string }>
      locale?: string
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Пустое сообщение' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      const msg = locale === 'kg'
        ? 'AI убакытша жеткиликсиз. Бизге түздөн-түз кайрылыңыз.'
        : 'AI временно недоступен. Обратитесь к нам напрямую.'
      return NextResponse.json({ error: msg }, { status: 503 })
    }

    const lang = locale ?? 'ru'
    const systemPrompt = getSystemPrompt(lang)

    // Build OpenAI-compatible messages array
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ]

    // Last 10 history messages
    if (history?.length) {
      for (const h of history.slice(-10)) {
        messages.push({
          role:    h.role === 'model' ? 'assistant' : 'user',
          content: h.text,
        })
      }
    }

    messages.push({ role: 'user', content: message })

    const res = await fetch(OPENROUTER_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'HTTP-Referer':  'https://english-zone.kg',
        'X-Title':       'English Zone AI Assistant',
      },
      body: JSON.stringify({
        model:       MODEL,
        messages,
        max_tokens:  400,
        temperature: 0.85,   // выше = живее, человечнее
        top_p:       0.95,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[openrouter]', res.status, err)
      const msg = locale === 'kg'
        ? 'AI убакытша жеткиликсиз. Кийинчерээк аракет кылыңыз.'
        : 'AI временно недоступен. Попробуйте позже.'
      return NextResponse.json({ error: msg }, { status: 503 })
    }

    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      const msg = locale === 'kg'
        ? 'Жооп алынган жок. Суроону кайра жазып көрүңүз.'
        : 'Не удалось получить ответ. Попробуйте переформулировать.'
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[ai/chat]', err)
    return NextResponse.json(
      { error: 'Внутренняя ошибка. Попробуйте позже.' },
      { status: 500 },
    )
  }
}
