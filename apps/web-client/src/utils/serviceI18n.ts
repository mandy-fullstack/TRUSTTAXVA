import i18n from "../i18n";
import type { Service } from "../types";

/**
 * Gets the translated service name based on current language
 */
export function getServiceName(service: Service): string {
  if (!service) return "";
  const lang = i18n.language.startsWith("es") ? "es" : "en";
  if (service.nameI18n) {
    return (
      service.nameI18n[lang] ||
      service.nameI18n.en ||
      service.nameI18n.es ||
      service.name ||
      ""
    );
  }
  return service.name || "";
}

/**
 * Gets the translated service description based on current language
 */
export function getServiceDescription(service: Service): string {
  if (!service) return "";
  const lang = i18n.language.startsWith("es") ? "es" : "en";
  if (service.descriptionI18n) {
    return (
      service.descriptionI18n[lang] ||
      service.descriptionI18n.en ||
      service.descriptionI18n.es ||
      service.description ||
      ""
    );
  }
  return service.description || "";
}
