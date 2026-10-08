# 💳 Интеграция Finik Pay - Руководство по использованию

## ✅ Статус интеграции

Интеграция Finik Pay **успешно завершена** и готова к использованию!

### Что реализовано:

- ✅ Установлена зависимость `@mancho.devs/authorizer`
- ✅ Создана библиотека `lib/finik.ts` с функциями работы с Finik API
- ✅ API эндпоинт `/api/finik/create-payment` для создания платежей
- ✅ API эндпоинт `/api/finik/webhook` для обработки уведомлений
- ✅ Поддержка production окружения с криптографическими подписями
- ✅ Верификация webhook подписей
- ✅ Защита от replay-атак через проверку timestamp
- ✅ Фиксированная цена: **5 сомов**

---

## 📋 Конфигурация

### Переменные окружения (уже настроены в `.env`):

```env
# Finik Configuration
FINIK_ENV="prod"
FINIK_API_KEY="WWeYjjsYE93LxEG5dI9Ce49zq5PD67yR7JfO51gC"
FINIK_ACCOUNT_ID="aadda212-e6ae-441f-8c9f-41e155849209"
FINIK_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
```

---

## 🚀 Как использовать

### 1. Создание платежа из клиентского кода

Пример использования в React компоненте:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PaymentButton({ 
  workId, 
  userId 
}: {
  workId: string;
  userId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Вызов API для создания платежа
      const response = await fetch('/api/finik/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workId: workId,        // ID заявки/работы
          userId: userId,        // ID пользователя
          workTopic: 'Оплата курса English Zone', // Опционально
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось создать платеж');
      }

      // Редирект на платежную страницу Finik
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('URL платежа не получен');
      }

    } catch (err) {
      console.error('Ошибка платежа:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Создание платежа...' : 'Оплатить 5 сом'}
      </Button>
      
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}
```

---

### 2. API Endpoints

#### POST `/api/finik/create-payment`

Создает платеж с фиксированной ценой 5 сомов.

**Request Body:**
```json
{
  "workId": "123",          // Обязательно: ID заявки/работы
  "userId": "456",          // Обязательно: ID пользователя
  "workTopic": "Название"   // Опционально: описание платежа
}
```

**Response (Success):**
```json
{
  "success": true,
  "paymentUrl": "https://api.acquiring.averspay.kg/payment/...",
  "amount": 5,
  "message": "Payment created successfully"
}
```

**Response (Error):**
```json
{
  "error": "Failed to create payment",
  "details": "Детали ошибки"
}
```

---

#### POST `/api/finik/webhook`

Обрабатывает webhook от Finik после завершения платежа.

**Автоматически вызывается Finik после оплаты.**

Что происходит:
1. ✅ Проверка подписи запроса
2. ✅ Проверка timestamp (защита от replay-атак)
3. ✅ Извлечение метаданных (userId, workId, paymentId)
4. ✅ Логирование успешных/неудачных платежей
5. ✅ Возврат ответа Finik

**Пример лога успешного платежа:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PAYMENT SUCCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Work ID:        123
User ID:        456
Payment ID:     uuid-here
Amount:         5 сом
Transaction ID: finik-transaction-id
Date:           08.10.2026, 18:00:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 Процесс оплаты

```
┌─────────────────────────────────────────────┐
│ 1. Пользователь нажимает "Оплатить"        │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 2. POST /api/finik/create-payment           │
│    { workId, userId, workTopic }            │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 3. Finik API создает платеж                 │
│    Возвращает URL платежной страницы        │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 4. Редирект на страницу Finik               │
│    Пользователь сканирует QR-код            │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 5. Пользователь оплачивает через FINIK      │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 6. Finik отправляет webhook                 │
│    POST /api/finik/webhook                  │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 7. Ваш сервер обрабатывает webhook          │
│    Логирует успешный платеж                 │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 8. Пользователь редиректится обратно        │
│    на ваш сайт (success redirect)           │
└─────────────────────────────────────────────┘
```

---

## 💾 Интеграция с базой данных

В webhook эндпоинте (`app/api/finik/webhook/route.ts`) есть закомментированный пример обновления БД.

### Вариант 1: Обновление заявки (Application)

Если `workId` - это ID заявки из таблицы `applications`:

```typescript
import { db } from '@/lib/db'; // ваш Prisma Client

