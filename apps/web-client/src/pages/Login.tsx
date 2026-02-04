import { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  api,
  AuthenticationError,
  NotFoundError,
  NetworkError,
} from "../services/api";
import { Card, Button, Input, H1, Subtitle, Text } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { TrustTaxLogo } from "../components/TrustTaxLogo";
import { Eye, EyeOff, Home } from "lucide-react";

export const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t("auth.error_empty", "Please enter both email and password"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await api.login(email, password);
      if (data.access_token) {
        login(data.access_token, data.user);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof AuthenticationError) {
        setError(
          t(
            "auth.error_invalid",
            "Invalid email or password. Please try again.",
          ),
        );
      } else if (err instanceof NotFoundError) {
        setError(
          t(
            "auth.error_not_found",
            "Account not found. Please check your email or sign up.",
          ),
        );
      } else if (err instanceof NetworkError) {
        setError(
          t(
            "auth.error_network",
            "Unable to connect. Please check your internet connection.",
          ),
        );
      } else {
        setError(
          (err as Error).message ||
            t(
              "auth.error_unexpected",
              "An unexpected error occurred. Please try again.",
            ),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigate("/")}
        activeOpacity={0.7}
      >
        <Home size={18} color="#64748B" />
        <Text style={styles.homeButtonText}>
          {t("common.home", "Home")}
        </Text>
      </TouchableOpacity>

      <View style={styles.wrapper}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <TrustTaxLogo size={64} />
          </View>
          <H1 style={styles.title}>{t("auth.welcome_back", "Welcome Back")}</H1>
          <Subtitle>
            {t("auth.sign_in_to_continue", "Sign in to continue to TrustTax")}
          </Subtitle>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.formContainer}>
            <Input
              label={t("auth.email_label", "Email Address")}
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
            />
            <View>
              <Input
                label={t("auth.password_label", "Password")}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                icon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
                    )}
                  </TouchableOpacity>
                }
                iconPosition="right"
              />
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => navigate("/forgot-password")}
                activeOpacity={0.85}
              >
                <Text style={styles.forgotText}>
                  {t("auth.forgot_password", "Forgot password?")}
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title={t("auth.sign_in", "Sign In")}
              onPress={handleLogin}
              loading={isLoading}
              style={{ width: "100%" }}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>
                {t("auth.dont_have_account", "Don't have an account?")}
              </Text>
              <TouchableOpacity
                onPress={() => navigate("/register")}
                activeOpacity={0.85}
                style={styles.linkTouch as any}
              >
                <Text style={styles.linkText}>{t("auth.sign_up", "Sign Up")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <View style={styles.legalWrapper}>
          <Text style={styles.legalText}>
            {t(
              "auth.legal_disclaimer",
              "By continuing, you agree to TrustTax's Terms of Service and Privacy Policy.",
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: 24,
    minHeight: "100%",
    position: "relative",
  },
  homeButton: {
    position: "absolute",
    top: Platform.OS === "web" ? 24 : 16,
    left: Platform.OS === "web" ? 24 : 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    zIndex: 100,
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer",
          transition: "all 0.2s ease",
        }
      : {}),
  } as any,
  homeButtonText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  wrapper: { width: "100%", maxWidth: 400 },
  header: { alignItems: "center", marginBottom: 32 },
  logoContainer: { marginBottom: 16 },
  title: {
    fontSize: 28,
    marginBottom: 4,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  formCard: {
    padding: 40,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
  },
  formContainer: { gap: 24 },
  forgotBtn: { alignSelf: "flex-end", marginTop: -12 },
  forgotText: { fontSize: 13, color: "#2563EB", fontWeight: "500" } as any,
  errorText: { color: "#EF4444", fontSize: 13, textAlign: "center" },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 16,
  },
  linkTouch: {
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  } as any,
  footerText: { color: "#64748B", fontSize: 14 },
  linkText: { color: "#2563EB", fontWeight: "600", fontSize: 14 } as any,
  legalWrapper: { marginTop: 32 },
  legalText: {
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "300",
  },
});
