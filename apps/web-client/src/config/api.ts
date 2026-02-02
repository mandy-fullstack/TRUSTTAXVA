/**
 * Configuración centralizada de la API
 * SIEMPRE usa VITE_API_URL si está definido en las variables de entorno
 *
 * IMPORTANTE: Las variables de entorno deben estar en:
 * - apps/web-client/.env (desarrollo)
 * - apps/web-client/.env.production (producción)
 *
 * Formato: VITE_API_URL=http://localhost:4000
 */

/**
 * Obtiene la URL base del API desde las variables de entorno
 * PRIORIZA SIEMPRE VITE_API_URL si está definido
 */
export function getApiUrl(): string {
    // Obtener variable de entorno (Vite expone variables con prefijo VITE_)
    const envUrl = import.meta.env.VITE_API_URL;

    // Si VITE_API_URL está definido y no está vacío, SIEMPRE lo usamos
    if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
        const url = envUrl.trim();
        // Solo log en desarrollo
        if (import.meta.env.DEV) {
            console.log("✅ Usando VITE_API_URL de variables de entorno:", url);
        }
        return url;
    }

    // SOLO si NO está definido, usamos fallback
    // Solo mostrar warning en desarrollo
    if (import.meta.env.DEV) {
        console.warn(
            "⚠️ VITE_API_URL no está definido en variables de entorno. Usando fallback.",
        );
    }

    if (import.meta.env.PROD) {
        return "https://trusttax-api.onrender.com";
    }

    return "http://localhost:4000";
}

/**
 * URL base del API (exportada para compatibilidad)
 * Se calcula una vez al cargar el módulo
 */
export const API_BASE_URL = getApiUrl();

// Log detallado en desarrollo para debugging
if (import.meta.env.DEV) {
    console.group("🔧 Configuración de API");
    console.log("VITE_API_URL (env):", import.meta.env.VITE_API_URL);
    console.log("URL Final Usada:", API_BASE_URL);
    console.log("Modo:", import.meta.env.MODE);
    console.log("Es Producción:", import.meta.env.PROD);
    console.groupEnd();
}
