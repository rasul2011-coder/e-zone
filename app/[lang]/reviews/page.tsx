import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, getDictionaryByLocale } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'
import ReviewsMarquee from '@/components/ReviewsMarquee'
import { db, schema } from '@/lib/db'
import { eq, asc } from 'drizzle-orm'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = await getDictionaryByLocale(lang as Locale, 'reviews')
  return { title: `${t.title} · English Zone` }
}

// Fallback reviews when DB is empty
const FALLBACK_REVIEWS = [
  { name: 'Айгерим С.',        course: 'General English', rating: 5, text: 'За 4 месяца подняла разговорный уровень с Elementary до Pre-Intermediate. В небольшой группе успеваешь поговорить каждый урок.' },
  { name: 'Данияр К.',         course: 'IELTS Prep',      rating: 5, text: 'Сдал IELTS на 6.5 с первой попытки. Разбирали все части экзамена системно. Преподаватель давал чёткую обратную связь.' },
  { name: 'Алтынай М. (мама)', course: 'Kids Club',       rating: 5, text: 'Дочери 9 лет, занимается полгода. На уроках игры, песни — ребёнок идёт с удовольствием. Преподаватели терпеливы.' },
  { name: 'Бакыт М.',          course: 'General English', rating: 5, text: 'Здесь максимум 8 человек, на каждом уроке реально разговариваешь. За 3 месяца прогресс заметный.' },
  { name: 'Нурия Р.',          course: 'IELTS Prep',      rating: 5, text: 'Получила 7.0. Поступила в университет в Великобритании.' },
  { name: 'Санжар Т.',         course: 'General English', rating: 5, text: 'Через 5 месяцев стал понимать фильмы без субтитров. Комфортный класс, приятная атмосфера.' },
  { name: 'Жылдыз А. (мама)',  course: 'Kids Club',       rating: 5, text: 'Сыну 7 лет. После 3 месяцев уверенность выросла — сам начал читать английские слова.' },
  { name: 'Тимур О.',          course: 'General English', rating: 5, text: 'Занимаюсь вечерами после работы. Уже через 2 месяца смог вести базовые переговоры с коллегами.' },
  { name: 'Мээрим Б.',         course: 'Kids Club',       rating: 5, text: 'Два ребёнка ходят в Kids Club. Старший уже читает тексты самостоятельно.' },
  { name: 'Адиль С.',          course: 'IELTS Prep',      rating: 5, text: 'Сдал IELTS на 7.5. Mock тесты помогли не нервничать на реальном экзамене.' },
  { name: 'Гүлназ К.',         course: 'General English', rating: 5, text: 'За 6 месяцев дошла до уровня, где могу общаться в путешествии. Преподаватель очень поддерживает.' },
  { name: 'Руслан Д.',         course: 'General English', rating: 5, text: 'Уроки всегда разные — разговорные упражнения, тексты, аудирование. Пришёл продлевать на второй курс.' },
  { name: 'Азиза Н.',          course: 'General English', rating: 5, text: 'Занималась 5 месяцев, теперь свободно общаюсь с англоговорящими друзьями.' },
  { name: 'Эрлан Ж.',          course: 'IELTS Prep',      rating: 5, text: 'Сдал на 7.0 баллов. Все материалы актуальные, много практики.' },
  { name: 'Максат Б.',         course: 'General English', rating: 5, text: 'За 3 месяца научился базовым фразам и могу поддержать простой разговор.' },
  { name: 'Нуржан О.',         course: 'General English', rating: 5, text: 'Начал смотреть сериалы в оригинале. Атмосфера в классе дружелюбная.' },
  { name: 'Асель Т. (мама)',   course: 'Kids Club',       rating: 5, text: 'Сын ходит 4 месяца. Не боится говорить на английском. Дети не устают и всё запоминают через игры.' },
  { name: 'Кубат С.',          course: 'General English', rating: 5, text: 'За 5 месяцев значительно улучшил разговорные навыки. Рекомендую всем!' },
  { name: 'Жаңыл М.',          course: 'IELTS Prep',      rating: 5, text: 'Сдала IELTS на 7.0! Много практических заданий, разборы ошибок.' },
  { name: 'Бермет К.',         course: 'General English', rating: 5, text: 'За 4 месяца перешла с Pre-Intermediate на Intermediate. Много разговорной практики.' },
  { name: 'Эмиль Д.',          course: 'Kids Club',       rating: 5, text: 'Дочке 8 лет, начала читать простые книги на английском.' },
  { name: 'Алмаз Ж.',          course: 'General English', rating: 5, text: 'Занимаюсь 3 месяца. Преподаватель всегда готов помочь, объясняет доступно.' },
  { name: 'Гүлмира А.',        course: 'IELTS Prep',      rating: 5, text: 'Готовилась к IELTS за 3 месяца, получила 6.5. Очень благодарна!' },
  { name: 'Айнура К. (мама)',  course: 'Kids Club',       rating: 5, text: 'За 7 месяцев дочка начала составлять предложения. Преподаватели находят подход к каждому.' },
]

export default async function ReviewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc] = await Promise.all([
    getDictionary(locale, 'reviews'),
    getDictionary(locale, 'common'),
  ])

  // Load reviews from DB
  const dbReviews = await db
    .select({
      id:     schema.reviews.id,
      name:   schema.reviews.name,
      text:   schema.reviews.text,
      rating: schema.reviews.rating,
    })
    .from(schema.reviews)
    .where(eq(schema.reviews.isPublished, true))
    .orderBy(asc(schema.reviews.sortOrder))
    .catch(() => [])

  // Use DB reviews if any, else fallback
  const reviews = dbReviews.length > 0
    ? dbReviews.map(r => ({ name: r.name, course: '', text: r.text, rating: r.rating }))
    : FALLBACK_REVIEWS

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href={`/${locale}`} className="hover:text-orange-500 transition">{tc.breadcrumbs.home}</Link>
            <span>/</span>
            <span className="text-[var(--text)]">{t.breadcrumb}</span>
          </nav>
        </div>
      </div>

      {/* Hero — light warm style */}
      <section className="py-16 bg-gradient-to-b from-orange-50 to-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-600">
            {t.title}
          </span>
          <h1 className="text-3xl font-extrabold text-[var(--text)] sm:text-4xl">{t.title}</h1>
          <p className="mt-4 text-[var(--text-muted)] max-w-xl mx-auto">{t.subtitle}</p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {[
              { value: String(reviews.length), label: locale === 'ru' ? 'отзывов' : 'пикир' },
              { value: avgRating, label: locale === 'ru' ? 'средняя оценка' : 'орточо баа' },
              { value: '3', label: locale === 'ru' ? 'курса' : 'курс' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-3 shadow-sm">
                <span className="text-3xl font-extrabold text-orange-500">{s.value}</span>
                <span className="text-sm text-[var(--text-muted)]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews marquee — 3 rows */}
      <section className="py-12 md:py-16">
        <ReviewsMarquee rows={3} reviews={reviews} />

        {/* Leave review CTA */}
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mt-12 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8 text-center">
            <p className="text-xl font-bold text-[var(--text)] mb-2">
              {locale === 'ru'
                ? 'Вы наш ученик? Поделитесь впечатлениями'
                : 'Сиз биздин окуучусузбу? Пикириңизди бөлүшүңүз'}
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md mx-auto">
              {locale === 'ru'
                ? 'Ваш честный отзыв поможет другим принять решение'
                : 'Сиздин чынчыл пикириңиз башкаларга чечим кабыл алууга жардам берет'}
            </p>
            <Link href={`/${locale}/contacts`}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/25">
              {t.leave_review}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
