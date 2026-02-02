import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "@trusttax/ui";
import { Download, Eye, ShieldCheck, Clock } from "lucide-react";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
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
  };
  showActions?: boolean;
  variant?: "default" | "compact" | "inline";
}

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
      await previewDocument(document.id, document.mimeType);
    } catch (error: any) {
      alert(`Error al previsualizar documento: ${error.message}`);
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
              style={styles.compactPreviewButton}
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
      <View>
        <View style={styles.inlineCard}>
          <View style={[styles.inlineIconBox, { backgroundColor: bg }]}>
            <DocumentIcon size={20} color={color} />
          </View>
          <View style={styles.inlineInfo}>
            <Text style={styles.inlineTitle} numberOfLines={1}>
              {document.title}
            </Text>
            <Text style={styles.inlineMeta}>
              {fileType} • {formatFileSize(document.size)}
            </Text>
          </View>
          {showActions && (
            <TouchableOpacity
              style={styles.inlinePreviewButton}
              onPress={handlePreview}
              disabled={loading || !!actionLoading}
            >
              {loading || actionLoading === "preview" ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Eye size={14} color="#059669" />
              )}
            </TouchableOpacity>
          )}
        </View>
        {/* Preview Modal para variant inline */}
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

      {showActions && (
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
    </View>
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
    borderRadius: 4,
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
  compactPreviewButton: {
    padding: 8,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    marginTop: 8,
    width: "100%",
  },
  inlineIconBox: {
    width: 32,
    height: 32,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  inlineInfo: {
    flex: 1,
  },
  inlineTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  inlineMeta: {
    fontSize: 10,
    color: "#64748B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  inlinePreviewButton: {
    padding: 6,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  inlineLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
});
