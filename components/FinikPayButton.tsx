'use client';

import { useState } from 'react';

interface FinikPayButtonProps {
  workId: string;
  userId: string;
  workTopic?: string;
  buttonText?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Компонент кнопки оплаты через Finik Pay
 * Цена фиксированная: 5 сомов
 * 
 * @example
 * <FinikPayButton 
 *   workId="123" 
 *   userId="456" 
 *   workTopic="Оплата курса английского языка"
 * />
 */
export default function FinikPayButton({
  workId,
  userId,
  workTopic = 'Оплата курса English Zone',
  buttonText = 'Оплатить',
  className = '',
  onSuccess,
  onError,
}: FinikPayButtonProps) {
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
          workId,
          userId,
          workTopic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось создать платеж');
      }

      // Редирект на платежную страницу Finik
      if (data.paymentUrl) {
        console.log('Redirecting to payment URL:', data.paymentUrl);
        
        // Вызываем callback успеха перед редиректом
        if (onSuccess) {
          onSuccess();
        }
        
        // Редирект
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('URL платежа не получен');
      }

    } catch (err) {
      console.error('Ошибка платежа:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      
      // Вызываем callback ошибки
      if (onError) {
        onError(errorMessage);
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`
          w-full px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }
          text-white shadow-md hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Создание платежа...
          </span>
        ) : (
          buttonText
        )}
      </button>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">❌ Ошибка: {error}</p>
        </div>
      )}
      
      {isLoading && (
        <p className="text-sm text-gray-600 text-center">
          Перенаправление на страницу оплаты...
        </p>
      )}
    </div>
  );
}
