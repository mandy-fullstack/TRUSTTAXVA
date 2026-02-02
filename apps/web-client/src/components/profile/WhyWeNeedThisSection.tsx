import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Text } from "@trusttax/ui";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export const WhyWeNeedThisSection = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <HelpCircle size={20} color="#2563EB" />
        <Text style={styles.triggerText}>
          {t(
            "profile.why_we_need_section_title",
            "Why we need this information",
          )}
        </Text>
        {expanded ? (
          <ChevronUp size={20} color="#64748B" />
        ) : (
          <ChevronDown size={20} color="#64748B" />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <Text style={styles.paragraph}>
            {t(
              "profile.why_section_intro",
              "We collect personal and sensitive information solely to provide accurate tax preparation, e-filing, and immigration-related services. Each field has a specific purpose:",
            )}
          </Text>
          <View style={styles.list}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.item}>
              {t(
                "profile.why_name",
                "Full name (First, Middle, Last): Required by the IRS on tax forms and for identity verification.",
              )}
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.item}>
              {t(
                "profile.why_dob",
                "Date of birth: Used for IRS forms and to prevent identity mix-ups.",
              )}
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.item}>
              {t(
                "profile.why_country_lang",
                "Country of birth & primary language: Helps us tailor your experience and meet certain form requirements.",
              )}
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.item}>
              {t(
                "profile.why_ssn_itin",
                "SSN or ITIN: Required by law for U.S. tax filing. Stored encrypted (AES-256-GCM). Only last 4 digits are shown for verification.",
              )}
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.item}>
              {t(
                "profile.why_dl",
                "Driver's license: Used for identity verification and IRS due diligence. Encrypted at rest.",
              )}
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.item}>
              {t(
                "profile.why_passport",
                "Passport: Used for immigration-related tax services and identity verification. Encrypted at rest.",
              )}
            </Text>
          </View>
          <Text style={[styles.paragraph, styles.closing]}>
            {t(
              "profile.why_closing",
              "By accepting our terms, you agree that this data will be encrypted, stored securely, and used only for the purposes described. We do not sell or share your information.",
            )}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 0,
    overflow: "hidden",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  } as any,
  triggerText: { fontSize: 16, fontWeight: "600", color: "#0F172A", flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 0 },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
    marginBottom: 12,
  },
  list: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  bullet: { fontSize: 14, color: "#64748B", width: 16, textAlign: "center" },
  item: { flex: 1, fontSize: 14, lineHeight: 21, color: "#475569" },
  closing: { marginTop: 8, marginBottom: 0 },
});
