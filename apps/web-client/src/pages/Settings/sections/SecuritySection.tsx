import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { H3, Text, Card, Button } from "@trusttax/ui";
import { Shield, Key } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../services/api";
import { PinSetupModal } from "../../../components/PinSetupModal";
import { PinChangeModal } from "../../../components/PinChangeModal";

interface SecuritySectionProps {
  hasPin: boolean | null;
  loadingPin: boolean;
  onPinChangeSuccess: () => void;
}

export const SecuritySection = ({
  hasPin,
  loadingPin,
  onPinChangeSuccess,
}: SecuritySectionProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [resetSending, setResetSending] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    Alert.alert(
      t("settings.confirm_reset", "Reset Password"),
      t(
        "settings.reset_desc",
        "For security, we will send a password reset link to your email address: {{email}}.",
        { email: user.email },
      ),
      [
        { text: t("common.cancel", "Cancel"), style: "cancel" },
        {
          text: t("settings.send_link", "Send Link"),
          style: "default",
          onPress: async () => {
            setResetSending(true);
            try {
              await api.requestPasswordReset(user.email);
              Alert.alert(
                t("settings.success_title", "Success"),
                t(
                  "settings.reset_link_sent",
                  "Reset link sent! Check your email.",
                ),
              );
            } catch (e) {
              Alert.alert(
                t("settings.error_title", "Error"),
                t("settings.reset_link_failed", "Failed to send reset link."),
              );
            } finally {
              setResetSending(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.section}>
      <H3 style={styles.sectionTitle}>{t("settings.security", "Security")}</H3>
      <Card style={styles.card}>
        {/* PIN Management */}
        <View style={styles.settingItem}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Shield size={20} color={hasPin ? "#10B981" : "#64748B"} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>
                {t("security.pin_code", "Security PIN")}
              </Text>
              <Text style={styles.helper}>
                {loadingPin
                  ? "Loading..."
                  : hasPin
                    ? t("security.pin_active", "Active & Protected")
                    : t("security.pin_inactive", "Not Configured")}
                {hasPin && (
                  <Text
                    style={{ fontSize: 12, color: "#10B981", marginLeft: 4 }}
                  >
                    {" "}
                    • {t("security.encrypted", "Encrypted")}
                  </Text>
                )}
              </Text>
            </View>
            <Button
              variant="neutral"
              size="sm"
              onPress={() =>
                hasPin ? setShowPinChange(true) : setShowPinSetup(true)
              }
              disabled={loadingPin}
            >
              {hasPin
                ? t("common.change", "Change")
                : t("common.setup", "Setup")}
            </Button>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Password Management */}
        <View style={styles.settingItem}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Key size={20} color="#64748B" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>
                {t("security.password", "Password")}
              </Text>
              <Text style={styles.helper}>
                {t("security.password_desc", "Reset via email link")}
              </Text>
            </View>
            <Button
              variant="danger"
              size="sm"
              onPress={handlePasswordReset}
              loading={resetSending}
            >
              {t("security.reset_password", "Reset Password")}
            </Button>
          </View>
        </View>
      </Card>

      {/* Modals */}
      <PinSetupModal
        visible={showPinSetup}
        onClose={() => setShowPinSetup(false)}
        onSuccess={() => {
          setShowPinSetup(false);
          onPinChangeSuccess();
          Alert.alert(
            t("settings.success_title", "Success"),
            t("settings.pin_configured", "PIN Configured Successfully"),
          );
        }}
      />

      <PinChangeModal
        visible={showPinChange}
        onClose={() => setShowPinChange(false)}
        onSuccess={() => {
          setShowPinChange(false);
          Alert.alert(
            t("settings.success_title", "Success"),
            t("settings.pin_changed", "PIN Changed Successfully"),
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    color: "#1E293B",
  },
  card: {
    padding: 0,
    overflow: "hidden",
  },
  settingItem: {
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  rowContent: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 4,
  },
  helper: {
    fontSize: 13,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
});
