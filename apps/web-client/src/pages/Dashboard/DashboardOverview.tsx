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
  const isDesktop = width >= TABLET_BREAKPOINT;

  return (
    <View
      style={[
        styles.container,
        isSmallMobile && styles.containerSmallMobile,
        isMobile && !isSmallMobile && styles.containerMobile,
        isTablet && styles.containerTablet,
        isDesktop && styles.containerDesktop,
      ]}
    >
      <H4
        style={[
          styles.title,
          isSmallMobile && styles.titleSmallMobile,
          isMobile && !isSmallMobile && styles.titleMobile,
          isTablet && styles.titleTablet,
          isDesktop && styles.titleDesktop,
        ]}
      >
        {t("dashboard.overview", "Overview")}
      </H4>
      
      <View
        style={[
          styles.cardsContainer,
          isSmallMobile && styles.cardsContainerSmallMobile,
          isMobile && !isSmallMobile && styles.cardsContainerMobile,
          isTablet && styles.cardsContainerTablet,
          isDesktop && styles.cardsContainerDesktop,
        ]}
      >
        <View
          style={[
            styles.cardWrapper,
            isSmallMobile && styles.cardWrapperSmallMobile,
            isMobile && !isSmallMobile && styles.cardWrapperMobile,
            isTablet && styles.cardWrapperTablet,
            isDesktop && styles.cardWrapperDesktop,
          ]}
        >
          <StatsCard
            label={t("dashboard.total_orders", "Total Orders")}
            value={String(totalOrders)}
            trend
            trendValue={t("dashboard.live", "Live")}
            trendColor="#64748B"
            style={[
              styles.statsCard,
              isSmallMobile && styles.statsCardSmallMobile,
              isMobile && !isSmallMobile && styles.statsCardMobile,
            ]}
          />
        </View>
        
        <View
          style={[
            styles.cardWrapper,
            isSmallMobile && styles.cardWrapperSmallMobile,
            isMobile && !isSmallMobile && styles.cardWrapperMobile,
            isTablet && styles.cardWrapperTablet,
            isDesktop && styles.cardWrapperDesktop,
          ]}
        >
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
              styles.statsCard,
              isSmallMobile && styles.statsCardSmallMobile,
              isMobile && !isSmallMobile && styles.statsCardMobile,
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container styles
  container: {
    width: "100%",
    marginBottom: 0,
  },
  containerSmallMobile: {
    width: "100%",
    maxWidth: "100%",
    marginBottom: 0,
  },
  containerMobile: {
    width: "100%",
    maxWidth: "100%",
    marginBottom: 0,
  },
  containerTablet: {
    width: "48%",
    maxWidth: "48%",
    marginBottom: 0,
  },
  containerDesktop: {
    width: "48%",
    maxWidth: "48%",
    marginBottom: 0,
  },
  
  // Title styles
  title: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: 24,
  },
  titleSmallMobile: {
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 20,
  },
  titleMobile: {
    marginBottom: 10,
    fontSize: 16,
    lineHeight: 22,
  },
  titleTablet: {
    marginBottom: 12,
    fontSize: 18,
    lineHeight: 24,
  },
  titleDesktop: {
    marginBottom: 12,
    fontSize: 18,
    lineHeight: 24,
  },
  
  // Cards container styles
  cardsContainer: {
    width: "100%",
    gap: 12,
  },
  cardsContainerSmallMobile: {
    flexDirection: "column",
    width: "100%",
    maxWidth: "100%",
    gap: 10,
    alignItems: "stretch",
  },
  cardsContainerMobile: {
    flexDirection: "column",
    width: "100%",
    maxWidth: "100%",
    gap: 12,
    alignItems: "stretch",
  },
  cardsContainerTablet: {
    flexDirection: "row",
    width: "100%",
    maxWidth: "100%",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  cardsContainerDesktop: {
    flexDirection: "row",
    width: "100%",
    maxWidth: "100%",
    gap: 12,
    flexWrap: "nowrap",
    alignItems: "stretch",
  },
  
  // Card wrapper styles
  cardWrapper: {
    width: "100%",
  },
  cardWrapperSmallMobile: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  },
  cardWrapperMobile: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  },
  cardWrapperTablet: {
    width: "48%",
    maxWidth: "48%",
    flex: 1,
    minWidth: 0,
  },
  cardWrapperDesktop: {
    width: "48%",
    maxWidth: "48%",
    flex: 1,
    minWidth: 0,
  },
  
  // StatsCard styles
  statsCard: {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
  },
  statsCardSmallMobile: {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
  },
  statsCardMobile: {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
  },
});
