import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { H1, H4, Text, StatsCard, spacing, Spacer } from "@trusttax/ui";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useSocketContext } from "../context/SocketContext";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const SMALL_MOBILE_BREAKPOINT = 375;

export function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const isSmallMobile = width < SMALL_MOBILE_BREAKPOINT;
  const isMobile = width < MOBILE_BREAKPOINT;
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
  const [metrics, setMetrics] = useState<{
    totalClients?: number;
    totalOrders?: number;
    pendingOrders?: number;
    completedOrders?: number;
    activeOrders?: number;
    totalRevenue?: number;
  } | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const {
    permission,
    requestPermission,
  } = useNotification();
  const { socket, isConnected } = useSocketContext();
  const navigate = useNavigate();

  // Load initial metrics
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getDashboardMetrics();
        if (!cancelled) setMetrics(data);
      } catch (e) {
        console.error("Failed to load metrics:", e);
      } finally {
        if (!cancelled) setLoadingMetrics(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Real-time updates via socket
  useEffect(() => {
    if (!isConnected || !socket) return;

    const handleOrderUpdate = (data: any) => {
      console.log("📊 Dashboard: Order update received", data);
      // Refresh metrics when order status changes
      api.getDashboardMetrics()
        .then((newMetrics) => {
          setMetrics(newMetrics);
        })
        .catch((e) => {
          console.error("Failed to refresh metrics:", e);
        });
    };

    const handleNewOrder = (data: any) => {
      console.log("📊 Dashboard: New order received", data);
      // Refresh metrics when new order is created
      api.getDashboardMetrics()
        .then((newMetrics) => {
          setMetrics(newMetrics);
        })
        .catch((e) => {
          console.error("Failed to refresh metrics:", e);
        });
    };

    const handleMetricsUpdate = (data: any) => {
      console.log("📊 Dashboard: Metrics update received", data);
      // Direct metrics update from server
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    };

    // Listen for order-related events
    socket.on("orderUpdate", handleOrderUpdate);
    socket.on("newOrder", handleNewOrder);
    socket.on("metricsUpdate", handleMetricsUpdate);

    // Also listen to notifications that might indicate changes
    socket.on("notification", (payload: any) => {
      if (payload.type === "order") {
        // Refresh metrics when order notification is received
        api.getDashboardMetrics()
          .then((newMetrics) => {
            setMetrics(newMetrics);
          })
          .catch((e) => {
            console.error("Failed to refresh metrics:", e);
          });
      }
    });

    return () => {
      socket.off("orderUpdate", handleOrderUpdate);
      socket.off("newOrder", handleNewOrder);
      socket.off("metricsUpdate", handleMetricsUpdate);
      socket.off("notification");
    };
  }, [isConnected, socket]);

  if (isLoading) {
    return (
      <Layout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      </Layout>
    );
  }

  const adminName = user?.name || user?.email || "Admin";

  return (
    <Layout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          isSmallMobile && styles.scrollContentSmallMobile,
          isMobile && !isSmallMobile && styles.scrollContentMobile,
          isTablet && styles.scrollContentTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.topBar,
          isSmallMobile && styles.topBarSmallMobile,
          isMobile && !isSmallMobile && styles.topBarMobile,
        ]}>
          <H1 style={[
            isSmallMobile && styles.titleSmallMobile,
            isMobile && !isSmallMobile && styles.titleMobile,
            isTablet && styles.titleTablet,
          ]}>
            {t("dashboard.welcome_user", { name: adminName })}
          </H1>
        </View>

        <View style={[
          styles.header,
          isSmallMobile && styles.headerSmallMobile,
        ]}>
          <Spacer size="xs" />
          <Text style={[
            styles.subtitle,
            isSmallMobile && styles.subtitleSmallMobile,
            isMobile && !isSmallMobile && styles.subtitleMobile,
          ]}>
            {t("dashboard.subtitle")}
          </Text>
        </View>

        {permission === "default" && (
          <View style={styles.notificationBanner}>
            <Text style={styles.notificationText}>
              {t("dashboard.enable_notifications")}
            </Text>
            <Text style={styles.bannerBtn} onPress={requestPermission}>
              {t("dashboard.enable")}
            </Text>
          </View>
        )}

        <Spacer size="xl" />
        <View style={[
          styles.statsGrid,
          isSmallMobile && styles.statsGridSmallMobile,
          isMobile && !isSmallMobile && styles.statsGridMobile,
          isTablet && styles.statsGridTablet,
        ]}>
          <StatsCard
            label={t("dashboard.total_clients")}
            value={loadingMetrics ? "..." : String(metrics?.totalClients ?? 0)}
            trend
            trendValue={t("common.active")}
            trendColor="#64748B"
          />
          <StatsCard
            label={t("dashboard.active_orders")}
            value={loadingMetrics ? "..." : String(metrics?.activeOrders ?? 0)}
            trend
            trendValue={t("orders.in_progress")}
            trendColor="#3B82F6"
          />
          <StatsCard
            label={t("dashboard.pending")}
            value={loadingMetrics ? "..." : String(metrics?.pendingOrders ?? 0)}
            trend
                  trendValue={
                    (metrics?.pendingOrders ?? 0) > 0
                      ? t("dashboard.action_required")
                      : t("dashboard.all_clear")
                  }
            trendColor={
              (metrics?.pendingOrders ?? 0) > 0 ? "#F59E0B" : "#10B981"
            }
          />
          <StatsCard
            label={t("dashboard.revenue")}
            value={
              loadingMetrics
                ? "..."
                : `$${(metrics?.totalRevenue ?? 0).toFixed(2)}`
            }
            trend
            trendValue={t("orders.completed")}
            trendColor="#10B981"
          />
        </View>
        <Spacer size="xl" />
        <View
          style={[
            styles.emptyContainer,
            isMobile && styles.emptyContainerMobile,
          ]}
        >
          <LayoutDashboard size={48} color="#E2E8F0" />
          <Spacer size="lg" />
                <H4 style={styles.emptyTitle}>{t("dashboard.operational_dashboard")}</H4>
                <Spacer size="sm" />
                <Text style={styles.emptyText}>
                  {(metrics?.totalOrders ?? 0) > 0
                    ? t("dashboard.total_orders_message", {
                        total: metrics?.totalOrders ?? 0,
                        completed: metrics?.completedOrders ?? 0,
                      })
                    : t("dashboard.all_systems_normal")}
                </Text>
        </View>
      </ScrollView>
    </Layout>
  );
}

