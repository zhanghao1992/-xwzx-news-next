import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'zh-CN' | 'en-US';

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: 'zh-CN',

      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'language-storage',
    }
  )
);
