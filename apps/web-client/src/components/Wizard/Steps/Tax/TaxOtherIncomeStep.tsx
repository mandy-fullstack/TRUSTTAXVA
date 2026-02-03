import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { H3, Text, spacing, Spacer, Stack, Button } from "@trusttax/ui";
import { ChevronDown, ChevronUp, X, CheckCircle, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import { DocumentSelector } from "../../../../components/DocumentSelector";
import type {
  TaxIntakeData,
  OtherIncomeFlags,
} from "../../../../types/taxIntake";

const s = spacing;

const OTHER_INCOME_ITEMS: {
  key: keyof OtherIncomeFlags;
  labelKey: string;
  hintKey: string;
}[] = [
    { key: "has1099NEC", labelKey: "has_1099nec", hintKey: "has_1099nec_hint" },
    { key: "has1099K", labelKey: "has_1099k", hintKey: "has_1099k_hint" },
    { key: "has1099G", labelKey: "has_1099g", hintKey: "has_1099g_hint" },
    {
      key: "has1099INTorDIV",
      labelKey: "has_1099int",
      hintKey: "has_1099int_hint",
    },
    { key: "has1099R", labelKey: "has_1099r", hintKey: "has_1099r_hint" },
    { key: "hasSSA1099", labelKey: "has_ssa1099", hintKey: "has_ssa1099_hint" },
    { key: "hasCrypto", labelKey: "has_crypto", hintKey: "has_crypto_hint" },
    { key: "hasW2G", labelKey: "has_w2g", hintKey: "has_w2g_hint" },
    { key: "has1099B", labelKey: "has_1099b", hintKey: "has_1099b_hint" },
    { key: "hasRental", labelKey: "has_rental", hintKey: "has_rental_hint" },
  ];

interface TaxOtherIncomeStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
  docData?: Record<string, { fileName: string; status: string; id?: string }>;
  onDocChange?: (
    docData: Record<string, { fileName: string; status: string; id?: string }>,
  ) => void;
}

const OTHER_INCOME_LABELS: Record<keyof OtherIncomeFlags, string> = {
  has1099NEC: "1099-NEC",
  has1099K: "1099-K",
  has1099G: "1099-G",
  has1099INTorDIV: "1099-INT / 1099-DIV",
  has1099R: "1099-R",
  hasSSA1099: "SSA-1099",
  hasCrypto: "Crypto statements",
  hasW2G: "W-2G",
  has1099B: "1099-B",
  hasRental: "Rental docs",
};

