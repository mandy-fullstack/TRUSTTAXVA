import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Platform,
} from "react-native";
import { H3, Text, spacing, Spacer, Stack } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { SquareSwitch } from "../../../SquareSwitch";
import type { TaxIntakeData, FilingStatus } from "../../../../types/taxIntake";
import { useState } from "react";

const s = spacing;

const TAX_YEARS = [2025, 2024, 2023] as const;

interface TaxFilingStatusStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
}

export function TaxFilingStatusStep({
  data,
  onChange,
}: TaxFilingStatusStepProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const taxYear = data.taxYear ?? new Date().getFullYear();
  const filingStatus = data.filingStatus ?? "";
  const filingWithSpouse = data.filingWithSpouse ?? "";
  const paidOver50 = data.paidOver50PercentHousehold ?? false;
  const hasQualifyingDep = data.hasQualifyingDependent ?? false;
  const claimableAsDep = data.claimableAsDependent ?? "";

  // Estado local para foco de inputs
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const set = (patch: Partial<TaxIntakeData>) => onChange(patch);

  const showSpouse =
    filingStatus === "Married Filing Jointly" ||
    filingStatus === "Married Filing Separately";
  const showHoH = filingStatus === "Head of Household";

  const FILING_STATUSES: { value: FilingStatus; labelKey: string }[] = [
    { value: "Single", labelKey: "filing_status_single" },
    { value: "Married Filing Jointly", labelKey: "filing_status_mfj" },
    { value: "Married Filing Separately", labelKey: "filing_status_mfs" },
    { value: "Head of Household", labelKey: "filing_status_hoh" },
    { value: "Qualifying Surviving Spouse", labelKey: "filing_status_qss" },
  ];

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  // Helper para formato SSN
  const formatSSN = (val: string) => {
    // Eliminar no numéricos
    const cleaned = val.replace(/\D/g, "");
    // Aplicar formato XXX-XX-XXXX
    const match = cleaned.match(/^(\d{0,3})(\d{0,2})(\d{0,4})$/);
    if (match) {
      return !match[2]
        ? match[1]
        : `${match[1]}-${match[2]}${match[3] ? `-${match[3]}` : ""}`;
    }
    return val;
  };

  return (
    <Stack gap="xl">
      <View>
        <H3>{t("tax_wizard.filing_status.title")}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t("tax_wizard.filing_status.description")}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("tax_wizard.filing_status.tax_year")}
        </Text>
        <View style={styles.selectWrap}>
          <select
            value={taxYear}
            onChange={(e) => set({ taxYear: Number(e.target.value) })}
            style={styles.select as any}
          >
            {TAX_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("tax_wizard.filing_status.filing_status")}
        </Text>
        <Spacer size="sm" />
        <View style={styles.options}>
          {FILING_STATUSES.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.option,
                filingStatus === opt.value && styles.optionActive,
              ]}
              onPress={() =>
                set({
                  filingStatus: opt.value as FilingStatus,
                  filingWithSpouse: "",
                })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  filingStatus === opt.value && styles.optionTextActive,
                ]}
              >
                {t(`tax_wizard.filing_status.${opt.labelKey}`)}
              </Text>
              {filingStatus === opt.value && (
                <Check size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showSpouse && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("tax_wizard.filing_status.filing_with_spouse")}
          </Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                filingWithSpouse === "yes" && styles.toggleBtnActive,
              ]}
              onPress={() => set({ filingWithSpouse: "yes" })}
            >
              <Text
                style={[
                  styles.toggleText,
                  filingWithSpouse === "yes" && styles.toggleTextActive,
                ]}
              >
                {t("tax_wizard.filing_status.filing_with_spouse_yes")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                filingWithSpouse === "no" && styles.toggleBtnActive,
              ]}
              onPress={() => set({ filingWithSpouse: "no" })}
            >
              <Text
                style={[
                  styles.toggleText,
                  filingWithSpouse === "no" && styles.toggleTextActive,
                ]}
              >
                {t("tax_wizard.filing_status.filing_with_spouse_no")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showHoH && (
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {t("tax_wizard.filing_status.paid_over_50")}
            </Text>
            <SquareSwitch
              value={paidOver50}
              onValueChange={(v) => set({ paidOver50PercentHousehold: v })}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {t("tax_wizard.filing_status.has_qualifying_dep")}
            </Text>
            <SquareSwitch
              value={hasQualifyingDep}
              onValueChange={(v) => set({ hasQualifyingDependent: v })}
            />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("tax_wizard.filing_status.claimable_as_dependent")}
        </Text>
        <View style={styles.toggleRow}>
          {(["yes", "no", ""] as const).map((v) => (
            <TouchableOpacity
              key={v || "unknown"}
              style={[
                styles.toggleBtn,
                claimableAsDep === v && styles.toggleBtnActive,
              ]}
              onPress={() => set({ claimableAsDependent: v || "" })}
            >
              <Text
                style={[
                  styles.toggleText,
                  claimableAsDep === v && styles.toggleTextActive,
                ]}
              >
                {v === "yes"
                  ? t("tax_wizard.filing_status.claimable_yes")
                  : v === "no"
                    ? t("tax_wizard.filing_status.claimable_no")
                    : t("tax_wizard.filing_status.claimable_unknown")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filingStatus === "Married Filing Jointly" && (
        <Stack gap="lg" style={styles.spouseSection}>
          <View style={styles.spouseHeader}>
            <H3 style={{ color: "#0F172A" }}>{t("tax_wizard.spouse.title")}</H3>
            <Text style={styles.descSmall}>
              {t("tax_wizard.spouse.description")}
            </Text>
          </View>

          <View style={[styles.row, isMobile && styles.col]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelSmall}>
                {t("tax_wizard.spouse.first_name")}
              </Text>
              <TextInput
                style={inputStyle("s_firstName")}
                value={data.spouseInfo?.firstName || ""}
                onChangeText={(v) =>
                  onChange({
                    spouseInfo: {
                      ...data.spouseInfo!,
                      firstName: v.toUpperCase(),
                    },
                  })
                }
                placeholder="JOHN"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                onFocus={() => setFocusedField("s_firstName")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelSmall}>
                {t("tax_wizard.spouse.last_name")}
              </Text>
              <TextInput
                style={inputStyle("s_lastName")}
                value={data.spouseInfo?.lastName || ""}
                onChangeText={(v) =>
                  onChange({
                    spouseInfo: {
                      ...data.spouseInfo!,
                      lastName: v.toUpperCase(),
                    },
                  })
                }
                placeholder="DOE"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                onFocus={() => setFocusedField("s_lastName")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={[styles.row, isMobile && styles.col]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelSmall}>
                {t("tax_wizard.spouse.ssn")}
              </Text>
              <TextInput
                style={inputStyle("s_ssn")}
                value={data.spouseInfo?.ssn || ""}
                onChangeText={(v) =>
                  onChange({
                    spouseInfo: { ...data.spouseInfo!, ssn: formatSSN(v) },
                  })
                }
                placeholder="000-00-0000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={11}
                onFocus={() => setFocusedField("s_ssn")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelSmall}>
                {t("tax_wizard.spouse.dob")}
              </Text>
              <TextInput
                style={inputStyle("s_dob")}
                value={data.spouseInfo?.dateOfBirth || ""}
                onChangeText={(v) =>
                  onChange({
                    spouseInfo: { ...data.spouseInfo!, dateOfBirth: v },
                  })
                }
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#94A3B8"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                onFocus={() => setFocusedField("s_dob")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View>
            <Text style={styles.labelSmall}>
              {t("tax_wizard.spouse.occupation")}
            </Text>
            <TextInput
              style={inputStyle("s_occupation")}
              value={data.spouseInfo?.occupation || ""}
              onChangeText={(v) =>
                onChange({
                  spouseInfo: {
                    ...data.spouseInfo!,
                    occupation: v.toUpperCase(),
                  },
                })
              }
              placeholder="CONSULTANT"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              onFocus={() => setFocusedField("s_occupation")}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </Stack>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 16, color: "#64748B", lineHeight: 24 },
  descSmall: { fontSize: 13, color: "#64748B", lineHeight: 18, marginTop: 4 },
  section: { gap: s[2] },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    paddingHorizontal: s[4],
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#FFF",
    ...Platform.select({
      web: {
        outlineStyle: "none",
        transition: "border-color 0.2s ease",
      } as any,
    }),
  },
  inputFocused: {
    borderColor: "#2563EB",
    ...Platform.select({
      web: { boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.1)" } as any,
    }),
  },
  selectWrap: { width: "100%" },
  select: {
    width: "100%",
    height: 48,
    paddingHorizontal: s[4],
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
    color: "#0F172A",
    ...Platform.select({
      web: { appearance: "none" } as any,
    }),
  },
  options: { flexDirection: "column", gap: s[2] },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  optionText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  optionTextActive: { color: "#FFF" },
  toggleRow: { flexDirection: "row", gap: s[3], flexWrap: "wrap" },
  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
  },
  toggleBtnActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  toggleText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  toggleTextActive: { color: "#FFF" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: s[3],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: s[4],
  },
  switchLabel: { fontSize: 14, color: "#334155", flex: 1, fontWeight: "500" },
  spouseSection: {
    backgroundColor: "#F8FAFC",
    padding: s[5],
    borderRadius: 0,
    marginTop: s[2],
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  spouseHeader: { marginBottom: s[4] },
  row: { flexDirection: "row", gap: s[4] },
  col: { flexDirection: "column", gap: s[4] },
});
