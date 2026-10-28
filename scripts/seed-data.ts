// scripts/seed-data.ts
import 'dotenv/config'
import { db, schema } from '../lib/db'
import { count } from 'drizzle-orm'

async function seed() {
  console.log('🌱 Starting seed...\n')

  // ── application statuses ─────────────────────────────────────────────────
  const [{ count: statusCount }] = await db.select({ count: count() }).from(schema.applicationStatuses)
  if (Number(statusCount) === 0) {
    const statuses = [
      { name: 'Новая',            description: 'Новая заявка' },
      { name: 'Ожидает оплаты',   description: 'Ожидает подтверждения оплаты' },
      { name: 'Оплачена',         description: 'Оплата подтверждена' },
      { name: 'В обработке',      description: 'Заявка в обработке' },
      { name: 'Завершена',        description: 'Заявка обработана' },
      { name: 'Отменена',         description: 'Заявка отменена' },
    ]
    for (const s of statuses) await db.insert(schema.applicationStatuses).values(s)
    console.log(`✅ Добавлено ${statuses.length} статусов`)
  } else {
    console.log(`ℹ️  Статусы уже есть (${statusCount})`)
  }

  // ── courses ──────────────────────────────────────────────────────────────
  const [{ count: courseCount }] = await db.select({ count: count() }).from(schema.courses)
  if (Number(courseCount) === 0) {
    const now = new Date()
    const courses = [
      { name: 'General English',  slug: 'general-english',  shortDescription: 'Разговорный и деловой английский для взрослых', description: 'Комплексный курс английского языка для взрослых.', price: '3500', duration: '3 месяца', ageFrom: 16, ageTo: null, isActive: true, sortOrder: 1, createdAt: now, updatedAt: now },
      { name: 'Kids Club',        slug: 'kids-club',        shortDescription: 'Английский для детей 5-15 лет',                 description: 'Увлекательные занятия английским для детей.',      price: '3000', duration: '3 месяца', ageFrom: 5,  ageTo: 15,   isActive: true, sortOrder: 2, createdAt: now, updatedAt: now },
      { name: 'IELTS Prep',       slug: 'ielts-prep',       shortDescription: 'Подготовка к экзамену IELTS',                   description: 'Интенсивная подготовка к IELTS.',                  price: '5500', duration: '3 месяца', ageFrom: 14, ageTo: null, isActive: true, sortOrder: 3, createdAt: now, updatedAt: now },
      { name: 'Business English', slug: 'business-english', shortDescription: 'Деловой английский для профессионалов',         description: 'Курс делового английского.',                       price: '4000', duration: '3 месяца', ageFrom: 18, ageTo: null, isActive: true, sortOrder: 4, createdAt: now, updatedAt: now },
      { name: 'Разговорный клуб', slug: 'speaking-club',    shortDescription: 'Разговорная практика',                          description: 'Еженедельные встречи для практики.',               price: '1500', duration: '1 месяц',  ageFrom: 14, ageTo: null, isActive: true, sortOrder: 5, createdAt: now, updatedAt: now },
    ]
    for (const c of courses) await db.insert(schema.courses).values(c)
    console.log(`✅ Добавлено ${courses.length} курсов`)
  } else {
    console.log(`ℹ️  Курсы уже есть (${courseCount})`)
  }

  // ── branches ─────────────────────────────────────────────────────────────
  const [{ count: branchCount }] = await db.select({ count: count() }).from(schema.branches)
  if (Number(branchCount) === 0) {
    const now = new Date()
    const branches = [
      { name: 'Филиал на Чуй',        slug: 'chui',       description: 'Центральный филиал',      address: 'ул. Чуй 123, Бишкек',              phone: '+996 700 000 001', email: 'chui@englishzone.kg',       workingHours: 'Пн-Пт: 9:00-20:00', isActive: true, sortOrder: 1, createdAt: now, updatedAt: now },
      { name: 'Филиал на Манас',       slug: 'manas',      description: 'Филиал на пр. Манас',     address: 'пр. Манас 45, Бишкек',             phone: '+996 700 000 002', email: 'manas@englishzone.kg',      workingHours: 'Пн-Пт: 9:00-20:00', isActive: true, sortOrder: 2, createdAt: now, updatedAt: now },
      { name: 'Филиал на Ибраимова',   slug: 'ibraimova',  description: 'Филиал на ул. Ибраимова', address: 'ул. Ибраимова 78, Бишкек',         phone: '+996 700 000 003', email: 'ibraimova@englishzone.kg',  workingHours: 'Пн-Пт: 9:00-20:00', isActive: true, sortOrder: 3, createdAt: now, updatedAt: now },
      { name: 'Филиал Асанбай',        slug: 'asanbay',    description: 'Филиал в мкр. Асанбай',   address: 'мкр. Асанбай, ул. Ахунбаева 12',   phone: '+996 700 000 004', email: 'asanbay@englishzone.kg',    workingHours: 'Пн-Пт: 9:00-20:00', isActive: true, sortOrder: 4, createdAt: now, updatedAt: now },
    ]
    for (const b of branches) await db.insert(schema.branches).values(b)
    console.log(`✅ Добавлено ${branches.length} филиалов`)
  } else {
    console.log(`ℹ️  Филиалы уже есть (${branchCount})`)
  }

  // ── teachers ─────────────────────────────────────────────────────────────
  const [{ count: teacherCount }] = await db.select({ count: count() }).from(schema.teachers)
  if (Number(teacherCount) === 0) {
    const teachers = [
      { name: 'Айнур Бекова',      slug: 'ainur-bekova',      photo: '/teachers/teacher-1.jpg', position: 'IELTS Teacher',           specialization: 'IELTS Preparation',           experienceYears: 5, bio: 'Преподаватель IELTS с опытом 5 лет. Помогла сотням студентов достичь целевого балла.',              languages: 'English, Russian, Kyrgyz', isActive: true, sortOrder: 1 },
      { name: 'Тимур Осмонов',     slug: 'timur-osmonov',     photo: '/teachers/teacher-2.jpg', position: 'IELTS Teacher',           specialization: 'IELTS Preparation',           experienceYears: 4, bio: 'Специалист по подготовке к IELTS. Системный подход к каждому из 4 навыков.',                      languages: 'English, Russian, Kyrgyz', isActive: true, sortOrder: 2 },
      { name: 'Гульнара Сейткали', slug: 'gulnara-seitkali',  photo: '/teachers/teacher-3.jpg', position: 'Kids Club Teacher',       specialization: 'English for Children 5–15',  experienceYears: 4, bio: 'Специалист по обучению детей. Создаёт увлекательную атмосферу на каждом уроке.',                  languages: 'English, Russian, Kyrgyz', isActive: true, sortOrder: 3 },
      { name: 'Данияр Жумабеков',  slug: 'daniyar-zhumabekov',photo: '/teachers/teacher-4.jpg', position: 'General English Teacher', specialization: 'General & Business English',  experienceYears: 3, bio: 'Преподаватель общего и делового английского. Практический подход с акцентом на коммуникацию.',    languages: 'English, Russian',         isActive: true, sortOrder: 4 },
      { name: 'Аида Токтосунова',  slug: 'aida-toktosunova',  photo: '/teachers/teacher-5.jpg', position: 'General English Teacher', specialization: 'General English, Speaking',   experienceYears: 6, bio: 'Опытный преподаватель с международным сертификатом CELTA. Специализируется на разговорной практике.', languages: 'English, Russian, Kyrgyz', isActive: true, sortOrder: 5 },
      { name: 'Бекзод Рахимов',    slug: 'bekzod-rahimov',    photo: '/teachers/teacher-6.jpg', position: 'Business English Teacher',specialization: 'Business English, IELTS',     experienceYears: 7, bio: 'Преподаватель делового английского с опытом работы в международных компаниях.',                   languages: 'English, Russian',         isActive: true, sortOrder: 6 },
      { name: 'Нурия Касымова',    slug: 'nuria-kasymova',    photo: '/teachers/teacher-7.jpg', position: 'Kids Club Teacher',       specialization: 'English for Children',        experienceYears: 3, bio: 'Молодой энергичный педагог, обожает работать с детьми. Уроки проходят в игровой форме.',          languages: 'English, Russian, Kyrgyz', isActive: true, sortOrder: 7 },
      { name: 'Жаныбек Алиев',     slug: 'zhanybek-aliev',    photo: '/teachers/teacher-8.jpg', position: 'IELTS Teacher',           specialization: 'IELTS, Academic Writing',     experienceYears: 5, bio: 'Эксперт по академическому письму и подготовке к IELTS Writing. Результат — от 6.5 до 8.0.',       languages: 'English, Russian, Kyrgyz', isActive: true, sortOrder: 8 },
    ]
    for (const t of teachers) await db.insert(schema.teachers).values(t)
    console.log(`✅ Добавлено ${teachers.length} преподавателей`)
  } else {
    console.log(`ℹ️  Преподаватели уже есть (${teacherCount})`)
  }

  // ── course schedule (groups) ─────────────────────────────────────────────
  const [{ count: scheduleCount }] = await db.select({ count: count() }).from(schema.courseSchedule)
  if (Number(scheduleCount) === 0) {
    const courses  = await db.select().from(schema.courses)
    const branches = await db.select().from(schema.branches)
    const teachers = await db.select().from(schema.teachers)

    const getCourse  = (name: string) => courses.find(c => c.name === name)?.id
    const getBranch  = (name: string) => branches.find(b => b.name === name)?.id
    const getTeacher = (name: string) => teachers.find(t => t.name === name)?.id

    const groups = [
      { courseId: getCourse('General English')!,  branchId: getBranch('Филиал на Чуй')!,      teacherId: getTeacher('Аида Токтосунова'),  dayOfWeek: 1, startTime: '09:00', endTime: '11:00', format: 'offline', isActive: true },
      { courseId: getCourse('General English')!,  branchId: getBranch('Филиал на Манас')!,     teacherId: getTeacher('Данияр Жумабеков'), dayOfWeek: 2, startTime: '11:00', endTime: '13:00', format: 'offline', isActive: true },
      { courseId: getCourse('General English')!,  branchId: getBranch('Филиал на Ибраимова')!, teacherId: getTeacher('Аида Токтосунова'),  dayOfWeek: 4, startTime: '17:00', endTime: '19:00', format: 'offline', isActive: true },
      { courseId: getCourse('Kids Club')!,         branchId: getBranch('Филиал на Чуй')!,      teacherId: getTeacher('Гульнара Сейткали'), dayOfWeek: 1, startTime: '15:00', endTime: '16:00', format: 'offline', isActive: true },
      { courseId: getCourse('Kids Club')!,         branchId: getBranch('Филиал Асанбай')!,     teacherId: getTeacher('Нурия Касымова'),    dayOfWeek: 3, startTime: '15:00', endTime: '16:00', format: 'offline', isActive: true },
      { courseId: getCourse('Kids Club')!,         branchId: getBranch('Филиал на Манас')!,    teacherId: getTeacher('Нурия Касымова'),    dayOfWeek: 5, startTime: '14:00', endTime: '15:00', format: 'offline', isActive: true },
      { courseId: getCourse('IELTS Prep')!,        branchId: getBranch('Филиал на Чуй')!,      teacherId: getTeacher('Айнур Бекова'),      dayOfWeek: 2, startTime: '09:00', endTime: '12:00', format: 'offline', isActive: true },
      { courseId: getCourse('IELTS Prep')!,        branchId: getBranch('Филиал на Манас')!,    teacherId: getTeacher('Тимур Осмонов'),     dayOfWeek: 6, startTime: '10:00', endTime: '12:00', format: 'offline', isActive: true },
      { courseId: getCourse('IELTS Prep')!,        branchId: getBranch('Филиал на Ибраимова')!,teacherId: getTeacher('Жаныбек Алиев'),     dayOfWeek: 3, startTime: '19:00', endTime: '21:00', format: 'offline', isActive: true },
      { courseId: getCourse('Business English')!,  branchId: getBranch('Филиал на Чуй')!,      teacherId: getTeacher('Бекзод Рахимов'),    dayOfWeek: 5, startTime: '18:00', endTime: '20:00', format: 'offline', isActive: true },
    ]

    let added = 0
    for (const g of groups) {
      if (g.courseId && g.branchId) {
        await db.insert(schema.courseSchedule).values(g)
        added++
      }
    }
    console.log(`✅ Добавлено ${added} групп`)
  } else {
    console.log(`ℹ️  Группы уже есть (${scheduleCount})`)
  }

  console.log('\n✅ Seed завершён успешно!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Ошибка seed:', error)
  process.exit(1)
})
