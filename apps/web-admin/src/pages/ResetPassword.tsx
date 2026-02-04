import { useState } from "react";
import { View, StyleSheet, Text, useWindowDimensions } from "react-native";
import { Button, Input } from "@trusttax/ui";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

const MOBILE_BREAKPOINT = 768;

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const handleSubmit = async () => {
    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: unknown) {
      const errorMessage =
        (err as Error)?.message || "Failed to reset password";

      if (errorMessage.includes("expired")) {
        setError("This reset link has expired. Please request a new one.");
      } else if (errorMessage.includes("invalid")) {
        setError("This reset link is invalid. Please request a new one.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleRequestNewLink = () => {
    navigate("/forgot-password");
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {!isMobile && (
        <View style={styles.brandSection}>
          <View style={styles.brandOverlay}>
            <Text style={styles.brandTitle}>TrustTax Admin</Text>
            <Text style={styles.brandSubtitle}>
              Create a new secure password
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
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Please enter your new password. Make sure it's secure and at
                  least 6 characters long.
                </Text>
              </View>

              <Input
                label="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                style={styles.inputWrap}
              />

              <Input
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="••••••••"
                style={styles.inputWrap}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title="Reset Password"
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

              {error &&
                (error.includes("expired") || error.includes("invalid")) && (
                  <Button
                    title="Request New Link"
                    onPress={handleRequestNewLink}
                    variant="text"
                    style={styles.textButton}
                  />
                )}
            </>
          ) : (
            <>
              <View style={styles.successIcon}>
                <Text style={styles.checkmark}>✓</Text>
              </View>

              <View style={styles.header}>
                <Text style={styles.title}>Password Reset Successful!</Text>
                <Text style={styles.subtitle}>
                  Your password has been reset successfully. You will be
                  redirected to the login page in a few seconds.
                </Text>
              </View>

              <Button
                title="Go to Login Now"
                onPress={handleBackToLogin}
                style={styles.button}
              />
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
  textButton: {
    marginTop: 8,
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
    borderRadius: 0,
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
  footerText: {
    marginTop: 24,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
  },
});
