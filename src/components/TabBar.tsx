'use client';

import { usePathname, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Home, MessageSquare, User } from 'lucide-react';

export default function TabBar() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const tabs = [
    { path: '/home', icon: Home, label: t('home') },
    { path: '/aichat', icon: MessageSquare, label: t('aichat') },
    { path: '/my', icon: User, label: t('my') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = pathname?.startsWith(tab.path);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
