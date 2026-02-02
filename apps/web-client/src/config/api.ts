/**
 * Configuración centralizada de la API
 * Usa VITE_API_URL de variables de entorno, con fallback según el entorno
 */
export function getApiUrl(): string {
    const envUrl = import.meta.env.VITE_API_URL;

    if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
        return envUrl.trim();
    }

    if (import.meta.env.PROD) {
        return "https://trusttax-api.onrender.com";
    }

    return "http://localhost:4000";
}

export const API_BASE_URL = getApiUrl();
