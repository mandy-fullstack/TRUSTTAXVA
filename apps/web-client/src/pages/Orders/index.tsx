import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigate } from "react-router-dom";
import { Text, Card, Badge, Button } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { Layout } from "../../components/Layout";
import { PageMeta } from "../../components/PageMeta";
import { api } from "../../services/api";
import { FileText, ChevronRight, Clock } from "lucide-react";
import { format } from "date-fns";

export const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "info";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Layout>
      <PageMeta
        title={`${t("header.orders", "Orders")} | TrustTax`}
        description={t(
          "orders.subtitle",
          "Track and manage your service requests",
        )}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("header.orders", "Orders")}</Text>
          <Text style={styles.subtitle}>
            {t(
              "orders.description",
              "View and track the status of your service requests.",
            )}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading orders...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : orders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <FileText size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyText}>
              You haven't placed any orders yet. Visit Services to get started.
            </Text>
          </Card>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.list}>
              {orders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => navigate(`/dashboard/orders/${order.id}`)}
                >
                  <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={styles.orderInfo}>
                        <Text style={styles.serviceName}>
                          {order.service?.name || "Unknown Service"}
                        </Text>
                        <Text style={styles.orderId}>
                          #{order.displayId || order.id.slice(0, 8)}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status.replace("_", " ")}
                        </Badge>
                        {order.status === "DRAFT" && (
                          <>
                            <Button
                              title={t("dashboard.resume", "Resume")}
                              variant="outline"
                              style={{
                                height: 28,
                                paddingVertical: 0,
                                paddingHorizontal: 12,
                              }}
                              textStyle={{ fontSize: 12 }}
                              onPress={(e: any) => {
                                e.stopPropagation();
                                if (order.service?.id) {
                                  navigate(
                                    `/services/${order.service.id}/wizard`,
                                  );
                                }
                              }}
                            />
                            <Button
                              title={t("common.delete", "Delete")}
                              variant="ghost"
                              style={{
                                height: 28,
                                paddingVertical: 0,
                                paddingHorizontal: 8,
                              }}
                              textStyle={{ fontSize: 12, color: "#EF4444" }}
                              onPress={async (e: any) => {
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
                                    await api.deleteOrder(order.id);
                                    setOrders((prev) =>
                                      prev.filter((o) => o.id !== order.id),
                                    );
                                  } catch (err) {
                                    console.error(
                                      "Failed to delete draft",
                                      err,
                                    );
                                  }
                                }
                              }}
                            />
                          </>
                        )}
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.dateContainer}>
                        <Clock size={14} color="#64748B" />
                        <Text style={styles.date}>
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#94A3B8" />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  errorContainer: {
    padding: 24,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#DC2626",
  },
  list: {
    gap: 16,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0, // No corners design
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderInfo: {
    gap: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  orderId: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "monospace",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    fontSize: 14,
    color: "#64748B",
  },
  emptyCard: {
    alignItems: "center",
    padding: 48,
    gap: 16,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
  },
});
