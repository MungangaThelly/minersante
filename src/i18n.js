import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector'; // 👈 FIXED: Import added

i18next
  .use(HttpBackend)
  .use(LanguageDetector) // 👈 Now properly used
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    lng: localStorage.getItem('language') || 'fr',
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (value instanceof Date) {
          return new Intl.DateTimeFormat(lng, {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(value);
        }
        return value;
      },
    },
  });

export default i18next;
