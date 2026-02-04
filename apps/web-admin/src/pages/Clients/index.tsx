import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
  Platform,
} from "react-native";
import { H1, H4, Text, Badge, Button, Input, Inline, Stack, Spacer } from "@trusttax/ui";
import { Users, Mail, Calendar, Trash2, Phone, UserPlus, Info, XCircle, X, CheckCircle, Send } from "lucide-react";
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
  invitationPending?: boolean;
  _count: { orders: number; invoices: number };
}

function fullName(c: Client): string {
  const parts = [c.firstName, c.middleName, c.lastName].filter(
    Boolean,
  ) as string[];
  return parts.length ? parts.join(" ") : c.name || "—";
}

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)}`;
};

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
  const [reinviteConfirm, setReinviteConfirm] = useState<{
    isOpen: boolean;
    email: string | null;
    clientName: string;
  }>({ isOpen: false, email: null, clientName: "" });
  const [reinviting, setReinviting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    confirmEmail: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [createError, setCreateError] = useState("");
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

  const handleReinviteClick = (e: any, client: Client) => {
    e.stopPropagation();
    setReinviteConfirm({
      isOpen: true,
      email: client.email,
      clientName: fullName(client),
    });
  };

  const handleConfirmReinvite = async () => {
    if (!reinviteConfirm.email) return;

    try {
      setReinviting(true);
      const response = await api.reinviteClient(reinviteConfirm.email);

      setAlertDialog({
        isOpen: true,
        title: t("clients.reinvite_sent_title", "Invitation Re-sent"),
        message: response.message || t("clients.invite_sent_msg", "Invitation email sent successfully."),
        variant: "success",
      });

      setReinviteConfirm({ isOpen: false, email: null, clientName: "" });
    } catch (e: any) {
      setAlertDialog({
        isOpen: true,
        title: t("common.error"),
        message: e?.message || "Failed to resend invitation",
        variant: "error",
      });
    } finally {
      setReinviting(false);
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
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <H1 style={isMobile ? styles.titleMobile : undefined}>
              {t("clients.title")}
            </H1>
            <Text style={styles.subtitle}>
              {t("clients.total_clients", { count: clients.length })}
            </Text>
          </View>
          <Button
            title={t("clients.create_client", "Crear cliente")}
            variant="outline"
            style={styles.createBtn}
            onPress={() => {
              setCreateError("");
              setCreateForm({ email: "", confirmEmail: "", firstName: "", lastName: "", phone: "" });
              setCreateOpen(true);
            }}
          />
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
                    <View style={styles.badgeRow}>
                      {c.profileCompleted && (
                        <View style={styles.profileBadge}>
                          <Text style={styles.profileBadgeText}>
                            {t("clients.profile_complete")}
                          </Text>
                        </View>
                      )}
                      {c.invitationPending && (
                        <View style={styles.pendingBadge}>
                          <View style={styles.statusDotPending} />
                          <Text style={styles.pendingBadgeText}>
                            {t("clients.invitation_pending", "Invitación pendiente")}
                          </Text>
                        </View>
                      )}
                    </View>
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
                    <View style={styles.cardActions}>
                      {c.invitationPending && (
                        <TouchableOpacity
                          onPress={(e) => handleReinviteClick(e, c)}
                          style={styles.actionButton}
                          disabled={reinviting}
                        >
                          {reinviting && reinviteConfirm.email === c.email ? (
                            <ActivityIndicator size="small" color="#2563EB" />
                          ) : (
                            <Send size={16} color="#2563EB" />
                          )}
                        </TouchableOpacity>
                      )}
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
                    {c.invitationPending && (
                      <View style={styles.pendingBadge}>
                        <View style={styles.statusDotPending} />
                        <Text style={styles.pendingBadgeText}>
                          {t("clients.invitation_pending", "Invitación pendiente")}
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
                  {c.invitationPending && (
                    <TouchableOpacity
                      onPress={(e) => handleReinviteClick(e, c)}
                      style={styles.actionButton}
                      disabled={reinviting}
                    >
                      {reinviting && reinviteConfirm.email === c.email ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                      ) : (
                        <Send size={16} color="#2563EB" />
                      )}
                    </TouchableOpacity>
                  )}
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

      {/* Create Client Modal */}
      <Modal
        visible={createOpen}
        transparent
        animationType="fade"
        onRequestClose={creating ? undefined : () => setCreateOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("clients.create_title", "Invitar cliente")}
              </Text>
              <TouchableOpacity
                onPress={creating ? undefined : () => setCreateOpen(false)}
                style={styles.modalClose}
                disabled={creating}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalHint}>
                {t(
                  "clients.create_hint",
                  "Invite a professional to collaborate securely. They will receive an email to set up their account.",
                )}
              </Text>

              <Spacer size="xl" />

              <Stack gap="xl">
                <Input
                  label={t("clients.email", "Email Address")}
                  value={createForm.email}
                  placeholder="client@example.com"
                  icon={<Mail size={18} color="#94A3B8" />}
                  onChangeText={(v: string) =>
                    setCreateForm((p) => ({ ...p, email: v }))
                  }
                  style={styles.noMargin}
                />

                <View>
                  <Input
                    label={t("clients.confirm_email", "Confirm Email Address")}
                    value={createForm.confirmEmail}
                    placeholder="client@example.com"
                    icon={<Mail size={18} color="#94A3B8" />}
                    onChangeText={(v: string) =>
                      setCreateForm((p) => ({ ...p, confirmEmail: v }))
                    }
                    style={styles.noMargin}
                  />
                  {createForm.confirmEmail.length > 0 && (
                    <View style={styles.matchIndicator}>
                      {createForm.email.toLowerCase().trim() === createForm.confirmEmail.toLowerCase().trim() ? (
                        <Inline gap="xs">
                          <CheckCircle size={14} color="#10B981" />
                          <Text style={styles.matchTextSuccess}>
                            {t("clients.emails_match", "Emails match")}
                          </Text>
                        </Inline>
                      ) : (
                        <Inline gap="xs">
                          <XCircle size={14} color="#EF4444" />
                          <Text style={styles.matchTextError}>
                            {t("clients.emails_dont_match", "Emails don't match")}
                          </Text>
                        </Inline>
                      )}
                    </View>
                  )}
                </View>

                <Inline gap="md">
                  <View style={{ flex: 1 }}>
                    <Input
                      label={t("clients.first_name", "First Name")}
                      value={createForm.firstName}
                      placeholder={t("common.optional", "Optional")}
                      onChangeText={(v: string) =>
                        setCreateForm((p) => ({ ...p, firstName: v }))
                      }
                      style={styles.noMargin}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label={t("clients.last_name", "Last Name")}
                      value={createForm.lastName}
                      placeholder={t("common.optional", "Optional")}
                      onChangeText={(v: string) =>
                        setCreateForm((p) => ({ ...p, lastName: v }))
                      }
                      style={styles.noMargin}
                    />
                  </View>
                </Inline>

                <Input
                  label={t("clients.phone", "Phone Number")}
                  value={createForm.phone}
                  placeholder="(XXX) XXX-XXXX"
                  icon={<Phone size={18} color="#94A3B8" />}
                  keyboardType="phone-pad"
                  maxLength={14}
                  onChangeText={(v: string) => {
                    const formatted = formatPhoneNumber(v);
                    setCreateForm((p) => ({ ...p, phone: formatted }));
                  }}
                  style={styles.noMargin}
                />

                <View style={styles.infoBox}>
                  <Info size={16} color="#D97706" />
                  <Text style={styles.infoText}>
                    {t(
                      "clients.invite_info",
                      "The invitation expires in 7 days for security reasons.",
                    )}
                  </Text>
                </View>

                {createError ? (
                  <View style={styles.errorBox}>
                    <XCircle size={16} color="#EF4444" />
                    <Text style={styles.modalErrorText}>{createError}</Text>
                  </View>
                ) : null}
              </Stack>
            </View>

            <View style={styles.modalActions}>
              <Button
                title={t("common.cancel", "Cancel")}
                variant="ghost"
                onPress={() => setCreateOpen(false)}
                disabled={creating}
              />
              <Button
                title={
                  creating
                    ? t("clients.sending", "Sending...")
                    : t("clients.send_invite", "Send Invitation")
                }
                icon={creating ? undefined : <UserPlus size={18} color="#FFF" />}
                onPress={async () => {
                  const email = createForm.email.toLowerCase().trim();
                  const confirmEmail = createForm.confirmEmail.toLowerCase().trim();

                  if (!email || !email.includes("@")) {
                    setCreateError(
                      t("clients.invalid_email", "Please enter a valid email address"),
                    );
                    return;
                  }

                  if (email !== confirmEmail) {
                    setCreateError(
                      t("clients.emails_dont_match", "Los correos electrónicos no coinciden"),
                    );
                    return;
                  }
                  try {
                    setCreating(true);
                    setCreateError("");
                    const response = await api.createClient({
                      email,
                      firstName: createForm.firstName.trim() || undefined,
                      lastName: createForm.lastName.trim() || undefined,
                      phone: createForm.phone.trim() || undefined,
                    });

                    setCreateForm({
                      email: "",
                      confirmEmail: "",
                      firstName: "",
                      lastName: "",
                      phone: "",
                    });

                    const data = await api.getClients();
                    setClients(Array.isArray(data) ? data : []);
                    setCreateOpen(false);

                    setAlertDialog({
                      isOpen: true,
                      title: response.isReinvite
                        ? t("clients.reinvite_sent_title", "Invitation Re-sent")
                        : t("clients.invite_sent_title", "Invitation Sent"),
                      message: response.message || t(
                        "clients.invite_sent_msg",
                        "The invitation has been successfully sent to the client.",
                      ),
                      variant: "success",
                    });
                  } catch (e: any) {
                    setCreateError(
                      e?.message ||
                      t(
                        "clients.invite_failed",
                        "Failed to send the invitation. Please try again.",
                      ),
                    );
                  } finally {
                    setCreating(false);
                  }
                }}
                disabled={creating}
              />
            </View>
          </View>
        </View>
      </Modal>

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

      <ConfirmDialog
        isOpen={reinviteConfirm.isOpen}
        onClose={() =>
          setReinviteConfirm({ isOpen: false, email: null, clientName: "" })
        }
        onConfirm={handleConfirmReinvite}
        isLoading={reinviting}
        autoCloseOnConfirm={false}
        title={t("clients.reinvite_title", "Resend Secure Invitation")}
        message={
          <Text style={{ color: "#475569", fontSize: 15, lineHeight: 24 }}>
            You are about to send a new secure invitation link to{" "}
            <Text style={{ fontWeight: "700", color: "#0F172A" }}>
              {reinviteConfirm.email}
            </Text>
            .{"\n\n"}
            <Text style={{ fontSize: 13, color: "#64748B" }}>
              Note: Any previous invitation links sent to this client will be
              invalidated immediately for security purposes.
            </Text>
          </Text>
        }
        confirmText={t("clients.reinvite_confirm", "Send Invitation")}
        cancelText={t("common.cancel", "Cancel")}
        variant="info"
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
    </Layout >
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
  headerRow: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  titleMobile: { fontSize: 24 },
  subtitle: { color: "#64748B", marginTop: 4 },
  errorText: { color: "#EF4444", fontSize: 14 },

  createBtn: {
    height: 44,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)", // Premium backdrop
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 9999,
    elevation: 9999,
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#1E293B", // Sharper border
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? {
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }
      : {}),
  } as any,
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#0F172A" },
  modalClose: {
    padding: 4,
    borderRadius: 0,
    ...(Platform.OS === "web"
      ? {
        cursor: "pointer",
      }
      : {}),
  } as any,
  modalCloseText: { fontSize: 18, color: "#64748B", fontWeight: "400" },
  modalBody: { padding: 24, paddingVertical: 12 },
  modalHint: { fontSize: 13, color: "#64748B", lineHeight: 20 },
  modalRow: { flexDirection: "row", gap: 12 },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  infoText: { fontSize: 12, color: "#B45309", fontWeight: "500" },
  noMargin: { marginBottom: 0 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginTop: 8,
  },
  modalErrorText: { fontSize: 13, color: "#EF4444", fontWeight: "500" },
  matchIndicator: {
    marginTop: 4,
    marginLeft: 4,
  },
  matchTextSuccess: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
  matchTextError: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },

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
  colActions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },

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
  badgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginVertical: 4 },
  profileBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  profileBadgeText: { fontSize: 11, fontWeight: "600", color: "#15803D" },
  pendingBadge: {
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDotPending: {
    width: 6,
    height: 6,
    backgroundColor: "#D97706",
    borderRadius: 0,
  },
  pendingBadgeText: { fontSize: 11, fontWeight: "700", color: "#B45309" },
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
    borderRadius: 0,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  actionButton: {
    padding: 8,
    borderRadius: 0,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
});
