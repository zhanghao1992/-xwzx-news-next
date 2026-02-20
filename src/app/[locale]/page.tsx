'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push(`/${routing.defaultLocale}/home`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">正在跳转...</div>
    </div>
  );
}
