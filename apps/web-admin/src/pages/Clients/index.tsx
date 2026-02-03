import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { H1, H4, Text, Badge } from "@trusttax/ui";
import { Users, Mail, Calendar, Trash2 } from "lucide-react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { useTranslation } from "react-i18next";
import { useSocketContext } from "../../context/SocketContext";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AlertDialog } from "../../components/AlertDialog";

interface Client {
  id: string;
  email: string;
  name: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  countryOfBirth?: string | null;
  primaryLanguage?: string | null;
  profileCompleted?: boolean;
  taxIdType?: string | null;
  ssnLast4?: string | null;
  driverLicenseLast4?: string | null;
  passportLast4?: string | null;
  termsAcceptedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  _count: { orders: number; invoices: number };
}

function fullName(c: Client): string {
  const parts = [c.firstName, c.middleName, c.lastName].filter(
    Boolean,
  ) as string[];
  return parts.length ? parts.join(" ") : c.name || "—";
}

const MOBILE_BREAKPOINT = 768;

export function ClientsPage() {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { socket, isConnected } = useSocketContext();
  const isMobile = width < MOBILE_BREAKPOINT;
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    clientId: string | null;
    clientName: string;
  }>({ isOpen: false, clientId: null, clientName: "" });
  const [deleting, setDeleting] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "info" | "warning";
  }>({ isOpen: false, title: "", message: "", variant: "info" });
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getClients();
        if (!cancelled) setClients(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load clients");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Real-time updates for clients
  useEffect(() => {
    if (!isConnected || !socket) return;

    const handleClientUpdate = (data: any) => {
      console.log("👥 Clients: Client update received", data);
      // Update the specific client in the list
      setClients((prev) =>
        prev.map((client) =>
          client.id === data.clientId
            ? { ...client, ...data.updates }
            : client
        )
      );
    };

    const handleNewClient = (data: any) => {
      console.log("👥 Clients: New client received", data);
      // Refresh the list when new client registers
      api.getClients()
        .then((newClients) => {
          setClients(Array.isArray(newClients) ? newClients : []);
        })
        .catch((e) => {
          console.error("Failed to refresh clients:", e);
        });
    };

    (socket as any).on("clientUpdate", handleClientUpdate);
    (socket as any).on("newClient", handleNewClient);

    return () => {
      (socket as any).off("clientUpdate", handleClientUpdate);
      (socket as any).off("newClient", handleNewClient);
    };
  }, [isConnected, socket]);

  const handleDeleteClick = (e: any, client: Client) => {
    e.stopPropagation(); // Prevent navigation
    setDeleteConfirm({
      isOpen: true,
      clientId: client.id,
      clientName: fullName(client),
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.clientId) return;

    try {
      setDeleting(true);
      await api.deleteClient(deleteConfirm.clientId);
      
      // Show success message
      setAlertDialog({
        isOpen: true,
        title: t("clients.delete_success_title"),
        message: t("clients.delete_success_message", {
          name: deleteConfirm.clientName,
        }),
        variant: "success",
      });

      // Refresh clients list
      const data = await api.getClients();
      setClients(Array.isArray(data) ? data : []);
      
      setDeleteConfirm({ isOpen: false, clientId: null, clientName: "" });
    } catch (e: any) {
      console.error("Failed to delete client:", e);
      setAlertDialog({
        isOpen: true,
        title: t("clients.delete_error_title"),
        message: e?.message || t("clients.delete_error_message"),
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          isMobile && styles.containerMobile,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <H1 style={isMobile ? styles.titleMobile : undefined}>
              {t("clients.title")}
            </H1>
            <Text style={styles.subtitle}>
              {t("clients.total_clients", { count: clients.length })}
            </Text>
          </View>
        </View>

        {clients.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#E2E8F0" />
            <H4 style={styles.emptyTitle}>{t("clients.no_clients_yet")}</H4>
            <Text style={styles.emptyText}>
              {t("clients.no_clients_message")}
            </Text>
          </View>
        ) : isMobile ? (
          <View style={styles.cardList}>
            {clients.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.card}
                onPress={() => navigate(`/clients/${c.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.cardRow}>
                  <View style={styles.avatar}>
                    <Users size={18} color="#64748B" />
                  </View>
                  <View style={styles.cardMain}>
                    <Text style={styles.clientName}>{fullName(c)}</Text>
                    {c.profileCompleted && (
                      <View style={styles.profileBadge}>
                        <Text style={styles.profileBadgeText}>
                          {t("clients.profile_complete")}
                        </Text>
                      </View>
                    )}
                    <View style={styles.cardMeta}>
                      <Mail size={12} color="#94A3B8" />
                      <Text style={styles.emailText}>{c.email}</Text>
                    </View>
                    <View style={styles.cardMeta}>
                      <Calendar size={12} color="#94A3B8" />
                      <Text style={styles.dateText}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Badge
                      label={t("clients.orders_count", {
                        count: c._count?.orders ?? 0,
                      })}
                      variant={
                        (c._count?.orders ?? 0) > 0 ? "primary" : "secondary"
                      }
                    />
                    <TouchableOpacity
                      onPress={(e) => handleDeleteClick(e, c)}
                      style={styles.deleteButton}
                      disabled={deleting}
                    >
                      {deleting && deleteConfirm.clientId === c.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <Trash2 size={16} color="#EF4444" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colName]}>
                {t("clients.title")}
              </Text>
              <Text style={[styles.th, styles.colEmail]}>
                {t("common.email")}
              </Text>
              <Text style={[styles.th, styles.colOrders]}>
                {t("orders.title")}
              </Text>
              <Text style={[styles.th, styles.colDate]}>
                {t("common.date")}
              </Text>
              <Text style={[styles.th, styles.colActions]}>
                {t("clients.actions")}
              </Text>
            </View>
            {clients.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.tableRow}
                onPress={() => navigate(`/clients/${c.id}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.colName, styles.cell]}>
                  <View style={styles.avatar}>
                    <Users size={16} color="#64748B" />
                  </View>
                  <View style={styles.nameCell}>
                    <Text style={styles.clientName}>{fullName(c)}</Text>
                    {c.profileCompleted && (
                      <View style={styles.profileBadge}>
                        <Text style={styles.profileBadgeText}>
                          {t("clients.profile_complete")}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={[styles.colEmail, styles.cell]}>
                  <Mail size={14} color="#94A3B8" />
                  <Text style={styles.emailText}>{c.email}</Text>
                </View>
                <View style={[styles.colOrders, styles.cell]}>
                  <Badge
                    label={t("clients.orders_count", {
                      count: c._count?.orders ?? 0,
                    })}
                    variant={
                      (c._count?.orders ?? 0) > 0 ? "primary" : "secondary"
                    }
                  />
                </View>
                <View style={[styles.colDate, styles.cell]}>
                  <Calendar size={14} color="#94A3B8" />
                  <Text style={styles.dateText}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.colActions}>
                  <TouchableOpacity
                    onPress={(e) => handleDeleteClick(e, c)}
                    style={styles.deleteButton}
                    disabled={deleting}
                  >
                    {deleting && deleteConfirm.clientId === c.id ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Trash2 size={16} color="#EF4444" />
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, clientId: null, clientName: "" })
        }
        onConfirm={handleConfirmDelete}
        isLoading={deleting}
        autoCloseOnConfirm={false}
        title={t("clients.delete_confirm_title")}
        message={t("clients.delete_confirm_message", {
          name: deleteConfirm.clientName,
        })}
        confirmText={t("clients.delete_confirm_button")}
        cancelText={t("clients.delete_cancel_button")}
        variant="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() =>
          setAlertDialog({
            isOpen: false,
            title: "",
            message: "",
            variant: "info",
          })
        }
        title={alertDialog.title}
        message={alertDialog.message}
        variant={alertDialog.variant}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, width: "100%" },
  container: {
    padding: 32,
    width: "100%",
    minWidth: "100%" as any,
    minHeight: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  containerMobile: { padding: 16, paddingTop: 24 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  header: { marginBottom: 24 },
  titleMobile: { fontSize: 24 },
  subtitle: { color: "#64748B", marginTop: 4 },
  errorText: { color: "#EF4444", fontSize: 14 },

  tableContainer: {
    backgroundColor: "#FFF",
    borderRadius: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  th: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "center",
  },
  cell: { flexDirection: "row", alignItems: "center", gap: 10 },
  colName: { flex: 3 },
  colEmail: { flex: 3 },
  colOrders: { flex: 2 },
  colDate: { flex: 2 },
  colActions: { flex: 1, alignItems: "center" },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 0,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  nameCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  clientName: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  profileBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
  },
  profileBadgeText: { fontSize: 11, fontWeight: "600", color: "#15803D" },
  emailText: { fontSize: 13, color: "#64748B" },
  dateText: { fontSize: 13, color: "#64748B" },

  cardList: { gap: 12, width: "100%" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardMain: { flex: 1, gap: 6 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6 },

  emptyState: { padding: 48, alignItems: "center", gap: 12 },
  emptyTitle: { color: "#1E293B" },
  emptyText: { color: "#94A3B8", textAlign: "center" },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
});
