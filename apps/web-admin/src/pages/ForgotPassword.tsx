import { useState } from "react";
import { View, StyleSheet, Text, useWindowDimensions } from "react-native";
import { Button, Input } from "@trusttax/ui";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const MOBILE_BREAKPOINT = 768;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.forgotPassword(email.trim());
      setSuccess(true);
    } catch (err: unknown) {
      // For security, we show generic message even if email doesn't exist
      setSuccess(true); // Still show success to prevent email enumeration
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {!isMobile && (
        <View style={styles.brandSection}>
          <View style={styles.brandOverlay}>
            <Text style={styles.brandTitle}>TrustTax Admin</Text>
            <Text style={styles.brandSubtitle}>
              Reset your password securely
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.formSection, isMobile && styles.formSectionMobile]}>
        <View style={styles.formCard}>
          {isMobile && (
            <Text style={styles.brandTitleMobile}>TrustTax Admin</Text>
          )}

          {!success ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  No worries. Enter your email address and we'll send you
                  instructions to reset your password.
                </Text>
              </View>

              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="admin@trusttax.com"
                style={styles.inputWrap}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title="Send Reset Instructions"
                onPress={handleSubmit}
                loading={loading}
                style={styles.button}
              />

              <Button
                title="Back to Login"
                onPress={handleBackToLogin}
                variant="outline"
                style={styles.secondaryButton}
              />
            </>
          ) : (
            <>
              <View style={styles.successIcon}>
                <Text style={styles.checkmark}>✓</Text>
              </View>

              <View style={styles.header}>
                <Text style={styles.title}>Check Your Email</Text>
                <Text style={styles.subtitle}>
                  If an account exists for {email}, you will receive an email
                  with instructions to reset your password.
                </Text>
                <Text style={[styles.subtitle, { marginTop: 16 }]}>
                  The link will expire in 1 hour for security reasons.
                </Text>
              </View>

              <Button
                title="Back to Login"
                onPress={handleBackToLogin}
                style={styles.button}
              />

              <Text style={styles.resendText}>
                Didn't receive the email?{" "}
                <Text
                  style={styles.resendLink}
                  onPress={() => setSuccess(false)}
                >
                  Try again
                </Text>
              </Text>
            </>
          )}

          <Text style={styles.footerText}>
            Protected area. Unauthorized access is prohibited.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    minHeight: "100vh" as any,
    width: "100%",
    backgroundColor: "#F8FAFC",
  },
  containerMobile: {
    flexDirection: "column",
  },
  brandSection: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  brandOverlay: {
    padding: 40,
    maxWidth: 500,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  brandTitleMobile: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 24,
    textAlign: "center",
  },
  brandSubtitle: {
    fontSize: 20,
    color: "#94A3B8",
    lineHeight: 28,
  },
  formSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  formSectionMobile: {
    padding: 20,
    justifyContent: "flex-start",
    paddingTop: 48,
  },
  formCard: {
    width: "100%",
    maxWidth: 420,
    padding: 8,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },
  inputWrap: {
    marginBottom: 20,
  },
  button: {
    marginTop: 8,
    height: 48,
    backgroundColor: "#0F172A",
  },
  secondaryButton: {
    marginTop: 12,
    height: 48,
    borderColor: "#E2E8F0",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resendText: {
    marginTop: 16,
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
  },
  resendLink: {
    color: "#0F172A",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footerText: {
    marginTop: 24,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
  },
});
