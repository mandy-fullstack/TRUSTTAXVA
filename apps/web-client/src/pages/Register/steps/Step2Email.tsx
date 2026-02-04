import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Text, Button, Input } from "@trusttax/ui";

interface Step2EmailProps {
  email: string;
  onEmailChange: (email: string) => void;
  onNext: () => void;
  onBack: () => void;
  error?: string;
}

export const Step2Email = ({
  email,
  onEmailChange,
  onNext,
  onBack,
  error,
}: Step2EmailProps) => {
  const { t } = useTranslation();
  const [localError, setLocalError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = () => {
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
          {t("register.step2_title", "Your Email Address")}
        </Text>
        <Text style={styles.description}>
          {t(
            "register.step2_description",
            "We'll use this email to send you important updates and verify your account.",
          )}
        </Text>

        <View style={styles.form}>
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
          title={t("common.back", "Back")}
          variant="neutral"
          onPress={onBack}
          style={styles.backButton}
        />
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
