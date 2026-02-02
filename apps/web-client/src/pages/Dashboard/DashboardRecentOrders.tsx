import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { CheckCircle, LayoutDashboard } from "lucide-react";
import { H4, Card, Text, Button, Badge } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import {
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  SMALL_MOBILE_BREAKPOINT,
} from "../../config/navigation";

interface Order {
  id: string;
  displayId?: string;
  createdAt: string;
  status: string;
  service?: { id?: string; name?: string };
}

interface DashboardRecentOrdersProps {
  orders: Order[];
}

export const DashboardRecentOrders = ({
  orders,
}: DashboardRecentOrdersProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const navigate = useNavigate();

  // Responsive breakpoints
  const isSmallMobile = width < SMALL_MOBILE_BREAKPOINT;
  const isMobile = width < MOBILE_BREAKPOINT;
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;

  const handleDelete = async (orderId: string, e: any) => {
    e.stopPropagation();
    if (
      confirm(
        t(
          "dashboard.delete_confirm",
          "Are you sure you want to delete this draft?",
        ),
      )
    ) {
      try {
        await api.deleteOrder(orderId);
        // Refresh logic would be ideal here, but for now we might need to rely on parent refresh or navigation
        // Since this component just takes props, we can't self-refresh easily without a callback.
        // Assuming parent will re-fetch or we reload. For simplicity in this quick fix:
        window.location.reload();
      } catch (err) {
        console.error("Failed to delete draft", err);
      }
    }
  };

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
        {t("dashboard.recent_orders", "Recent Orders")}
      </H4>
      <Card padding="none" elevated style={styles.card}>
        {orders.length > 0 ? (
          orders.map((order, i) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => navigate(`/dashboard/orders/${order.id}`)}
              activeOpacity={0.6}
              style={[
                styles.orderItem,
                i === orders.length - 1 && styles.noBorder,
              ]}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <View style={styles.orderIconWrapper}>
                    <LayoutDashboard size={18} color="#2563EB" />
                  </View>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderText}>
                      {order.service?.name ||
                        t("dashboard.default_service", "Tax Service")}
                    </Text>
                  </View>
                </View>
                <Badge
                  label={order.status}
                  variant={order.status === "DRAFT" ? "warning" : "primary"}
                />
              </View>
              <View style={styles.orderMetaRow}>
                <Text style={styles.displayId}>
                  {order.displayId || `#${order.id.substring(0, 8)}`}
                </Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {order.status === "DRAFT" && (
                <View
                  style={[
                    styles.draftActions,
                    isSmallMobile && styles.draftActionsSmallMobile,
                  ]}
                >
                  <Button
                    title={t("dashboard.resume", "Resume")}
                    variant="primary"
                    style={{
                      height: 32,
                      minHeight: 32,
                      maxHeight: 32,
                      paddingVertical: 6,
                      paddingHorizontal: 16,
                      flex: 1,
                      minWidth: 0,
                      borderRadius: 0,
                      backgroundColor: "#3B82F6",
                    }}
                    textStyle={{ fontSize: 11, lineHeight: 16, padding: 0, margin: 0, color: "#FFFFFF" }}
                    onPress={(e: any) => {
                      e.stopPropagation();
                      if (order.service?.id) {
                        navigate(`/services/${order.service.id}/wizard`);
                      }
                    }}
                  />
                  <Button
                    title={t("common.delete", "Delete")}
                    variant="danger"
                    style={{
                      height: 32,
                      minHeight: 32,
                      maxHeight: 32,
                      paddingVertical: 6,
                      paddingHorizontal: 16,
                      flex: 1,
                      minWidth: 0,
                      borderRadius: 0,
                      backgroundColor: "#EF4444",
                    }}
                    textStyle={{ fontSize: 11, lineHeight: 16, padding: 0, margin: 0, color: "#FFFFFF" }}
                    onPress={(e: any) => handleDelete(order.id, e)}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <CheckCircle size={32} color="#10B981" />
            <Text style={styles.emptyText}>
              {t(
                "dashboard.no_orders",
                "You don't have any active orders yet.",
              )}
            </Text>
            <Button
              title={t("common.browse_services", "Browse Services")}
              variant="outline"
              style={styles.browseBtn}
              onPress={() => navigate("/dashboard/services")}
            />
          </View>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, minWidth: 0, gap: 8, width: "100%" },
  wrapperSmallMobile: { minWidth: "100%", gap: 8, width: "100%" },
  wrapperMobile: { minWidth: "100%", gap: 8, width: "100%" },
  wrapperTablet: {
    minWidth: 0,
    flex: 1,
    gap: 8,
    width: "48%",
  },
  gridTitle: { marginBottom: 8 },
  gridTitleSmallMobile: { marginBottom: 6, fontSize: 16 },
  gridTitleTablet: { marginBottom: 8, fontSize: 18 },
  card: { overflow: "hidden" },
  orderItem: {
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noBorder: { borderBottomWidth: 0 },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  orderDetails: {
    flex: 1,
    minWidth: 0,
  },
  orderIconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  orderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  orderMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
    paddingLeft: 52,
  },
  displayId: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "monospace",
  },
  orderDate: {
    fontSize: 12,
    color: "#94A3B8",
  },
  emptyState: { padding: 48, alignItems: "center", gap: 12 },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  browseBtn: { marginTop: 16 },
  draftActions: {
    flexDirection: "row",
    gap: 6,
    alignItems: "stretch",
    paddingLeft: 52,
    marginTop: 6,
    width: "100%",
    maxWidth: "100%",
  },
  draftActionsSmallMobile: {
    paddingLeft: 0,
    flexDirection: "row",
    gap: 6,
    width: "100%",
    maxWidth: "100%",
  },
});
