import { useCallback, useRef, useState, useEffect } from 'react';

interface TranslationCache {
  [lang: string]: { [key: string]: string };
}

export function usePageTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const cacheRef = useRef<TranslationCache>({});
  const pendingKeysRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  // Load cache from localStorage on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('dr-ia-translations-')) {
          const lang = key.replace('dr-ia-translations-', '');
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              cacheRef.current[lang] = JSON.parse(stored);
            } catch {}
          }
        }
      });
    } catch {}
  }, []);

  // Load specific language cache
  const loadCache = useCallback((lang: string) => {
    try {
      const stored = localStorage.getItem(`dr-ia-translations-${lang}`);
      if (stored) {
        cacheRef.current[lang] = JSON.parse(stored);
      }
    } catch {}
  }, []);

  // Save cache to localStorage
  const saveCache = useCallback((lang: string) => {
    try {
      localStorage.setItem(`dr-ia-translations-${lang}`, JSON.stringify(cacheRef.current[lang] || {}));
    } catch {}
  }, []);

  // Collect all translatable strings from current page
  const collectTranslatableStrings = useCallback((): Array<{ key: string; original: string }> => {
    const results: Array<{ key: string; original: string }> = [];
    const seenKeys = new Set<string>();
    
    // Collect from data-i18n-key attributes
    const elements = document.querySelectorAll('[data-i18n-key]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        // Use the element's text content or placeholder as original
        const original = el.textContent?.trim() || 
                        (el as HTMLInputElement).placeholder || 
                        (el as HTMLTextAreaElement).placeholder ||
                        el.getAttribute('title') ||
                        key;
        results.push({ key, original });
      }
    });

    // Also collect from TranslatableText components (they'll have data-i18n-key set)
    return results;
  }, []);

  // Translate strings via API
  const translateStrings = useCallback(async (lang: string, strings: Array<{ key: string; original: string }>) => {
    if (!strings.length) return {};
    
    setIsTranslating(true);
    try {
      const texts = strings.map(s => s.original);
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, targetLanguage: lang })
      });
      
      if (!res.ok) throw new Error('Translation failed');
      
      const { translations } = await res.json();
      const map: Record<string, string> = {};
      strings.forEach((s, i) => {
        map[s.key] = translations[i] || s.original;
      });
      return map;
    } catch (error) {
      console.error('Translation error:', error);
      // Return original texts on failure
      const map: Record<string, string> = {};
      strings.forEach(s => { map[s.key] = s.original; });
      return map;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Main function: translate page for a language
  const translatePage = useCallback(async (lang: string) => {
    if (lang === 'pt') return {}; // Portuguese is the source language
    
    loadCache(lang);
    const cached = cacheRef.current[lang] || {};
    const strings = collectTranslatableStrings().filter(s => !cached[s.key]);
    
    if (!strings.length) return cached;
    
    const newTranslations = await translateStrings(lang, strings);
    const merged = { ...cached, ...newTranslations };
    cacheRef.current[lang] = merged;
    saveCache(lang);
    return merged;
  }, [loadCache, collectTranslatableStrings, translateStrings]);

  // Get translation for a specific key
  const getTranslation = useCallback((lang: string, key: string, fallback: string) => {
    if (lang === 'pt') return fallback;
    return cacheRef.current[lang]?.[key] || fallback;
  }, []);

  return { 
    translatePage, 
    getTranslation,
    isTranslating 
  };
}