import { View, StyleSheet } from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react";
import { H4, Text, Button } from "@trusttax/ui";
import { useTranslation } from "react-i18next";

interface DashboardErrorProps {
  message: string;
  onRetry: () => void;
}

export const DashboardError = ({ message, onRetry }: DashboardErrorProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.center}>
      <AlertCircle size={48} color="#EF4444" />
      <H4 style={styles.title}>
        {t("dashboard.unable_load", "Unable to Load Dashboard")}
      </H4>
      <Text style={styles.message}>{message}</Text>
      <Button
        title={t("common.retry", "Retry")}
        icon={<RefreshCw size={18} color="#FFFFFF" />}
        onPress={onRetry}
        style={styles.retryBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 280,
    paddingHorizontal: 24,
  },
  title: { marginTop: 16, color: "#EF4444" },
  message: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  retryBtn: { marginTop: 24 },
});
