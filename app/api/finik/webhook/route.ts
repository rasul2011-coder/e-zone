// app/api/finik/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyFinikWebhook, 
  isTimestampValid, 
  FinikWebhookData 
} from '@/lib/finik';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { sendTelegramMessage } from '@/lib/telegram';

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
      
      // 9. Сохранить успешную оплату в БД и уведомить Telegram
      if (workId) {
        try {
          // Найти статус "Подтверждена" или "Оплачена"
          const statuses = await db.select().from(schema.applicationStatuses).limit(10);
          const paidStatus = statuses.find(s => s.name === 'Подтверждена') 
            || statuses.find(s => s.name === 'Новая');

          const appId = parseInt(workId);
          if (!isNaN(appId)) {
            // Обновить заявку — пометить как оплаченную
            await db.update(schema.applications)
              .set({
                isPaid:        true,
                paymentAmount: body.amount || 5,
                statusId:      paidStatus?.id ?? 1,
                updatedAt:     new Date(),
              })
              .where(eq(schema.applications.id, appId));

            // Получить данные заявки для Telegram
            const [app] = await db.select().from(schema.applications)
              .where(eq(schema.applications.id, appId)).limit(1);

            if (app) {
              const roleLabel = app.role === 'parent' ? '👨‍👧 Родитель'
                : app.role === 'student' ? '🎓 Ученик' : null;

              const msg =
                `💰 <b>Оплата получена!</b>\n\n` +
                `👤 Имя:      <b>${app.name}</b>\n` +
                `📞 Телефон:  ${app.phone}\n` +
                (app.email       ? `📧 Email:    ${app.email}\n`       : '') +
                (roleLabel       ? `🙋 Роль:     ${roleLabel}\n`       : '') +
                (app.age         ? `🎂 Возраст:  ${app.age} лет\n`    : '') +
                (app.courseName  ? `📚 Курс:     ${app.courseName}\n`  : '') +
                `💵 Сумма:    ${body.amount || 5} сом\n` +
                `🔑 Transaction: ${body.transactionId}\n` +
                `\n🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })}`;

              sendTelegramMessage(msg).catch(e => console.error('Telegram error:', e));
            }
          }
        } catch (dbErr) {
          console.error('DB update error on webhook:', dbErr);
        }
      }
      
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