const s = spacing;
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 200,
  },
  scroll: { flex: 1, width: "100%" },
  scrollContent: {
    padding: s[8],
    width: "100%",
    minWidth: "100%" as any,
    minHeight: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  scrollContentSmallMobile: {
    padding: s[3],
    paddingTop: s[4],
  },
  scrollContentMobile: {
    padding: s[4],
    paddingTop: s[6],
  },
  scrollContentTablet: {
    padding: s[6],
    paddingTop: s[8],
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: s[2],
  },
  topBarSmallMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: s[1],
  },
  topBarMobile: {
    marginBottom: s[1],
  },
  header: {},
  headerSmallMobile: {
    marginBottom: s[1],
  },
  titleSmallMobile: { fontSize: 20 },
  titleMobile: { fontSize: 24 },
  titleTablet: { fontSize: 28 },
  subtitle: { color: "#64748B", fontSize: 15 },
  subtitleSmallMobile: { fontSize: 13 },
  subtitleMobile: { fontSize: 14 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s[5],
    width: "100%",
  },
  statsGridSmallMobile: {
    flexDirection: "column",
    gap: s[2],
    width: "100%",
  },
  statsGridMobile: {
    flexDirection: "column",
    gap: s[3],
    width: "100%",
  },
  statsGridTablet: {
    flexDirection: "row",
    gap: s[4],
    flexWrap: "wrap",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: s[12],
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E2E8F0",
  },
  emptyContainerMobile: {
    padding: s[6],
  },
  emptyTitle: { color: "#1E293B" },
  emptyText: {
    color: "#94A3B8",
    textAlign: "center",
    maxWidth: 400,
    fontSize: 14,
  },
  notificationBanner: {
    backgroundColor: "#EFF6FF",
    padding: s[4],
    marginBottom: s[4],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  notificationText: {
    color: "#1E3A8A",
    fontWeight: "500",
    flex: 1,
  },
  bannerBtn: {
    color: "#2563EB",
    fontWeight: "bold",
    marginLeft: 16,
    cursor: "pointer" as any,
  },
});
