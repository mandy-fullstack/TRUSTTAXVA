import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { H3, Text, Button, spacing, Spacer, Stack } from "@trusttax/ui";
import { FileText, CheckCircle, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import { DocumentSelector } from "../../../../components/DocumentSelector";
import type {
  TaxIntakeData,
  OtherIncomeFlags,
  DeductionFlags,
} from "../../../../types/taxIntake";

const s = spacing;

const OTHER_DOCS: { key: keyof OtherIncomeFlags; label: string }[] = [
  { key: "has1099NEC", label: "1099-NEC" },
  { key: "has1099K", label: "1099-K" },
  { key: "has1099G", label: "1099-G" },
  { key: "has1099INTorDIV", label: "1099-INT / 1099-DIV" },
  { key: "has1099R", label: "1099-R" },
  { key: "hasSSA1099", label: "SSA-1099" },
  { key: "hasCrypto", label: "Crypto statements" },
  { key: "hasW2G", label: "W-2G" },
  { key: "has1099B", label: "1099-B" },
  { key: "hasRental", label: "Rental docs" },
];

const DEDUCTION_DOCS: { key: keyof DeductionFlags; label: string }[] = [
  { key: "mortgageInterest", label: "1098 (mortgage)" },
  { key: "tuition1098T", label: "1098-T (tuition)" },
  { key: "studentLoanInterest", label: "1098-E (student loan)" },
  { key: "iraContribution", label: "IRA contribution confirmation" },
  { key: "hsa", label: "1095 / 1099-SA (HSA)" },
  { key: "charitable", label: "Charitable receipts" },
  { key: "medical", label: "Medical expense docs" },
  { key: "energy", label: "Energy improvement docs" },
];

function buildMissingList(data: TaxIntakeData): string[] {
  const list: string[] = [];
  const other = data.otherIncome ?? {};
  const ded = data.deductions ?? {};
  OTHER_DOCS.forEach(({ key, label }) => {
    if (other[key]) list.push(label);
  });
  DEDUCTION_DOCS.forEach(({ key, label }) => {
    if (ded[key]) list.push(label);
  });
  const deps = data.dependents ?? [];
  deps.forEach((d) => {
    if (d.childcare && (d.childcareProvider || d.childcareAmount)) {
      list.push(`Childcare provider info for ${d.firstName} ${d.lastName}`);
    }
  });
  return list;
}

interface TaxMissingDocsStepProps {
  data: TaxIntakeData;
  docData: Record<string, { fileName: string; status: string; id?: string }>;
  onDocChange: (
    docData: Record<string, { fileName: string; status: string; id?: string }>,
  ) => void;
}

export function TaxMissingDocsStep({
  data,
  docData,
  onDocChange,
}: TaxMissingDocsStepProps) {
  const { t } = useTranslation();
  const { showAlert } = useAuth();
  const missing = buildMissingList(data);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!activeLabel) return;
    setUploading(activeLabel);
    try {
      let docType = "TAX_FORM";
      if (activeLabel.includes("W2") || activeLabel.includes("W-2"))
        docType = "W2_FORM";
      else if (activeLabel.toLowerCase().includes("receipt"))
        docType = "RECEIPT";
      else if (activeLabel.toLowerCase().includes("medical"))
        docType = "MEDICAL_RECORD";
      else if (activeLabel.toLowerCase().includes("passport"))
        docType = "PASSPORT";

      const result = await api.uploadDocument(file, activeLabel, docType);

      const key = activeLabel.replace(/\s*\/\s*/g, "_").replace(/\s+/g, "_");
      onDocChange({
        ...docData,
        [key]: { fileName: file.name, status: "uploaded", id: result.id },
      });
      setActiveLabel(null);
    } catch (error: any) {
      console.error("Upload failed", error);
      showAlert({
        title: t("wizard.error_title"),
        message: t("wizard.upload_error"),
        variant: "error",
      });
    } finally {
      setUploading(null);
    }
  };

  const processExistingFile = async (doc: { id: string; fileName: string }) => {
    if (!activeLabel) return;
    const key = activeLabel.replace(/\s*\/\s*/g, "_").replace(/\s+/g, "_");
    onDocChange({
      ...docData,
      [key]: { fileName: doc.fileName, status: "uploaded", id: doc.id },
    });
    setActiveLabel(null);
  };

  const handleRemove = (label: string) => {
    const key = label.replace(/\s*\/\s*/g, "_").replace(/\s+/g, "_");
    const next = { ...docData };
    delete next[key];
    onDocChange(next);
  };

  if (missing.length === 0) {
    return (
      <Stack gap="xl">
        <H3>{t("tax_wizard.missing_docs.no_missing_title")}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t("tax_wizard.missing_docs.no_missing_desc")}
        </Text>
        <View style={styles.empty}>
          <CheckCircle size={32} color="#10B981" />
          <Text style={styles.emptyText}>
            {t("tax_wizard.missing_docs.no_missing_text")}
          </Text>
        </View>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <View>
        <H3>{t("tax_wizard.missing_docs.title")}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t("tax_wizard.missing_docs.description")}
        </Text>
      </View>

      <Modal
        visible={!!activeLabel}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveLabel(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeLabel}</Text>
              <TouchableOpacity onPress={() => setActiveLabel(null)}>
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
        {missing.map((label) => {
          const key = label.replace(/\s*\/\s*/g, "_").replace(/\s+/g, "_");
          const file = docData[key];
          const isUploading = uploading === label;

          return (
            <View key={key} style={styles.item}>
              <View style={styles.itemInfo}>
                <View
                  style={[
                    styles.iconBox,
                    file ? styles.iconBoxSuccess : styles.iconBoxPending,
                  ]}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : file ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <FileText size={20} color="#64748B" />
                  )}
                </View>
                <View>
                  <Text style={styles.itemTitle}>{label}</Text>
                  <Text style={styles.itemStatus}>
                    {file
                      ? file.fileName
                      : t("tax_wizard.missing_docs.upload_or_enter")}
                  </Text>
                </View>
              </View>
              {file ? (
                <TouchableOpacity
                  onPress={() => handleRemove(label)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeText}>
                    {t("tax_wizard.missing_docs.remove")}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Button
                  title={t("tax_wizard.missing_docs.upload")}
                  variant="outline"
                  onPress={() => setActiveLabel(label)}
                  loading={isUploading}
                  icon={
                    !isUploading ? (
                      <Upload size={14} color="#2563EB" />
                    ) : undefined
                  }
                />
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.needsInfo}>
        <Text style={styles.needsInfoText}>
          {t("tax_wizard.missing_docs.needs_info_note")}
        </Text>
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 16, color: "#64748B", lineHeight: 24 },
  empty: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[3],
    padding: s[5],
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 0,
  },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#166534" },
  list: { gap: s[3] },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: s[4],
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
  },
  itemInfo: { flexDirection: "row", alignItems: "center", gap: s[3] },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
    borderWidth: 1,
  },
  iconBoxPending: { backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" },
  iconBoxSuccess: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  itemTitle: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  itemStatus: { fontSize: 13, color: "#64748B", marginTop: 2 },
  removeBtn: {},
  removeText: { fontSize: 14, fontWeight: "600", color: "#EF4444" },
  needsInfo: {
    padding: s[4],
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 0,
  },
  needsInfoText: { fontSize: 14, color: "#92400E", lineHeight: 22 },
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
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
});
