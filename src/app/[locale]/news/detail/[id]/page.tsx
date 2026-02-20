'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Eye, Share2, Bookmark } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { newsApi } from '@/lib/api';
import type { NewsDetail as NewsDetailType, NewsItem as NewsItemType } from '@/types';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

function MarkdownContent({ content }: { content: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const renderContent = async () => {
      try {
        const rendered = await marked(content);
        setHtml(DOMPurify.sanitize(rendered));
      } catch (error) {
        console.error('Markdown render error:', error);
        setHtml(DOMPurify.sanitize(content));
      }
    };
    renderContent();
  }, [content]);

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function NewsDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const [news, setNews] = useState<NewsDetailType | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await newsApi.getNewsDetail(id);

        if (response.code === 200) {
          const newsData = response.data;
          setNews(newsData);

          // 处理相关新闻 - 支持驼峰和蛇形命名
          const related = (newsData as any).relatedNews || newsData.related_news || [];
          setRelatedNews(related);
        }
      } catch (error) {
        console.error('Failed to load news detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadNewsDetail();
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (navigator.share && news) {
      try {
        await navigator.share({
          title: news.title,
          text: news.content.substring(0, 100),
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        await newsApi.removeFavorite(id);
      } else {
        await newsApi.addFavorite(id);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">新闻不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 ${isFavorited ? 'text-primary' : 'text-gray-500'}`}
            >
              <Bookmark className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-2 text-gray-500">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="px-4 py-6 max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-4">{news.title}</h1>

        {/* Meta Info */}
        <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4 pb-4 border-b border-gray-200">
          {news.author && <span>{news.author}</span>}
          {(news.publishTime || news.publish_time) && (
            <span>{new Date((news.publishTime || news.publish_time)!).toLocaleString()}</span>
          )}
          {news.views !== undefined && news.views > 0 && (
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{news.views}</span>
            </div>
          )}
        </div>

        {/* News Image */}
        {news.image && (
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <MarkdownContent content={news.content || ''} />
      </article>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <div className="mt-8 border-t border-gray-200 px-4 py-6">
          <h2 className="text-lg font-semibold mb-4">{t('news.related')}</h2>
          <div className="space-y-4">
            {relatedNews.map((item) => (
              <Link
                key={item.id}
                href={`/news/detail/${item.id}`}
                className="block bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Left: Image */}
                  {item.image && (
                    <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Right: Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium mb-2 hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {item.content || item.description || ''}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 mt-2 space-x-3">
                      {item.views && (
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          <span>{item.views}</span>
                        </div>
                      )}
                      {item.publishTime && (
                        <span>{new Date(item.publishTime).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
