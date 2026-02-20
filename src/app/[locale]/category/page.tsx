'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { newsApi } from '@/lib/api';
import { routing } from '@/i18n/routing';
import type { Category } from '@/types';

const allCategories = [
  { id: 1, code: 'headline', name: '头条', icon: '📰' },
  { id: 2, code: 'society', name: '社会', icon: '👥' },
  { id: 3, code: 'domestic', name: '国内', icon: '🇨🇳' },
  { id: 4, code: 'international', name: '国际', icon: '🌍' },
  { id: 5, code: 'entertainment', name: '娱乐', icon: '🎬' },
  { id: 6, code: 'sports', name: '体育', icon: '⚽' },
  { id: 7, code: 'military', name: '军事', icon: '🛡️' },
  { id: 8, code: 'technology', name: '科技', icon: '💻' },
  { id: 9, code: 'finance', name: '财经', icon: '💰' },
  { id: 10, code: 'health', name: '健康', icon: '🏥' },
  { id: 11, code: 'education', name: '教育', icon: '📚' },
  { id: 12, code: 'automotive', name: '汽车', icon: '🚗' },
];

export default function CategoryPage() {
  const t = useTranslations();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await newsApi.getCategories();
      if (response.code === 200) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    // 跳转到首页并设置分类
    router.push(`/${routing.defaultLocale}/home?categoryId=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold ml-2">分类</h1>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-3 gap-4">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow active:scale-95"
            >
              <span className="text-4xl mb-2">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
