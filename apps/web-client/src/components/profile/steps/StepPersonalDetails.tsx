import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Card, H3, Text } from "@trusttax/ui";
import { User, AlertTriangle } from "lucide-react";
import { RequiredLabel } from "../RequiredLabel";
import { EditableTextInput } from "../EditableTextInput";
import { DatePicker } from "../DatePicker";
import { CountrySelect } from "../CountrySelect";
import { PrimaryLanguageSelect } from "../PrimaryLanguageSelect";

interface StepPersonalDetailsProps {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Set<string>;
  clearError: (field: string) => void;
}

export const StepPersonalDetails = ({
  data,
  onChange,
  errors,
  clearError,
}: StepPersonalDetailsProps) => {
  const { t } = useTranslation();

  const handleChange = (field: string, value: any) => {
    onChange(field, value);
    clearError(field);
  };

  return (
    <View style={styles.container}>
      {/* Compliance Alert */}
      <View style={styles.complianceAlert}>
        <View style={styles.alertIconBox}>
          <AlertTriangle size={24} color="#B45309" />
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>
            {t("profile.legal_compliance_title", "Legal Compliance Notice")}
          </Text>
          <Text style={styles.alertText}>
            {t(
              "profile.legal_compliance_text",
              "The information provided below will be used for official tax filings and legal documentation. It must match your government-issued ID exactly. Incorrect information may result in processing delays or penalties.",
            )}
          </Text>
        </View>
      </View>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <User size={20} color="#2563EB" />
          </View>
          <H3>{t("profile.personal_info", "Personal Information")}</H3>
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroup}>
            <RequiredLabel required>
              {t("profile.first_name", "First Name")}
            </RequiredLabel>
            <EditableTextInput
              value={data.firstName || ""}
              onChange={(v) => handleChange("firstName", v)}
              placeholder={t(
                "profile.first_name_placeholder",
                "Enter first name",
              )}
              hasError={errors.has("firstName")}
              autoUppercase
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t("profile.middle_name", "Middle Name")}
            </Text>
            <EditableTextInput
              value={data.middleName || ""}
              onChange={(v) => handleChange("middleName", v)}
              placeholder={t(
                "profile.middle_name_placeholder",
                "Enter middle name (optional)",
              )}
              autoUppercase
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.fullWidth]}>
            <RequiredLabel required>
              {t("profile.last_name", "Last Name")}
            </RequiredLabel>
            <EditableTextInput
              value={data.lastName || ""}
              onChange={(v) => handleChange("lastName", v)}
              placeholder={t(
                "profile.last_name_placeholder",
                "Enter last name",
              )}
              hasError={errors.has("lastName")}
              autoUppercase
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.fullWidth]}>
            <DatePicker
              label={t("profile.date_of_birth", "Date of Birth")}
              value={data.dateOfBirth || ""}
              onChange={(v) => handleChange("dateOfBirth", v)}
              placeholder="YYYY-MM-DD"
              required
              maxDate={new Date().toISOString().split("T")[0]}
              hasError={errors.has("dateOfBirth")}
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, minWidth: 200 }]}>
            <CountrySelect
              label={t("profile.country_of_birth", "Country of Birth")}
              required
              value={data.countryOfBirth || ""}
              onChange={(v) =>
                handleChange("countryOfBirth", (v || "").toUpperCase())
              }
              placeholder={t("profile.select_country", "Select country")}
              hasError={errors.has("countryOfBirth")}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, minWidth: 200 }]}>
            <PrimaryLanguageSelect
              label={t("profile.primary_language", "Primary Language")}
              required
              value={data.primaryLanguage || "en"}
              onChange={(v) => handleChange("primaryLanguage", v)}
              hasError={errors.has("primaryLanguage")}
            />
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  complianceAlert: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400E",
  },
  alertText: {
    fontSize: 14,
    color: "#B45309",
    lineHeight: 20,
  },
  card: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  formRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  formGroup: {
    flex: 1,
    minWidth: 200,
    gap: 8,
  },
  fullWidth: {
    minWidth: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
});
