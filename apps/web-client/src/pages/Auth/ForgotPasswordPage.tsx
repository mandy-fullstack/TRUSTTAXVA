import { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigate } from "react-router-dom";
import { Text, H3 } from "@trusttax/ui";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showAlert } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      showAlert({
        title: t("common.error"),
        message: t("auth.email_required"),
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      await api.requestPasswordReset(email);
      setSuccess(true);
    } catch (error) {
      console.error("Password reset request failed:", error);
      showAlert({
        title: t("common.error"),
        message: t("auth.password_reset_error"),
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={64} color="#10B981" />
          <H3 style={styles.successTitle}>{t("auth.check_your_email")}</H3>
          <Text style={styles.successText}>
            {t("auth.password_reset_sent")}
          </Text>
          <Text style={styles.infoText}>{email}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigate("/login")}
          >
            <Text style={styles.backButtonText}>{t("auth.back_to_login")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigate("/login")}
        >
          <ArrowLeft size={20} color="#64748B" />
          <Text style={styles.backLinkText}>{t("auth.back_to_login")}</Text>
        </TouchableOpacity>

        <H3 style={styles.title}>{t("auth.forgot_password")}</H3>
        <Text style={styles.subtitle}>
          {t("auth.forgot_password_subtitle")}
        </Text>

        <View style={styles.inputContainer}>
          <Mail size={20} color="#94A3B8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{t("auth.send_reset_link")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFF",
    borderRadius: 0,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  backLinkText: {
    color: "#64748B",
    fontSize: 14,
  },
  title: {
    marginBottom: 8,
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    marginBottom: 32,
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#F8FAFC",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: "#0F172A",
    outlineStyle: "none",
  } as any,
  button: {
    backgroundColor: "#0F172A",
    borderRadius: 0,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  successContainer: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFF",
    borderRadius: 0,
    padding: 48,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  successTitle: {
    marginTop: 24,
    marginBottom: 12,
    color: "#0F172A",
  },
  successText: {
    color: "#64748B",
    textAlign: "center",
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  infoText: {
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 32,
    fontSize: 15,
  },
  backButton: {
    backgroundColor: "#0F172A",
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
