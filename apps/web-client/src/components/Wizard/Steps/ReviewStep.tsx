import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { H3, Text, Card, spacing, Spacer, Stack } from "@trusttax/ui";
import {
  CheckCircle2,
  FileText,
  ClipboardCheck,
  FileStack,
  Shield,
} from "lucide-react";

interface ReviewStepProps {
  formData: any;
  docData: any;
  serviceName: string;
}

export const ReviewStep = ({
  formData,
  docData,
  serviceName,
}: ReviewStepProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <Stack gap="xl">
        <View>
          <H3>{t("wizard.review_submit")}</H3>
          <Spacer size="sm" />
          <Text style={styles.desc}>{t("wizard.review_description")}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.titleWithIcon}>
            <ClipboardCheck size={18} color="#0F172A" />
            <Text style={styles.sectionTitle}>
              {t("wizard.service_details")}
            </Text>
          </View>
          <Spacer size="xs" />
          <Card style={styles.card}>
            <View style={styles.rowNoBorder}>
              <Text style={styles.label}>{t("wizard.service_type")}</Text>
              <Text style={styles.value}>{serviceName}</Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.titleWithIcon}>
            <FileStack size={18} color="#0F172A" />
            <Text style={styles.sectionTitle}>
              {t("wizard.intake_information")}
            </Text>
          </View>
          <Spacer size="xs" />
          <Card style={styles.card}>
            {Object.keys(formData).length > 0 ? (
              Object.entries(formData).map(([key, val], idx, arr) => (
                <View
                  key={key}
                  style={[
                    styles.row,
                    idx === arr.length - 1 && { borderBottomWidth: 0 },
                    isMobile && styles.mobileRow,
                  ]}
                >
                  <Text style={styles.label}>
                    {key.replace(/([A-Z])/g, " $1")}
                  </Text>
                  <Text style={styles.value}>{String(val)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>{t("wizard.no_information")}</Text>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.titleWithIcon}>
            <FileText size={18} color="#0F172A" />
            <Text style={styles.sectionTitle}>{t("wizard.documents")}</Text>
          </View>
          <Spacer size="xs" />
          <Card style={styles.card}>
            {Object.keys(docData).length > 0 ? (
              Object.entries(docData).map(([key], idx, arr) => (
                <View
                  key={key}
                  style={[
                    styles.row,
                    idx === arr.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <FileText size={16} color="#64748B" />
                    <Text style={styles.label}>{key}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <CheckCircle2 size={14} color="#10B981" />
                    <Text
                      style={{
                        color: "#10B981",
                        fontSize: 13,
                        fontWeight: "700",
                      }}
                    >
                      {t("wizard.attached").toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>{t("wizard.no_documents")}</Text>
            )}
          </Card>
        </View>

        <View
          style={[
            styles.policies,
            {
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              gap: 16,
            },
          ]}
        >
          <Shield size={24} color="#2563EB" />
          <Text style={styles.policyText}>{t("wizard.policy_text")}</Text>
        </View>
      </Stack>
    </ScrollView>
  );
};

const s = spacing;
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  desc: { fontSize: 16, color: "#64748B", lineHeight: 24 },
  section: {},
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#FFF",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    padding: s[4],
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: s[3],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rowNoBorder: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mobileRow: { flexDirection: "column", alignItems: "flex-start", gap: 4 },
  label: { color: "#64748B", fontSize: 14, textTransform: "capitalize" },
  value: { color: "#0F172A", fontWeight: "700", fontSize: 14 },
  empty: { fontStyle: "italic", color: "#94A3B8" },
  policies: {
    padding: s[6],
    backgroundColor: "#EFF6FF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  policyText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
    textAlign: "left",
  },
});
