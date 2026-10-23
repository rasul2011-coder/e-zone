'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPWAButtonProps {
  locale: 'ru' | 'kg'
}

export default function InstallPWAButton({ locale }: InstallPWAButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState({ title: '', text: '' })

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed (more reliable check)
    const checkInstalled = () => {
      // Check if running as standalone app
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }
      // Check if running as PWA on iOS
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return
      }
    }

    checkInstalled()

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const showMessage = (title: string, text: string) => {
    setModalMessage({ title, text })
    setShowModal(true)
  }

  const handleInstallClick = async () => {
    // If already installed, show message
    if (isInstalled) {
      showMessage(
        locale === 'ru' ? '✅ Приложение установлено' : '✅ Тиркеме орнотулган',
        locale === 'ru'
          ? 'Вы можете найти его на главном экране или в списке приложений.'
          : 'Аны башкы экранда же тиркемелер тизмесинен таба аласыз.'
      )
      return
    }

    // If prompt is not available
    if (!deferredPrompt) {
      showMessage(
        locale === 'ru' ? 'ℹ️ Установка' : 'ℹ️ Орнотуу',
        locale === 'ru'
          ? 'Для установки используйте меню браузера или кнопку "Установить" в адресной строке.'
          : 'Орнотуу үчүн браузердин менюсун же даректик тилкедеги "Орнотуу" баскычын колдонуңуз.'
      )
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setIsInstalled(true)
      showMessage(
        locale === 'ru' ? '🎉 Успешно!' : '🎉 Ийгиликтүү!',
        locale === 'ru'
          ? 'Приложение установлено! Теперь вы можете запускать его с главного экрана.'
          : 'Тиркеме орнотулду! Азыр аны башкы экрандан иштете аласыз.'
      )
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/40"
        aria-label={locale === 'ru' ? 'Скачать приложение' : 'Тиркемени жүктөө'}
      >
        {/* Animated background */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        
        {/* Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10 transition-transform group-hover:scale-110"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        
        {/* Text */}
        <span className="relative z-10">
          {locale === 'ru' ? 'Скачать' : 'Жүктөө'}
        </span>

        {/* Badge */}
        <span className="relative z-10 hidden rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium xl:inline-block">
          PWA
        </span>
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative max-w-md w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-[var(--text)] mb-3">
              {modalMessage.title}
            </h3>
            <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
              {modalMessage.text}
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              {locale === 'ru' ? 'Понятно' : 'Түшүндүм'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
