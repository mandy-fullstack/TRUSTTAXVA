import {
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Text } from "@trusttax/ui";
import { Download, Eye, ExternalLink, ShieldCheck, Clock, X } from "lucide-react";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { api } from "../services/api";

import {
    FaFilePdf,
    FaFileImage,
    FaFileWord,
    FaFileExcel,
    FaFileArchive,
    FaFileVideo,
    FaIdCard,
    FaCreditCard,
    FaFile,
    FaFileAlt,
    FaFileInvoice,
    FaFileContract,
    FaFileMedical,
    FaFilePowerpoint,
    FaFileCode,
    FaFileCsv,
    FaFileAudio,
    FaPassport,
    FaCertificate,
} from "react-icons/fa";
import { useDocumentViewer } from "../hooks/useDocumentViewer";
import { useState } from "react";

interface DocumentCardProps {
    document: {
        id: string;
        title: string;
        type: string;
        size?: number;
        mimeType?: string;
        uploadedAt: string | Date;
        url?: string;
        orderId?: string;
        status?: "PENDING" | "VERIFIED" | "REJECTED";
    };
    showActions?: boolean;
    onStatusUpdate?: (docId: string, status: "PENDING" | "VERIFIED" | "REJECTED") => void;
    variant?: "default" | "compact" | "inline";
}

/**
 * Formatea el tamaño del archivo de bytes a formato legible
 * Nota: El tamaño mostrado es el ORIGINAL (no encriptado)
 */
