'use client';

import { useState } from 'react';

interface PaymentSectionProps {
  locale: string;
  applicationId?: string; // ID заявки, если сохранена
}

export default function PaymentSection({ locale, applicationId }: PaymentSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Создаем временный ID если заявка не сохранена
      const workId = applicationId || `temp-${Date.now()}`;
      const userId = `user-${Date.now()}`; // В реальном проекте берите из сессии/auth

      const response = await fetch('/api/finik/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workId,
          userId,
          workTopic: locale === 'ru' ? 'Оплата курса English Zone' : 'English Zone курсу үчүн төлөм',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (locale === 'ru' ? 'Не удалось создать платеж' : 'Төлөмдү түзүү мүмкүн болгон жок'));
      }

      if (data.paymentUrl) {
        // Редирект на страницу оплаты
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(locale === 'ru' ? 'URL платежа не получен' : 'Төлөм URL алынган жок');
      }

    } catch (err) {
      console.error('Ошибка платежа:', err);
      setError(err instanceof Error ? err.message : (locale === 'ru' ? 'Неизвестная ошибка' : 'Белгисиз ката'));
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-500/10 p-6">
      <div className="text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        
        <h3 className="text-lg font-bold text-[var(--text)]">
          {locale === 'ru' ? 'Оплатите прямо сейчас' : 'Азыр эле төлөңүз'}
        </h3>
        
        <p className="mt-2 text-sm text-[var(--text-muted)] max-w-sm mx-auto">
          {locale === 'ru' 
            ? 'Оплатите 5 сомов через FINIK Pay и забронируйте свое место в группе' 
            : '5 сом FINIK Pay аркылуу төлөп, топто ордуңузду брондоштуруңуз'}
        </p>

        <div className="mt-4 inline-flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-orange-500">5</span>
          <span className="text-lg font-semibold text-[var(--text-muted)]">
            {locale === 'ru' ? 'сом' : 'сом'}
          </span>
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-white hover:bg-orange-600 transition disabled:opacity-60 shadow-lg shadow-orange-500/30 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {locale === 'ru' ? 'Создание платежа...' : 'Төлөм түзүлүүдө...'}
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              {locale === 'ru' ? 'Оплатить' : 'Төлөө'}
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            ❌ {error}
          </div>
        )}

        <p className="mt-4 text-xs text-[var(--text-muted)]">
          {locale === 'ru' 
            ? '🔒 Безопасная оплата через FINIK Pay' 
            : '🔒 FINIK Pay аркылуу коопсуз төлөм'}
        </p>
      </div>
    </div>
  );
}
