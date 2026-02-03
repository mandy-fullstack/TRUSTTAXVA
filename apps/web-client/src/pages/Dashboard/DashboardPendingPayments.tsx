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
              isSmallMobile && styles.actionItemSmallMobile,
              isMobile && !isSmallMobile && styles.actionItemMobile,
              i === invoices.length - 1 && styles.noBorder,
            ]}
          >
            <View
              style={[
                styles.actionInfo,
                isSmallMobile && styles.actionInfoSmallMobile,
                isMobile && !isSmallMobile && styles.actionInfoMobile,
              ]}
            >
              <View
                style={[
                  styles.actionIconWrapper,
                  isSmallMobile && styles.actionIconWrapperSmallMobile,
                ]}
              >
                <AlertCircle
                  size={isSmallMobile ? 16 : isMobile ? 17 : 18}
                  color="#F59E0B"
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={[
                    styles.actionText,
                    isSmallMobile && styles.actionTextSmallMobile,
                    isMobile && !isSmallMobile && styles.actionTextMobile,
                  ]}
                  numberOfLines={2}
                >
                  {inv.description ||
                    t("dashboard.service_invoice", "Service Invoice")}
                </Text>
                <Text
                  style={[
                    styles.actionSubtext,
                    isSmallMobile && styles.actionSubtextSmallMobile,
                    isMobile && !isSmallMobile && styles.actionSubtextMobile,
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
                  ? ({ marginTop: 8, alignSelf: "flex-start" } as any)
                  : isMobile && !isSmallMobile
                    ? ({ marginLeft: 8 } as any)
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
  wrapper: {
    marginTop: 16,
    width: "100%",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  wrapperSmallMobile: {
    marginTop: 12,
    width: "100%",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  wrapperMobile: {
    marginTop: 14,
    width: "100%",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  wrapperTablet: {
    marginTop: 16,
    width: "100%",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  gridTitle: { marginBottom: 10 },
  gridTitleSmallMobile: { marginBottom: 8, fontSize: 16 },
  gridTitleTablet: { marginBottom: 10, fontSize: 18 },
  card: { overflow: "hidden" },
  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    minHeight: 56,
  },
  actionItemSmallMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 8,
    paddingHorizontal: 10,
    minHeight: "auto",
    gap: 6,
  },
  actionItemMobile: {
    padding: 9,
    paddingHorizontal: 11,
    minHeight: 54,
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
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    width: "100%",
  },
  actionInfoMobile: {
    gap: 12,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actionIconWrapperSmallMobile: {
    width: 36,
    height: 36,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    flexShrink: 1,
  },
  actionTextSmallMobile: { fontSize: 13, lineHeight: 18 },
  actionTextMobile: { fontSize: 13.5 },
  actionSubtext: { fontSize: 12, color: "#64748B", marginTop: 2 },
  actionSubtextSmallMobile: { fontSize: 11, marginTop: 4 },
  actionSubtextMobile: { fontSize: 11.5, marginTop: 3 },
});