// В webhook эндпоинте, после проверки успешного платежа:
if (body.status === 'SUCCEEDED' || body.status === 'succeeded') {
  const { userId, workId } = metadata;
  
  const applicationId = BigInt(workId);
  
  // Обновляем заявку
  await db.application.update({
    where: { id: applicationId },
    data: {
      comment: `Платеж успешно выполнен. Transaction ID: ${body.transactionId}. Сумма: ${body.amount} сом`,
      updatedAt: new Date(),
    },
  });
  
  console.log(`✓ Application ${workId} updated with payment info`);
}
```

### Вариант 2: Создание отдельной таблицы для платежей

Если хотите хранить историю платежей отдельно, создайте новую модель в `schema.prisma`:

```prisma
model Payment {
  id              BigInt    @id @default(autoincrement())
  applicationId   BigInt    @map("application_id")
  userId          String    @map("user_id")
  amount          Decimal   @db.Decimal(10, 2)
  currency        String    @default("KGS") @db.VarChar(10)
  status          String    @db.VarChar(50) // "succeeded" | "failed"
  transactionId   String    @map("transaction_id") @db.VarChar(255)
  paymentId       String    @map("payment_id") @db.VarChar(255)
  transactionDate DateTime  @map("transaction_date")
  createdAt       DateTime  @default(now()) @map("created_at")
  
  application Application @relation(fields: [applicationId], references: [id])
  
  @@map("payments")
}
```

Затем в webhook:

```typescript
await db.payment.create({
  data: {
    applicationId: BigInt(workId),
    userId: userId,
    amount: body.amount,
    currency: 'KGS',
    status: body.status.toLowerCase(),
    transactionId: body.transactionId,
    paymentId: paymentId,
    transactionDate: new Date(body.transactionDate),
  },
});
```

---

## 🔒 Безопасность

### Реализованные меры безопасности:

1. **Криптографическая подпись запросов** (production)
   - Все запросы к Finik API подписываются приватным ключом
   - Используется библиотека `@mancho.devs/authorizer`

2. **Верификация webhook подписей**
   - Проверка подписи каждого webhook от Finik
   - Использование публичного ключа Finik для верификации

3. **Защита от replay-атак**
   - Проверка timestamp (не старше 5 минут)
   - Функция `isTimestampValid()` в библиотеке

4. **Безопасное хранение credentials**
   - Все ключи в `.env` файле (не коммитятся в Git)
   - Приватный ключ используется только на сервере

---

## 🧪 Тестирование

### Локальное тестирование с ngrok

Для получения webhook на локальной машине:

1. Установите ngrok:
```bash
# Скачайте с https://ngrok.com/download
```

2. Запустите ngrok:
```bash
ngrok http 3000
```

3. Обновите `NEXTAUTH_URL` в `.env.local`:
```env
NEXTAUTH_URL="https://your-ngrok-url.ngrok.io"
```

4. Перезапустите сервер:
```bash
npm run dev
```

Теперь Finik сможет отправлять webhook на ваш локальный сервер!

---

## 📊 Мониторинг платежей

### Просмотр логов

Все платежи логируются в консоль сервера. Для просмотра:

```bash
# В development режиме
npm run dev

# В production
# Проверяйте логи вашего хостинга (Vercel, Railway и т.д.)
```

### Пример логов:

**Успешный платеж:**
```
✓ Using FINIK_PRIVATE_KEY from environment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PAYMENT SUCCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Work ID:        123
User ID:        456
Payment ID:     abc-123-xyz
Amount:         5 сом
Transaction ID: finik-trans-789
Date:           08.10.2026, 18:00:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Неудачный платеж:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ PAYMENT FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Work ID:        123
User ID:        456
Amount:         5 сом
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🛠️ Структура файлов

```
e-zone/
├── lib/
│   └── finik.ts                          # Основная библиотека Finik
├── app/
│   └── api/
│       └── finik/
│           ├── create-payment/
│           │   └── route.ts              # Создание платежа (5 сомов)
│           └── webhook/
│               └── route.ts              # Обработка webhook от Finik
├── .env                                  # Конфигурация (уже настроено)
└── FINIK_INTEGRATION_README.md           # Это руководство
```

---

## 📝 Чеклист интеграции

- [x] Установлена зависимость `@mancho.devs/authorizer`
- [x] Настроены переменные окружения в `.env`
- [x] Создана библиотека `lib/finik.ts`
- [x] Создан эндпоинт `/api/finik/create-payment`
- [x] Создан эндпоинт `/api/finik/webhook`
- [x] Проект успешно собирается (`npm run build`)
- [ ] Добавлена кнопка оплаты в UI (см. пример выше)
- [ ] Добавлена логика обработки платежа в БД (см. раздел "Интеграция с БД")
- [ ] Протестирован платеж в production окружении
- [ ] Настроен мониторинг логов

---

## 🚦 Следующие шаги

### 1. Добавьте кнопку оплаты в UI

Используйте пример компонента `PaymentButton` из раздела "Как использовать".

### 2. Интегрируйте с базой данных

Раскомментируйте и адаптируйте код в `app/api/finik/webhook/route.ts` для обновления БД после успешного платежа.

### 3. Протестируйте платеж

1. Запустите сервер: `npm run dev`
2. Откройте страницу с кнопкой оплаты
3. Нажмите "Оплатить 5 сом"
4. Отсканируйте QR-код в приложении FINIK
5. Проверьте логи в консоли после оплаты

### 4. Настройте уведомления (опционально)

Добавьте отправку email или Telegram уведомлений после успешного платежа в webhook эндпоинте.

---

## 🆘 Помощь и поддержка

### Частые проблемы:

**Проблема:** "Payment URL not found in response"
- **Решение:** Проверьте правильность `FINIK_API_KEY` и `FINIK_ACCOUNT_ID`

**Проблема:** "Invalid webhook signature"
- **Решение:** Убедитесь что используется правильный публичный ключ для окружения (prod)

**Проблема:** Webhook не приходит
- **Решение:** 
  - Проверьте что сервер доступен из интернета
  - Используйте ngrok для локального тестирования
  - Проверьте что в переменных окружения указан правильный URL

---

## ✅ Заключение

Интеграция Finik Pay **полностью готова** к использованию!

**Что реализовано:**
- ✅ Создание платежей с фиксированной ценой 5 сомов
- ✅ Обработка webhook уведомлений от Finik
- ✅ Верификация подписей для безопасности
- ✅ Детальное логирование всех платежей
- ✅ Поддержка production окружения

**Осталось сделать:**
- Добавить кнопку оплаты в UI
- Интегрировать обработку платежей с вашей БД
- Протестировать платеж

**Цена платежа:** 5 сомов (фиксированная, как требовалось)

Удачи с интеграцией! 🚀
