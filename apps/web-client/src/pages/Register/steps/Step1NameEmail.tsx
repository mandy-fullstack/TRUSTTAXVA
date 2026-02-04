import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Text, Button, Input } from "@trusttax/ui";

interface Step1NameEmailProps {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onNext: () => void;
  error?: string;
}

export const Step1NameEmail = ({
  name,
  email,
  onNameChange,
  onEmailChange,
  onNext,
  error,
}: Step1NameEmailProps) => {
  const { t } = useTranslation();
  const [localError, setLocalError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = () => {
    if (!name.trim()) {
      setLocalError(t("auth.name_required", "Name is required"));
      return;
    }

    if (!email.trim()) {
      setLocalError(t("auth.email_required", "Email is required"));
      return;
    }

    if (!validateEmail(email)) {
      setLocalError(t("auth.invalid_email", "Please enter a valid email address"));
      return;
    }

    setLocalError("");
    onNext();
  };

  const displayError = error || localError;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {t("register.step1_title", "Create Your Account")}
        </Text>
        <Text style={styles.description}>
          {t(
            "register.step1_description",
            "Let's start with your basic information.",
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
          />

          {displayError && (
            <Text style={styles.errorText}>{displayError}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title={t("common.next", "Next")}
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  content: {
    flex: 1,
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
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  nextButton: {
    width: "100%",
  },
});
