// app/api/finik/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyFinikWebhook, 
  isTimestampValid, 
  FinikWebhookData 
} from '@/lib/finik';

/**
 * POST /api/finik/webhook
 * Обрабатывает webhook от Finik после завершения платежа
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Получение заголовков
    const signature = request.headers.get('signature');
    const timestamp = request.headers.get('x-api-timestamp');
    const host = request.headers.get('host');

    if (!signature || !timestamp) {
      console.error('Missing signature or timestamp in webhook');
      return NextResponse.json(
        { error: 'Missing signature or timestamp' },
        { status: 400 }
      );
    }

    // 2. Проверка актуальности timestamp (защита от replay-атак)
    if (!isTimestampValid(timestamp)) {
      console.error('Webhook timestamp is too old or invalid');
      return NextResponse.json(
        { error: 'Invalid timestamp' },
        { status: 400 }
      );
    }

    // 3. Получение тела запроса
    const body: FinikWebhookData = await request.json();

    // 4. Подготовка заголовков для верификации
    const headers: Record<string, string> = {
      'host': host || '',
    };

    // 5. Верификация подписи
    const webhookPath = '/api/finik/webhook';
    const isValid = await verifyFinikWebhook(
      signature, 
      timestamp, 
      body as any, 
      headers, 
      webhookPath
    );
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      
      // В продакшене всегда отклоняем невалидные подписи
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // 6. Извлечение метаданных
    let metadata: { 
      userId?: string; 
      workId?: string; 
      paymentId?: string 
    } = {};
    
    try {
      if (body.data && body.data.metadata) {
        if (typeof body.data.metadata === 'string') {
          metadata = JSON.parse(body.data.metadata);
        } else {
          metadata = body.data.metadata as typeof metadata;
        }
      }
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }

    // 7. Обработка успешного платежа
    if (body.status === 'SUCCEEDED' || body.status === 'succeeded') {
      const { userId, workId, paymentId } = metadata;

      if (!userId || !workId) {
        console.error('Missing userId or workId in metadata');
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        );
      }

      // 8. ЛОГИРОВАНИЕ УСПЕШНОГО ПЛАТЕЖА
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ PAYMENT SUCCESS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Work ID:        ${workId}`);
      console.log(`User ID:        ${userId}`);
      console.log(`Payment ID:     ${paymentId}`);
      console.log(`Amount:         ${body.amount} сом`);
      console.log(`Transaction ID: ${body.transactionId}`);
      console.log(`Date:           ${new Date(body.transactionDate).toLocaleString('ru-RU')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // 9. ЗДЕСЬ ДОБАВЬТЕ ЛОГИКУ ОБРАБОТКИ УСПЕШНОГО ПЛАТЕЖА
      // Например:
      // - Обновление статуса заявки в БД (Application)
      // - Создание записи о платеже
      // - Отправка email уведомления пользователю
      // - Отправка уведомления в Telegram админу
      // - Начисление баланса и т.д.
      
      // Пример обновления статуса заявки (раскомментируйте и адаптируйте):
      /*
      import { db } from '@/lib/db'; // импортируйте ваш Prisma Client
      
      // Обновляем статус заявки на "Оплачено"
      if (workId) {
        const applicationId = BigInt(workId);
        
        await db.application.update({
          where: { id: applicationId },
          data: {
            // Добавьте поля для хранения информации о платеже
            // или обновите статус
            comment: `Платеж успешно выполнен. Transaction ID: ${body.transactionId}`,
            updatedAt: new Date(),
          },
        });
        
        console.log(`✓ Application ${workId} updated with payment info`);
      }
      */
      
    } 
    // 10. Обработка неудачного платежа
    else if (body.status === 'FAILED' || body.status === 'failed') {
      const { userId, workId, paymentId } = metadata;
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ PAYMENT FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Work ID:        ${workId}`);
      console.log(`User ID:        ${userId}`);
      console.log(`Payment ID:     ${paymentId}`);
      console.log(`Amount:         ${body.amount} сом`);
      console.log(`Transaction ID: ${body.transactionId}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // ЗДЕСЬ ВАША ЛОГИКА ОБРАБОТКИ НЕУДАЧНОГО ПЛАТЕЖА
      // Например: отправка уведомления пользователю о неудачной оплате
    }

    // 11. Возврат успешного ответа (важно для Finik!)
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR processing Finik webhook');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
