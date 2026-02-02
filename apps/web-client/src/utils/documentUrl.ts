import { API_BASE_URL } from "../config/api";

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
 * Abre un documento usando el proxy del backend con autenticación
 */
export async function openDocumentWithAuth(documentId: string, originalUrl?: string): Promise<void> {
  const url = getDocumentProxyUrl(documentId, originalUrl);
  const token = localStorage.getItem('token');
  
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
