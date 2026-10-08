# 🔐 Руководство по интеграции платежной системы Finik

## 📋 Содержание

1. [Обзор системы](#обзор-системы)
2. [Установка зависимостей](#установка-зависимостей)
3. [Настройка переменных окружения](#настройка-переменных-окружения)
4. [Структура файлов](#структура-файлов)
5. [Основная библиотека Finik](#основная-библиотека-finik)
6. [API эндпоинт создания платежа](#api-эндпоинт-создания-платежа)
7. [API эндпоинт webhook](#api-эндпоинт-webhook)
8. [Интеграция в клиентский код](#интеграция-в-клиентский-код)
9. [Тестирование](#тестирование)
10. [Переход на продакшн](#переход-на-продакшн)

---

## 🎯 Обзор системы

Finik Acquiring API — это платежная система Кыргызстана, которая позволяет принимать платежи через QR-коды.

**Основные возможности:**
- ✅ Создание платежей через QR-коды (FINIK_QR)
- ✅ Webhook для автоматического подтверждения оплаты
- ✅ Поддержка тестового (beta) и продакшн окружения
- ✅ Криптографическая подпись запросов (для продакшн)
- ✅ Верификация webhook через публичный ключ

**Архитектура:**7

```
┌─────────────────────────────────────────┐
│  Клиент (React/Next.js)                 │
│  • Кнопка "Оплатить"                    │
│  • Редирект на платежную страницу       │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  API Routes                             │
│  • /api/finik/create-payment            │
│  • /api/finik/webhook                   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Finik Library (/src/lib/finik.ts)     │
│  • createFinikPayment()                 │
│  • verifyFinikWebhook()                 │
│  • isTimestampValid()                   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Finik Acquiring API                    │
│  • beta.api.acquiring.averspay.kg       │
│  • api.acquiring.averspay.kg (prod)     │
└─────────────────────────────────────────┘
```

---

## 📦 Установка зависимостей


Установите необходимую библиотеку для работы с криптографическими подписями:

```bash
npm install @mancho.devs/authorizer
```

**Зависимости:**
- `@mancho.devs/authorizer` — библиотека для создания и верификации подписей запросов

---

## ⚙️ Настройка переменных окружения

Создайте или обновите файл `.env` в корне проекта:

```env
# Finik Configuration
# Окружение: "beta" для тестирования, "prod" для продакшена
FINIK_ENV="beta"

# API ключ от Finik (получите в личном кабинете)
FINIK_API_KEY="your-api-key-here"

# ID вашего аккаунта в Finik
FINIK_ACCOUNT_ID="your-account-id-here"

# URL вашего приложения (для webhook и redirect)
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Приватный ключ (ТОЛЬКО для продакшена, для beta не требуется)
# FINIK_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
# YOUR_PRIVATE_KEY_HERE
# -----END PRIVATE KEY-----"
```

**Важные замечания:**
- Для **beta** окружения приватный ключ НЕ требуется
- Для **prod** окружения приватный ключ ОБЯЗАТЕЛЕН
- `NEXTAUTH_URL` или `NEXT_PUBLIC_APP_URL` используется для формирования webhook URL

---

## 📁 Структура файлов

Создайте следующую структуру файлов в вашем проекте:

```
your-project/
├── src/
│   ├── lib/
│   │   └── finik.ts                          # Основная библиотека
│   └── app/
│       └── api/
│           └── finik/
│               ├── create-payment/
│               │   └── route.ts              # Создание платежа
│               └── webhook/
│                   └── route.ts              # Обработка webhook
```

---

## 🔧 Основная библиотека Finik

Создайте файл `src/lib/finik.ts`:


```typescript
// src/lib/finik.ts
import { Signer } from '@mancho.devs/authorizer';

// Флаг для отключения логов при инициализации модуля
let isInitialized = false;

// Типизация для RequestData
type Body = Record<string, unknown> | string | undefined;

interface RequestData {
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  queryStringParameters?: Record<string, string> | null;
  body?: Body | null;
}

// Выбор окружения (beta или prod)
const FINIK_ENV = process.env.FINIK_ENV || 'beta';
const BASE_URL = FINIK_ENV === 'prod' 
  ? 'https://api.acquiring.averspay.kg' 
  : 'https://beta.api.acquiring.averspay.kg';
const HOST = FINIK_ENV === 'prod'
  ? 'api.acquiring.averspay.kg'
  : 'beta.api.acquiring.averspay.kg';

// Finik credentials
const FINIK_API_KEY = process.env.FINIK_API_KEY;
const FINIK_ACCOUNT_ID = process.env.FINIK_ACCOUNT_ID;

// Чтение приватного ключа
const FINIK_PRIVATE_KEY = (() => {
  if (process.env.FINIK_PRIVATE_KEY) {
    const key = process.env.FINIK_PRIVATE_KEY.trim();
    if (!isInitialized) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✓ Using FINIK_PRIVATE_KEY from environment');
      }
      isInitialized = true;
    }
    return key;
  }
  if (!isInitialized) {
    console.error('❌ FINIK_PRIVATE_KEY not configured');
    isInitialized = true;
  }
  return undefined;
})();

// Публичные ключи Finik для верификации webhook
const FINIK_PUBLIC_KEYS = {
  prod: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuF/PUmhMPPidcMxhZBPb
BSGJoSphmCI+h6ru8fG8guAlcPMVlhs+ThTjw2LHABvciwtpj51ebJ4EqhlySPyT
hqSfXI6Jp5dPGJNDguxfocohaz98wvT+WAF86DEglZ8dEsfoumojFUy5sTOBdHEu
g94B4BbrJvjmBa1YIx9Azse4HFlWhzZoYPgyQpArhokeHOHIN2QFzJqeriANO+wV
aUMta2AhRVZHbfyJ36XPhGO6A5FYQWgjzkI65cxZs5LaNFmRx6pjnhjIeVKKgF99
4OoYCzhuR9QmWkPl7tL4Kd68qa/xHLz0Psnuhm0CStWOYUu3J7ZpzRK8GoEXRcr8
tQIDAQAB
-----END PUBLIC KEY-----`,
  beta: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwlrlKz/8gLWd1ARWGA/8
o3a3Qy8G+hPifyqiPosiTY6nCHovANMIJXk6DH4qAqqZeLu8pLGxudkPbv8dSyG7
F9PZEAryMPzjoB/9P/F6g0W46K/FHDtwTM3YIVvstbEbL19m8yddv/xCT9JPPJTb
LsSTVZq5zCqvKzpupwlGS3Q3oPyLAYe+ZUn4Bx2J1WQrBu3b08fNaR3E8pAkCK27
JqFnP0eFfa817VCtyVKcFHb5ij/D0eUP519Qr/pgn+gsoG63W4pPHN/pKwQUUiAy
uLSHqL5S2yu1dffyMcMVi9E/Q2HCTcez5OvOllgOtkNYHSv9pnrMRuws3u87+hNT
ZwIDAQAB
-----END PUBLIC KEY-----`
};

// Интерфейс для данных платежа
export interface CreatePaymentData {
  amount: number;
  workId: string;
  workTopic: string;
  userId: string;
}

// Интерфейс для webhook данных
export interface FinikWebhookData {
  id: string;
  transactionId: string;
  status: 'succeeded' | 'failed' | 'SUCCEEDED' | 'FAILED';
  amount: number;
  transactionDate: number;
  clientId: string;
  fields: {
    transactionType?: string;
    amount?: number;
    webhook_url?: string;
    paymentId?: string;
    success_redirect_url?: string;
    qrComment?: string;
    name?: string;
    qrTransactionId?: string;
    url?: string;
    [key: string]: unknown;
  };
  data: {
    accountId?: string;
    description?: string;
    metadata?: string | Record<string, unknown>;
    webhookUrl?: string;
    merchantCategoryCode?: string;
    name_en?: string;
    [key: string]: unknown;
  };
}

/**
 * Создает платеж в Finik Acquiring API
 */
export async function createFinikPayment(data: CreatePaymentData): Promise<string> {
  // Проверка наличия credentials
  if (!FINIK_API_KEY || !FINIK_ACCOUNT_ID) {
    throw new Error('Finik credentials are not configured (FINIK_API_KEY and FINIK_ACCOUNT_ID required)');
  }
  
  // В продакшене требуется приватный ключ
  if (FINIK_ENV === 'prod' && !FINIK_PRIVATE_KEY) {
    throw new Error('FINIK_PRIVATE_KEY is required for production environment');
  }

  const timestamp = Date.now().toString();
  const paymentId = crypto.randomUUID();

  // Получаем APP_URL из переменных окружения
  const APP_URL = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  // Тело запроса согласно документации Finik
  const body = {
    Amount: data.amount,
    CardType: 'FINIK_QR',
    PaymentId: paymentId,
    RedirectUrl: `${APP_URL}/dashboard/work-plan?workId=${data.workId}&payment=success`,
    Data: {
      accountId: FINIK_ACCOUNT_ID,
      merchantCategoryCode: '0742',
      name_en: 'YourAppName',
      description: 'Payment description',
      webhookUrl: `${APP_URL}/api/finik/webhook`,
      metadata: JSON.stringify({
        userId: data.userId,
        workId: data.workId,
        paymentId: paymentId
      })
    }
  };

  // Создание подписи для запроса
  const requestData: RequestData = {
    httpMethod: 'POST',
    path: '/v1/payment',
    headers: {
      Host: HOST,
      'x-api-key': FINIK_API_KEY,
      'x-api-timestamp': timestamp,
    },
    queryStringParameters: undefined,
    body,
  };

  // Генерация подписи (только для продакшена)
  let signature = '';
  if (FINIK_ENV === 'prod' && FINIK_PRIVATE_KEY) {
    try {
      signature = await new Signer(requestData as any).sign(FINIK_PRIVATE_KEY);
    } catch (error) {
      console.error('❌ Signature error:', error);
      throw new Error('Failed to generate signature');
    }
  }

  // Отправка запроса
  const url = `${BASE_URL}${requestData.path}`;
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-api-key': FINIK_API_KEY,
    'x-api-timestamp': timestamp,
  };
  
  // Добавляем подпись только если она есть
  if (signature) {
    headers['signature'] = signature;
  }
  
  const response = await fetch(url, {
    method: requestData.httpMethod,
    headers,
    body: JSON.stringify(body),
    redirect: 'manual',
  });

  // Finik возвращает 302 с URL платежной страницы
  if (response.status === 302) {
    const paymentUrl = response.headers.get('location');
    if (!paymentUrl) {
      throw new Error('Payment URL not found in response');
    }
    
    // Проверяем статус в URL
    if (paymentUrl.includes('status=failed')) {
      console.error('Payment URL contains status=failed');
    }
    
    return paymentUrl;
  }

  // Обработка ошибок
  const errorText = await response.text();
  console.error('Finik payment creation failed:', response.status);
  
  throw new Error(`Payment creation failed: ${errorText}`);
}

/**
 * Верифицирует подпись webhook от Finik
 */
export async function verifyFinikWebhook(
  signature: string,
  timestamp: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  webhookPath: string = '/api/finik/webhook'
): Promise<boolean> {
  try {
    const env: 'prod' | 'beta' = FINIK_ENV === 'prod' ? 'prod' : 'beta';
    
    if (!FINIK_PUBLIC_KEYS[env]) {
      console.error('Finik public key is not configured for environment:', env);
      return false;
    }

    const publicKey = FINIK_PUBLIC_KEYS[env];

    // Формируем requestData для верификации
    const requestData = {
      httpMethod: 'POST',
      path: webhookPath,
      headers: {
        'Host': headers['host'] || headers['Host'] || '',
        'x-api-timestamp': timestamp,
      },
      queryStringParameters: undefined,
      body: body,
    };

    // Используем Verifier из библиотеки
    const isValid = await new Signer(requestData as any).verify(publicKey, signature);
    
    return isValid;
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return false;
  }
}

/**
 * Проверяет timestamp на актуальность (защита от replay атак)
 */
export function isTimestampValid(timestamp: string, maxAgeMinutes: number = 5): boolean {
  try {
    const requestTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    const diffMinutes = (currentTime - requestTime) / 1000 / 60;
    
    return Math.abs(diffMinutes) <= maxAgeMinutes;
  } catch {
    return false;
  }
}
```

**Ключевые функции:**

1. **`createFinikPayment()`** — создает платеж и возвращает URL платежной страницы
2. **`verifyFinikWebhook()`** — проверяет подпись webhook от Finik
3. **`isTimestampValid()`** — защита от replay-атак

---

## 🚀 API эндпоинт создания платежа

Создайте файл `src/app/api/finik/create-payment/route.ts`:

```typescript
// src/app/api/finik/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createFinikPayment, CreatePaymentData } from '@/lib/finik';

/**
 * POST /api/finik/create-payment
 * Создает платеж в Finik
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Получение данных из запроса
    const body = await request.json();
    const { amount, workId, workTopic, userId } = body;

    // 2. Валидация данных
    if (!amount || !workId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3. Создание данных для платежа
    const paymentData: CreatePaymentData = {
      amount,
      workId,
      workTopic: workTopic || 'Payment',
      userId,
    };

    // 4. Создание платежа в Finik
    const paymentUrl = await createFinikPayment(paymentData);

    // 5. Возврат URL платежной страницы
    return NextResponse.json({
      success: true,
      paymentUrl,
      amount: paymentData.amount,
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
```

**Что делает этот эндпоинт:**
1. Принимает данные платежа (сумма, ID заказа, ID пользователя)
2. Валидирует входные данные
3. Вызывает `createFinikPayment()` для создания платежа
4. Возвращает URL платежной страницы клиенту

---

## 🔔 API эндпоинт webhook

Создайте файл `src/app/api/finik/webhook/route.ts`:

```typescript
// src/app/api/finik/webhook/route.ts
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
      const { userId, workId } = metadata;

      if (!userId || !workId) {
        console.error('Missing userId or workId in metadata');
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        );
      }

      // 8. ЗДЕСЬ ВАША ЛОГИКА ОБРАБОТКИ УСПЕШНОГО ПЛАТЕЖА
      // Например:
      // - Обновление статуса заказа в БД
      // - Отправка email уведомления
      // - Активация подписки
      // - Начисление баланса и т.д.
      
      console.log(`[PAYMENT_SUCCESS] Work ID: ${workId} | Amount: ${body.amount} | Transaction: ${body.transactionId}`);
      
      // Пример обновления в БД (адаптируйте под вашу схему):
      // await db.order.update({
      //   where: { id: workId },
      //   data: {
      //     status: 'PAID',
      //     transactionId: body.transactionId,
      //     paidAt: new Date(body.transactionDate),
      //   },
      // });
    } 
    // 9. Обработка неудачного платежа
    else if (body.status === 'FAILED' || body.status === 'failed') {
      const { userId, workId } = metadata;
      console.error('Payment failed:', { userId, workId });
      
      // ЗДЕСЬ ВАША ЛОГИКА ОБРАБОТКИ НЕУДАЧНОГО ПЛАТЕЖА
    }

    // 10. Возврат успешного ответа
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Finik webhook:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

**Что делает этот эндпоинт:**
1. Получает webhook от Finik после завершения платежа
2. Проверяет подпись и timestamp для безопасности
3. Извлекает метаданные (userId, workId и т.д.)
4. Обрабатывает успешный/неудачный платеж
5. Обновляет статус заказа в вашей БД

---

## 💻 Интеграция в клиентский код

Пример использования в React компоненте:


```typescript
// Пример компонента с кнопкой оплаты
'use client';

import { useState } from 'react';

export default function PaymentButton({ 
  amount, 
  workId, 
  workTopic, 
  userId 
}: {
  amount: number;
  workId: string;
  workTopic: string;
  userId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Вызов API для создания платежа
      const response = await fetch('/api/finik/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          workId,
          workTopic,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // 2. Редирект на платежную страницу Finik
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL not received');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        {isLoading ? 'Создание платежа...' : `Оплатить ${amount} сом`}
      </button>
      
      {error && (
        <p className="text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
```

**Процесс оплаты:**
1. Пользователь нажимает кнопку "Оплатить"
2. Отправляется запрос на `/api/finik/create-payment`
3. Получаем URL платежной страницы
4. Редиректим пользователя на страницу Finik
5. Пользователь сканирует QR-код и оплачивает
6. Finik отправляет webhook на `/api/finik/webhook`
7. Обновляем статус заказа в БД
8. Пользователь редиректится обратно на ваш сайт

---

## 🧪 Тестирование

### Тестирование в beta окружении

1. **Настройте переменные окружения:**
```env
FINIK_ENV="beta"
FINIK_API_KEY="your-beta-api-key"
FINIK_ACCOUNT_ID="your-beta-account-id"
NEXTAUTH_URL="http://localhost:3000"
```

2. **Запустите приложение:**
```bash
npm run dev
```

3. **Создайте тестовый платеж:**
   - Нажмите кнопку оплаты
   - Вы будете перенаправлены на тестовую страницу Finik
   - Используйте тестовые данные для оплаты

4. **Проверьте webhook:**
   - Для локального тестирования используйте ngrok или localtunnel
   - Webhook должен прийти на `https://your-domain.com/api/finik/webhook`

### Использование ngrok для локального тестирования webhook

```bash
# Установите ngrok
brew install ngrok

# Запустите ngrok
ngrok http 3000

# Обновите NEXTAUTH_URL в .env на ngrok URL
NEXTAUTH_URL="https://your-ngrok-url.ngrok.io"
```

### Проверка логов

Проверьте консоль сервера на наличие логов:
- `✓ Using FINIK_PRIVATE_KEY from environment` (только для prod)
- `[PAYMENT_SUCCESS] Work ID: ... | Amount: ... | Transaction: ...`
- Ошибки верификации подписи
- Ошибки создания платежа

---

## 🚀 Переход на продакшн

### 1. Получите продакшн credentials

Свяжитесь с Finik для получения:
- Продакшн API ключа
- Продакшн Account ID
- Приватного ключа (PEM формат)

### 2. Обновите переменные окружения

```env
# Продакшн конфигурация
FINIK_ENV="prod"
FINIK_API_KEY="your-prod-api-key"
FINIK_ACCOUNT_ID="your-prod-account-id"
NEXTAUTH_URL="https://yourdomain.com"

# Приватный ключ (ОБЯЗАТЕЛЬНО для продакшн)
FINIK_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4X89SaEw8+J1w
zGFkE9sFIYmhKmGYIj6Hqu7x8byC4CVw8xWWGz5OFOPDYscAG9yLC2mPnV5sngSq
... (ваш полный приватный ключ)
-----END PRIVATE KEY-----"
```

### 3. Важные замечания для продакшн

⚠️ **Безопасность:**
- Никогда не коммитьте приватный ключ в Git
- Используйте переменные окружения или секреты
- Храните ключи в безопасном месте (AWS Secrets Manager, Vault и т.д.)

⚠️ **Webhook:**
- Убедитесь что ваш домен доступен из интернета
- Используйте HTTPS (обязательно!)
- Webhook URL: `https://yourdomain.com/api/finik/webhook`

⚠️ **Мониторинг:**
- Настройте логирование всех платежей
- Отслеживайте ошибки верификации подписи
- Мониторьте неудачные платежи


### 4. Тестирование в продакшн

1. Создайте тестовый платеж с минимальной суммой
2. Проверьте что webhook приходит корректно
3. Убедитесь что подпись верифицируется успешно
4. Проверьте обновление статуса заказа в БД

---

## 📊 Структура данных webhook

Пример данных, которые приходят в webhook:

```json
{
  "id": "payment-id",
  "transactionId": "finik-transaction-id",
  "status": "SUCCEEDED",
  "amount": 1000,
  "transactionDate": 1234567890000,
  "clientId": "client-id",
  "fields": {
    "transactionType": "FINIK_QR",
    "amount": 1000,
    "paymentId": "payment-uuid",
    "qrTransactionId": "qr-transaction-id"
  },
  "data": {
    "accountId": "your-account-id",
    "description": "Payment description",
    "metadata": "{\"userId\":\"user-123\",\"workId\":\"work-456\",\"paymentId\":\"payment-uuid\"}",
    "webhookUrl": "https://yourdomain.com/api/finik/webhook",
    "merchantCategoryCode": "0742",
    "name_en": "YourAppName"
  }
}
```

---

## 🔍 Отладка и решение проблем

### Проблема: "Payment URL not found in response"

**Причина:** Finik не вернул 302 редирект

**Решение:**
- Проверьте правильность API ключа и Account ID
- Убедитесь что сумма платежа корректна
- Проверьте логи на стороне Finik

### Проблема: "Invalid webhook signature"

**Причина:** Подпись webhook не прошла верификацию

**Решение:**
- Убедитесь что используете правильный публичный ключ для окружения (beta/prod)
- Проверьте что `Host` заголовок корректен
- Убедитесь что тело запроса не модифицировано

### Проблема: "FINIK_PRIVATE_KEY is required for production"

**Причина:** Не настроен приватный ключ для продакшн

**Решение:**
- Добавьте `FINIK_PRIVATE_KEY` в переменные окружения
- Убедитесь что ключ в правильном PEM формате
- Проверьте что нет лишних пробелов или переносов строк

### Проблема: Webhook не приходит

**Причина:** Finik не может достучаться до вашего сервера

**Решение:**
- Убедитесь что ваш сервер доступен из интернета
- Проверьте что используете HTTPS (для продакшн)
- Проверьте firewall и security groups
- Для локальной разработки используйте ngrok

---

## 📝 Чеклист интеграции

Используйте этот чеклист для проверки интеграции:

### Базовая настройка
- [ ] Установлена библиотека `@mancho.devs/authorizer`
- [ ] Созданы переменные окружения (FINIK_ENV, FINIK_API_KEY, FINIK_ACCOUNT_ID)
- [ ] Создан файл `src/lib/finik.ts` с основными функциями
- [ ] Создан эндпоинт `/api/finik/create-payment`
- [ ] Создан эндпоинт `/api/finik/webhook`

### Функциональность
- [ ] Кнопка оплаты создает платеж и редиректит на Finik
- [ ] Webhook принимает и обрабатывает уведомления от Finik
- [ ] Верификация подписи webhook работает корректно
- [ ] Проверка timestamp защищает от replay-атак
- [ ] Метаданные (userId, workId) корректно передаются и извлекаются

### Безопасность
- [ ] Приватный ключ не закоммичен в Git
- [ ] Используются переменные окружения для credentials
- [ ] Webhook верифицирует подпись в продакшн
- [ ] Timestamp проверяется на актуальность
- [ ] HTTPS используется в продакшн

### Тестирование
- [ ] Протестирован платеж в beta окружении
- [ ] Webhook получен и обработан корректно
- [ ] Статус заказа обновляется после оплаты
- [ ] Обработка ошибок работает корректно
- [ ] Логирование настроено и работает

### Продакшн
- [ ] Получены продакшн credentials от Finik
- [ ] Настроен приватный ключ для продакшн
- [ ] Домен доступен из интернета
- [ ] HTTPS настроен и работает
- [ ] Мониторинг и алерты настроены

---

## 🎯 Краткая справка по API

### Создание платежа

**Endpoint:** `POST /api/finik/create-payment`

**Request Body:**
```json
{
  "amount": 1000,
  "workId": "work-123",
  "workTopic": "Payment for service",
  "userId": "user-456"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://beta.api.acquiring.averspay.kg/payment/...",
  "amount": 1000
}
```

### Webhook

**Endpoint:** `POST /api/finik/webhook`

**Headers:**
- `signature` — подпись запроса
- `x-api-timestamp` — timestamp запроса
- `host` — хост вашего сервера

**Body:** См. раздел "Структура данных webhook"

---

## 📚 Дополнительные ресурсы

- **Документация Finik:** Свяжитесь с поддержкой Finik для получения официальной документации
- **Библиотека authorizer:** https://www.npmjs.com/package/@mancho.devs/authorizer
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## 💡 Советы и лучшие практики

1. **Идемпотентность:** Всегда проверяйте дубликаты платежей по `transactionId`
2. **Логирование:** Логируйте все важные события (создание платежа, webhook, ошибки)
3. **Мониторинг:** Настройте алерты на ошибки верификации подписи
4. **Тестирование:** Всегда тестируйте в beta перед деплоем в продакшн
5. **Безопасность:** Никогда не храните credentials в коде
6. **Обработка ошибок:** Всегда возвращайте понятные сообщения об ошибках
7. **Timeout:** Webhook должен отвечать быстро (< 5 секунд)
8. **Retry:** Finik может повторно отправить webhook, будьте готовы к дубликатам

---

## ✅ Заключение

Теперь у вас есть полная интеграция с платежной системой Finik! 

Основные шаги:
1. ✅ Установили зависимости
2. ✅ Настроили переменные окружения
3. ✅ Создали библиотеку для работы с Finik
4. ✅ Реализовали API эндпоинты
5. ✅ Интегрировали в клиентский код
6. ✅ Протестировали в beta
7. ✅ Готовы к продакшн

**Следующие шаги:**
- Протестируйте интеграцию в beta окружении
- Настройте мониторинг и логирование
- Получите продакшн credentials
- Задеплойте в продакшн

Удачи с интеграцией! 🚀
