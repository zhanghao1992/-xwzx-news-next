'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Camera } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { userApi } from '@/lib/api';

export default function ProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userApi.updateUser({
        nickname,
        email,
        phone,
      });

      if (response.code === 200) {
        updateUser({ nickname, email, phone });
        alert('保存成功');
        router.back();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold ml-2">{t('user.profile')}</h1>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
                {user?.nickname?.charAt(0)?.toUpperCase() || user?.username.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Username (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('user.username')}
            </label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('user.nickname')}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="请输入昵称"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('user.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="请输入邮箱"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('user.phone')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="请输入手机号"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  );
}
