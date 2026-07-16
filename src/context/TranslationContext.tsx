import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { usePageTranslation } from '../hooks/usePageTranslation';
import { useLanguage } from '../hooks/useLanguage';

export interface TranslationContextType {
  translations: Record<string, string>;
  currentLang: string;
  isTranslating: boolean;
  refresh: () => Promise<void>;
  getTranslation: (key: string, fallback: string) => string;
}

export const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { currentLanguage } = useLanguage();
  const { translatePage, getTranslation, isTranslating } = usePageTranslation();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    const result = await translatePage(currentLanguage);
    setTranslations(result || {});
  }, [currentLanguage, translatePage]);

  // Initial load and language change
  useEffect(() => {
    refresh();
  }, [currentLanguage]);

  return (
    <TranslationContext.Provider value={{ 
      translations, 
      currentLang: currentLanguage, 
      isTranslating, 
      refresh,
      getTranslation 
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslationContext must be used within TranslationProvider');
  return ctx;
}