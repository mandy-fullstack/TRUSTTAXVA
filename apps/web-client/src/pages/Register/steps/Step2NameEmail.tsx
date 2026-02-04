import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Text, Button, Input } from "@trusttax/ui";
import { User, Mail } from "lucide-react";
import { api } from "../../../services/api";

interface Step2NameEmailProps {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onNext: () => void;
  onBack: () => void;
  error?: string;
}

export const Step2NameEmail = ({
  name,
  email,
  onNameChange,
  onEmailChange,
  onNext,
  onBack,
  error,
}: Step2NameEmailProps) => {
  const { t } = useTranslation();
  const [localError, setLocalError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = async () => {
    setLocalError("");

    if (!name.trim()) {
      setLocalError(t("auth.name_required", "Name is required"));
      return;
    }

    if (!email.trim()) {
      setLocalError(t("auth.email_required", "Email is required"));
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      setLocalError(t("auth.invalid_email", "Please enter a valid email address"));
      return;
    }

    // Professional check: verify if email already exists before moving to password step
    setCheckingEmail(true);
    try {
      const res = await api.checkEmailExists(normalizedEmail);
      if (res.exists) {
        setLocalError(
          t(
            "auth.email_already_registered",
            "This email is already registered. Please log in or use a different email.",
          ),
        );
        return;
      }

      setLocalError("");
      onNext();
    } catch (e: any) {
      setLocalError(
        t(
          "auth.email_check_failed",
          "We couldn’t verify this email right now. Please try again.",
        ),
      );
    } finally {
      setCheckingEmail(false);
    }
  };

  const displayError = error || localError;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconsContainer}>
          <View style={styles.iconBox}>
            <User size={24} color="#2563EB" />
          </View>
          <View style={styles.iconBox}>
            <Mail size={24} color="#2563EB" />
          </View>
        </View>
        <Text style={styles.title}>
          {t("register.step2_title_name_email", "Your Name & Email")}
        </Text>
        <Text style={styles.description}>
          {t(
            "register.step2_description_name_email",
            "We need your name and email to create your account.",
          )}
        </Text>

        <View style={styles.form}>
          <Input
            label={t("auth.name_label", "Full Name")}
            placeholder="John Doe"
            value={name}
            onChangeText={(value: string) => {
              onNameChange(value);
              setLocalError("");
            }}
            autoCapitalize="words"
            icon={<User size={18} color="#64748B" />}
            iconPosition="left"
          />

          <Input
            label={t("auth.email_label", "Email Address")}
            placeholder="name@example.com"
            value={email}
            onChangeText={(value: string) => {
              onEmailChange(value);
              setLocalError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            icon={<Mail size={18} color="#64748B" />}
            iconPosition="left"
          />

          {displayError && (
            <Text style={styles.errorText}>{displayError}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title={t("common.back", "Back")}
          variant="neutral"
          onPress={onBack}
          style={styles.backButton}
        />
        <Button
          title={t("common.next", "Next")}
          onPress={handleNext}
          loading={checkingEmail}
          disabled={checkingEmail}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  content: {
    width: "100%",
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 0,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    gap: 24,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
});
