import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Button, Text } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

interface Step4Props {
  onSubmit: (data: any) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const Step4Authorization: React.FC<Step4Props> = ({
  onSubmit,
  onBack,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.mission}>
        <ScrollView
          style={styles.legalBox}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.legalTitle}>
            {t(
              "profile_wizard.step4.agreement_title",
              "MASTER SERVICE AGREEMENT v2.0",
            )}
          </Text>
          <Text style={styles.legalBody}>
            {t(
              "profile_wizard.step4.agreement_date",
              "Last Updated: January 2026",
            )}
            {"\n\n"}
            {t(
              "profile_wizard.step4.agreement_body_1",
              "1. DATA PRIVACY & SECURITY\nTrustTax uses high-priority AES-256-GCM encryption for all PII. By proceeding, you authorize the secure storage of your identification documents.",
            )}
            {"\n\n"}
            {t(
              "profile_wizard.step4.agreement_body_2",
              "2. IRS COMPLIANCE\nYou certify that all information provided—including identity, birth, and origin records—is accurate and truthful.",
            )}
            {"\n\n"}
            {t(
              "profile_wizard.step4.agreement_body_3",
              "3. ELECTRONIC SIGNATURE\nBy activating your profile, you agree to conduct transactions electronically and acknowledge that your digital acceptance carries full legal weight.",
            )}
          </Text>
        </ScrollView>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.8}
        >
          <View style={[styles.check, accepted && styles.checkActive]}>
            {accepted && <Check size={24} color="#FFFFFF" strokeWidth={4} />}
          </View>
          <Text style={styles.checkLabel}>
            {t(
              "profile_wizard.step4.accept_label",
              "I ACCEPT THE PRIVACY PROTOCOLS AND SECURE ACTIVATION.",
            )}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={() => onSubmit({ acceptTerms: true })}
          disabled={!accepted || isSubmitting}
          loading={isSubmitting}
          style={styles.btn}
          textStyle={styles.btnText}
        >
          {isSubmitting
            ? t("profile_wizard.step4.activating", "SECURELY ACTIVATING...")
            : t("profile_wizard.step4.activate", "ACTIVATE DEPLOYMENT")}
        </Button>
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>
            {t("profile_wizard.common.retract_step", "RETRACT STEP")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  mission: {
    marginBottom: 56,
  },
  legalBox: {
    height: 200,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: 24,
    marginBottom: 40,
    borderRadius: 0,
  },
  legalTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: "Inter",
  },
  legalBody: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "Inter",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  check: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: "#0F172A",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: {
    backgroundColor: "#0F172A",
  },
  checkLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 1.2,
    lineHeight: 18,
    fontFamily: "Inter",
  },
  footer: {
    gap: 16,
  },
  btn: {
    height: 52, // Standard height
    backgroundColor: "#0F172A",
    borderRadius: 0,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#FFFFFF",
    fontFamily: "Inter",
  },
  back: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
    fontFamily: "Inter",
  },
});
