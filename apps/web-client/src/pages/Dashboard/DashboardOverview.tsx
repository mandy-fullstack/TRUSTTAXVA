import { View, StyleSheet, useWindowDimensions } from "react-native";
import { H4, StatsCard } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import {
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  SMALL_MOBILE_BREAKPOINT,
} from "../../config/navigation";

interface DashboardOverviewProps {
  totalOrders: number;
  actionRequiredCount: number;
}

export const DashboardOverview = ({
  totalOrders,
  actionRequiredCount,
}: DashboardOverviewProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  // Responsive breakpoints
  const isSmallMobile = width < SMALL_MOBILE_BREAKPOINT;
  const isMobile = width < MOBILE_BREAKPOINT;
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;

  return (
    <View
      style={[
        styles.wrapper,
        isSmallMobile && styles.wrapperSmallMobile,
        isMobile && !isSmallMobile && styles.wrapperMobile,
        isTablet && styles.wrapperTablet,
      ]}
    >
      <H4
        style={[
          styles.gridTitle,
          isSmallMobile && styles.gridTitleSmallMobile,
          isTablet && styles.gridTitleTablet,
        ]}
      >
        {t("dashboard.overview", "Overview")}
      </H4>
      <View
        style={[
          styles.statsRow,
          isSmallMobile && styles.statsRowSmallMobile,
          isMobile && !isSmallMobile && styles.statsRowMobile,
          isTablet && styles.statsRowTablet,
        ]}
      >
        <StatsCard
          label={t("dashboard.total_orders", "Total Orders")}
          value={String(totalOrders)}
          trend
          trendValue={t("dashboard.live", "Live")}
          trendColor="#64748B"
          style={[
            styles.flex1,
            isSmallMobile && styles.flex1SmallMobile,
            isMobile && !isSmallMobile && styles.flex1Mobile,
          ]}
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
          style={[
            styles.flex1,
            isSmallMobile && styles.flex1SmallMobile,
            isMobile && !isSmallMobile && styles.flex1Mobile,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
    gap: 8,
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  wrapperSmallMobile: {
    minWidth: "100%",
    gap: 8,
    width: "100%",
    maxWidth: "100%",
  },
  wrapperMobile: {
    minWidth: "100%",
    gap: 8,
    width: "100%",
    maxWidth: "100%",
  },
  wrapperTablet: {
    minWidth: 0,
    flex: 1,
    gap: 8,
    width: "48%",
  },
  gridTitle: { marginBottom: 8 },
  gridTitleSmallMobile: { marginBottom: 6, fontSize: 16 },
  gridTitleTablet: { marginBottom: 8, fontSize: 18 },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
    width: "100%",
    maxWidth: "100%",
  },
  statsRowSmallMobile: {
    flexDirection: "column",
    gap: 12,
    width: "100%",
    maxWidth: "100%",
  },
  statsRowMobile: {
    flexDirection: "column",
    gap: 14,
    width: "100%",
    maxWidth: "100%",
  },
  statsRowTablet: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  flex1: {
    flex: 1,
    minWidth: 0,
    minHeight: 100,
    maxWidth: "48%",
    width: "48%",
  },
  flex1SmallMobile: {
    minHeight: 90,
    minWidth: "100%",
    maxWidth: "100%",
    width: "100%",
  },
  flex1Mobile: {
    minHeight: 95,
    minWidth: "100%",
    maxWidth: "100%",
    width: "100%",
  },
});
