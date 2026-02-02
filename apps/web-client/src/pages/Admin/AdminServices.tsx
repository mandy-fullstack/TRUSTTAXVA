import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Layout } from "../../components/Layout";
import { api } from "../../services/api";
import { H1, Card, Text, Badge, Button } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";

export const AdminServicesPage = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // We'll use the existing public services for now,
        // but we could have an admin specific one later.
        const data = await api.getServices();
        setServices(data);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
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

  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <H1>{t("admin.services_title", "Service Catalog")}</H1>
            <Text style={styles.subtitle}>
              {t(
                "admin.services_subtitle",
                "Manage service offerings, prices, and categories",
              )}
            </Text>
          </View>
          <Button
            title={t("admin.add_service", "Add Service")}
            Icon={Plus}
            onPress={() => {}}
          />
        </View>

        <View style={styles.grid}>
          {services.map((service) => (
            <Card key={service.id} style={styles.serviceCard}>
              <View style={styles.cardContent}>
                <View style={styles.serviceHeader}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Badge
                      label={service.category}
                      variant="info"
                      style={styles.categoryBadge}
                    />
                  </View>
                  <Text style={styles.price}>${service.price}</Text>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {service.description || "No description provided."}
                </Text>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
                    <Edit2 size={18} color="#2563EB" />
                    <Text style={styles.actionText}>
                      {t("common.edit", "Edit")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => {}}
                  >
                    <Trash2 size={18} color="#EF4444" />
                    <Text style={[styles.actionText, styles.deleteText]}>
                      {t("common.delete", "Delete")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  subtitle: { color: "#64748B", fontSize: 16, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  serviceCard: {
    width: Platform.OS === "web" ? "calc(33.33% - 14px)" : "100%",
    minWidth: 300,
    padding: 0,
    borderRadius: 0,
  } as any,
  cardContent: { padding: 20 },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleWrapper: { flex: 1, gap: 8 },
  serviceName: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  categoryBadge: { borderRadius: 0 },
  price: { fontSize: 20, fontWeight: "800", color: "#2563EB" },
  description: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
    gap: 16,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 14, fontWeight: "600", color: "#2563EB" },
  deleteBtn: { marginLeft: "auto" },
  deleteText: { color: "#EF4444" },
});
