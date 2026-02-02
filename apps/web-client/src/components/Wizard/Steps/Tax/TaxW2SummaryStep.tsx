import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { H3, Text, spacing, Spacer, Stack } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  AlertCircle,
  Edit3,
  Building2,
  User,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import type { TaxIntakeData } from "../../../../types/taxIntake";

const s = spacing;

interface TaxW2SummaryStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
  w2Index: number;
  subStep: "employer_employee" | "federal" | "state_local";
  onNext: () => void;
}

function SummaryRow({
  label,
  value,
  isMonetary = false,
}: {
  label: string;
  value?: string | number;
  isMonetary?: boolean;
}) {
  if (value == null || value === "") return null;
  const displayValue =
    isMonetary && typeof value === "number"
      ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      : String(value);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{displayValue}</Text>
    </View>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Icon size={16} color="#2563EB" />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

export function TaxW2SummaryStep({
  data,
  onChange,
  w2Index,
  subStep,
  onNext,
}: TaxW2SummaryStepProps) {
  const { t } = useTranslation();
  const w2 = data.w2Uploads?.[w2Index];
  const detected = w2?.detected;

  const handleEdit = () => {
    const nextUploads = [...(data.w2Uploads ?? [])];
    if (nextUploads[w2Index]) {
      nextUploads[w2Index] = { ...nextUploads[w2Index], manualReview: true };
      onChange({ w2Uploads: nextUploads });
    }
  };

  const handleConfirm = () => {
    // If this is the last subStep (state_local), mark as confirmed
    const nextUploads = [...(data.w2Uploads ?? [])];
    if (nextUploads[w2Index]) {
      const isLast = subStep === "state_local";
      nextUploads[w2Index] = {
        ...nextUploads[w2Index],
        confirmed: isLast ? true : nextUploads[w2Index].confirmed,
        manualReview: false,
      };
      onChange({ w2Uploads: nextUploads });
    }
    onNext();
  };

  if (!w2 || !detected) {
    return (
      <View style={styles.errorState}>
        <AlertCircle size={48} color="#EF4444" />
        <Spacer size="md" />
        <Text style={styles.errorText}>
          {t("tax_wizard.w2_confirm.no_data")}
        </Text>
      </View>
    );
  }

  const renderSection = () => {
    switch (subStep) {
      case "employer_employee":
        return (
          <SectionCard
            title={t("tax_wizard.w2_summary.employer_employee")}
            icon={User}
          >
            <SummaryRow
              label={t("tax_wizard.w2_verify.employer_name")}
              value={detected.employerName}
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.employer_ein")}
              value={detected.employerEin}
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.employer_address")}
              value={detected.employerAddress}
            />
            <View style={styles.divider} />
            <SummaryRow
              label={t("tax_wizard.w2_verify.employee_name")}
              value={detected.taxpayerName}
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.employee_ssn")}
              value={detected.taxpayerSsnMasked}
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.employee_address")}
              value={detected.address}
            />
          </SectionCard>
        );
      case "federal":
        return (
          <SectionCard
            title={t("tax_wizard.w2_summary.federal_info")}
            icon={Landmark}
          >
            <SummaryRow
              label={t("tax_wizard.w2_verify.box1")}
              value={detected.wages}
              isMonetary
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.box2")}
              value={detected.federalWithholding}
              isMonetary
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.box3")}
              value={detected.socialSecurityWages}
              isMonetary
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.box4")}
              value={detected.socialSecurityWithheld}
              isMonetary
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.box5")}
              value={detected.medicareWages}
              isMonetary
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.box6")}
              value={detected.medicareWithheld}
              isMonetary
            />
          </SectionCard>
        );
      case "state_local":
        return (
          <SectionCard
            title={t("tax_wizard.w2_summary.state_info")}
            icon={Building2}
          >
            <SummaryRow
              label={t("tax_wizard.w2_verify.box15_code")}
              value={detected.stateCode}
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.box15_id")}
              value={detected.stateIdNumber}
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.box16")}
              value={detected.stateWages}
              isMonetary
            />
            <SummaryRow
              label={t("tax_wizard.w2_verify.box17")}
              value={detected.stateWithholding}
              isMonetary
            />
          </SectionCard>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (subStep) {
      case "employer_employee":
        return t("tax_wizard.w2_summary.employer_employee");
      case "federal":
        return t("tax_wizard.w2_summary.federal_info");
      case "state_local":
        return t("tax_wizard.w2_summary.state_info");
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Stack gap="xl">
        <View style={styles.header}>
          <H3 style={styles.title}>
            {getStepTitle()} ({w2Index + 1})
          </H3>
          <Spacer size="xs" />
          <Text style={styles.desc}>
            {t("tax_wizard.w2_summary.description")}
          </Text>
        </View>

        {renderSection()}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <Edit3 size={18} color="#475569" />
            <Text style={styles.editBtnText}>
              {t("tax_wizard.w2_summary.edit_data")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.7}
          >
            <CheckCircle size={18} color="#FFF" />
            <Text style={styles.confirmBtnText}>
              {t("tax_wizard.w2_summary.confirm_continue")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityHint}>
          <ShieldCheck size={14} color="#059669" />
          <Text style={styles.securityText}>
            {t("tax_wizard.w2_upload.secure_analysis")}
          </Text>
        </View>
        <Spacer size="xl" />
      </Stack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: s[10] },
  header: { paddingHorizontal: s[2] },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  desc: { fontSize: 15, color: "#64748B", lineHeight: 22 },
  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[3],
    padding: s[5],
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardBody: { padding: s[5], gap: s[2] },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: s[3],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexWrap: "wrap",
    gap: s[2],
  },
  label: { fontSize: 14, color: "#64748B", fontWeight: "500", minWidth: 120 },
  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
    flex: 1,
    minWidth: 150,
  },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: s[3] },
  actions: {
    flexDirection: "row",
    gap: s[4],
    marginTop: s[4],
    paddingHorizontal: s[2],
  },
  editBtn: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s[2],
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    backgroundColor: "#FFF",
  },
  editBtnText: { color: "#475569", fontWeight: "700", fontSize: 15 },
  confirmBtn: {
    flex: 2,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s[2],
    backgroundColor: "#2563EB",
    borderRadius: 0,
  },
  confirmBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  errorState: {
    alignItems: "center",
    justifyContent: "center",
    padding: s[10],
    backgroundColor: "#FEF2F2",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    fontSize: 16,
    color: "#991B1B",
    textAlign: "center",
    fontWeight: "500",
  },
  securityHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    opacity: 0.6,
    marginTop: s[4],
  },
  securityText: { fontSize: 12, color: "#059669", fontWeight: "600" },
});
