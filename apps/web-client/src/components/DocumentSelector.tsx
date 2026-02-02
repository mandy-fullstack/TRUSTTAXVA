import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text, Button, Stack } from "@trusttax/ui";
import { FileText, Upload, Archive, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";

interface DocumentSelectorProps {
  onSelect: (doc: { id: string; fileName: string; type?: string }) => void;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
  accept?: string;
  docFilter?: string; // e.g. 'W2_FORM' or '1099_NEC'
}

export function DocumentSelector({
  onSelect,
  onUpload,
  uploading,
  accept,
  docFilter,
}: DocumentSelectorProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"upload" | "vault">("upload");
  const [vaultDocs, setVaultDocs] = useState<any[]>([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [vaultError, setVaultError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "vault") {
      loadVaultDocs();
    }
  }, [mode, docFilter]);

  const loadVaultDocs = async () => {
    setLoadingVault(true);
    setVaultError(null);
    console.log(
      "[DocumentSelector] Loading vault docs with filter:",
      docFilter,
    );

    try {
      const docs = await api.getDocuments(
        docFilter ? { type: docFilter } : undefined,
      );
      console.log("[DocumentSelector] Loaded docs:", docs);
      setVaultDocs(docs || []);
    } catch (error) {
      console.error(
        "[DocumentSelector] Failed to load vault documents:",
        error,
      );
      setVaultError(
        t("common.error_loading_docs", "Error al cargar documentos"),
      );
    } finally {
      setLoadingVault(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      console.log("[DocumentSelector] File selected:", e.target.files[0].name);
      onUpload(e.target.files[0]);
    }
  };

  const handleSelectDocument = (doc: any) => {
    console.log("[DocumentSelector] Document selected:", {
      id: doc.id,
      fileName: doc.fileName,
      type: doc.type,
    });
    onSelect({
      id: doc.id,
      fileName: doc.fileName || doc.title || `documento-${doc.type}`,
      type: doc.type,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === "upload" && styles.tabActive]}
          onPress={() => setMode("upload")}
        >
          <Upload size={16} color={mode === "upload" ? "#2563EB" : "#64748B"} />
          <Text
            style={[styles.tabText, mode === "upload" && styles.tabTextActive]}
          >
            {t("common.upload_new", "Subir Nuevo")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === "vault" && styles.tabActive]}
          onPress={() => setMode("vault")}
        >
          <Archive size={16} color={mode === "vault" ? "#2563EB" : "#64748B"} />
          <Text
            style={[styles.tabText, mode === "vault" && styles.tabTextActive]}
          >
            {t("common.select_from_vault", "Biblioteca Personal")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {mode === "upload" ? (
          <View style={styles.uploadArea}>
            {uploading ? (
              <>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.uploadingText}>
                  {t("common.uploading", "Subiendo...")}
                </Text>
              </>
            ) : (
              <>
                <input
                  type="file"
                  id={`doc-selector-${docFilter || "generic"}`}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept={accept || "image/*,.pdf"}
                />
                <Button
                  title={t("common.choose_file", "Elegir Archivo")}
                  variant="outline"
                  onPress={() =>
                    document
                      .getElementById(`doc-selector-${docFilter || "generic"}`)
                      ?.click()
                  }
                  icon={<Upload size={18} color="#2563EB" />}
                />
                <Text style={styles.hint}>
                  {t("common.upload_hint", "PDF, JPG, PNG hasta 10MB")}
                </Text>
              </>
            )}
          </View>
        ) : (
          <View style={styles.vaultArea}>
            {loadingVault ? (
              <View style={styles.center}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.loadingText}>
                  {t("common.loading", "Cargando...")}
                </Text>
              </View>
            ) : vaultError ? (
              <View style={styles.center}>
                <AlertCircle size={24} color="#DC2626" />
                <Text style={styles.errorText}>{vaultError}</Text>
                <Button
                  title={t("common.retry", "Reintentar")}
                  variant="ghost"
                  onPress={loadVaultDocs}
                  size="sm"
                />
              </View>
            ) : vaultDocs.length === 0 ? (
              <View style={styles.center}>
                <Archive size={32} color="#CBD5E1" />
                <Text style={styles.emptyText}>
                  {docFilter
                    ? t(
                        "common.no_docs_of_type",
                        `No hay documentos de tipo ${docFilter}`,
                      )
                    : t(
                        "common.no_docs_found",
                        "No se encontraron documentos previos.",
                      )}
                </Text>
                <Text style={styles.emptyHint}>
                  {t(
                    "common.upload_first_doc",
                    'Usa "Subir Nuevo" para agregar tu primer documento',
                  )}
                </Text>
              </View>
            ) : (
              <ScrollView nestedScrollEnabled style={styles.scrollView}>
                <Stack gap="sm">
                  {vaultDocs.map((doc) => (
                    <TouchableOpacity
                      key={doc.id}
                      style={styles.docItem}
                      onPress={() => handleSelectDocument(doc)}
                    >
                      <View style={styles.docIcon}>
                        <FileText size={20} color="#475569" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.docName} numberOfLines={1}>
                          {doc.fileName || doc.title || doc.type}
                        </Text>
                        <Text style={styles.docDate}>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Button
                        title={t("common.select", "Seleccionar")}
                        size="sm"
                        variant="ghost"
                        onPress={(e: any) => {
                          e?.stopPropagation?.();
                          handleSelectDocument(doc);
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </Stack>
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
    overflow: "hidden",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  tabActive: {
    backgroundColor: "#FFF",
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
    marginBottom: -1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#2563EB",
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  uploadArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 12,
  },
  uploadingText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
  hint: {
    fontSize: 12,
    color: "#94A3B8",
  },
  vaultArea: {
    minHeight: 200,
  },
  scrollView: {
    flex: 1,
    maxHeight: 300,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
  },
  emptyHint: {
    fontSize: 12,
    color: "#CBD5E1",
    textAlign: "center",
    marginTop: 4,
  },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 4,
    gap: 12,
    backgroundColor: "#FFF",
  },
  docIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  docName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  docDate: {
    fontSize: 12,
    color: "#64748B",
  },
});
