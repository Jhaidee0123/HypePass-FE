import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './locales/es.json';
import en from './locales/en.json';
export const LANGUAGES = ['es', 'en'];
export const DEFAULT_LANGUAGE = 'es';
const STORAGE_KEY = 'hypepass.language';
void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
    resources: {
        es: { translation: es },
        en: { translation: en },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: LANGUAGES,
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: STORAGE_KEY,
        caches: ['localStorage'],
    },
});
export const setLanguage = (lang) => {
    void i18n.changeLanguage(lang);
    try {
        localStorage.setItem(STORAGE_KEY, lang);
    }
    catch (_a) {
        /* noop */
    }
};
export default i18n;
