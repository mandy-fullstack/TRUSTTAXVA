import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { api } from "../../services/api";
import { H1, Card, Text, Badge, Button, Input } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { Search, Filter, Eye } from "lucide-react";

export const AdminOrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.adminGetOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch admin orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Layout>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 100,
          }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </Layout>
    );
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "warning";
      case "SUBMITTED":
        return "primary";
      default:
        return "info";
    }
  };

  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <H1>{t("admin.orders_title", "Order Management")}</H1>
            <Text style={styles.subtitle}>
              {t("admin.orders_subtitle", "View and manage all client orders")}
            </Text>
          </View>
          <Button
            title={t("admin.manage_services", "Manage Catalog")}
            variant="primary"
            onPress={() => navigate("/admin/services")}
          />
        </View>

        <Card style={styles.searchCard}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <Search size={20} color="#64748B" style={styles.searchIcon} />
              <Input
                placeholder={t(
                  "admin.search_placeholder",
                  "Search by ID, client or service...",
                )}
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={styles.searchInput}
              />
            </View>
            <Button
              title={t("admin.filter", "Filter")}
              variant="outline"
              onPress={() => {}}
              Icon={Filter}
            />
          </View>
        </Card>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 2 }]}>
                {t("admin.client", "Client")}
              </Text>
              <Text style={[styles.columnHeader, { flex: 2 }]}>
                {t("admin.service", "Service")}
              </Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>
                {t("admin.date", "Date")}
              </Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>
                {t("admin.status", "Status")}
              </Text>
              <Text style={[styles.columnHeader, { width: 80, flex: 0 }]}>
                {t("admin.actions", "Actions")}
              </Text>
            </View>

            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                return (
                  <TouchableOpacity
                    key={order.id}
                    style={[
                      styles.tableRow,
                      Platform.OS === "web" &&
                        ({
                          cursor: "pointer",
                        } as any),
                    ]}
                    onPress={() => navigate(`/admin/orders/${order.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 2 }}>
                      <Text style={styles.clientName}>
                        {order.user?.name || "Unknown"}
                      </Text>
                      <Text style={styles.clientEmail}>
                        {order.user?.email}
                      </Text>
                    </View>
                    <View style={{ flex: 2 }}>
                      <Text style={[styles.serviceName, styles.serviceLink]}>
                        {order.service?.name}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dateText}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Badge
                        label={order.status}
                        variant={getStatusVariant(order.status) as any}
                      />
                    </View>
                    <View style={{ width: 80, flex: 0, alignItems: "center" }}>
                      <View style={styles.actionBtn}>
                        <Eye size={20} color="#2563EB" />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text>
                  {t(
                    "admin.no_orders_found",
                    "No orders found match your search.",
                  )}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 16,
    marginTop: 4,
  },
  searchCard: {
    marginBottom: 24,
    padding: 16,
  },
  searchRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 0,
    backgroundColor: "transparent",
  } as any,
  scrollContent: {
    paddingBottom: 40,
  },
  table: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
  },
  clientName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  clientEmail: {
    fontSize: 12,
    color: "#64748B",
  },
  serviceName: {
    fontSize: 14,
    color: "#334155",
  },
  serviceLink: {
    color: "#2563EB",
    fontWeight: "600",
  },
  dateText: {
    fontSize: 14,
    color: "#64748B",
  },
  actionBtn: {
    padding: 8,
    borderRadius: 0,
    backgroundColor: "#EFF6FF",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  tableRowHover: {
    backgroundColor: "#F8FAFC",
  },
});
