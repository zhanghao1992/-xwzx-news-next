'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { User, History, Bookmark, Settings, LogOut } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { routing } from '@/i18n/routing';
import TabBar from '@/components/TabBar';

export default function MyPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, isLoggedIn, logout } = useUserStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push(`/${routing.defaultLocale}/login`);
    }
  }, [isLoggedIn, router]);

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      router.push(`/${routing.defaultLocale}/login`);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(`/${routing.defaultLocale}${path}`);
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">请先登录</div>
      </div>
    );
  }

  const menuItems = [
    { icon: History, label: t('user.history'), path: '/history' },
    { icon: Bookmark, label: t('user.favorite'), path: '/favorite' },
    { icon: User, label: t('user.profile'), path: '/profile' },
    { icon: Settings, label: t('user.settings'), path: '/settings' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* User Info Header */}
      <div className="bg-white px-4 py-6 mb-3">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            {user?.nickname?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-xl font-semibold mb-1">
              {user?.nickname || user?.username || '用户'}
            </h2>
            {(user?.email || user?.phone) && (
              <p className="text-sm text-gray-500">
                {user?.email || user?.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className="w-full flex items-center px-4 py-4 hover:bg-gray-50 transition-colors"
            >
              <Icon className="w-5 h-5 text-gray-600" />
              <span className="ml-3 flex-1 text-left">{item.label}</span>
              <svg
                className="w-5 h-5 text-gray-400"
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
            </button>
          );
        })}

        <div className="border-t border-gray-100 mx-4"></div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-4 hover:bg-gray-50 transition-colors text-danger"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3 flex-1 text-left">{t('user.logout')}</span>
        </button>
      </div>

      <TabBar />
    </div>
  );
}