export function TaxOtherIncomeStep({
  data,
  onChange,
  docData = {},
  onDocChange,
}: TaxOtherIncomeStepProps) {
  const { t } = useTranslation();
  const { showAlert } = useAuth();
  const other = data.otherIncome ?? {};
  const [activeKey, setActiveKey] = useState<keyof OtherIncomeFlags | null>(
    null,
  );
  const [uploading, setUploading] = useState<string | null>(null);

  const toggle = (key: keyof OtherIncomeFlags) => {
    const next = { ...other, [key]: !other[key] };
    onChange({ otherIncome: next });
  };

  const getDocKey = (key: keyof OtherIncomeFlags): string => {
    const label = OTHER_INCOME_LABELS[key];
    return label.replace(/\s*\/\s*/g, "_").replace(/\s+/g, "_");
  };

  const processFile = async (file: File) => {
    if (!activeKey || !onDocChange) return;
    setUploading(activeKey);
    try {
      let docType = "TAX_FORM";
      const label = OTHER_INCOME_LABELS[activeKey];
      if (label.includes("W2") || label.includes("W-2")) docType = "W2_FORM";
      else if (label.toLowerCase().includes("crypto")) docType = "OTHER";

      const result = await api.uploadDocument(file, label, docType);
      const key = getDocKey(activeKey);
      onDocChange({
        ...docData,
        [key]: { fileName: file.name, status: "uploaded", id: result.id },
      });
      setActiveKey(null);
    } catch (error: any) {
      console.error("Upload failed", error);
      showAlert({
        title: t("wizard.error_title"),
        message: error?.message || t("wizard.upload_error"),
        variant: "error",
      });
    } finally {
      setUploading(null);
    }
  };

  const processExistingFile = async (doc: { id: string; fileName: string }) => {
    if (!activeKey || !onDocChange) return;
    const key = getDocKey(activeKey);
    onDocChange({
      ...docData,
      [key]: { fileName: doc.fileName, status: "uploaded", id: doc.id },
    });
    setActiveKey(null);
  };

  const handleRemove = (key: keyof OtherIncomeFlags) => {
    if (!onDocChange) return;
    const docKey = getDocKey(key);
    const next = { ...docData };
    delete next[docKey];
    onDocChange(next);
  };

  const count = Object.values(other).filter(Boolean).length;

  return (
    <Stack gap="xl">
      <View>
        <H3>{t("tax_wizard.other_income.title")}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t("tax_wizard.other_income.description")}
        </Text>
      </View>

      <Modal
        visible={!!activeKey}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveKey(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeKey ? OTHER_INCOME_LABELS[activeKey] : ""}
              </Text>
              <TouchableOpacity onPress={() => setActiveKey(null)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <DocumentSelector
              onUpload={processFile}
              onSelect={processExistingFile}
              uploading={!!uploading}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.checklist}>
        {OTHER_INCOME_ITEMS.map(({ key, labelKey, hintKey }) => {
          const isYes = !!other[key];
          const docKey = getDocKey(key);
          const file = docData[docKey];
          const isUploading = uploading === key;

          return (
            <View key={key} style={styles.item}>
              <TouchableOpacity
                style={[styles.toggleRow, isYes && styles.toggleRowActive]}
                onPress={() => toggle(key)}
              >
                <View
                  style={[styles.checkbox, isYes && styles.checkboxChecked]}
                />
                <Text
                  style={[styles.itemLabel, isYes && styles.itemLabelActive]}
                >
                  {t(`tax_wizard.other_income.${labelKey}`)}
                </Text>
                {isYes ? (
                  <ChevronUp size={18} color="#2563EB" />
                ) : (
                  <ChevronDown size={18} color="#94A3B8" />
                )}
              </TouchableOpacity>
              {isYes && (
                <View style={styles.detail}>
                  <Text style={styles.hint}>
                    {t(`tax_wizard.other_income.${hintKey}`)}
                  </Text>
                  <TextInput
                    style={styles.noteInput}
                    placeholder={t("tax_wizard.other_income.note_placeholder")}
                    placeholderTextColor="#94A3B8"
                  />

                  {/* Document Upload Section */}
                  {onDocChange && (
                    <View style={styles.docSection}>
                      {file ? (
                        <View style={styles.docInfo}>
                          <View style={styles.docIconBox}>
                            <CheckCircle size={16} color="#10B981" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.docFileName} numberOfLines={1}>
                              {file.fileName}
                            </Text>
                            <Text style={styles.docStatus}>
                              Documento vinculado
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemove(key)}
                            style={styles.removeBtn}
                          >
                            <Text style={styles.removeText}>Eliminar</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Button
                          title={t(
                            "tax_wizard.missing_docs.upload",
                            "Subir Documento",
                          )}
                          variant="outline"
                          onPress={() => setActiveKey(key)}
                          loading={isUploading}
                          icon={
                            !isUploading ? (
                              <Upload size={14} color="#2563EB" />
                            ) : undefined
                          }
                          size="sm"
                        />
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {t("tax_wizard.other_income.summary", { count })}
        </Text>
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
    marginBottom: s[2],
    paddingHorizontal: s[2],
  },
  checklist: { gap: s[3], paddingHorizontal: s[2] },
  item: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[4],
    padding: s[5],
  },
  toggleRowActive: {
    backgroundColor: "#EFF6FF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    backgroundColor: "#FFF",
  },
  checkboxChecked: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  itemLabel: { flex: 1, fontSize: 15, fontWeight: "700", color: "#334155" },
  itemLabelActive: { color: "#1E40AF" },
  detail: { padding: s[5], paddingTop: s[4], backgroundColor: "#F8FAFC" },
  hint: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: s[4],
    fontWeight: "500",
    lineHeight: 18,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    paddingHorizontal: s[4],
    height: 52,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#FFF",
    width: "100%",
  },
  summary: {
    marginTop: s[2],
    padding: s[5],
    backgroundColor: "#059669",
    borderRadius: 0,
    marginHorizontal: s[2],
  },
  summaryText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },
  docSection: {
    marginTop: s[4],
    paddingTop: s[4],
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  docInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[3],
    padding: s[3],
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 0,
  },
  docIconBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 0,
  },
  docFileName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
  },
  docStatus: {
    fontSize: 11,
    color: "#059669",
    marginTop: 2,
  },
  removeBtn: {
    paddingHorizontal: s[3],
  },
  removeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    width: "100%",
    maxWidth: 600,
    borderRadius: 0,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
});
