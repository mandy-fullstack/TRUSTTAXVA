import { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Text, Button, Input } from "@trusttax/ui";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";

interface Step3PasswordProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string;
}

export const Step3Password = ({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onBack,
  isLoading = false,
  error,
}: Step3PasswordProps) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = () => {
    if (!password) {
      setLocalError(t("auth.password_required", "Password is required"));
      return;
    }

    if (password.length < 6) {
      setLocalError(
        t("auth.password_too_short", "Password must be at least 6 characters"),
      );
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t("auth.passwords_dont_match", "Passwords don't match"));
      return;
    }

    setLocalError("");
    onSubmit();
  };

  const displayError = error || localError;

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "#E2E8F0" };
    if (pwd.length < 6) return { strength: 1, label: t("auth.password_weak", "Weak"), color: "#EF4444" };
    if (pwd.length < 10) return { strength: 2, label: t("auth.password_medium", "Medium"), color: "#F59E0B" };
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { strength: 3, label: t("auth.password_strong", "Strong"), color: "#10B981" };
    }
    return { strength: 2, label: t("auth.password_medium", "Medium"), color: "#F59E0B" };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconsContainer}>
          <View style={styles.iconBox}>
            <Lock size={24} color="#2563EB" />
          </View>
          <View style={styles.iconBox}>
            <Shield size={24} color="#2563EB" />
          </View>
        </View>
        <Text style={styles.title}>
          {t("register.step3_title", "Set Your Password")}
        </Text>
        <Text style={styles.description}>
          {t(
            "register.step3_description",
            "Create a secure password to protect your account. Use at least 6 characters.",
          )}
        </Text>

        <View style={styles.form}>
          <View>
            <Input
              label={t("auth.password_label", "Password")}
              placeholder="••••••••"
              value={password}
              onChangeText={(value: string) => {
                onPasswordChange(value);
                setLocalError("");
              }}
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
            {password && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${(passwordStrength.strength / 3) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}
          </View>

          <View>
            <Input
              label={t("auth.confirm_password_label", "Confirm Password")}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(value: string) => {
                onConfirmPasswordChange(value);
                setLocalError("");
              }}
              secureTextEntry={!showConfirmPassword}
              icon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#64748B" />
                  ) : (
                    <Eye size={20} color="#64748B" />
                  )}
                </TouchableOpacity>
              }
              iconPosition="right"
            />
            {confirmPassword && passwordsMatch && (
              <Text style={styles.matchText}>
                {t("auth.passwords_match", "Passwords match")}
              </Text>
            )}
          </View>

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
          disabled={isLoading}
        />
        <Button
          title={t("auth.register", "Register")}
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
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
  submitButton: {
    flex: 1,
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
  strengthContainer: {
    marginTop: 8,
    gap: 4,
  },
  strengthBar: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 0,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 0,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  matchText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
    marginTop: 4,
  },
});
