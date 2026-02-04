import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Platform, ScrollView } from "react-native";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Card, H1, Subtitle, Text } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { TrustTaxLogo } from "../components/TrustTaxLogo";
import { Home } from "lucide-react";
import { Step1Phone } from "./Register/steps/Step1Phone";
import { Step2NameEmail } from "./Register/steps/Step2NameEmail";
import { Step3Password } from "./Register/steps/Step3Password";

export const RegisterPage = () => {
  const { t } = useTranslation();
  const { showAlert } = useAuth();
  const navigate = useNavigate();

  // Form data state
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => {
    setError("");
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError("");

    try {
      await api.register({
        name,
        email,
        password,
        ...(smsOptIn
          ? {
              smsOptIn: true,
              phoneNumber: phoneNumber.trim(),
            }
          : {}),
      });

      // Show success message and redirect to login
      showAlert({
        title: t("auth.success", "Success"),
        message: t(
          "auth.reg_success_verify",
          "Registration successful! Please check your email to verify your account.",
        ),
        variant: "success",
        onConfirm: () => navigate("/login"),
      });
    } catch (err: any) {
      const errorMessage =
        err.message ||
        t("auth.error_unexpected", "Something went wrong. Please try again.");

      // Show specific error messages
      if (
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("already registered")
      ) {
        setError(
          t(
            "auth.email_already_registered",
            "This email is already registered. Please log in or use a different email.",
          ),
        );
      } else if (errorMessage.toLowerCase().includes("too many")) {
        setError(
          t(
            "auth.rate_limit_exceeded",
            "Too many attempts. Please wait a few minutes and try again.",
          ),
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1Phone
            phoneNumber={phoneNumber}
            smsOptIn={smsOptIn}
            onPhoneChange={setPhoneNumber}
            onOptInChange={(v) => {
              setSmsOptIn(v);
            }}
            onNext={handleNext}
            error={step === 1 ? error : undefined}
          />
        );
      case 2:
        return (
          <Step2NameEmail
            name={name}
            email={email}
            onNameChange={setName}
            onEmailChange={setEmail}
            onNext={handleNext}
            onBack={handleBack}
            error={step === 2 ? error : undefined}
          />
        );
      case 3:
        return (
          <Step3Password
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handleRegister}
            onBack={handleBack}
            isLoading={isLoading}
            error={step === 3 ? error : undefined}
          />
        );
      default:
        return null;
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <TrustTaxLogo size={64} />
            </View>
            <H1 style={styles.title}>
              {t("auth.create_account", "Create Account")}
            </H1>
            <Subtitle>
              {t("auth.join_us", "Join TrustTax and start your journey")}
            </Subtitle>
          </View>

          <Card style={styles.formCard} elevated>
            {renderStep()}
          </Card>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              {t("auth.already_have_account", "Already have an account?")}
            </Text>
            <TouchableOpacity
              onPress={() => navigate("/login")}
              activeOpacity={0.85}
              style={styles.linkTouch as any}
            >
              <Text style={styles.linkText}>{t("auth.sign_in", "Sign In")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingTop: Platform.OS === "web" ? 80 : 70,
    minHeight: "100%",
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
  wrapper: {
    width: "100%",
    maxWidth: 500,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
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
    minHeight: 400,
    width: "100%",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 24,
  },
  linkTouch: {
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  } as any,
  footerText: {
    color: "#64748B",
    fontSize: 14,
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  } as any,
});
