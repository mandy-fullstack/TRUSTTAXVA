import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Card, H3, Text } from "@trusttax/ui";
import { Lock } from "lucide-react";
import { ProfileSSNOrITIN } from "../ProfileSSNOrITIN";

interface StepTaxIdProps {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: Set<string>;
  clearError: (field: string) => void;
  onLoadDecryptedSSN: () => Promise<string | null>;
  user: any;
}

export const StepTaxId = ({
  data,
  onChange,
  errors,
  clearError,
  onLoadDecryptedSSN,
  user,
}: StepTaxIdProps) => {
  const { t } = useTranslation();

  const handleChange = (field: string, value: any) => {
    onChange(field, value);
    clearError(field);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Lock size={20} color="#2563EB" />
          </View>
          <H3>{t("profile.tax_id", "SSN or ITIN")}</H3>
        </View>

        <View style={styles.securityNoteContainer}>
          <Lock size={14} color="#64748B" />
          <Text style={styles.securityNote}>
            {t(
              "profile.encryption_note",
              "All sensitive information is encrypted using AES-256-GCM encryption before storage.",
            )}
          </Text>
        </View>

        <View style={styles.content}>
          <ProfileSSNOrITIN
            taxIdType={data.taxIdType}
            value={data.ssn || ""}
            onChangeType={(t) => handleChange("taxIdType", t)}
            onChangeValue={(v) => handleChange("ssn", v)}
            ssnMasked={user?.ssnMasked}
            onLoadDecrypted={onLoadDecryptedSSN}
            hasError={errors.has("ssn")}
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  card: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  securityNoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  securityNote: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
  },
  content: {
    gap: 16,
  },
});
