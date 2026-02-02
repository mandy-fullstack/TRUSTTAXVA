import { API_BASE_URL } from "../config/api";
import { getToken } from "../lib/cookies";

// Cache para blob URLs autenticadas
const blobUrlCache = new Map<string, { blobUrl: string; timestamp: number }>();
const BLOB_URL_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Convierte una URL de documento a la URL del proxy del backend
 * Esto evita problemas de CORS con Firebase Storage
 */
export function getDocumentProxyUrl(documentId: string, originalUrl?: string): string {
  // Si ya es una URL del proxy, devolverla tal cual
  if (originalUrl?.startsWith('/documents/') && originalUrl?.includes('/content')) {
    return `${API_BASE_URL}${originalUrl}`;
  }
  
  // Si es una URL de Firebase Storage, convertirla al proxy
  if (originalUrl?.includes('storage.googleapis.com') || originalUrl?.includes('firebasestorage')) {
    return `${API_BASE_URL}/documents/${documentId}/content`;
  }
  
  // Si no hay URL original o es relativa, usar el proxy
  return `${API_BASE_URL}/documents/${documentId}/content`;
}

/**
 * Obtiene una blob URL autenticada para usar en componentes Image
 * Esto es necesario porque Image de React Native no puede enviar headers de autenticación
 */
export async function getAuthenticatedImageUrl(documentId: string, originalUrl?: string): Promise<string> {
  const cacheKey = `doc_${documentId}`;
  const cached = blobUrlCache.get(cacheKey);
  
  // Verificar si hay una URL en caché válida
  if (cached && Date.now() - cached.timestamp < BLOB_URL_CACHE_TTL) {
    return cached.blobUrl;
  }
  
  const proxyUrl = getDocumentProxyUrl(documentId, originalUrl);
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  try {
    const response = await fetch(proxyUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load document: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    // Limpiar URL anterior si existe
    if (cached) {
      URL.revokeObjectURL(cached.blobUrl);
    }
    
    // Guardar en caché
    blobUrlCache.set(cacheKey, {
      blobUrl,
      timestamp: Date.now(),
    });
    
    // Limpiar caché después de TTL
    setTimeout(() => {
      const cachedEntry = blobUrlCache.get(cacheKey);
      if (cachedEntry && Date.now() - cachedEntry.timestamp >= BLOB_URL_CACHE_TTL) {
        URL.revokeObjectURL(cachedEntry.blobUrl);
        blobUrlCache.delete(cacheKey);
      }
    }, BLOB_URL_CACHE_TTL);
    
    return blobUrl;
  } catch (error) {
    console.error('Failed to get authenticated image URL:', error);
    throw error;
  }
}

/**
 * Abre un documento usando el proxy del backend con autenticación
 */
export async function openDocumentWithAuth(documentId: string, originalUrl?: string): Promise<void> {
  const url = getDocumentProxyUrl(documentId, originalUrl);
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load document: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    
    // Clean up after 60 seconds
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (error) {
    console.error('Failed to open document:', error);
    throw error;
  }
}
