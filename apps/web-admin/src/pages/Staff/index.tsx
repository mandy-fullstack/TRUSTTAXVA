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
import { Users, Mail, Calendar, ShieldCheck } from "lucide-react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";

interface StaffMember {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "PREPARER";
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  updatedAt?: string;
  _count: { preparedOrders: number; preparedAppointments: number };
}

function fullName(s: StaffMember): string {
  const parts = [s.firstName, s.lastName].filter(Boolean) as string[];
  return parts.length ? parts.join(" ") : s.name || "—";
}

const MOBILE_BREAKPOINT = 768;

export function StaffPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getStaff();
        if (!cancelled) setStaff(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load staff");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
              Staff & Team
            </H1>
            <Text style={styles.subtitle}>{staff.length} team members</Text>
          </View>
        </View>

        {staff.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#E2E8F0" />
            <H4 style={styles.emptyTitle}>No Staff Members</H4>
            <Text style={styles.emptyText}>
              Staff members will appear here once they are added.
            </Text>
          </View>
        ) : isMobile ? (
          <View style={styles.cardList}>
            {staff.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.card}
                onPress={() => navigate(`/clients/${s.id}`)} // Reusing client detail for now as it's common user detail
                activeOpacity={0.7}
              >
                <View style={styles.cardRow}>
                  <View style={styles.avatar}>
                    <ShieldCheck size={18} color="#64748B" />
                  </View>
                  <View style={styles.cardMain}>
                    <View style={styles.nameRow}>
                      <Text style={styles.staffName}>{fullName(s)}</Text>
                      <Badge
                        label={s.role}
                        variant={s.role === "ADMIN" ? "primary" : "secondary"}
                      />
                    </View>
                    <View style={styles.cardMeta}>
                      <Mail size={12} color="#94A3B8" />
                      <Text style={styles.emailText}>{s.email}</Text>
                    </View>
                    <View style={styles.cardMeta}>
                      <Calendar size={12} color="#94A3B8" />
                      <Text style={styles.dateText}>
                        Joined {new Date(s.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colName]}>Member</Text>
              <Text style={[styles.th, styles.colRole]}>Role</Text>
              <Text style={[styles.th, styles.colEmail]}>Email</Text>
              <Text style={[styles.th, styles.colDate]}>Joined</Text>
            </View>
            {staff.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.tableRow}
                onPress={() => navigate(`/clients/${s.id}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.colName, styles.cell]}>
                  <View style={styles.avatar}>
                    <ShieldCheck size={16} color="#64748B" />
                  </View>
                  <Text style={styles.staffName}>{fullName(s)}</Text>
                </View>
                <View style={[styles.colRole, styles.cell]}>
                  <Badge
                    label={s.role}
                    variant={s.role === "ADMIN" ? "primary" : "secondary"}
                  />
                </View>
                <View style={[styles.colEmail, styles.cell]}>
                  <Mail size={14} color="#94A3B8" />
                  <Text style={styles.emailText}>{s.email}</Text>
                </View>
                <View style={[styles.colDate, styles.cell]}>
                  <Calendar size={14} color="#94A3B8" />
                  <Text style={styles.dateText}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  colRole: { flex: 1.5 },
  colEmail: { flex: 3 },
  colDate: { flex: 2 },

  avatar: {
    width: 36,
    height: 36,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  staffName: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  emailText: { fontSize: 13, color: "#64748B" },
  dateText: { fontSize: 13, color: "#64748B" },

  cardList: { gap: 12, width: "100%" },
  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardMain: { flex: 1, gap: 6 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6 },

  emptyState: { padding: 48, alignItems: "center", gap: 12 },
  emptyTitle: { color: "#1E293B" },
  emptyText: { color: "#94A3B8", textAlign: "center" },
});
