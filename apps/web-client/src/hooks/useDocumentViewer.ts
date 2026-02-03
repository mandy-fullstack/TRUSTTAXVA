import { useState } from "react";
import { getToken } from "../lib/cookies";
import { API_BASE_URL } from "../config/api";

/**
 * Hook para manejar visualización, descarga y preview de documentos
 * Considera que los documentos están encriptados y el backend los descifra automáticamente
 */
export function useDocumentViewer() {
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewMimeType, setPreviewMimeType] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Ver documento en nueva pestaña con autenticación
     * El backend descifra automáticamente el documento antes de enviarlo
     */
    const viewDocument = async (docId: string) => {
        try {
            setLoading(true);
            setError(null);

            const url = `${API_BASE_URL}/documents/${docId}/content`;

            const token = getToken();
            if (!token) {
                throw new Error("No authentication token available");
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to load document: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const newWindow = window.open(blobUrl, "_blank");
            if (!newWindow) {
                throw new Error("Popup blocked. Please allow popups for this site.");
            }

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 60000);

            return blobUrl;
        } catch (err: any) {
            setError(err.message || "Failed to view document");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Descargar documento con autenticación
     */
    const downloadDocument = async (docId: string, filename: string) => {
        try {
            setLoading(true);
            setError(null);

            const url = `${API_BASE_URL}/documents/${docId}/content`;

            const token = getToken();
            if (!token) {
                throw new Error("No authentication token available");
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to download document: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 1000);

            return true;
        } catch (err: any) {
            setError(err.message || "Failed to download document");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Preview documento en modal
     */
    const previewDocument = async (docId: string, mimeType?: string) => {
        try {
            setLoading(true);
            setError(null);

            const url = `${API_BASE_URL}/documents/${docId}/content`;

            const token = getToken();
            if (!token) {
                throw new Error("No authentication token available");
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                // Try to get error message from response
                let errorMessage = response.statusText;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    // If response is not JSON, use statusText
                }

                throw new Error(
                    `Error al cargar documento: ${errorMessage} (${response.status})`,
                );
            }

            const blob = await response.blob();

            // Check if blob is empty
            if (blob.size === 0) {
                throw new Error("El documento está vacío o no se pudo cargar");
            }

            const blobUrl = URL.createObjectURL(blob);

            // Get content type from response or use provided mimeType
            const contentType =
                mimeType ||
                response.headers.get("content-type") ||
                "application/octet-stream";

            setPreviewUrl(blobUrl);
            setPreviewMimeType(contentType);

            return blobUrl;
        } catch (err: any) {
            const errorMessage =
                err.message || "Error desconocido al previsualizar documento";
            console.error("[useDocumentViewer] Preview error:", err);
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const closePreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setPreviewMimeType(null);
    };

    return {
        viewDocument,
        downloadDocument,
        previewDocument,
        closePreview,
        previewUrl,
        previewMimeType,
        loading,
        error,
    };
}
