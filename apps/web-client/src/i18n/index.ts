import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import es from "./locales/es.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    // 'languageOnly' ensures we don't try to load things like 'es-ES.json' if we only have 'es.json'
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      // Check order:
      // 1. URL (?lng=es)
      // 2. Cookie
      // 3. LocalStorage
      // 4. SessionStorage
      // 5. Browser Navigator (THE SYSTEM LANGUAGE)
      // 6. Character set
      // 7. HTML Header attribute
      order: [
        "querystring",
        "cookie",
        "localStorage",
        "sessionStorage",
        "navigator",
        "htmlTag",
      ],
      lookupQuerystring: "lng",
      lookupCookie: "i18next",
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage", "cookie"],
    },
    // Preload languages to avoid flicker
    preload: ["en", "es"],
  });

// Professional Sync: Update HTML 'lang' attribute and meta tags
i18n.on("languageChanged", (lng) => {
  const baseLang = lng.split("-")[0];
  document.documentElement.lang = baseLang;

  // Pro Tip: Update the title or meta description if needed for SEO
  console.log(
    `[i18n] Language changed to: ${lng} (System detected or User selected)`,
  );
});

// Immediate execution for the very first load
const initialLang = i18n.language || "en";
document.documentElement.lang = initialLang.split("-")[0];

export default i18n;
