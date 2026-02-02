import { useState, useEffect } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { H1 } from "@trusttax/ui";
import { Layout } from "../../components/Layout";
import { api } from "../../services/api";
import { AccountSection } from "./sections/AccountSection";
import { SecuritySection } from "./sections/SecuritySection";
import { PreferencesSection } from "./sections/PreferencesSection";

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // State
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [loadingPin, setLoadingPin] = useState(true);

  useEffect(() => {
    loadPinStatus();
  }, []);

  const loadPinStatus = async () => {
    try {
      const status = await api.getPinStatus();
      setHasPin(status.hasPin);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPin(false);
    }
  };

  return (
    <Layout>
      <View style={[styles.container, isMobile && styles.containerMobile]}>
        <H1 style={styles.pageTitle}>{t("settings.title", "Settings")}</H1>

        <AccountSection />

        <SecuritySection
          hasPin={hasPin}
          loadingPin={loadingPin}
          onPinChangeSuccess={loadPinStatus}
        />

        <PreferencesSection />
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    maxWidth: 1000,
    width: "100%",
    alignSelf: "center",
  },
  containerMobile: {
    padding: 16,
  },
  pageTitle: {
    marginBottom: 32,
  },
});
