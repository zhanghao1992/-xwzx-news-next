'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Trash2, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { newsApi } from '@/lib/api';
import { useUserStore } from '@/store/userStore';
import type { FavoriteItem } from '@/types';

export default function FavoritePage() {
  const t = useTranslations();
  const router = useRouter();
  const { token, isLoggedIn } = useUserStore();
  const [favoriteList, setFavoriteList] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setLoading(false);
      return;
    }

    loadFavorites(1);
  }, [isLoggedIn, token]);

  const loadFavorites = async (pageNum: number) => {
    try {
      setError(null);

      const response = await newsApi.getFavorites({
        page: pageNum,
        page_size: 20,
      });

      if (response.code === 200) {
        // 后端返回的数据结构可能是：
        // 1. { data: { list: [...], total: number } } - 嵌套结构
        // 2. { data: [...] } - 直接是数组
        // 3. { data: { list: [...] } } - 没有total字段

        let newData = [];
        let total = 0;

        if (Array.isArray(response.data)) {
          // 情况2: 直接是数组
          newData = response.data;
          total = response.data.length;
        } else if (response.data?.list) {
          // 情况1/3: 嵌套在list字段中
          newData = response.data.list;
          total = response.data.total || response.data.list.length;
        } else if (response.data?.data) {
          // 可能有额外的data嵌套
          if (Array.isArray(response.data.data)) {
            newData = response.data.data;
            total = response.data.data.length;
          } else if (response.data.data.list) {
            newData = response.data.data.list;
            total = response.data.data.total || response.data.data.list.length;
          }
        }

        if (pageNum === 1) {
          setFavoriteList(newData);
        } else {
          setFavoriteList((prev) => [...prev, ...newData]);
        }

        const pageSize = 20;
        setHasMore(pageNum * pageSize < total);
        setPage(pageNum);
      } else {
        const errorMsg = response.message || '获取收藏列表失败';
        setError(errorMsg);
      }
    } catch (error: any) {
      console.error('Failed to load favorites:', error);
      setError(error?.message || '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFavorites(page + 1);
    }
  };

  // 删除单个收藏
  const handleRemoveFavorite = async (item: FavoriteItem) => {
    const newsId = item.news_id || (item.news?.id) || item.id;

    if (!confirm('确定要取消收藏这条新闻吗？')) {
      return;
    }

    try {
      const response = await newsApi.removeFavorite(newsId);
      if (response.code === 200) {
        // 从列表中移除
        setFavoriteList((prev) => prev.filter((i) => i.id !== item.id));
      } else {
        alert(response.message || '取消收藏失败');
      }
    } catch (error: any) {
      console.error('删除收藏失败:', error);
      alert(error?.message || '删除收藏失败');
    }
  };

  // 清空所有收藏
  const handleClearAll = async () => {
    if (!confirm('确定要清空所有收藏吗？此操作不可恢复！')) {
      return;
    }

    try {
      const response = await newsApi.clearFavorites();
      if (response.code === 200) {
        setFavoriteList([]);
        setPage(1);
        setHasMore(false);
      } else {
        alert(response.message || '清空收藏失败');
      }
    } catch (error: any) {
      console.error('清空收藏失败:', error);
      alert(error?.message || '清空收藏失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold ml-2">{t('user.favorite')}</h1>
          </div>
          {favoriteList.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-danger hover:text-red-700 transition-colors"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* Favorites List */}
      <div className="px-4 py-4">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-gray-500 mb-4">请先登录查看收藏</div>
            <Link
              href="/login"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              去登录
            </Link>
          </div>
        ) : loading && favoriteList.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">{t('common.loading')}</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-red-500 mb-2">{error}</div>
            <button
              onClick={() => loadFavorites(1)}
              className="text-primary text-sm"
            >
              点击重试
            </button>
          </div>
        ) : favoriteList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-gray-400 mb-2">暂无收藏</div>
            <Link
              href="/home"
              className="text-primary text-sm"
            >
              去首页浏览新闻
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteList.map((item, index) => {
              // 兼容两种数据结构：
              // 1. 嵌套结构：{ id, news_id, news: { title, content, ... } }
              // 2. 扁平结构：{ id, title, content, image, ... } (原Vue项目结构)
              const newsItem = item.news || item;
              const newsId = item.news_id || item.id;
              const imageUrl = newsItem?.image;

              // 使用组合键确保唯一性：索引_新闻ID_收藏时间
              const uniqueKey = `fav_${index}_${newsId}_${item.created_at || item.favoriteTime || ''}`;

              return (
                <div key={uniqueKey} className="relative bg-white rounded-lg overflow-hidden shadow-sm">
                  <Link
                    href={`/news/detail/${newsId}`}
                    className="block"
                  >
                    <div className="flex p-4 pr-12">
                      {imageUrl && (
                        <div className="w-28 h-20 flex-shrink-0 mr-3">
                          <img
                            src={imageUrl}
                            alt={newsItem?.title || '新闻图片'}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold mb-2 line-clamp-2">
                          {newsItem?.title || '暂无标题'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {newsItem?.content || newsItem?.description || '暂无内容'}
                        </p>
                        <div className="text-xs text-gray-400">
                          收藏于 {item.created_at || item.favoriteTime || '未知时间'}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFavorite(item);
                    }}
                    className="absolute top-1/2 right-3 -translate-y-1/2 w-8 h-8 bg-red-100 hover:bg-red-200 text-red-500 rounded-full flex items-center justify-center transition-colors"
                    title="取消收藏"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full py-3 text-center text-primary hover:bg-gray-100 transition-colors"
              >
                {loading ? t('common.loading') : t('common.loadMore')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
