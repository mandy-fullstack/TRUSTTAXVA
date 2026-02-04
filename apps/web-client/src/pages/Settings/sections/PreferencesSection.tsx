import { useEffect, useState } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { H3, Text, Card, Tabs, Switch, Button } from "@trusttax/ui";
import { Globe, Bell } from "lucide-react";
import { SMSOptIn } from "../../../components/SMSOptIn";
import { api } from "../../../services/api";
import { ConfirmDialog } from "../../../components/ConfirmDialog";

export const PreferencesSection = () => {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Notification states (local only for now)
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState<boolean | null>(null);
  const [loadingSms, setLoadingSms] = useState(false);
  const [showSmsOptIn, setShowSmsOptIn] = useState(false);
  const [showSmsOptOutConfirm, setShowSmsOptOutConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await api.getSMSConsentStatus();
        if (!cancelled) setSmsEnabled(!!status.hasConsent);
      } catch (e) {
        // If backend is unavailable, don't block settings page
        if (!cancelled) setSmsEnabled(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const languages = [
    { id: "en", label: "English" },
    { id: "es", label: "Español" },
  ];

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.section}>
      <H3 style={styles.sectionTitle}>
        {t("settings.preferences", "Preferences")}
      </H3>
      <Card style={styles.card}>
        {/* Language Selection */}
        <View style={styles.settingItem}>
          <View style={[styles.row, isMobile && styles.col]}>
            <View style={styles.headerGroup}>
              <View style={styles.iconBox}>
                <Globe size={20} color="#64748B" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.label}>
                  {t("common.language", "Language")}
                </Text>
                <Text style={styles.helper}>
                  {t(
                    "settings.language_desc",
                    "Select your preferred language",
                  )}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: isMobile ? "100%" : 200,
                marginTop: isMobile ? 12 : 0,
              }}
            >
              <Tabs
                tabs={languages}
                activeTab={i18n.language.split("-")[0]}
                onTabChange={handleLanguageChange}
                style={{ marginBottom: 0 }}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Notifications */}
        <View style={styles.settingItem}>
          <View style={[styles.row, isMobile && styles.col]}>
            <View style={styles.headerGroup}>
              <View style={styles.iconBox}>
                <Bell size={20} color="#64748B" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.label}>
                  {t("common.notifications", "Notifications")}
                </Text>
                <Text style={styles.helper}>
                  {t(
                    "settings.notifications_desc",
                    "Manage your alert preferences",
                  )}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.optionsList, isMobile && { paddingLeft: 0 }]}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>
                {t("settings.push_notifications", "Push Notifications")}
              </Text>
              <Switch value={pushEnabled} onValueChange={setPushEnabled} />
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>
                {t("settings.email_notifications", "Email Notifications")}
              </Text>
              <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
            </View>

            <View style={styles.dividerInner} />

            <View style={styles.optionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>
                  {t("settings.sms_notifications", "SMS Messages")}
                </Text>
                <Text style={styles.helperSmall}>
                  {smsEnabled
                    ? t("settings.sms_enabled", "SMS is enabled. Reply STOP to opt out.")
                    : t(
                        "settings.sms_desc",
                        "Opt in to receive order updates, reminders, and document requests by text message.",
                      )}
                </Text>
              </View>

              {smsEnabled ? (
                <Switch
                  value={true}
                  onValueChange={() => setShowSmsOptOutConfirm(true)}
                  disabled={loadingSms}
                />
              ) : (
                <Button
                  variant="neutral"
                  size="sm"
                  onPress={() => setShowSmsOptIn((v) => !v)}
                >
                  {showSmsOptIn
                    ? t("common.cancel", "Cancel")
                    : t("common.enable", "Enable")}
                </Button>
              )}
            </View>

            {/* Explicit opt-in widget (required for carrier compliance) */}
            {!smsEnabled && showSmsOptIn && (
              <View style={{ marginTop: 12 }}>
                <SMSOptIn
                  variant="compact"
                  showPhoneInput={true}
                  onSuccess={() => {
                    setSmsEnabled(true);
                    setShowSmsOptIn(false);
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </Card>

      <ConfirmDialog
        isOpen={showSmsOptOutConfirm}
        onClose={() => setShowSmsOptOutConfirm(false)}
        onConfirm={async () => {
          try {
            setLoadingSms(true);
            await api.optOutSMS();
            setSmsEnabled(false);
          } finally {
            setLoadingSms(false);
          }
        }}
        title={t("settings.sms_opt_out_title", "Disable SMS?")}
        message={t(
          "settings.sms_opt_out_message",
          "You will stop receiving text messages. You can re-enable SMS anytime by opting in again.",
        )}
        confirmText={t("settings.disable", "Disable")}
        cancelText={t("dialog.cancel", "Cancel")}
        variant="danger"
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
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  col: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  headerGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
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
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  helper: {
    fontSize: 13,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  optionsList: {
    marginTop: 16,
    paddingLeft: 56, // Align with rowContent
  },
  dividerInner: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  helperSmall: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    marginTop: 6,
  },
});
