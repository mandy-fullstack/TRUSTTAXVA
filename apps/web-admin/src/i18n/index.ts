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
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
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
    preload: ["en", "es"],
  });

// Update HTML 'lang' attribute
i18n.on("languageChanged", (lng) => {
  const baseLang = lng.split("-")[0];
  if (typeof document !== "undefined") {
    document.documentElement.lang = baseLang;
  }
});

// Immediate execution for the very first load
if (typeof document !== "undefined") {
  const initialLang = i18n.language || "en";
  document.documentElement.lang = initialLang.split("-")[0];
}

export default i18n;
