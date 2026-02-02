import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Text, H1 } from "@trusttax/ui";
import { PublicLayout } from "../../components/PublicLayout";
import { PageMeta } from "../../components/PageMeta";
import { SMSOptIn } from "../../components/SMSOptIn";
import { useCompany } from "../../context/CompanyContext";
import { MessageSquare, CheckCircle } from "lucide-react";

export const SMSConsentTestPage = () => {
  const { t } = useTranslation();
  const { profile } = useCompany();
  const companyName = profile?.companyName || "TrustTax";

  return (
    <PublicLayout>
      <PageMeta
        title={t("legal.sms_test.title", {
          companyName,
          defaultValue: `SMS Consent Test | ${companyName}`,
        })}
        description={t(
          "legal.sms_test.description",
          "Test and verify your SMS consent status.",
        )}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <MessageSquare size={32} color="#2563EB" />
          </View>
          <H1 style={styles.title}>
            {t("legal.sms_test.page_title", "SMS Consent Test")}
          </H1>
          <Text style={styles.subtitle}>
            {t(
              "legal.sms_test.subtitle",
              "Verify your SMS consent status and opt-in to receive text messages",
            )}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <CheckCircle size={20} color="#059669" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                {t("legal.sms_test.info_title", "About SMS Consent")}
              </Text>
              <Text style={styles.infoText}>
                {t(
                  "legal.sms_test.info_text",
                  "By opting in to SMS messages, you consent to receive important updates, reminders, and notifications via text message. You can opt-out at any time by replying STOP to any message.",
                )}
              </Text>
            </View>
          </View>

          <View style={styles.optInSection}>
            <SMSOptIn variant="default" showPhoneInput={true} />
          </View>

          <View style={styles.linksSection}>
            <Text style={styles.linksTitle}>
              {t("legal.sms_test.related_links", "Related Information")}
            </Text>
            <View style={styles.linksList}>
              {/* eslint-disable-next-line react-native/no-inline-styles */}
              <a href="/legal/sms-consent" style={styles.link as any}>
                {t("legal.sms_consent.title", "SMS Consent Policy")}
              </a>
              {/* eslint-disable-next-line react-native/no-inline-styles */}
              <a href="/legal/privacy" style={styles.link as any}>
                {t("legal.privacy_policy", "Privacy Policy")}
              </a>
              {/* eslint-disable-next-line react-native/no-inline-styles */}
              <a href="/legal/terms" style={styles.link as any}>
                {t("legal.terms_of_service", "Terms of Service")}
              </a>
            </View>
          </View>
        </View>
      </View>
    </PublicLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  content: {
    gap: 24,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 4,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#047857",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  optInSection: {
    width: "100%",
  },
  linksSection: {
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  linksTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  linksList: {
    gap: 8,
  },
  link: {
    fontSize: 14,
    color: "#2563EB",
    textDecorationLine: "underline",
    marginBottom: 8,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  } as any,
});
