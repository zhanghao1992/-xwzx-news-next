'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Moon, Sun, Globe } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, toggleTheme } = useThemeStore();
  const { locale, setLocale } = useLanguageStore();

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLanguageChange = (newLocale: 'zh-CN' | 'en-US') => {
    setLocale(newLocale);
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = pathname.replace(/^\/[^\/]+/, '');
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold ml-2">{t('user.settings')}</h1>
        </div>
      </div>

      {/* Settings List */}
      <div className="mt-3 bg-white">
        {/* Theme */}
        <button
          onClick={handleThemeToggle}
          className="w-full flex items-center px-4 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center flex-1">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-gray-600" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600" />
            )}
            <span className="ml-3">{t('settings.theme')}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span className="text-sm">
              {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
            </span>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>

        <div className="border-t border-gray-100 mx-4"></div>

        {/* Language */}
        <button
          onClick={() => handleLanguageChange(locale === 'zh-CN' ? 'en-US' : 'zh-CN')}
          className="w-full flex items-center px-4 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center flex-1">
            <Globe className="w-5 h-5 text-gray-600" />
            <span className="ml-3">{t('settings.language')}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span className="text-sm">{locale === 'zh-CN' ? '简体中文' : 'English'}</span>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Version Info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">{t('settings.version')}: 1.0.0</p>
      </div>
    </div>
  );
}
