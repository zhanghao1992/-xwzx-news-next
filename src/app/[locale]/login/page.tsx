'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { userApi } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/routing';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { login } = useUserStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      alert('请输入用户名和密码');
      return;
    }

    setLoading(true);

    try {
      const response = await userApi.login({ username, password });

      if (response.code === 200) {
        // 后端返回的数据结构是 { data: { userInfo, token } }
        const userInfo = response.data.userInfo;
        const token = response.data.token;

        login(userInfo, token);
        router.replace(`/${routing.defaultLocale}/my`);
      } else {
        alert(response.message || '登录失败');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.response?.data?.message || '登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">新闻资讯</h1>
          <p className="text-gray-500">欢迎回来</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('user.username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('user.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('common.loading') : t('user.login')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-500">还没有账号？</span>
            <Link
              href="/register"
              className="ml-1 text-primary hover:underline"
            >
              {t('user.register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
