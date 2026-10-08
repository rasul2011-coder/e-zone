// app/api/finik/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createFinikPayment, CreatePaymentData } from '@/lib/finik';

/**
 * POST /api/finik/create-payment
 * Создает платеж в Finik с фиксированной ценой 5 сомов
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Получение данных из запроса
    const body = await request.json();
    const { workId, workTopic, userId } = body;

    // 2. Валидация данных
    if (!workId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: workId and userId are required' },
        { status: 400 }
      );
    }

    // 3. Создание данных для платежа с фиксированной ценой 5 сомов
    const paymentData: CreatePaymentData = {
      amount: 5, // Фиксированная цена 5 сомов
      workId,
      workTopic: workTopic || 'Payment for English Zone',
      userId,
    };

    // 4. Создание платежа в Finik
    const paymentUrl = await createFinikPayment(paymentData);

    // 5. Возврат URL платежной страницы
    return NextResponse.json({
      success: true,
      paymentUrl,
      amount: paymentData.amount,
      message: 'Payment created successfully',
    });

  } catch (error) {
    console.error('Error creating Finik payment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
