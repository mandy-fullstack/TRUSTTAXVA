import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Button } from "@trusttax/ui";
import { Check } from "lucide-react";

interface Step4Props {
  onSubmit: (data: any) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const Step4TermsAgreement: React.FC<Step4Props> = ({
  onSubmit,
  onBack,
  isSubmitting,
}) => {
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = () => {
    if (!accepted) return;
    onSubmit({
      acceptTerms: true,
      termsVersion: "2026.1",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.legalMission}>
        <ScrollView
          style={styles.legalBox}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.legalTitle}>MASTER SERVICE AGREEMENT</Text>
          <Text style={styles.legalBody}>
            Last Updated: January 2026{"\n\n"}
            1. DATA PRIVACY & SECURITY{"\n"}
            TrustTax uses AES-256-GCM encryption for all PII. By proceeding, you
            authorize the secure storage of your identification documents.
            {"\n\n"}
            2. IRS COMPLIANCE{"\n"}
            You certify that all information provided is accurate and truthful.
            Providing false social security numbers or identity documents may
            result in immediate account termination.{"\n\n"}
            3. ELECTRONIC SIGNATURE{"\n"}
            By activating your profile, you agree to conduct transactions
            electronically and acknowledge that your digital acceptance carries
            the same legal weight as a physical signature.
          </Text>
        </ScrollView>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
            {accepted && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <Text style={styles.checkboxLabel}>
            I ACCEPT THE TERMS OF SERVICE AND AUTHORIZE SECURE ACTIVATION.
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleSubmit}
          disabled={!accepted || isSubmitting}
          loading={isSubmitting}
          style={styles.primaryButton}
          textStyle={styles.buttonText}
        >
          {isSubmitting ? "PROCESSING..." : "COMPLETE ACTIVATION"}
        </Button>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  legalMission: {
    marginBottom: 60,
  },
  legalBox: {
    height: 240,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#0F172A",
    borderRadius: 0,
    padding: 30,
    marginBottom: 40,
  },
  legalTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 2,
    marginBottom: 20,
  },
  legalBody: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 24,
    fontWeight: "500",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 10,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: "#0F172A",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#0F172A",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 1.5,
    lineHeight: 18,
  },
  footer: {
    width: "100%",
    gap: 20,
  },
  primaryButton: {
    height: 72,
    backgroundColor: "#0F172A",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#FFFFFF",
  },
  backButton: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1,
  },
});
