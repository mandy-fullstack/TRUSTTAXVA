import { useEffect } from "react";
import { View, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { Layout } from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { Text, Button } from "@trusttax/ui";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardOverview } from "./DashboardOverview";
import { DashboardRecentOrders } from "./DashboardRecentOrders";
import { DashboardPendingPayments } from "./DashboardPendingPayments";
import { DashboardLoading } from "./DashboardLoading";
import { DashboardError } from "./DashboardError";
import { ProfileIncompleteBanner } from "../../components/ProfileIncompleteBanner";
import { PageMeta } from "../../components/PageMeta";
import { useTranslation } from "react-i18next";
import {
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  SMALL_MOBILE_BREAKPOINT,
} from "../../config/navigation";

interface UserWithRelations {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  isProfileComplete?: boolean;
  orders?: Array<{
    id: string;
    createdAt: string;
    status: string;
    service?: { name?: string };
  }>;
  invoices?: Array<{
    id: string;
    description?: string;
    amount?: number | string;
    status?: string;
  }>;
}

import { useState } from "react";
import { api } from "../../services/api";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const {
    user,
    isLoading: authLoading,
    error: authError,
    clearError,
    refreshUser,
    isAuthenticated,
  } = useAuth();
  const { permission, requestPermission, isIOS, isStandalone } =
    useNotification();

  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Responsive breakpoints
  const isSmallMobile = width < SMALL_MOBILE_BREAKPOINT;
  const isMobile = width < MOBILE_BREAKPOINT;
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
  const isDesktop = width >= TABLET_BREAKPOINT;

  // Refrescar user al montar para tener profileComplete actualizado (p. ej. tras completar perfil)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      refreshUser();

      // Fetch Orders and Invoices explicitly
      Promise.all([
        api.getOrders().catch((err) => {
          console.error("Failed to fetch orders", err);
          return [];
        }),
        api.getInvoices().catch((err) => {
          console.error("Failed to fetch invoices", err);
          return [];
        }),
      ]).then(([ordersData, invoicesData]) => {
        setOrders(ordersData);
        setInvoices(invoicesData);
        setIsLoadingData(false);
      });
    }
  }, [authLoading, isAuthenticated, refreshUser]);

  if (authLoading || (isAuthenticated && isLoadingData)) {
    return (
      <Layout>
        <DashboardLoading error={authError ?? undefined} />
      </Layout>
    );
  }

  if (authError != null && authError !== "" && !user) {
    return (
      <Layout>
        <DashboardError
          message={authError}
          onRetry={() => {
            clearError();
            window.location.reload();
          }}
        />
      </Layout>
    );
  }

  const userData = user as UserWithRelations | null;
  const userName = userData?.name ?? "Client";
  // const orders = userData?.orders ?? []; // Old way
  // const pendingInvoices = userData?.invoices ?? []; // Old way
  const pendingInvoices = invoices.filter(
    (inv) => inv.status !== "PAID" && inv.status !== "CANCELLED",
  );

  return (
    <Layout>
      <PageMeta
        title={`${t("header.dashboard", "Dashboard")} | TrustTax`}
        description={t("dashboard.subtitle", "Your professional tax workspace")}
      />
      {/* Dashboard Header - Componente independiente separado */}
      <View
        style={[
          styles.headerSection,
          isSmallMobile && styles.headerSectionSmallMobile,
          isMobile && !isSmallMobile && styles.headerSectionMobile,
          isTablet && styles.headerSectionTablet,
        ]}
      >
        <DashboardHeader userName={userName} />
      </View>

      {/* Contenido principal del dashboard */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isSmallMobile && styles.scrollContentSmallMobile,
          isMobile && !isSmallMobile && styles.scrollContentMobile,
          isTablet && styles.scrollContentTablet,
        ]}
      >
        {!userData?.isProfileComplete && (
          <ProfileIncompleteBanner profileComplete={false} />
        )}

        {permission === "default" && (
          <View
            style={[
              styles.notificationBanner,
              isSmallMobile && styles.notificationBannerSmallMobile,
              isMobile && !isSmallMobile && styles.notificationBannerMobile,
              isTablet && styles.notificationBannerTablet,
              isIOS &&
              !isStandalone && {
                backgroundColor: "#F0F9FF",
                borderLeftColor: "#0EA5E9",
              },
            ]}
          >
            {isIOS && !isStandalone ? (
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.notificationText,
                    { color: "#0369A1" },
                    isSmallMobile && styles.notificationTextSmallMobile,
                  ]}
                >
                  {t(
                    "notifications.ios_install_prompt",
                    'To enable notifications on iPhone: Tap the Share button and select "Add to Home Screen"',
                  )}
                </Text>
              </View>
            ) : (
              <>
                <Text
                  style={[
                    styles.notificationText,
                    isSmallMobile && styles.notificationTextSmallMobile,
                  ]}
                >
                  Enable notifications to stay updated on your orders.
                </Text>
                <Button
                  title="Enable Notifications"
                  onPress={requestPermission}
                  size="sm"
                />
              </>
            )}
          </View>
        )}

        <View
          style={[
            styles.grid,
            isSmallMobile && styles.gridSmallMobile,
            isMobile && !isSmallMobile && styles.gridMobile,
            isTablet && styles.gridTablet,
            isDesktop && styles.gridDesktop,
          ]}
        >
          <DashboardOverview
            totalOrders={orders.length}
            actionRequiredCount={pendingInvoices.length}
          />
          <DashboardRecentOrders orders={orders} />
        </View>

        <DashboardPendingPayments invoices={pendingInvoices} />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 16,
    zIndex: 9999, // Ensure header sits on top of scroll content
    position: "relative",
  },
  headerSectionSmallMobile: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 16,
  },
  headerSectionMobile: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 16,
  },
  headerSectionTablet: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 16,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 0,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    overflow: "hidden",
  },
  scrollContentSmallMobile: {
    paddingTop: 0,
    paddingBottom: 12,
    paddingHorizontal: 0,
  },
  scrollContentMobile: {
    paddingTop: 0,
    paddingBottom: 14,
    paddingHorizontal: 0,
  },
  scrollContentTablet: {
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 0,
  },
  grid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    width: "100%",
    maxWidth: "100%",
    alignItems: "flex-start",
  },
  gridSmallMobile: {
    flexDirection: "column",
    gap: 8,
    width: "100%",
    maxWidth: "100%",
    alignItems: "stretch",
  },
  gridMobile: {
    flexDirection: "column",
    gap: 8,
    width: "100%",
    maxWidth: "100%",
    alignItems: "stretch",
  },
  gridTablet: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    width: "100%",
    maxWidth: "100%",
    alignItems: "flex-start",
  },
  gridDesktop: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "nowrap",
    width: "100%",
    maxWidth: "100%",
    alignItems: "flex-start",
  },
  notificationBanner: {
    backgroundColor: "#EFF6FF",
    padding: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    marginLeft: 0,
    marginRight: 0,
  },
  notificationBannerSmallMobile: {
    padding: 6,
    marginBottom: 8,
    marginLeft: 0,
    marginRight: 0,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
  },
  notificationBannerMobile: {
    padding: 7,
    marginBottom: 8,
    marginLeft: 0,
    marginRight: 0,
  },
  notificationBannerTablet: {
    padding: 8,
    marginBottom: 8,
    marginLeft: 0,
    marginRight: 0,
  },
  notificationText: {
    color: "#1E3A8A",
    fontWeight: "500",
    fontSize: 14,
  },
  notificationTextSmallMobile: {
    fontSize: 13,
  },
});
