import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { H3, Text, Button, spacing, Spacer, Stack } from "@trusttax/ui";
import {
  FileText,
  CheckCircle,
  X,
  ShieldCheck,
  Lock,
  Info,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { api } from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import type { TaxIntakeData, W2Upload } from "../../../../types/taxIntake";
import { DocumentSelector } from "../../../../components/DocumentSelector";
import { SquareSwitch } from "../../../../components/SquareSwitch";

const s = spacing;

interface TaxW2UploadStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
}

export function TaxW2UploadStep({ data, onChange }: TaxW2UploadStepProps) {
  const { t } = useTranslation();
  const { showAlert } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const uploads = data.w2Uploads ?? [];
  const hasMore = data.hasMoreThanOneW2;

  const handleNewW2 = async (id: string, fileName: string) => {
    if (uploads.some((u) => u.id === id)) {
      showAlert({
        title: t("wizard.info", "Info"),
        message: t(
          "wizard.doc_already_added",
          "Este documento ya fue agregado.",
        ),
        variant: "info",
      });
      return;
    }

    const newUpload: W2Upload = {
      id,
      fileName,
      status: "pending",
    };

    const next = [...uploads, newUpload];
    onChange({ w2Uploads: next, hasMoreThanOneW2: next.length > 1 });
    await triggerAnalysis(id, next);
  };

  const processFile = async (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showAlert({
        title: t("wizard.error_title", "Error de archivo"),
        message: t(
          "wizard.file_too_large",
          "El archivo es demasiado grande. Por favor sube uno menor a 10MB.",
        ),
        variant: "error",
      });
      return;
    }

    try {
      setUploading(true);
      const result = await api.uploadDocument(file, file.name, "W2_FORM");
      await handleNewW2(result.id, file.name);
    } catch (error) {
      console.error("Upload error:", error);
      showAlert({
        title: t("tax_wizard.w2_upload.error_upload_title", "Error al subir"),
        message: t(
          "tax_wizard.w2_upload.error_upload_msg",
          "No pudimos subir tu archivo de forma segura. Por favor intenta de nuevo.",
        ),
        variant: "error",
      });
    } finally {
      setUploading(false);
      setShowSelector(false);
    }
  };

  const processExistingFile = async (doc: { id: string; fileName: string }) => {
    setUploading(true);
    try {
      await handleNewW2(doc.id, doc.fileName);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      setShowSelector(false);
    }
  };

  const triggerAnalysis = async (docId: string, currentUploads: W2Upload[]) => {
    try {
      setAnalyzingId(docId);
      const detection = await api.analyzeW2(docId);
      const next = currentUploads.map((u) => {
        if (u.id === docId) {
          return { ...u, status: "uploaded" as const, detected: detection };
        }
        return u;
      });

      // Automatically map detected values to the main form data
      const updates: Partial<TaxIntakeData> = { w2Uploads: next };
      if (detection.year && detection.year >= 2023 && detection.year <= 2026) {
        updates.taxYear = detection.year;
      }
      onChange(updates);
    } catch (error) {
      console.error("Analysis error:", error);
      showAlert({
        title: t(
          "tax_wizard.w2_upload.error_processing_title",
          "Procesamiento en Pausa",
        ),
        message: t(
          "tax_wizard.w2_upload.error_processing_msg",
          "No pudimos procesar este documento automáticamente. Puede continuar manualmente o reintentar.",
        ),
        variant: "warning",
        onConfirm: () => triggerAnalysis(docId, currentUploads),
      });
    } finally {
      setAnalyzingId(null);
    }
  };

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleRemove = async (id: string) => {
    if (deletingIds.has(id)) return;
    try {
      setDeletingIds((prev) => new Set(prev).add(id));
      await api.deleteDocument(id);
      const next = uploads.filter((u) => u.id !== id);
      onChange({ w2Uploads: next, hasMoreThanOneW2: next.length > 1 });
    } catch (error: any) {
      if (error?.name === "NotFoundError" || error?.statusCode === 404) {
        const next = uploads.filter((u) => u.id !== id);
        onChange({ w2Uploads: next, hasMoreThanOneW2: next.length > 1 });
      } else {
        showAlert({
          title: t("wizard.error_title", "Error"),
          message: t(
            "wizard.delete_error",
            "No se pudo eliminar el documento. Intenta de nuevo.",
          ),
          variant: "error",
        });
      }
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleToggleMore = (v: boolean) => {
    onChange({ hasMoreThanOneW2: v });
  };

  return (
    <Stack gap="xl">
      <View>
        <H3>{t("tax_wizard.w2_upload.title", "Subir Formularios W-2")}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t(
            "tax_wizard.w2_upload.description",
            "Sube tus formularios W-2 de este año. El sistema extraerá los datos automáticamente para agilizar tu declaración.",
          )}
        </Text>
      </View>

      {uploads.length > 0 && (
        <View style={styles.list}>
          {uploads.map((w) => {
            const isAnalyzing = analyzingId === w.id;
            return (
              <View key={w.id} style={styles.docItem}>
                <View style={styles.docInfo}>
                  <View
                    style={[
                      styles.iconBox,
                      w.status === "uploaded"
                        ? styles.iconBoxSuccess
                        : styles.iconBoxPending,
                    ]}
                  >
                    {w.status === "uploaded" ? (
                      <CheckCircle size={20} color="#10B981" />
                    ) : isAnalyzing ? (
                      <ActivityIndicator size="small" color="#2563EB" />
                    ) : (
                      <FileText size={20} color="#64748B" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docTitle} numberOfLines={1}>
                      {w.fileName}
                    </Text>
                    <View style={styles.statusRow}>
                      {isAnalyzing ? (
                        <View style={styles.processingBadge}>
                          <ActivityIndicator size={12} color="#2563EB" />
                          <Text style={styles.processingText}>
                            {t(
                              "tax_wizard.w2_upload.processing",
                              "Procesando documento...",
                            )}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.docStatus}>
                          {w.status === "uploaded"
                            ? t(
                                "tax_wizard.w2_upload.complete",
                                "Procesado correctamente",
                              )
                            : t("tax_wizard.w2_upload.pending", "Pendiente")}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(w.id)}
                  style={styles.removeBtn}
                  disabled={deletingIds.has(w.id)}
                >
                  {deletingIds.has(w.id) ? (
                    <ActivityIndicator size="small" color="#94A3B8" />
                  ) : (
                    <X size={18} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {(uploads.length === 0 || showSelector) && (
        <View style={{ marginBottom: s[4] }}>
          <DocumentSelector
            onUpload={processFile}
            onSelect={processExistingFile}
            uploading={uploading}
            docFilter="W2_FORM"
          />
          {showSelector && (
            <Button
              title={t("common.cancel", "Cancelar")}
              variant="ghost"
              onPress={() => setShowSelector(false)}
              style={{ marginTop: s[2] }}
            />
          )}
        </View>
      )}

      {uploads.length > 0 && !showSelector && (
        <Button
          title={
            uploading
              ? t("wizard.uploading", "Subiendo...")
              : t("tax_wizard.w2_upload.add_another", "Agregar otro W-2")
          }
          variant="outline"
          onPress={() => setShowSelector(true)}
          loading={uploading}
          icon={<Plus size={14} color="#2563EB" />}
          style={styles.addMoreBtn}
        />
      )}

      <View style={styles.securityBox}>
        <View style={styles.securityHeader}>
          <ShieldCheck size={18} color="#059669" />
          <Text style={styles.securityTitle}>
            {t(
              "tax_wizard.w2_upload.secure_processing",
              "Procesamiento 100% Seguro",
            )}
          </Text>
        </View>
        <Text style={styles.securityContent}>
          {t(
            "tax_wizard.w2_upload.security_msg",
            "Tus documentos se cifran con AES-256 antes de guardarse. El procesamiento automático es completamente privado, cumple con SOC2 y tus datos nunca se comparten con terceros.",
          )}
        </Text>
        <View style={styles.securityFooter}>
          <Lock size={12} color="#64748B" />
          <Text style={styles.securityMuted}>
            {t(
              "tax_wizard.w2_upload.encrypted_storage",
              "Cifrado de Grado Bancario • Privacidad Garantizada",
            )}
          </Text>
        </View>
      </View>

      {uploads.length > 0 && (
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {t("tax_wizard.w2_upload.has_more", "¿Tienes más de un W-2?")}
          </Text>
          <SquareSwitch value={!!hasMore} onValueChange={handleToggleMore} />
        </View>
      )}

      {uploads.length === 0 && (
        <View style={styles.hint}>
          <View style={styles.hintHeader}>
            <Info size={16} color="#2563EB" />
            <Text style={styles.hintTitle}>
              {t("tax_wizard.w2_upload.quick_tip", "Sugerencia")}
            </Text>
          </View>
          <Text style={styles.hintText}>
            {t(
              "tax_wizard.w2_upload.hint",
              "Puedes arrastrar una foto nítida o un archivo PDF. Evita sombras y asegúrate de que todo el formulario sea visible.",
            )}
          </Text>
        </View>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 16, color: "#64748B", lineHeight: 24 },
  list: { gap: s[3] },
  addMoreBtn: { alignSelf: "center", marginTop: s[2] },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: s[4],
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
  },
  docInfo: { flexDirection: "row", alignItems: "center", gap: s[4], flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
    backgroundColor: "#F8FAFC",
  },
  iconBoxPending: {},
  iconBoxSuccess: { backgroundColor: "#F0FDF4" },
  docTitle: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: s[2],
  },
  docStatus: { fontSize: 13, color: "#64748B" },
  processingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
  },
  processingText: { fontSize: 11, color: "#2563EB", fontWeight: "600" },
  removeBtn: { padding: s[2] },
  securityBox: {
    backgroundColor: "#F0FDF4",
    padding: s[5],
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  securityTitle: { fontSize: 14, fontWeight: "700", color: "#065F46" },
  securityContent: {
    fontSize: 13,
    color: "#065F46",
    opacity: 0.8,
    lineHeight: 20,
  },
  securityFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  securityMuted: { fontSize: 11, color: "#059669", fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: s[5],
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#F8FAFC",
  },
  switchLabel: { fontSize: 15, color: "#334155", fontWeight: "500" },
  hint: { padding: s[5], backgroundColor: "#EFF6FF", borderRadius: 0 },
  hintHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  hintTitle: { fontSize: 14, fontWeight: "700", color: "#1E40AF" },
  hintText: { fontSize: 14, color: "#1E40AF", opacity: 0.8, lineHeight: 22 },
});
