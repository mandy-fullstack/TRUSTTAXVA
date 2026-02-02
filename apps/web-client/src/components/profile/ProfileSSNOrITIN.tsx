import { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@trusttax/ui";
import { CreditCard, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MaskedInput } from "./MaskedInput";

export type TaxIdType = "SSN" | "ITIN";

interface ProfileSSNOrITINProps {
  taxIdType: TaxIdType;
  value: string;
  onChangeType: (t: TaxIdType) => void;
  onChangeValue: (v: string) => void;
  ssnMasked?: string | null;
  onLoadDecrypted?: () => Promise<string | null>; // Función async que carga el valor descifrado
  hasError?: boolean; // Indica si hay un error de validación
}

export const ProfileSSNOrITIN = ({
  taxIdType,
  value,
  onChangeType,
  onChangeValue,
  ssnMasked,
  onLoadDecrypted,
  hasError = false,
}: ProfileSSNOrITINProps) => {
  const { t } = useTranslation();
  const [showWhy, setShowWhy] = useState(false);

  const formatDigits = (raw: string): string => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 5)
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  const handleChange = (v: string) => {
    onChangeValue(formatDigits(v));
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {t("profile.tax_id", "Social Security Number (SSN) or ITIN")}
          <Text style={styles.requiredAsterisk}> *</Text>
        </Text>
        <TouchableOpacity
          onPress={() => setShowWhy(!showWhy)}
          style={styles.whyButton}
          activeOpacity={0.7}
        >
          <HelpCircle size={16} color="#2563EB" />
          <Text style={styles.whyText}>
            {t("profile.why_we_need", "Why we need this")}
          </Text>
          {showWhy ? (
            <ChevronUp size={16} color="#64748B" />
          ) : (
            <ChevronDown size={16} color="#64748B" />
          )}
        </TouchableOpacity>
      </View>

      {showWhy && (
        <View style={styles.whyBox}>
          <Text style={styles.whyTitle}>
            {t("profile.why_ssn_title", "Why we ask for SSN or ITIN")}
          </Text>
          <Text style={styles.whyBody}>
            {t(
              "profile.why_ssn_body",
              "We use your Social Security Number (SSN) or Individual Taxpayer Identification Number (ITIN) solely for preparing and filing your tax returns with the IRS. This information is required by law for U.S. tax compliance. We encrypt it using AES-256-GCM before storage and never share it with third parties except as required for filing.",
            )}
          </Text>
        </View>
      )}

      {/* Type selector */}
      <View style={styles.typeRow}>
        {(["SSN", "ITIN"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeOption,
              taxIdType === type && styles.typeOptionActive,
            ]}
            onPress={() => onChangeType(type)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.typeText,
                taxIdType === type && styles.typeTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.inputRow, hasError && styles.inputRowError]}>
        <CreditCard size={18} color={hasError ? "#DC2626" : "#64748B"} />
        <MaskedInput
          value={value}
          onChange={handleChange}
          placeholder={taxIdType === "SSN" ? "XXX-XX-XXXX" : "XXX-XX-XXXX"}
          maskType="ssn"
          maxLength={11}
          keyboardType="numeric"
          formatValue={formatDigits}
          inline
          maskedDisplay={ssnMasked || null}
          onLoadDecrypted={onLoadDecrypted}
          hasError={hasError}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20, width: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#334155" },
  requiredAsterisk: { color: "#DC2626" },
  whyButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  whyText: { fontSize: 13, color: "#2563EB", fontWeight: "500" },
  whyBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 14,
    marginBottom: 12,
    borderRadius: 0,
  },
  whyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 6,
  },
  whyBody: { fontSize: 13, color: "#1E3A8A", lineHeight: 20 },
  typeRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  typeOption: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
  },
  typeOptionActive: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  typeText: { fontSize: 14, fontWeight: "500", color: "#64748B" },
  typeTextActive: { color: "#2563EB" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
  },
  inputRowError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  hint: { fontSize: 12, color: "#94A3B8", marginTop: 4 },
});
