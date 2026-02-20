'use client';

import { Link } from '@/i18n/routing';
import { Eye, Share2 } from 'lucide-react';
import type { NewsItem as NewsItemType } from '@/types';

interface NewsItemProps {
  news: NewsItemType;
}

export default function NewsItem({ news }: NewsItemProps) {
  return (
    <Link href={`/news/detail/${news.id}`}>
      <div className="bg-white rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          {/* Left: Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium mb-2 line-clamp-2">{news.title}</h3>

            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {news.description || news.content}
            </p>

            <div className="flex items-center text-xs text-gray-400">
              <div className="flex items-center space-x-3">
                {news.author && <span>{news.author}</span>}
                {(news.publish_time || news.publishTime) && (
                  <span>{new Date(news.publish_time || news.publishTime || '').toLocaleDateString()}</span>
                )}
              </div>

              <div className="flex items-center space-x-4 ml-auto">
                {news.views !== undefined && news.views > 0 && (
                  <div className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    <span>{news.views}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Image */}
          {news.image && (
            <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
