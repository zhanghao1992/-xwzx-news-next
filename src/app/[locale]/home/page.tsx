'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import NewsItem from '@/components/NewsItem';
import TabBar from '@/components/TabBar';
import { newsApi } from '@/lib/api';
import type { NewsItem as NewsItemType } from '@/types';

const categories = [
  { id: 1, code: 'headline', name: '头条' },
  { id: 2, code: 'society', name: '社会' },
  { id: 3, code: 'domestic', name: '国内' },
  { id: 4, code: 'international', name: '国际' },
  { id: 5, code: 'entertainment', name: '娱乐' },
  { id: 6, code: 'sports', name: '体育' },
  { id: 7, code: 'military', name: '军事' },
  { id: 8, code: 'technology', name: '科技' },
  { id: 9, code: 'finance', name: '财经' },
];

export default function HomePage() {
  const t = useTranslations();
  const [activeCategory, setActiveCategory] = useState(1); // Use ID instead of code
  const [newsList, setNewsList] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    if (loading) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await newsApi.getNewsList({
        page: pageNum,
        pageSize: 10,
        categoryId: activeCategory,
      });

      if (response.code === 200) {
        const newData = response.data.list || [];
        if (isRefresh || pageNum === 1) {
          setNewsList(newData);
        } else {
          setNewsList((prev) => [...prev, ...newData]);
        }

        const total = response.data.total || 0;
        const pageSize = 10;
        setHasMore(pageNum * pageSize < total);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, loading]);

  useEffect(() => {
    setNewsList([]);
    setPage(1);
    setHasMore(true);
    loadNews(1, true);
  }, [activeCategory]);

  const handleRefresh = async () => {
    await loadNews(1, true);
  };

  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      await loadNews(page + 1, false);
    }
  };

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (scrollBottom < 100 && hasMore && !loading) {
      handleLoadMore();
    }
  }, [hasMore, loading, handleLoadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Category Tabs */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex px-4 py-3 space-x-6 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="px-4 py-4">
        {refreshing ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">{t('common.loading')}</div>
          </div>
        ) : newsList.length === 0 && !loading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-400">暂无数据</div>
          </div>
        ) : (
          <>
            {newsList.map((news) => (
              <NewsItem key={news.id} news={news} />
            ))}

            {loading && (
              <div className="flex justify-center py-4">
                <div className="text-gray-500">{t('common.loading')}</div>
              </div>
            )}

            {!hasMore && newsList.length > 0 && (
              <div className="flex justify-center py-4">
                <div className="text-gray-400 text-sm">{t('common.noMore')}</div>
              </div>
            )}
          </>
        )}
      </div>

      <TabBar />
    </div>
  );
}
