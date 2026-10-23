// scripts/seed-data.ts
import 'dotenv/config'
import { db, schema } from '../lib/db'
import { count } from 'drizzle-orm'

async function seed() {
  console.log('🌱 Starting seed...\n')

  // ── Seed application statuses ────────────────────────────────────────────
  const [{ count: statusCount }] = await db.select({ count: count() }).from(schema.applicationStatuses)
  
  if (Number(statusCount) === 0) {
    const statuses = [
      { name: 'Новая', description: 'Новая заявка' },
      { name: 'Ожидает оплаты', description: 'Ожидает подтверждения оплаты' },
      { name: 'Оплачена', description: 'Оплата подтверждена' },
      { name: 'В обработке', description: 'Заявка в обработке' },
      { name: 'Завершена', description: 'Заявка обработана' },
      { name: 'Отменена', description: 'Заявка отменена' },
    ]
    for (const s of statuses) {
      await db.insert(schema.applicationStatuses).values(s)
    }
    console.log(`✅ Добавлено ${statuses.length} статусов заявок`)
  } else {
    console.log(`ℹ️  Статусы уже есть (${statusCount})`)
  }

  // ── Seed courses ─────────────────────────────────────────────────────────
  const [{ count: courseCount }] = await db.select({ count: count() }).from(schema.courses)
  
  if (Number(courseCount) === 0) {
    const courses = [
      {
        name: 'General English',
        slug: 'general-english',
        shortDescription: 'Разговорный и деловой английский для взрослых',
        description: 'Комплексный курс английского языка для взрослых. Развитие всех навыков: говорение, аудирование, чтение, письмо.',
        price: '3500',
        duration: '3 месяца',
        ageFrom: 16,
        ageTo: null,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Kids Club',
        slug: 'kids-club',
        shortDescription: 'Английский для детей 5-15 лет',
        description: 'Увлекательные занятия английским для детей. Игровой формат, песни, творчество.',
        price: '3000',
        duration: '3 месяца',
        ageFrom: 5,
        ageTo: 15,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'IELTS Prep',
        slug: 'ielts-prep',
        shortDescription: 'Подготовка к экзамену IELTS',
        description: 'Интенсивная подготовка к IELTS. Разбор всех секций, стратегии, mock-тесты.',
        price: '5500',
        duration: '3 месяца',
        ageFrom: 14,
        ageTo: null,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Business English',
        slug: 'business-english',
        shortDescription: 'Деловой английский для профессионалов',
        description: 'Курс делового английского: переговоры, презентации, деловая переписка.',
        price: '4000',
        duration: '3 месяца',
        ageFrom: 18,
        ageTo: null,
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Разговорный клуб',
        slug: 'speaking-club',
        shortDescription: 'Разговорная практика с носителями языка',
        description: 'Еженедельные встречи для практики разговорного английского в неформальной обстановке.',
        price: '1500',
        duration: '1 месяц',
        ageFrom: 14,
        ageTo: null,
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    for (const c of courses) {
      await db.insert(schema.courses).values(c)
    }
    console.log(`✅ Добавлено ${courses.length} курсов`)
  } else {
    console.log(`ℹ️  Курсы уже есть (${courseCount})`)
  }

  // ── Seed branches ────────────────────────────────────────────────────────
  const [{ count: branchCount }] = await db.select({ count: count() }).from(schema.branches)
  
  if (Number(branchCount) === 0) {
    const branches = [
      {
        name: 'Филиал на Чуй',
        slug: 'chui',
        description: 'Центральный филиал в самом сердце Бишкека',
        address: 'ул. Чуй 123, Бишкек',
        phone: '+996 700 000 001',
        email: 'chui@englishzone.kg',
        workingHours: 'Пн-Пт: 9:00-20:00, Сб: 10:00-18:00',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Филиал на Манас',
        slug: 'manas',
        description: 'Филиал на проспекте Манас',
        address: 'пр. Манас 45, Бишкек',
        phone: '+996 700 000 002',
        email: 'manas@englishzone.kg',
        workingHours: 'Пн-Пт: 9:00-20:00, Сб: 10:00-18:00',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Филиал на Ибраимова',
        slug: 'ibraimova',
        description: 'Уютный филиал на улице Ибраимова',
        address: 'ул. Ибраимова 78, Бишкек',
        phone: '+996 700 000 003',
        email: 'ibraimova@englishzone.kg',
        workingHours: 'Пн-Пт: 9:00-20:00, Сб: 10:00-18:00',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Филиал Асанбай',
        slug: 'asanbay',
        description: 'Филиал в микрорайоне Асанбай',
        address: 'мкр. Асанбай, ул. Ахунбаева 12, Бишкек',
        phone: '+996 700 000 004',
        email: 'asanbay@englishzone.kg',
        workingHours: 'Пн-Пт: 9:00-20:00, Сб: 10:00-18:00',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    for (const b of branches) {
      await db.insert(schema.branches).values(b)
    }
    console.log(`✅ Добавлено ${branches.length} филиалов`)
  } else {
    console.log(`ℹ️  Филиалы уже есть (${branchCount})`)
  }

  console.log('\n✅ Seed завершён успешно!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Ошибка seed:', error)
  process.exit(1)
})
