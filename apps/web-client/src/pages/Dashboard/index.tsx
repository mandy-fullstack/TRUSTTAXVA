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
      <View style={styles.headerSection}>
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
    paddingTop: 24,
    paddingBottom: 0,
    zIndex: 9999, // Ensure header sits on top of scroll content
    position: "relative",
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  scrollContentSmallMobile: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  scrollContentMobile: {
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  scrollContentTablet: {
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  grid: {
    flexDirection: "row",
    gap: 32,
    flexWrap: "wrap",
  },
  gridSmallMobile: {
    flexDirection: "column",
    gap: 24,
  },
  gridMobile: {
    flexDirection: "column",
    gap: 24,
  },
  gridTablet: {
    flexDirection: "row",
    gap: 24,
    flexWrap: "wrap",
  },
  gridDesktop: {
    flexDirection: "row",
    gap: 32,
    flexWrap: "nowrap",
  },
  notificationBanner: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  notificationBannerSmallMobile: {
    padding: 12,
    marginBottom: 20,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
  },
  notificationBannerMobile: {
    padding: 14,
    marginBottom: 22,
  },
  notificationBannerTablet: {
    padding: 18,
    marginBottom: 24,
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
