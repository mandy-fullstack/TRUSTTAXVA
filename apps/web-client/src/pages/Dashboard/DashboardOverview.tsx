import { View, StyleSheet } from "react-native";
import { H4, StatsCard } from "@trusttax/ui";
import { useTranslation } from "react-i18next";

interface DashboardOverviewProps {
  totalOrders: number;
  actionRequiredCount: number;
}

export const DashboardOverview = ({
  totalOrders,
  actionRequiredCount,
}: DashboardOverviewProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <H4 style={styles.gridTitle}>{t("dashboard.overview", "Overview")}</H4>
      <View style={styles.statsRow}>
        <StatsCard
          label={t("dashboard.total_orders", "Total Orders")}
          value={String(totalOrders)}
          trend
          trendValue={t("dashboard.live", "Live")}
          trendColor="#64748B"
          style={styles.flex1}
        />
        <StatsCard
          label={t("dashboard.action_required", "Action Required")}
          value={String(actionRequiredCount)}
          trend
          trendValue={
            actionRequiredCount > 0
              ? t("dashboard.urgent", "Urgent")
              : t("dashboard.none", "None")
          }
          trendColor={actionRequiredCount > 0 ? "#EF4444" : "#10B981"}
          style={styles.flex1}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, minWidth: 340, gap: 24 },
  gridTitle: { marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  flex1: { flex: 1 },
});