function formatFileSize(bytes?: number): string {
    if (!bytes) return "Tamaño desconocido";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Obtiene el icono según el mimeType y tipo de documento
 * Usa iconos de react-icons (similar a Flaticon) - sin texto, solo iconos
 */
function getDocumentIconAndType(mimeType?: string, type?: string) {
    const mime = (mimeType || "").toLowerCase();
    const docType = (type || "").toUpperCase();

    // Identificar tipo de archivo por mimeType
    if (mime.includes("pdf")) {
        return {
            Icon: FaFilePdf,
            fileType: "PDF",
            color: "#EF4444",
            bg: "#FEF2F2",
        };
    }
    if (mime.includes("image")) {
        if (mime.includes("jpeg") || mime.includes("jpg")) {
            return {
                Icon: FaFileImage,
                fileType: "JPG",
                color: "#8B5CF6",
                bg: "#F5F3FF",
            };
        }
        if (mime.includes("png")) {
            return {
                Icon: FaFileImage,
                fileType: "PNG",
                color: "#8B5CF6",
                bg: "#F5F3FF",
            };
        }
        return {
            Icon: FaFileImage,
            fileType: "IMG",
            color: "#8B5CF6",
            bg: "#F5F3FF",
        };
    }
    if (mime.includes("word") || mime.includes("document")) {
        return {
            Icon: FaFileWord,
            fileType: "DOC",
            color: "#2563EB",
            bg: "#EFF6FF",
        };
    }
    if (mime.includes("powerpoint") || mime.includes("presentation")) {
        return {
            Icon: FaFilePowerpoint,
            fileType: "PPT",
            color: "#F97316",
            bg: "#FFF7ED",
        };
    }
    if (
        mime.includes("sheet") ||
        mime.includes("excel") ||
        mime.includes("spreadsheet") ||
        mime.includes("csv")
    ) {
        if (mime.includes("csv")) {
            return {
                Icon: FaFileCsv,
                fileType: "CSV",
                color: "#10B981",
                bg: "#ECFDF5",
            };
        }
        return {
            Icon: FaFileExcel,
            fileType: "XLS",
            color: "#10B981",
            bg: "#ECFDF5",
        };
    }
    if (mime.includes("video")) {
        return {
            Icon: FaFileVideo,
            fileType: "VID",
            color: "#EC4899",
            bg: "#FDF2F8",
        };
    }
    if (mime.includes("audio") || mime.includes("sound")) {
        return {
            Icon: FaFileAudio,
            fileType: "AUD",
            color: "#8B5CF6",
            bg: "#F5F3FF",
        };
    }
    if (
        mime.includes("zip") ||
        mime.includes("archive") ||
        mime.includes("compressed") ||
        mime.includes("rar") ||
        mime.includes("7z")
    ) {
        return {
            Icon: FaFileArchive,
            fileType: "ZIP",
            color: "#F59E0B",
            bg: "#FFFBEB",
        };
    }
    if (
        mime.includes("code") ||
        mime.includes("text") ||
        mime.includes("javascript") ||
        mime.includes("json")
    ) {
        return {
            Icon: FaFileCode,
            fileType: "CODE",
            color: "#6366F1",
            bg: "#EEF2FF",
        };
    }
    if (mime.includes("text") || mime.includes("plain")) {
        return {
            Icon: FaFileAlt,
            fileType: "TXT",
            color: "#64748B",
            bg: "#F1F5F9",
        };
    }

    // Identificar por tipo de documento si no hay mimeType
    if (docType.includes("PASSPORT")) {
        return {
            Icon: FaPassport,
            fileType: "PASSPORT",
            color: "#6366F1",
            bg: "#EEF2FF",
        };
    }
    if (
        docType.includes("ID") ||
        docType.includes("SSN") ||
        docType.includes("IDENTITY")
    ) {
        return { Icon: FaIdCard, fileType: "ID", color: "#6366F1", bg: "#EEF2FF" };
    }
    if (docType.includes("DRIVER") || docType.includes("LICENSE")) {
        return {
            Icon: FaCreditCard,
            fileType: "DL",
            color: "#6366F1",
            bg: "#EEF2FF",
        };
    }
    if (
        docType.includes("W2") ||
        docType.includes("1099") ||
        docType.includes("TAX") ||
        docType.includes("TAX_RETURN")
    ) {
        return {
            Icon: FaFileInvoice,
            fileType: "TAX",
            color: "#EF4444",
            bg: "#FEF2F2",
        };
    }
    if (docType.includes("CERTIFICATE") || docType.includes("CERT")) {
        return {
            Icon: FaCertificate,
            fileType: "CERT",
            color: "#10B981",
            bg: "#ECFDF5",
        };
    }
    if (docType.includes("CONTRACT") || docType.includes("AGREEMENT")) {
        return {
            Icon: FaFileContract,
            fileType: "CONTRACT",
            color: "#6366F1",
            bg: "#EEF2FF",
        };
    }
    if (docType.includes("MEDICAL") || docType.includes("HEALTH")) {
        return {
            Icon: FaFileMedical,
            fileType: "MED",
            color: "#EC4899",
            bg: "#FDF2F8",
        };
    }

    // Default
    return { Icon: FaFile, fileType: "FILE", color: "#64748B", bg: "#F1F5F9" };
}

/**
 * Formatea la fecha de manera legible
 */
function formatDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;

    return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/**
 * Determina si el documento es "nuevo" (subido en últimos 7 días)
 */
function isNewDocument(uploadedAt: string | Date): boolean {
    const d = typeof uploadedAt === "string" ? new Date(uploadedAt) : uploadedAt;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
}

export function DocumentCard({
    document,
    showActions = true,
    onStatusUpdate,
    variant = "default",
}: DocumentCardProps) {
    const {
        viewDocument,
        downloadDocument,
        previewDocument,
        closePreview,
        previewUrl,
        previewMimeType,
        loading,
    } = useDocumentViewer();
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [localStatus, setLocalStatus] = useState(document.status || "PENDING");

    const handleView = async () => {
        try {
            setActionLoading("view");
            await viewDocument(document.id);
        } catch (error: any) {
            alert(`Error al ver documento: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownload = async () => {
        try {
            setActionLoading("download");
            const filename = document.title || `documento-${document.id}`;
            await downloadDocument(document.id, filename);
        } catch (error: any) {
            alert(`Error al descargar documento: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handlePreview = async () => {
        try {
            setActionLoading("preview");
            await previewDocument(document.id, document.mimeType || undefined);
        } catch (error: any) {
            alert(`Error al previsualizar documento: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };
    const handleStatusUpdate = async (newStatus: "PENDING" | "VERIFIED" | "REJECTED") => {
        try {
            setActionLoading(`status-${newStatus}`);
            await api.updateDocumentStatus(document.id, newStatus);
            setLocalStatus(newStatus);
            if (onStatusUpdate) onStatusUpdate(document.id, newStatus);
        } catch (error: any) {
            alert(`Error al actualizar estado: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const isNew = isNewDocument(document.uploadedAt);
    const isIdentityDoc = [
        "ID_FRONT",
        "ID_BACK",
        "PASSPORT",
        "SSN_CARD",
        "DRIVER_LICENSE",
    ].includes(document.type.toUpperCase());
    const {
        Icon: DocumentIcon,
        fileType,
        color,
        bg,
    } = getDocumentIconAndType(document.mimeType, document.type);

    if (variant === "compact") {
        return (
            <View style={{ width: "100%", alignSelf: "stretch" }}>
                <View style={styles.compactCard}>
                    <View style={[styles.compactIconBox, { backgroundColor: bg }]}>
                        <DocumentIcon size={24} color={color} />
                    </View>
                    <View style={styles.compactInfo}>
                        <Text style={styles.compactTitle} numberOfLines={1}>
                            {document.title}
                        </Text>
                        <Text style={styles.compactMeta}>
                            {fileType} • {formatFileSize(document.size)}
                        </Text>
                    </View>
                    {showActions && (
                        <TouchableOpacity
                            style={styles.compactActionButton}
                            onPress={handlePreview}
                            disabled={loading || !!actionLoading}
                        >
                            {loading || actionLoading === "preview" ? (
                                <ActivityIndicator size="small" color="#059669" />
                            ) : (
                                <Eye size={16} color="#059669" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
                {/* Preview Modal para variant compact */}
                <DocumentPreviewModal
                    visible={!!previewUrl}
                    previewUrl={previewUrl}
                    mimeType={previewMimeType}
                    documentTitle={document.title}
                    onClose={closePreview}
                    onDownload={() => {
                        const filename = document.title || `documento-${document.id}`;
                        downloadDocument(document.id, filename);
                    }}
                    onViewExternal={() => viewDocument(document.id)}
                />
            </View>
        );
    }

    if (variant === "inline") {
        return (
            <TouchableOpacity
                style={styles.inlineLink}
                onPress={handleView}
                disabled={loading || !!actionLoading}
            >
                <ExternalLink size={12} color="#2563EB" />
                <Text style={styles.inlineLinkText}>
                    {loading || actionLoading === "view"
                        ? "Cargando..."
                        : "Ver Documento"}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: bg }]}>
                    <DocumentIcon size={32} color={color} />
                </View>
                <View style={styles.cardInfo}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={2}>
                            {document.title || "Documento sin título"}
                        </Text>
                        {isNew && (
                            <View style={styles.newBadge}>
                                <Text style={styles.newBadgeText}>NUEVO</Text>
                            </View>
                        )}
                        {isIdentityDoc && <ShieldCheck size={14} color="#059669" />}
                        <View
                            style={[
                                styles.statusBadgeSimple,
                                localStatus === "VERIFIED"
                                    ? styles.statusBadgeVerified
                                    : localStatus === "REJECTED"
                                        ? styles.statusBadgeRejected
                                        : styles.statusBadgePending,
                            ]}
                        >
                            <View
                                style={[
                                    styles.statusDot,
                                    localStatus === "VERIFIED"
                                        ? styles.statusDotVerified
                                        : localStatus === "REJECTED"
                                            ? styles.statusDotRejected
                                            : styles.statusDotPending,
                                ]}
                            />
                            <Text
                                style={[
                                    styles.statusBadgeText,
                                    localStatus === "VERIFIED"
                                        ? styles.statusBadgeTextVerified
                                        : localStatus === "REJECTED"
                                            ? styles.statusBadgeTextRejected
                                            : styles.statusBadgeTextPending,
                                ]}
                            >
                                {localStatus === "VERIFIED"
                                    ? "VERIFICADO"
                                    : localStatus === "REJECTED"
                                        ? "RECHAZADO"
                                        : "PENDIENTE"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>{fileType}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>{document.type}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>{formatFileSize(document.size)}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <View style={styles.dateContainer}>
                            <Clock size={12} color="#94A3B8" />
                            <Text style={styles.metaText}>
                                {formatDate(document.uploadedAt)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {
                showActions && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.viewButton]}
                            onPress={handleView}
                            disabled={loading || !!actionLoading}
                        >
                            {loading || actionLoading === "view" ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <>
                                    <Eye size={16} color="#FFF" />
                                    <Text style={styles.actionButtonText}>Ver</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.downloadButton]}
                            onPress={handleDownload}
                            disabled={loading || !!actionLoading}
                        >
                            {loading || actionLoading === "download" ? (
                                <ActivityIndicator size="small" color="#2563EB" />
                            ) : (
                                <>
                                    <Download size={16} color="#2563EB" />
                                    <Text
                                        style={[styles.actionButtonText, styles.downloadButtonText]}
                                    >
                                        Descargar
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Preview siempre habilitado para todos los tipos de archivo */}
                        <TouchableOpacity
                            style={[styles.actionButton, styles.previewButton]}
                            onPress={handlePreview}
                            disabled={loading || !!actionLoading}
                        >
                            {loading || actionLoading === "preview" ? (
                                <ActivityIndicator size="small" color="#059669" />
                            ) : (
                                <>
                                    <Eye size={16} color="#059669" />
                                    <Text
                                        style={[styles.actionButtonText, styles.previewButtonText]}
                                    >
                                        Preview
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {localStatus !== "VERIFIED" && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.verifyButton]}
                                onPress={() => handleStatusUpdate("VERIFIED")}
                                disabled={loading || !!actionLoading}
                            >
                                {actionLoading === "status-VERIFIED" ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <ShieldCheck size={16} color="#FFF" />
                                        <Text style={styles.actionButtonText}>Verificar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {localStatus !== "REJECTED" && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.rejectButton]}
                                onPress={() => handleStatusUpdate("REJECTED")}
                                disabled={loading || !!actionLoading}
                            >
                                {actionLoading === "status-REJECTED" ? (
                                    <ActivityIndicator size="small" color="#EF4444" />
                                ) : (
                                    <>
                                        <X size={16} color="#EF4444" />
                                        <Text style={[styles.actionButtonText, styles.rejectButtonText]}>Rechazar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                )}

            {/* Preview Modal */}
            <DocumentPreviewModal
                visible={!!previewUrl}
                previewUrl={previewUrl}
                mimeType={previewMimeType}
                documentTitle={document.title}
                onClose={closePreview}
                onDownload={() => {
                    const filename = document.title || `documento-${document.id}`;
                    downloadDocument(document.id, filename);
                }}
                onViewExternal={() => viewDocument(document.id)}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 0,
        padding: 16,
        marginBottom: 12,
        width: "100%",
        maxWidth: "100%",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 0,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        position: "relative",
    },
    compactIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    cardInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 6,
    },
    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
        flex: 1,
        minWidth: 200,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        letterSpacing: -0.2,
        lineHeight: 20,
    },
    newBadge: {
        backgroundColor: "#FEF3C7",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 0,
    },
    newBadgeText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#92400E",
        textTransform: "uppercase",
        letterSpacing: 1,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
    },
    metaText: {
        fontSize: 12,
        color: "#64748B",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        lineHeight: 18,
    },
    metaDot: {
        fontSize: 12,
        color: "#CBD5E1",
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 0,
        flex: 1,
        minWidth: 100,
        justifyContent: "center",
    },
    viewButton: {
        backgroundColor: "#2563EB",
    },
    downloadButton: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#2563EB",
    },
    previewButton: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#059669",
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        letterSpacing: 0.3,
    },
    downloadButtonText: {
        color: "#2563EB",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    previewButtonText: {
        color: "#059669",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    verifyButton: {
        backgroundColor: "#10B981",
    },
    rejectButton: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#EF4444",
    },
    rejectButtonText: {
        color: "#EF4444",
    },
    statusBadgeSimple: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderWidth: 1,
    },
    statusBadgePending: {
        backgroundColor: "#FFFBEB",
        borderColor: "#FDE68A",
    },
    statusBadgeVerified: {
        backgroundColor: "#F0FDF4",
        borderColor: "#BBF7D0",
    },
    statusBadgeRejected: {
        backgroundColor: "#FEF2F2",
        borderColor: "#FECACA",
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 0,
    },
    statusDotPending: {
        backgroundColor: "#D97706",
    },
    statusDotVerified: {
        backgroundColor: "#10B981",
    },
    statusDotRejected: {
        backgroundColor: "#EF4444",
    },
    statusBadgeText: {
        fontSize: 9,
        fontWeight: "800",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        letterSpacing: 0.5,
    },
    statusBadgeTextPending: {
        color: "#B45309",
    },
    statusBadgeTextVerified: {
        color: "#15803D",
    },
    statusBadgeTextRejected: {
        color: "#B91C1C",
    },
    // Compact variant
    compactCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        width: "100%",
        alignSelf: "stretch",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    compactIconBox: {
        width: 40,
        height: 40,
        borderRadius: 0,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    compactContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    compactIcon: {
        fontSize: 20,
    },
    compactInfo: {
        flex: 1,
    },
    compactTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
        marginBottom: 2,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        letterSpacing: -0.1,
        lineHeight: 20,
    },
    compactMeta: {
        fontSize: 11,
        color: "#64748B",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        lineHeight: 16,
    },
    // Inline variant
    inlineLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginLeft: 8,
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    inlineLinkText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#2563EB",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    compactActionButton: {
        padding: 8,
        borderRadius: 0,
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#059669",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 36,
        minHeight: 36,
    },
});
