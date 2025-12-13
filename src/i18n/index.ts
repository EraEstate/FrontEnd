import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import vi from './locales/vi.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import th from './locales/th.json';
import ms from './locales/ms.json';
import id from './locales/id.json';
import tl from './locales/tl.json';
import km from './locales/km.json';
import my from './locales/my.json';

const resources = {
  en: { translation: en },
  vi: { translation: vi },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  ar: { translation: ar },
  hi: { translation: hi },
  th: { translation: th },
  ms: { translation: ms },
  id: { translation: id },
  tl: { translation: tl },
  km: { translation: km },
  my: { translation: my },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // Default language
    fallbackLng: 'vi',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;