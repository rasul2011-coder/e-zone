import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'
import { count } from 'drizzle-orm'

/**
 * POST /api/admin/seed
 * Seeds placeholder teachers and gallery items if the tables are empty.
 * Only callable by authenticated admins.
 */
export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results: string[] = []

  // ── Seed teachers ────────────────────────────────────────────────────────
  const [{ count: teacherCount }] = await db.select({ count: count() }).from(schema.teachers)

  if (Number(teacherCount) === 0) {
    const placeholderTeachers = [
      {
        name:            'Айнур Бекова',
        slug:            'ainur-bekova',
        photo:           '/teachers/teacher-1.jpg',
        position:        'IELTS Teacher',
        specialization:  'IELTS Preparation',
        experienceYears: 5,
        bio:             'Преподаватель IELTS с опытом работы 5 лет. Помогла сотням студентов достичь целевого балла.',
        languages:       'English, Russian, Kyrgyz',
        isActive:        true,
        sortOrder:       1,
      },
      {
        name:            'Тимур Осмонов',
        slug:            'timur-osmonov',
        photo:           '/teachers/teacher-2.jpg',
        position:        'IELTS Teacher',
        specialization:  'IELTS Preparation',
        experienceYears: 4,
        bio:             'Специалист по подготовке к IELTS. Системный подход к каждому из 4 навыков.',
        languages:       'English, Russian, Kyrgyz',
        isActive:        true,
        sortOrder:       2,
      },
      {
        name:            'Гульнара Сейткали',
        slug:            'gulnara-seitkali',
        photo:           '/teachers/teacher-3.jpg',
        position:        'Kids Club Teacher',
        specialization:  'English for Children (5–15 лет)',
        experienceYears: 4,
        bio:             'Специалист по обучению детей. Создаёт увлекательную и безопасную атмосферу на каждом уроке.',
        languages:       'English, Russian, Kyrgyz',
        isActive:        true,
        sortOrder:       3,
      },
      {
        name:            'Данияр Жумабеков',
        slug:            'daniyar-zhumabekov',
        photo:           '/teachers/teacher-4.jpg',
        position:        'Teacher',
        specialization:  'General English, Business English',
        experienceYears: 3,
        bio:             'Преподаватель общего и делового английского. Практический подход с акцентом на коммуникацию.',
        languages:       'English, Russian',
        isActive:        true,
        sortOrder:       4,
      },
    ]

    for (const t of placeholderTeachers) {
      await db.insert(schema.teachers).values(t)
    }
    results.push(`✓ Добавлено ${placeholderTeachers.length} преподавателей`)
  } else {
    results.push(`— Преподаватели уже есть (${teacherCount})`)
  }

  // ── Seed gallery ─────────────────────────────────────────────────────────
  const [{ count: galleryCount }] = await db.select({ count: count() }).from(schema.gallery)

  if (Number(galleryCount) === 0) {
    const placeholderGallery = [
      { title: 'Урок General English',     category: 'classes',  sortOrder: 1,  image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80&fit=crop', isPublished: true },
      { title: 'Групповое занятие',         category: 'classes',  sortOrder: 2,  image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&fit=crop', isPublished: true },
      { title: 'Kids Club',                 category: 'classes',  sortOrder: 3,  image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&fit=crop', isPublished: true },
      { title: 'IELTS подготовка',          category: 'classes',  sortOrder: 4,  image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&fit=crop', isPublished: true },
      { title: 'Разговорный клуб',          category: 'classes',  sortOrder: 5,  image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80&fit=crop', isPublished: true },
      { title: 'Занятие с детьми',          category: 'classes',  sortOrder: 6,  image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80&fit=crop', isPublished: true },
      { title: 'Учебный класс',             category: 'branches', sortOrder: 7,  image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80&fit=crop', isPublished: true },
      { title: 'Зона отдыха',              category: 'branches', sortOrder: 8,  image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&fit=crop', isPublished: true },
      { title: 'Библиотека центра',         category: 'branches', sortOrder: 9,  image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&fit=crop', isPublished: true },
      { title: 'Торжественное мероприятие', category: 'events',   sortOrder: 10, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&fit=crop', isPublished: true },
      { title: 'Выпускной вечер',           category: 'events',   sortOrder: 11, image: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=800&q=80&fit=crop', isPublished: true },
      { title: 'Студенческое мероприятие',  category: 'events',   sortOrder: 12, image: 'https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=800&q=80&fit=crop', isPublished: true },
    ]

    for (const g of placeholderGallery) {
      await db.insert(schema.gallery).values(g)
    }
    results.push(`✓ Добавлено ${placeholderGallery.length} фотографий в галерею`)
  } else {
    results.push(`— Галерея уже заполнена (${galleryCount})`)
  }

  return NextResponse.json({ ok: true, results })
}
