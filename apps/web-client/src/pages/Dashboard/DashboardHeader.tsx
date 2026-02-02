import { View, StyleSheet, useWindowDimensions } from "react-native";
import { H1, Subtitle, Text } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { useCompany } from "../../context/CompanyContext";
import { Sparkles } from "lucide-react";
import {
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  SMALL_MOBILE_BREAKPOINT,
} from "../../config/navigation";

interface DashboardHeaderProps {
  userName: string;
}

function getGreetingKey():
  | "greeting_morning"
  | "greeting_afternoon"
  | "greeting_evening" {
  const h = new Date().getHours();
  if (h < 12) return "greeting_morning";
  if (h < 18) return "greeting_afternoon";
  return "greeting_evening";
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { profile } = useCompany();
  const primaryColor = profile?.primaryColor || "#2563EB";
  const secondaryColor = profile?.secondaryColor || "#0F172A";

  const greetingKey = getGreetingKey();
  const greeting = t(`dashboard.${greetingKey}`);

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
      <View style={styles.headerContent}>
        <View style={[styles.textSection, { flex: 1 }]}>
          <View style={styles.greetingRow}>
            <Sparkles
              size={isSmallMobile ? 14 : isMobile ? 15 : isTablet ? 15 : 16}
              color={primaryColor}
            />
            <Text
              style={[
                styles.greeting,
                { color: primaryColor },
                isSmallMobile && styles.greetingSmallMobile,
                isMobile && !isSmallMobile && styles.greetingMobile,
                isTablet && styles.greetingTablet,
              ]}
            >
              {greeting}
            </Text>
          </View>
          <H1
            style={[
              styles.title,
              { color: secondaryColor },
              isSmallMobile && styles.titleSmallMobile,
              isMobile && !isSmallMobile && styles.titleMobile,
              isTablet && styles.titleTablet,
            ]}
          >
            {userName}
          </H1>
          <Subtitle
            style={[
              styles.subtitle,
              isSmallMobile && styles.subtitleSmallMobile,
              isMobile && !isSmallMobile && styles.subtitleMobile,
              isTablet && styles.subtitleTablet,
            ]}
          >
            {t("dashboard.subtitle", "Your professional tax workspace")}
          </Subtitle>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: 1200,
    width: "100%",
    marginHorizontal: "auto",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  wrapperSmallMobile: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  wrapperMobile: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  wrapperTablet: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
  },
  textSection: {
    // flex: 1, // handled inline
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  greetingSmallMobile: {
    fontSize: 12,
  },
  greetingMobile: {
    fontSize: 13,
  },
  greetingTablet: {
    fontSize: 14,
  },
  title: {
    marginBottom: 8,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 40,
  },
  titleSmallMobile: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  titleMobile: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  titleTablet: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.9,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  subtitleSmallMobile: {
    fontSize: 13,
    lineHeight: 20,
  },
  subtitleMobile: {
    fontSize: 14,
    lineHeight: 22,
  },
  subtitleTablet: {
    fontSize: 15,
    lineHeight: 23,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
});
