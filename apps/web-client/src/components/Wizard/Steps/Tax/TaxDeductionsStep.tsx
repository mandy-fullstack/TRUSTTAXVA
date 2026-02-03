import { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { H3, Text, spacing, Spacer, Stack, Button } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { X, CheckCircle, Upload } from "lucide-react";
import { SquareSwitch } from "../../../../components/SquareSwitch";
import { api } from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import { DocumentSelector } from "../../../../components/DocumentSelector";
import type {
  TaxIntakeData,
  DeductionFlags,
} from "../../../../types/taxIntake";

const s = spacing;

const DEDUCTION_ITEMS: {
  key: keyof DeductionFlags;
  labelKey: string;
  hintKey: string;
}[] = [
    {
      key: "mortgageInterest",
      labelKey: "has_mortgage",
      hintKey: "has_mortgage_hint",
    },
    { key: "tuition1098T", labelKey: "has_tuition", hintKey: "has_tuition_hint" },
    {
      key: "studentLoanInterest",
      labelKey: "has_student_loan",
      hintKey: "has_student_loan_hint",
    },
    { key: "iraContribution", labelKey: "has_ira", hintKey: "has_ira_hint" },
    { key: "hsa", labelKey: "has_hsa", hintKey: "has_hsa_hint" },
    {
      key: "charitable",
      labelKey: "has_charitable",
      hintKey: "has_charitable_hint",
    },
    { key: "medical", labelKey: "has_medical", hintKey: "has_medical_hint" },
    { key: "energy", labelKey: "has_energy", hintKey: "has_energy_hint" },
  ];

interface TaxDeductionsStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
  docData?: Record<string, { fileName: string; status: string; id?: string }>;
  onDocChange?: (
    docData: Record<string, { fileName: string; status: string; id?: string }>,
  ) => void;
}

const DEDUCTION_LABELS: Record<keyof DeductionFlags, string> = {
  mortgageInterest: "1098 (mortgage)",
  tuition1098T: "1098-T (tuition)",
  studentLoanInterest: "1098-E (student loan)",
  iraContribution: "IRA contribution confirmation",
  hsa: "1095 / 1099-SA (HSA)",
  charitable: "Charitable receipts",
  medical: "Medical expense docs",
  energy: "Energy improvement docs",
};

export function TaxDeductionsStep({
  data,
  onChange,
  docData = {},
  onDocChange,
}: TaxDeductionsStepProps) {
  const { t } = useTranslation();
  const { showAlert } = useAuth();
  const ded = data.deductions ?? {};
  const [activeKey, setActiveKey] = useState<keyof DeductionFlags | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const toggle = (key: keyof DeductionFlags) => {
    const next = { ...ded, [key]: !ded[key] };
    onChange({ deductions: next });
  };

  const getDocKey = (key: keyof DeductionFlags): string => {
    const label = DEDUCTION_LABELS[key];
    return label.replace(/\s*\/\s*/g, "_").replace(/\s+/g, "_");
  };

  const processFile = async (file: File) => {
    if (!activeKey || !onDocChange) return;
    setUploading(activeKey);
    try {
      let docType = "TAX_FORM";
      const label = DEDUCTION_LABELS[activeKey];
      if (label.toLowerCase().includes("receipt")) docType = "RECEIPT";
      else if (label.toLowerCase().includes("medical"))
        docType = "MEDICAL_RECORD";

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

  const handleRemove = (key: keyof DeductionFlags) => {
    if (!onDocChange) return;
    const docKey = getDocKey(key);
    const next = { ...docData };
    delete next[docKey];
    onDocChange(next);
  };

  return (
    <Stack gap="xl">
      <View>
        <H3>{t("tax_wizard.deductions.title")}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t("tax_wizard.deductions.description")}
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
                {activeKey ? DEDUCTION_LABELS[activeKey] : ""}
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

      <View style={styles.list}>
        {DEDUCTION_ITEMS.map(({ key, labelKey, hintKey }) => {
          const isYes = !!ded[key];
          const docKey = getDocKey(key);
          const file = docData[docKey];
          const isUploading = uploading === key;

          return (
            <View key={key} style={styles.item}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>
                  {t(`tax_wizard.deductions.${labelKey}`)}
                </Text>
                <SquareSwitch value={isYes} onValueChange={() => toggle(key)} />
              </View>
              {isYes && (
                <View style={styles.detail}>
                  <Text style={styles.hint}>
                    {t(`tax_wizard.deductions.${hintKey}`)}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t("tax_wizard.deductions.note_placeholder")}
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

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t("tax_wizard.deductions.footer")}
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
  list: { gap: s[3], paddingHorizontal: s[2] },
  item: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
    padding: s[5],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 15, fontWeight: "700", color: "#334155", flex: 1 },
  detail: {
    marginTop: s[4],
    paddingTop: s[4],
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  hint: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: s[4],
    fontWeight: "500",
    lineHeight: 18,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    paddingHorizontal: s[4],
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#FFF",
    width: "100%",
  },
  footer: {
    marginTop: s[2],
    padding: s[5],
    backgroundColor: "#EFF6FF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginHorizontal: s[2],
  },
  footerText: {
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 20,
    fontWeight: "500",
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
