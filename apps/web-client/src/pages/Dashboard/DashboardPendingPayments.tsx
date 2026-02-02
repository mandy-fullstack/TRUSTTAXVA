import { View, StyleSheet, useWindowDimensions } from "react-native";
import { AlertCircle } from "lucide-react";
import { H4, Card, Text, Badge } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import {
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  SMALL_MOBILE_BREAKPOINT,
} from "../../config/navigation";

interface Invoice {
  id: string;
  description?: string;
  amount?: number | string;
}

interface DashboardPendingPaymentsProps {
  invoices: Invoice[];
}

export const DashboardPendingPayments = ({
  invoices,
}: DashboardPendingPaymentsProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  // Responsive breakpoints
  const isSmallMobile = width < SMALL_MOBILE_BREAKPOINT;
  const isMobile = width < MOBILE_BREAKPOINT;
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;

  if (invoices.length === 0) return null;

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
        {t("dashboard.pending_payments", "Pending Payments")}
      </H4>
      <Card padding="none" elevated style={styles.card}>
        {invoices.map((inv, i) => (
          <View
            key={inv.id}
            style={[
              styles.actionItem,
              i === invoices.length - 1 && styles.noBorder,
            ]}
          >
            <View
              style={[
                styles.actionInfo,
                isSmallMobile && styles.actionInfoSmallMobile,
              ]}
            >
              <View style={styles.actionIconWrapper}>
                <AlertCircle
                  size={isSmallMobile ? 16 : isMobile ? 17 : 18}
                  color="#F59E0B"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.actionText,
                    isSmallMobile && styles.actionTextSmallMobile,
                  ]}
                >
                  {inv.description ||
                    t("dashboard.service_invoice", "Service Invoice")}
                </Text>
                <Text
                  style={[
                    styles.actionSubtext,
                    isSmallMobile && styles.actionSubtextSmallMobile,
                  ]}
                >
                  {t("dashboard.amount_due", "Amount due")}: $
                  {typeof inv.amount === "number"
                    ? inv.amount.toFixed(0)
                    : (inv.amount ?? "0")}
                </Text>
              </View>
            </View>
            <Badge
              label={t("dashboard.pay_now", "Pay Now")}
              variant="warning"
              style={
                isSmallMobile
                  ? ({ marginTop: 8 } as any)
                  : undefined
              }
            />
          </View>
        ))}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginTop: 40, width: "100%" },
  wrapperSmallMobile: { marginTop: 24, width: "100%" },
  wrapperMobile: { marginTop: 28, width: "100%" },
  wrapperTablet: { marginTop: 32, width: "100%" },
  gridTitle: { marginBottom: 16 },
  gridTitleSmallMobile: { marginBottom: 10, fontSize: 16 },
  gridTitleTablet: { marginBottom: 12, fontSize: 18 },
  card: { overflow: "hidden" },
  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    minHeight: 64,
  },
  actionItemSmallMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 10,
    paddingHorizontal: 12,
    minHeight: "auto",
  },
  noBorder: { borderBottomWidth: 0 },
  actionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
    minWidth: 0,
  },
  actionInfoSmallMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actionText: { fontSize: 14, fontWeight: "600", color: "#1E293B", flexShrink: 1 },
  actionTextSmallMobile: { fontSize: 13 },
  actionSubtext: { fontSize: 12, color: "#64748B", marginTop: 2 },
  actionSubtextSmallMobile: { fontSize: 11, marginTop: 4 },
});
