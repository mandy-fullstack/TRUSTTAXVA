import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Text } from "@trusttax/ui";
import { MessageSquare, Check, AlertCircle, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import * as api from "../services/api";

interface SMSOptInProps {
  onSuccess?: () => void;
  variant?: "default" | "compact" | "inline";
  showPhoneInput?: boolean;
}

export const SMSOptIn = ({
  onSuccess,
  variant = "default",
  showPhoneInput = false,
}: SMSOptInProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [phone, setPhone] = useState(user?.phone || "");
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOptIn = async () => {
    if (!consented) {
      setError(
        t("sms.consent_required", "You must consent to receive SMS messages"),
      );
      return;
    }

    if (showPhoneInput && !phone) {
      setError(t("sms.phone_required", "Phone number is required"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.optInSMS(phone || user?.phone || "");
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(
        err.message ||
          t("sms.opt_in_error", "Failed to opt-in to SMS messages"),
      );
    } finally {
      setLoading(false);
    }
  };

  const openConsentPage = () => {
    Linking.openURL("/legal/sms-consent").catch((err) =>
      console.error("Couldn't open consent page", err),
    );
  };

  if (variant === "compact") {
    return (
      <View style={styles.compactContainer}>
        {success ? (
          <View style={styles.successBox}>
            <Check size={16} color="#059669" />
            <Text style={styles.successText}>
              {t("sms.opt_in_success", "Successfully opted in to SMS messages")}
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.compactCheckbox}
              onPress={() => setConsented(!consented)}
            >
              <View
                style={[styles.checkbox, consented && styles.checkboxActive]}
              >
                {consented && (
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                )}
              </View>
              <Text style={styles.compactLabel}>
                {t("sms.consent_label", "I consent to receive SMS messages")}
              </Text>
            </TouchableOpacity>
            {showPhoneInput && (
              <TextInput
                style={styles.phoneInput}
                placeholder={t("sms.phone_placeholder", "Phone number")}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            )}
            {error && (
              <View style={styles.errorBox}>
                <AlertCircle size={14} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.compactButton, loading && styles.buttonDisabled]}
              onPress={handleOptIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.compactButtonText}>
                  {t("sms.opt_in_button", "Opt In")}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openConsentPage}
              style={styles.consentLink}
            >
              <Text style={styles.linkText}>
                {t("sms.read_consent", "Read SMS Consent Policy")}
              </Text>
              <ExternalLink size={12} color="#2563EB" />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  if (variant === "inline") {
    return (
      <View style={styles.inlineContainer}>
        <TouchableOpacity
          style={styles.inlineCheckbox}
          onPress={() => setConsented(!consented)}
        >
          <View style={[styles.checkbox, consented && styles.checkboxActive]}>
            {consented && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <Text style={styles.inlineLabel}>
            {t("sms.consent_label", "I consent to receive SMS messages")}
          </Text>
        </TouchableOpacity>
        {consented && (
          <TouchableOpacity
            style={styles.inlineButton}
            onPress={handleOptIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <MessageSquare size={14} color="#2563EB" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default variant
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <MessageSquare size={24} color="#2563EB" />
        </View>
        <Text style={styles.title}>
          {t("sms.opt_in_title", "Opt-In to SMS Messages")}
        </Text>
        <Text style={styles.subtitle}>
          {t(
            "sms.opt_in_subtitle",
            "Receive important updates, reminders, and notifications via text message",
          )}
        </Text>
      </View>

      {success ? (
        <View style={styles.successContainer}>
          <View style={styles.successIconBox}>
            <Check size={32} color="#059669" />
          </View>
          <Text style={styles.successTitle}>
            {t("sms.opt_in_success_title", "Successfully Opted In!")}
          </Text>
          <Text style={styles.successMessage}>
            {t(
              "sms.opt_in_success_message",
              "You will now receive SMS messages from us. You can opt-out at any time by replying STOP to any message or updating your preferences in account settings.",
            )}
          </Text>
        </View>
      ) : (
        <>
          {showPhoneInput && (
            <View style={styles.inputSection}>
              <Text style={styles.label}>
                {t("sms.phone_label", "Phone Number")}
              </Text>
              <TextInput
                style={styles.phoneInput}
                placeholder={t(
                  "sms.phone_placeholder",
                  "Enter your phone number",
                )}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>
          )}

          <View style={styles.consentSection}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setConsented(!consented)}
            >
              <View
                style={[styles.checkbox, consented && styles.checkboxActive]}
              >
                {consented && (
                  <Check size={18} color="#FFFFFF" strokeWidth={3} />
                )}
              </View>
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxLabel}>
                  {t(
                    "sms.consent_full",
                    "I consent to receive SMS messages from {companyName} and have read the SMS Consent Policy",
                    { companyName: "TrustTax" },
                  )}
                </Text>
                <TouchableOpacity onPress={openConsentPage}>
                  <Text style={styles.consentLinkText}>
                    {t("sms.read_consent_policy", "Read SMS Consent Policy")}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.optInButton, loading && styles.buttonDisabled]}
            onPress={handleOptIn}
            disabled={loading || !consented}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MessageSquare size={20} color="#FFFFFF" />
                <Text style={styles.optInButtonText}>
                  {t("sms.opt_in_button_full", "Opt-In to SMS Messages")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {t(
                "sms.info",
                "Message and data rates may apply. You can opt-out at any time by replying STOP. Supported by major U.S. carriers.",
              )}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    maxWidth: 600,
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 0,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  consentSection: {
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
    marginBottom: 4,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  consentLinkText: {
    fontSize: 13,
    color: "#2563EB",
    textDecorationLine: "underline",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  errorContainer: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#991B1B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  optInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 0,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  optInButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  infoBox: {
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    textAlign: "center",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  successContainer: {
    alignItems: "center",
    padding: 24,
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 8,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  successMessage: {
    fontSize: 15,
    color: "#334155",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  // Compact variant
  compactContainer: {
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  compactCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  compactLabel: {
    fontSize: 13,
    color: "#334155",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  compactButton: {
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 0,
    alignItems: "center",
    marginBottom: 8,
  },
  compactButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  successText: {
    fontSize: 13,
    color: "#065F46",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    backgroundColor: "#FEF2F2",
    marginBottom: 8,
  },
  consentLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  linkText: {
    fontSize: 12,
    color: "#2563EB",
    textDecorationLine: "underline",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  // Inline variant
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  inlineLabel: {
    fontSize: 13,
    color: "#334155",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  inlineButton: {
    padding: 6,
    borderRadius: 0,
  },
});
