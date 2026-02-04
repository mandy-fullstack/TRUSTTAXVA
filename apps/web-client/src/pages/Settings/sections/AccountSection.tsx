import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { H3, Text, Card, Button } from "@trusttax/ui";
import { Mail, User, Calendar } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";

export const AccountSection = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

        <View style={styles.divider} />

        <View style={[styles.row, isMobile && styles.rowMobile]}>
          <View style={styles.rowContent}>
            <Text style={styles.label}>
              {t("settings.logout", "Logout")}
            </Text>
            <Text style={styles.value}>
              {t("settings.logout_desc", "Sign out of your account on this device.")}
            </Text>
          </View>
          <Button
            variant="danger"
            size="sm"
            onPress={() => setShowLogoutConfirm(true)}
          >
            {t("header.logout", "Logout")}
          </Button>
        </View>
      </Card>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          navigate("/login", { replace: true });
        }}
        title={t("dialog.logout_title", "Confirm Logout")}
        message={t("dialog.logout_message", "Are you sure you want to log out?")}
        confirmText={t("dialog.logout", "Logout")}
        cancelText={t("dialog.cancel", "Cancel")}
        variant="danger"
      />
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
    borderRadius: 0,
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
