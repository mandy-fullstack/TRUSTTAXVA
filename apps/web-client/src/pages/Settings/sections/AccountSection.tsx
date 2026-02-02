import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { H3, Text, Card } from "@trusttax/ui";
import { Mail, User, Calendar } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export const AccountSection = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={styles.section}>
      <H3 style={styles.sectionTitle}>{t("settings.account", "Account")}</H3>
      <Card style={styles.card}>
        {/* Name */}
        <View style={[styles.row, isMobile && styles.rowMobile]}>
          <View style={styles.iconBox}>
            <User size={20} color="#64748B" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.label}>
              {t("common.full_name", "Full Name")}
            </Text>
            <Text style={styles.value}>
              {user?.name || t("common.not_provided", "Not provided")}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Email */}
        <View style={[styles.row, isMobile && styles.rowMobile]}>
          <View style={styles.iconBox}>
            <Mail size={20} color="#64748B" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.label}>
              {t("common.email", "Email Address")}
            </Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
        </View>

        {/* Joined Date (Optional) */}
        {(user as any)?.createdAt && (
          <>
            <View style={styles.divider} />
            <View style={[styles.row, isMobile && styles.rowMobile]}>
              <View style={styles.iconBox}>
                <Calendar size={20} color="#64748B" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.label}>
                  {t("settings.joined_on", "Joined on")}
                </Text>
                <Text style={styles.value}>
                  {formatDate((user as any).createdAt)}
                </Text>
              </View>
            </View>
          </>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
    color: "#1E293B",
  },
  card: {
    padding: 0,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  rowMobile: {
    flexDirection: "row", // Keep row for icon + text, usually fits. If not, can wrap text.
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginLeft: 76, // Align with text start (20pad + 40icon + 16gap)
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8, // Rounded square
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  rowContent: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: "#64748B",
  },
});
