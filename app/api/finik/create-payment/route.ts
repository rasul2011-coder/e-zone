// app/api/finik/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createFinikPayment, CreatePaymentData } from '@/lib/finik';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * POST /api/finik/create-payment
 * Создает платеж в Finik и сохраняет заявку в БД
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workId, workTopic, userId, name, phone, email, courseName, branchName, age, role } = body;

    if (!workId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: workId and userId are required' },
        { status: 400 }
      );
    }

    console.log('📝 Creating payment for:', { name, phone, courseName, branchName });

    // 1. Получить или создать статус "Ожидает оплаты"
    const statuses = await db.select().from(schema.applicationStatuses).limit(10);
    let pendingStatus = statuses.find(s => s.name === 'Ожидает оплаты');
    if (!pendingStatus) {
      // fallback на "Новая"
      pendingStatus = statuses.find(s => s.name === 'Новая');
    }
    if (!pendingStatus) {
      const [ins] = await db.insert(schema.applicationStatuses)
        .values({ name: 'Новая', description: 'Новая заявка' })
        .returning();
      pendingStatus = ins;
    }

    // 2. Найти курс и филиал по имени
    let courseId: number | null = null;
    if (courseName) {
      const courses = await db.select().from(schema.courses)
        .where(eq(schema.courses.name, courseName)).limit(1);
      if (courses.length > 0) {
        courseId = courses[0].id;
        console.log('✓ Course found:', courseId);
      } else {
        console.log('⚠ Course not found in DB:', courseName);
      }
    }

    let branchId: number | null = null;
    if (branchName) {
      const branches = await db.select().from(schema.branches)
        .where(eq(schema.branches.name, branchName)).limit(1);
      if (branches.length > 0) {
        branchId = branches[0].id;
        console.log('✓ Branch found:', branchId);
      } else {
        console.log('⚠ Branch not found in DB:', branchName);
      }
    }

    console.log('📊 Inserting application:', { courseId, branchId, courseName, branchName });

    // 3. Сохранить заявку в БД
    const now = new Date();
    const [application] = await db.insert(schema.applications).values({
      name:            (name || userId).trim(),
      phone:           (phone || '—').trim(),
      email:           email || null,
      courseId:        courseId,  // Явно передаём null если не найдено
      branchId:        branchId,  // Явно передаём null если не найдено
      courseName:      courseName || null,
      comment:         `workId: ${workId}`,
      source:          'payment_page',
      statusId:        pendingStatus.id,
      privacyAccepted: true,
      paymentAmount:   5,
      isPaid:          false,
      age:             age ? parseInt(String(age)) : null,
      role:            role || null,
      createdAt:       now,
      updatedAt:       now,
    }).returning();

    console.log('✅ Application created:', application.id);

    // 4. Создать платёж в Finik с ID заявки в workId
    const paymentData: CreatePaymentData = {
      amount: 5,
      workId: String(application.id), // используем ID заявки как workId
      workTopic: workTopic || `${courseName || 'Курс'} — ${name || 'Ученик'}`,
      userId,
    };

    try {
      const paymentUrl = await createFinikPayment(paymentData);
      console.log('✅ Payment URL created');

      return NextResponse.json({
        success: true,
        paymentUrl,
        applicationId: application.id,
        amount: 5,
      });
    } catch (finikError) {
      console.error('❌ Finik payment error:', finikError);
      
      // Вернем ошибку с деталями
      return NextResponse.json({
        error: 'Failed to create payment',
        details: finikError instanceof Error ? finikError.message : 'Unknown Finik error',
        applicationId: application.id, // заявка уже создана
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating Finik payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Detailed error:', { error, stack: error instanceof Error ? error.stack : undefined });
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment', 
        details: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
