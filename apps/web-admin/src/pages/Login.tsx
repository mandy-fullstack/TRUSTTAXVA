import { useState } from "react";
import { View, StyleSheet, Text, useWindowDimensions } from "react-native";
import { Button, Input } from "@trusttax/ui";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  api,
  AuthenticationError,
  ForbiddenError,
  NetworkError,
} from "../services/api";

const MOBILE_BREAKPOINT = 768;

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.login(email.trim(), password);

      if (data.user?.role !== "ADMIN") {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }
      login(data.access_token, data.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof AuthenticationError) {
        setError("Invalid email or password. Please try again.");
      } else if (err instanceof ForbiddenError) {
        setError("Access denied. Admin privileges required.");
      } else if (err instanceof NetworkError) {
        setError("Unable to connect to server. Please check your connection.");
      } else {
        setError(
          (err as Error)?.message ||
            "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {!isMobile && (
        <View style={styles.brandSection}>
          <View style={styles.brandOverlay}>
            <Text style={styles.brandTitle}>TrustTax Admin</Text>
            <Text style={styles.brandSubtitle}>
              Manage your tax services with confidence.
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.formSection, isMobile && styles.formSectionMobile]}>
        <View style={styles.formCard}>
          {isMobile && (
            <Text style={styles.brandTitleMobile}>TrustTax Admin</Text>
          )}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Please sign in to access the dashboard
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
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            style={styles.inputWrap}
          />

          <Text
            style={styles.forgotPasswordLink}
            onPress={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

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
  },
  inputWrap: {
    marginBottom: 20,
  },
  button: {
    marginTop: 8,
    height: 48,
    backgroundColor: "#0F172A",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  footerText: {
    marginTop: 24,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
  },
  forgotPasswordLink: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 16,
    marginTop: -8,
    textDecorationLine: "underline",
    cursor: "pointer",
  },
});
