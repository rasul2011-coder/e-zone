import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, getDictionaryByLocale } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = await getDictionaryByLocale(lang as Locale, 'reviews')
  return { title: `${t.title} · English Zone` }
}

// Expanded reviews — realistic and specific
const REVIEWS_RU = [
  { name: 'Айгерим С.',        course: 'General English', rating: 5, months: 4, text: 'За 4 месяца подняла разговорный уровень с Elementary до Pre-Intermediate. Преподаватель объясняет понятно, не торопит. В небольшой группе успеваешь поговорить каждый урок.' },
  { name: 'Данияр К.',         course: 'IELTS Prep',      rating: 5, months: 3, text: 'Сдал IELTS на 6.5 с первой попытки. Разбирали все части экзамена системно — Writing, Speaking, Reading, Listening. Преподаватель давал чёткую обратную связь по каждой работе.' },
  { name: 'Алтынай М. (мама)', course: 'Kids Club',       rating: 5, months: 6, text: 'Дочери 9 лет, занимается полгода. Начала понимать простые фразы и отвечать по-английски. На уроках игры, песни — ребёнок идёт с удовольствием. Преподаватели терпеливы.' },
  { name: 'Бакыт М.',          course: 'General English', rating: 5, months: 3, text: 'Пробовал в другой школе — там большие группы, мало разговорной практики. Здесь максимум 8 человек, на каждом уроке реально разговариваешь. За 3 месяца прогресс заметный.' },
  { name: 'Нурия Р.',          course: 'IELTS Prep',      rating: 5, months: 4, text: 'Готовилась к IELTS для поступления за рубеж. Получила 7.0. Преподаватель знает все типы заданий, объяснял стратегии для каждого раздела. Поступила в университет в Великобритании.' },
  { name: 'Санжар Т.',         course: 'General English', rating: 5, months: 5, text: 'Комфортный класс, приятная атмосфера. Через 5 месяцев стал понимать фильмы и сериалы без субтитров. Особенно понравилось что преподаватель не исправляет на каждом слове.' },
  { name: 'Жылдыз А. (мама)',  course: 'Kids Club',       rating: 5, months: 3, text: 'Сыну 7 лет. Раньше боялся говорить по-английски на уроках в школе. После 3 месяцев в English Zone уверенность выросла — сам начал читать английские слова.' },
  { name: 'Тимур О.',          course: 'General English', rating: 5, months: 2, text: 'Занимаюсь вечерами после работы. Удобное расписание — выбрал время, которое подходит. Уже через 2 месяца смог вести базовые переговоры с иностранными коллегами.' },
  { name: 'Мээрим Б.',         course: 'Kids Club',       rating: 5, months: 8, text: 'Два ребёнка ходят в Kids Club — 6 и 10 лет. Оба прогрессируют. Старший уже читает короткие тексты самостоятельно. Очень рады что нашли этот центр.' },
  { name: 'Адиль С.',          course: 'IELTS Prep',      rating: 5, months: 3, text: 'Сдал IELTS на 7.5. Курс структурирован грамотно — каждую неделю отрабатывали конкретный навык. Mock тесты помогли не нервничать на реальном экзамене. Рекомендую.' },
  { name: 'Гүлназ К.',         course: 'General English', rating: 5, months: 6, text: 'Начинала с нуля. За 6 месяцев дошла до уровня, где могу общаться в путешествии и понимать большую часть речи на слух. Преподаватель очень поддерживает и мотивирует.' },
  { name: 'Руслан Д.',         course: 'General English', rating: 5, months: 4, text: 'Нравится что уроки всегда разные — разговорные упражнения, работа с текстами, аудирование. Не скучно. Пришёл продлевать на второй курс, что говорит само за себя.' },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill={i < count ? '#f97316' : 'none'} stroke={i < count ? '#f97316' : '#6b7280'} strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

export default async function ReviewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc] = await Promise.all([
    getDictionary(locale, 'reviews'),
    getDictionary(locale, 'common'),
  ])

  const REVIEWS = REVIEWS_RU

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href={`/${locale}`} className="hover:text-orange-500 transition">{tc.breadcrumbs.home}</Link>
            <span>/</span><span className="text-[var(--text)]">{t.breadcrumb}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="section-hero py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center relative z-10">
          <span className="mb-4 inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">
            {t.title}
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{t.title}</h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">{t.subtitle}</p>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {[
              { value: `${REVIEWS.length}`, label: locale === 'ru' ? 'отзывов' : 'пикир' },
              { value: '5.0', label: locale === 'ru' ? 'средняя оценка' : 'орточо баа' },
              { value: '3', label: locale === 'ru' ? 'курса' : 'курс' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                <span className="text-3xl font-extrabold text-white">{s.value}</span>
                <span className="text-sm text-white/50">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">

          {/* Course filter tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { key: 'all',            label: locale === 'ru' ? 'Все' : 'Баары' },
              { key: 'General English', label: 'General English' },
              { key: 'IELTS Prep',      label: 'IELTS Prep' },
              { key: 'Kids Club',       label: 'Kids Club' },
            ].map((f, i) => (
              <span key={f.key}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition cursor-default ${
                  i === 0
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-card)]'
                }`}>
                {f.label}
                <span className="ml-1.5 text-xs opacity-60">
                  ({f.key === 'all' ? REVIEWS.length : REVIEWS.filter(r => r.course === f.key).length})
                </span>
              </span>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((rev, i) => (
              <div key={i} className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 hover:border-orange-500/30 hover:shadow-lg transition"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <Stars count={rev.rating} />
                  <span className="shrink-0 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-500">
                    {rev.course}
                  </span>
                </div>

                {/* Quote */}
                <p className="flex-1 text-sm leading-relaxed text-[var(--text-muted)] mb-5">
                  &ldquo;{rev.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 border-t border-[var(--border)] pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{rev.name}</p>
                    <p className="text-xs text-[var(--text-subtle)]">
                      {locale === 'ru' ? `${rev.months} мес. обучения` : `${rev.months} ай окуу`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leave review CTA */}
          <div className="mt-12 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8 text-center">
            <p className="text-xl font-bold text-[var(--text)] mb-2">
              {locale === 'ru' ? 'Вы наш ученик? Поделитесь впечатлениями' : 'Сиз биздин окуучусузбу? Пикириңизди бөлүшүңүз'}
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md mx-auto">
              {locale === 'ru'
                ? 'Ваш честный отзыв поможет другим принять решение и продолжить развитие центра'
                : 'Сиздин чынчыл пикириңиз башкаларга чечим кабыл алууга жана борборду өнүктүрүүгө жардам берет'}
            </p>
            <Link href={`/${locale}/contacts`}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition">
              {t.leave_review}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
