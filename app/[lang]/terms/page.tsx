import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  return {
    title: `${lang === 'ru' ? 'Условия использования' : 'Колдонуу шарттары'} · English Zone`,
  }
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale

  const isRu = locale === 'ru'

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href={`/${locale}`} className="hover:text-orange-500 transition">
              {isRu ? 'Главная' : 'Башкы'}
            </Link>
            <span>/</span>
            <span className="text-[var(--text)]">{isRu ? 'Условия использования' : 'Колдонуу шарттары'}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <h1 className="text-3xl font-extrabold text-[var(--text)] mb-8 sm:text-4xl">
          {isRu ? 'Условия использования' : 'Колдонуу шарттары'}
        </h1>

        <div className="prose prose-sm sm:prose max-w-none">
          <div className="space-y-6 text-[var(--text-muted)] leading-relaxed">
            
            <div>
              <p className="text-xs text-[var(--text-subtle)] mb-6">
                {isRu ? 'Последнее обновление: 13 октября 2026 г.' : 'Акыркы жаңыртуу: 13-октябрь 2026-ж.'}
              </p>
            </div>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                {isRu ? '1. Общие положения' : '1. Жалпы жоболор'}
              </h2>
              <p>
                {isRu 
                  ? 'Настоящие Условия использования регулируют использование веб-сайта и услуг языкового центра English Zone (далее - "Центр"). Используя наш сайт и услуги, вы соглашаетесь с данными условиями.'
                  : 'Бул Колдонуу шарттары English Zone тил борборунун (мындан ары - "Борбор") веб-сайтын жана кызматтарын колдонууну жөнгө салат. Биздин сайтты жана кызматтарды колдонуу менен сиз бул шарттарга макул болосуз.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                {isRu ? '2. Услуги центра' : '2. Борбордун кызматтары'}
              </h2>
              <p className="mb-3">
                {isRu 
                  ? 'English Zone предоставляет следующие услуги:'
                  : 'English Zone төмөнкү кызматтарды көрсөтөт:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{isRu ? 'Курсы английского языка для детей и взрослых' : 'Балдар жана чоңдор үчүн англис тили курстары'}</li>
                <li>{isRu ? 'Групповые и индивидуальные занятия' : 'Топтук жана жеке сабактар'}</li>
                <li>{isRu ? 'Подготовка к международным экзаменам (IELTS)' : 'Эл аралык экзамендерге (IELTS) даярдоо'}</li>
                <li>{isRu ? 'Онлайн и оффлайн форматы обучения' : 'Онлайн жана оффлайн окуу форматтары'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                {isRu ? '3. Регистрация и оплата' : '3. Катталуу жана төлөм'}
              </h2>
              <p className="mb-3">
                {isRu 
                  ? 'Для записи на курсы необходимо:'
                  : 'Курстарга жазылуу үчүн керек:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{isRu ? 'Предоставить достоверную контактную информацию' : 'Так байланыш маалыматын берүү'}</li>
                <li>{isRu ? 'Выбрать курс и филиал' : 'Курсту жана филиалды тандоо'}</li>
                <li>{isRu ? 'Оплатить регистрационный взнос' : 'Катталуу акысын төлөө'}</li>
                <li>{isRu ? 'Подтвердить согласие с расписанием занятий' : 'Сабактардын графигине макулдугуңузду ырастоо'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                {isRu ? '4. Правила посещения' : '4. Катышуу эрежелери'}
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{isRu ? 'Пунктуальность: приходите за 5-10 минут до начала занятия' : 'Так убакытта келүү: сабак башталышынан 5-10 мүнөт мурун келиңиз'}</li>
                <li>{isRu ? 'Пропущенные занятия не компенсируются и не переносятся' : 'Өткөрүлгөн сабактар компенсацияланбайт жана которулбайт'}</li>
                <li>{isRu ? 'Уважительное отношение к преподавателям и другим студентам' : 'Мугалимдерге жана башка студенттерге урматтуу мамиле'}</li>
                <li>{isRu ? 'Соблюдение правил внутреннего распорядка центра' : 'Борбордун ички тартип эрежелерин сактоо'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                {isRu ? '5. Возврат средств' : '5. Акчаны кайтаруу'}
              </h2>
              <p>
                {isRu 
                  ? 'Регистрационный взнос не подлежит возврату. В случае отказа от курса после начала занятий, возврат производится за вычетом пройденных уроков и регистрационного взноса.'
                  : 'Катталуу акысы кайтарылбайт. Сабактар башталгандан кийин курстан баш тартуу учурунда, акча өткөн сабактар жана катталуу акысын алып салуу менен кайтарылат.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                {isRu ? '6. Интеллектуальная собственность' : '6. Интеллектуалдык менчик'}
              </h2>
              <p>
                {isRu 
                  ? 'Все учебные материалы, предоставляемые English Zone, являются собственностью центра и защищены авторским правом. Запрещается копирование, распространение или коммерческое использование материалов без письменного разрешения.'
                  : 'English Zone тарабынан берилген бардык окуу материалдары борбордун менчиги болуп саналат жана автордук укук менен корголгон. Жазуу уруксатысыз материалдарды көчүрүү, жайылтуу же коммерциялык колдонуу тыюу салынат.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                {isRu ? '7. Ответственность' : '7. Жоопкерчилик'}
              </h2>
              <p className="mb-3">
                {isRu 
                  ? 'Центр не несёт ответственности за:'
                  : 'Борбор жоопкерчилик тартпайт:'}
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{isRu ? 'Личные вещи студентов, оставленные в помещениях центра' : 'Борбордун бөлмөлөрүндө калтырылган студенттердин жеке буюмдары үчүн'}</li>
                <li>{isRu ? 'Результаты обучения, зависящие от личных усилий студента' : 'Студенттин жеке аракеттерине көз каранды окуу натыйжалары үчүн'}</li>
                <li>{isRu ? 'Технические сбои при онлайн-обучении' : 'Онлайн окуу учурундагы техникалык бузулуулар үчүн'}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                {isRu ? '8. Изменение условий' : '8. Шарттарды өзгөртүү'}
              </h2>
              <p>
                {isRu 
                  ? 'English Zone оставляет за собой право изменять данные условия. Актуальная версия всегда доступна на нашем сайте. Продолжение использования услуг после внесения изменений означает ваше согласие с обновлёнными условиями.'
                  : 'English Zone бул шарттарды өзгөртүү укугун өзүндө калтырат. Актуалдуу версия биздин сайтта ар дайым жеткиликтүү. Өзгөртүүлөр киргизилгенден кийин кызматтарды колдонууну улантуу сиздин жаңыртылган шарттарга макулдугуңузду билдирет.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">
                {isRu ? '9. Контакты' : '9. Байланыштар'}
              </h2>
              <p className="mb-3">
                {isRu 
                  ? 'По всем вопросам, связанным с условиями использования, обращайтесь:'
                  : 'Колдонуу шарттары боюнча бардык суроолор үчүн кайрылыңыз:'}
              </p>
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 space-y-2">
                <p><strong>{isRu ? 'Email:' : 'Email:'}</strong> info@englishzone.kg</p>
                <p><strong>{isRu ? 'Телефон:' : 'Телефон:'}</strong> +996 (555) 123-456</p>
                <p><strong>{isRu ? 'Адрес:' : 'Дарек:'}</strong> {isRu ? 'г. Бишкек, ул. Чуй 123' : 'Бишкек ш., Чүй көч. 123'}</p>
              </div>
            </section>

          </div>
        </div>

        {/* Back button */}
        <div className="mt-12">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 transition font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {isRu ? 'Вернуться на главную' : 'Башкы бетке кайтуу'}
          </Link>
        </div>
      </div>
    </div>
  )
}
