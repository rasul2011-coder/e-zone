'use client';

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[var(--text)]">
            English<span className="text-orange-500">Zone</span>
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-[var(--text)] mb-4">
          Нет подключения к интернету
        </h2>
        <p className="text-[var(--text-muted)] mb-8">
          Проверьте подключение к интернету и попробуйте снова. Некоторые страницы доступны в оффлайн режиме.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-lg"
          >
            Обновить страницу
          </button>
          <Link
            href="/"
            className="block w-full rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-6 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg-alt)] transition"
          >
            На главную
          </Link>
        </div>

        {/* Offline tips */}
        <div className="mt-12 p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-left">
          <h3 className="font-bold text-[var(--text)] mb-3 flex items-center gap-2">
            <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Доступно оффлайн:
          </h3>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Главная страница</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Информация о курсах</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Контакты</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
