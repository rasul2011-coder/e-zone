'use client';

import { useState, useEffect, FormEvent } from 'react';
import { usePhoneFormat } from '@/hooks/usePhoneFormat';
import CustomSelect from '@/components/CustomSelect';

interface PaymentFormProps {
  locale: string;
}

interface Course {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

export default function PaymentForm({ locale }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [phone, handlePhoneChange] = usePhoneFormat();
  const [courseId, setCourseId] = useState('');
  const [branchId, setBranchId] = useState('');

  // Default fallback data
  const defaultCourses: Course[] = [
    { id: 1, name: 'General English' },
    { id: 2, name: 'Kids Club' },
    { id: 3, name: 'IELTS Prep' },
    { id: 4, name: 'Business English' },
    { id: 5, name: 'Разговорный клуб' },
  ];

  const defaultBranches: Branch[] = [
    { id: 1, name: 'Филиал на Чуй' },
    { id: 2, name: 'Филиал на Манас' },
    { id: 3, name: 'Филиал на Ибраимова' },
    { id: 4, name: 'Филиал Асанбай' },
  ];

  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load courses and branches on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesRes, branchesRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/branches'),
        ]);

        const coursesData = await coursesRes.json();
        const branchesData = await branchesRes.json();

        // Use API data if available, otherwise use defaults
        const loadedCourses = coursesData.data && coursesData.data.length > 0 
          ? coursesData.data 
          : defaultCourses;
        
        const loadedBranches = branchesData.data && branchesData.data.length > 0 
          ? branchesData.data 
          : defaultBranches;

        setCourses(loadedCourses);
        setBranches(loadedBranches);
      } catch (err) {
        console.error('Error loading data:', err);
        // Use default data on error
        setCourses(defaultCourses);
        setBranches(defaultBranches);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [locale]);

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Валидация
    if (!name.trim()) {
      setError(locale === 'ru' ? 'Введите имя ученика' : 'Окуучунун атын киргизиңиз');
      setIsLoading(false);
      return;
    }

    if (!phone.trim()) {
      setError(locale === 'ru' ? 'Введите номер телефона' : 'Телефон номерин киргизиңиз');
      setIsLoading(false);
      return;
    }

    if (!courseId) {
      setError(locale === 'ru' ? 'Выберите курс' : 'Курсту тандаңыз');
      setIsLoading(false);
      return;
    }

    if (!branchId) {
      setError(locale === 'ru' ? 'Выберите филиал' : 'Филиалды тандаңыз');
      setIsLoading(false);
      return;
    }

    try {
      const selectedCourse = courses.find(c => c.id === Number(courseId));
      const selectedBranch = branches.find(b => b.id === Number(branchId));
      
      const workId = `payment-${Date.now()}`;
      const userId = `user-${Date.now()}`;

      const response = await fetch('/api/finik/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workId,
          userId,
          workTopic: `${selectedCourse?.name || 'Курс'} - ${selectedBranch?.name || 'Филиал'} - ${name}`,
          name:       name.trim(),
          phone:      phone.trim(),
          courseName: selectedCourse?.name || '',
          branchName: selectedBranch?.name || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details || data.error || (locale === 'ru' ? 'Не удалось создать платеж' : 'Төлөмдү түзүү мүмкүн болгон жок');
        console.error('API error response:', data);
        throw new Error(errorMsg);
      }

      if (data.paymentUrl) {
        // Редирект на страницу оплаты
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(locale === 'ru' ? 'URL платежа не получен' : 'Төлөм URL алынган жок');
      }

    } catch (err) {
      console.error('Ошибка платежа:', err);
      const errorMessage = err instanceof Error ? err.message : (locale === 'ru' ? 'Неизвестная ошибка' : 'Белгисиз ката');
      setError(errorMessage);
      setIsLoading(false);
      
      // Показать alert для отладки
      if (process.env.NODE_ENV === 'development') {
        console.error('Full error:', err);
      }
    }
  };

  const inputCls = 'w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20';
  const selectCls = inputCls + ' cursor-pointer appearance-none bg-no-repeat bg-right pr-10 bg-[length:20px] dark:bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSA3LjVMMTAgMTIuNUwxNSA3LjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+")] bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSA3LjVMMTAgMTIuNUwxNSA3LjUiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=")]';
  const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

  if (dataLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-500/10 dark:from-orange-500/10 dark:to-orange-500/20 p-6">
          <div className="text-center py-8">
            <svg className="animate-spin h-8 w-8 mx-auto text-orange-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {locale === 'ru' ? 'Загрузка...' : 'Жүктөлүүдө...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-500/10 dark:from-orange-500/10 dark:to-orange-500/20 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {locale === 'ru' ? 'Оплата курса' : 'Курска төлөм'}
          </h3>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {locale === 'ru' 
              ? 'Заполните данные для оплаты' 
              : 'Төлөм үчүн маалыматтарды толтуруңуз'}
          </p>

          <div className="mt-4 inline-flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-orange-500">5</span>
            <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              {locale === 'ru' ? 'сом' : 'сом'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handlePayment} className="space-y-4">
          {/* Имя ученика */}
          <div>
            <label className={labelCls}>
              {locale === 'ru' ? 'Имя ученика' : 'Окуучунун аты'}
              <span className="text-orange-500 ml-1">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={locale === 'ru' ? 'Например: Азамат' : 'Мисалы: Азамат'}
              className={inputCls}
            />
          </div>

          {/* Номер телефона */}
          <div>
            <label className={labelCls}>
              {locale === 'ru' ? 'Номер телефона' : 'Телефон номери'}
              <span className="text-orange-500 ml-1">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+996 XXX XXX XXX"
              className={inputCls}
            />
          </div>

          {/* Курс */}
          <div>
            <label className={labelCls}>
              {locale === 'ru' ? 'Курс' : 'Курс'}
              <span className="text-orange-500 ml-1">*</span>
            </label>
            <CustomSelect
              required
              value={courseId}
              onChange={(v) => setCourseId(v)}
              placeholder={locale === 'ru' ? 'Выберите курс' : 'Курсту тандаңыз'}
              options={courses.map(c => ({ value: String(c.id), label: c.name }))}
            />
          </div>

          {/* Филиал */}
          <div>
            <label className={labelCls}>
              {locale === 'ru' ? 'Филиал' : 'Филиал'}
              <span className="text-orange-500 ml-1">*</span>
            </label>
            <CustomSelect
              required
              value={branchId}
              onChange={(v) => setBranchId(v)}
              placeholder={locale === 'ru' ? 'Выберите филиал' : 'Филиалды тандаңыз'}
              options={branches.map(b => ({ value: String(b.id), label: b.name }))}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              ❌ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-white hover:bg-orange-600 transition disabled:opacity-60 shadow-lg shadow-orange-500/30 disabled:cursor-not-allowed"
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
                {locale === 'ru' ? 'Оплатить 5 сом' : '5 сом төлөө'}
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {locale === 'ru' 
              ? '🔒 Безопасная оплата через FINIK Pay' 
              : '🔒 FINIK Pay аркылуу коопсуз төлөм'}
          </p>
        </form>
      </div>
    </div>
  );
}
