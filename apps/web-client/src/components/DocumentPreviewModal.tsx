import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Text } from "@trusttax/ui";
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import { useState, useEffect } from "react";

interface DocumentPreviewModalProps {
  visible: boolean;
  previewUrl: string | null;
  mimeType: string | null;
  documentTitle?: string;
  onClose: () => void;
  onDownload?: () => void;
  onViewExternal?: () => void;
}

export function DocumentPreviewModal({
  visible,
  previewUrl,
  mimeType,
  documentTitle,
  onClose,
  onDownload,
  onViewExternal,
}: DocumentPreviewModalProps) {
  const { width, height } = useWindowDimensions();
  const isPDF = mimeType?.includes("pdf");
  const isImage = mimeType?.includes("image");
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Reset zoom and rotation when modal opens/closes or document changes
  useEffect(() => {
    if (visible && previewUrl) {
      setImageZoom(1);
      setImageRotation(0);
      setImageError(false);
    }
  }, [visible, previewUrl]);

  const handleZoomIn = () => {
    setImageZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { maxWidth: width * 0.95, maxHeight: height * 0.9 },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {documentTitle || "Vista Previa del Documento"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isPDF ? "PDF" : isImage ? "Imagen" : "Documento"}
              </Text>
            </View>
            <View style={styles.headerActions}>
              {isImage && previewUrl && (
                <>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleZoomOut}
                    disabled={imageZoom <= 0.5}
                  >
                    <ZoomOut
                      size={18}
                      color={imageZoom <= 0.5 ? "#94A3B8" : "#2563EB"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleZoomIn}
                    disabled={imageZoom >= 3}
                  >
                    <ZoomIn
                      size={18}
                      color={imageZoom >= 3 ? "#94A3B8" : "#2563EB"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleRotate}
                  >
                    <RotateCw size={18} color="#2563EB" />
                  </TouchableOpacity>
                </>
              )}
              {onDownload && (
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={onDownload}
                >
                  <Download size={18} color="#2563EB" />
                </TouchableOpacity>
              )}
              {onViewExternal && (
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={onViewExternal}
                >
                  <ExternalLink size={18} color="#2563EB" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {!previewUrl ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Cargando documento...</Text>
              </View>
            ) : isPDF ? (
              // eslint-disable-next-line react-native/no-inline-styles
              <iframe
                src={previewUrl}
                style={styles.iframe}
                title="Document Preview"
                allow="fullscreen"
              />
            ) : isImage ? (
              imageError ? (
                <View style={styles.unsupportedContainer}>
                  <Text style={styles.unsupportedText}>
                    Error al cargar la imagen
                  </Text>
                  <Text style={styles.unsupportedSubtext}>
                    Por favor, intenta descargar el archivo
                  </Text>
                </View>
              ) : (
                <ScrollView
                  contentContainerStyle={styles.imageScrollContainer}
                  maximumZoomScale={3}
                  minimumZoomScale={0.5}
                  showsHorizontalScrollIndicator={true}
                  showsVerticalScrollIndicator={true}
                >
                  {/* eslint-disable-next-line react-native/no-inline-styles */}
                  <img
                    src={previewUrl}
                    alt={documentTitle || "Document preview"}
                    style={
                      {
                        ...styles.image,
                        transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                        transition: "transform 0.2s ease",
                      } as any
                    }
                    onError={handleImageError}
                  />
                </ScrollView>
              )
            ) : (
              <View style={styles.unsupportedContainer}>
                <Text style={styles.unsupportedText}>
                  Vista previa no disponible para este tipo de archivo
                </Text>
                <Text style={styles.unsupportedSubtext}>
                  Por favor, descarga el archivo para verlo
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "95%",
    maxWidth: 900,
    height: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  headerInfo: {
    flex: 1,
    minWidth: 200,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    lineHeight: 16,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#EFF6FF",
  },
  closeButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#F1F5F9",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    lineHeight: 20,
  },
  iframe: {
    width: "100%",
    height: "100%",
    borderWidth: 0,
  } as any,
  imageScrollContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
    padding: 20,
  } as any,
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    cursor: "zoom-in",
  } as any,
  unsupportedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 8,
  },
  unsupportedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  unsupportedSubtext: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    lineHeight: 20,
  },
});
