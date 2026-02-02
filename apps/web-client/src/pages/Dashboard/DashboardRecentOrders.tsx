import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { CheckCircle, LayoutDashboard } from "lucide-react";
import { H4, Card, Text, Button, Badge } from "@trusttax/ui";
import { useTranslation } from "react-i18next";

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
  const navigate = useNavigate();

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
    <View style={styles.wrapper}>
      <H4 style={styles.gridTitle}>
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
              <View style={styles.orderInfo}>
                <View style={styles.orderIconWrapper}>
                  <LayoutDashboard size={18} color="#2563EB" />
                </View>
                <View>
                  <View style={styles.orderTitleRow}>
                    <Text style={styles.orderText}>
                      {order.service?.name ||
                        t("dashboard.default_service", "Tax Service")}
                    </Text>
                    <Text style={styles.displayId}>
                      {order.displayId || `#${order.id.substring(0, 8)}`}
                    </Text>
                  </View>
                  <Text style={styles.orderSubtext}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Badge
                  label={order.status}
                  variant={order.status === "DRAFT" ? "warning" : "primary"}
                />
                {order.status === "DRAFT" && (
                  <>
                    <Button
                      title={t("dashboard.resume", "Resume")}
                      variant="outline"
                      style={{
                        height: 32,
                        paddingVertical: 0,
                        paddingHorizontal: 12,
                      }}
                      textStyle={{ fontSize: 12 }}
                      onPress={(e: any) => {
                        e.stopPropagation();
                        if (order.service?.id) {
                          navigate(`/services/${order.service.id}/wizard`);
                        }
                      }}
                    />
                    <Button
                      title={t("common.delete", "Delete")}
                      variant="ghost"
                      style={{
                        height: 32,
                        paddingVertical: 0,
                        paddingHorizontal: 8,
                      }}
                      textStyle={{ fontSize: 12, color: "#EF4444" }}
                      onPress={(e: any) => handleDelete(order.id, e)}
                    />
                  </>
                )}
              </View>
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
  wrapper: { flex: 1, minWidth: 340, gap: 24 },
  gridTitle: { marginBottom: 16 },
  card: { overflow: "hidden" },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  noBorder: { borderBottomWidth: 0 },
  orderInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  orderIconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  orderText: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  orderSubtext: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  emptyState: { padding: 48, alignItems: "center", gap: 12 },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  browseBtn: { marginTop: 16 },
  orderTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  displayId: { fontSize: 12, color: "#64748B", fontFamily: "monospace" },
});
