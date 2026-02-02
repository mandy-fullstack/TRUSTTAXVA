import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { Link } from "react-router-dom";
import { AuthorizedIRSBadge } from "./AuthorizedIRSBadge";
import { Text } from "@trusttax/ui";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Twitter,
} from "lucide-react";
import { useCompany } from "../context/CompanyContext";
import { useTranslation } from "react-i18next";
import { TrustTaxLogo } from "./TrustTaxLogo";
import { getPublicNav } from "../config/navigation";

export const Footer = () => {
  const { t } = useTranslation();
  const { profile } = useCompany();

  const navItems = getPublicNav();

  const companyName = profile?.dba || profile?.companyName || "TrustTax";
  const companyPhone = profile?.phone || "(540) 876-9748";
  const companyEmail = profile?.email || "contact@trusttax.com";
  const companyAddress = profile?.address || "123 Business Ave, VA";

  const footerBg = "#0B1120";
  const secondaryColor = profile?.secondaryColor || "#2563EB";
  const social = profile?.socialLinks || {};

  const hoursList = profile?.businessHours || [];

  const openLink = (url: string) => {
    if (url)
      Linking.openURL(url).catch((err) =>
        console.error("Couldn't load page", err),
      );
  };

  return (
    <View style={styles.footerContainer}>
      <View style={[styles.footer, { backgroundColor: footerBg }]}>
        <View style={styles.footerMain}>
          {/* Brand Section */}
          <View style={styles.brandSection}>
            <Link to="/" style={styles.logoRow as any}>
              <TrustTaxLogo size={44} bgColor={secondaryColor} />
              <Text style={styles.brandName}>{companyName}</Text>
            </Link>
            <Text style={styles.brandDesc}>
              {profile?.description ||
                t(
                  "footer.brand_desc",
                  "Your professional partner for tax preparation, immigration services, and business consulting in Virginia.",
                )}
            </Text>
            <View style={styles.socialGrid}>
              {social.facebook && (
                <TouchableOpacity
                  onPress={() => openLink(social.facebook)}
                  style={styles.socialBox}
                >
                  <Facebook size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
              {social.instagram && (
                <TouchableOpacity
                  onPress={() => openLink(social.instagram)}
                  style={styles.socialBox}
                >
                  <Instagram size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
              {social.linkedin && (
                <TouchableOpacity
                  onPress={() => openLink(social.linkedin)}
                  style={styles.socialBox}
                >
                  <Linkedin size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
              {social.twitter && (
                <TouchableOpacity
                  onPress={() => openLink(social.twitter)}
                  style={styles.socialBox}
                >
                  <Twitter size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Navigation Columns */}
          <View style={styles.navSection}>
            <View style={styles.navCol}>
              <Text style={styles.colHeader}>
                {t("footer.navigation", "Navigation")}
              </Text>
              {navItems.map((item) => {
                const label = t(item.i18nKey, item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={styles.navLink as any}
                    className={Platform.OS === "web" ? "nav-link" : undefined}
                  >
                    <Text style={styles.navLinkText}>{label}</Text>
                  </Link>
                );
              })}
            </View>

            <View style={styles.navCol}>
              <Text style={styles.colHeader}>
                {t("footer.reach_out", "Reach Out")}
              </Text>
              <View style={styles.contactItem}>
                <MapPin size={14} color={secondaryColor} />
                <Text style={styles.contactText}>{companyAddress}</Text>
              </View>
              <View style={styles.contactItem}>
                <Phone size={14} color={secondaryColor} />
                <Text style={styles.contactText}>{companyPhone}</Text>
              </View>
              <View style={styles.contactItem}>
                <Mail size={14} color={secondaryColor} />
                <Text style={styles.contactText}>{companyEmail}</Text>
              </View>

              {/* Integrated Hours */}
              {hoursList.length > 0 && (
                <View style={styles.hoursCompact}>
                  {hoursList.map((h: any, i: number) => (
                    <Text key={i} style={styles.hoursSmall}>
                      {h.label}: {h.value}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.navCol, styles.complianceCol]}>
              <Text style={styles.colHeader}>
                {t("footer.compliance", "Compliance")}
              </Text>
              <View style={styles.irsBadgePlacement}>
                <AuthorizedIRSBadge variant="dark" />
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Bar */}
        <View style={styles.footerBottom}>
          <View style={styles.footerBottomInner}>
            <Text style={styles.copyrightText}>
              &copy; {new Date().getFullYear()} {companyName}.{" "}
              {t("footer.rights_reserved", "All rights reserved.")}
            </Text>
            <View style={styles.legalLinks}>
              <Link to="/legal/privacy" style={styles.legalLink as any}>
                <Text style={styles.legalText}>
                  {t("footer.privacy_policy", "Privacy Policy")}
                </Text>
              </Link>
              <View style={styles.legalDot} />
              <Link to="/legal/terms" style={styles.legalLink as any}>
                <Text style={styles.legalText}>
                  {t("footer.terms_of_service", "Terms of Service")}
                </Text>
              </Link>
              <View style={styles.legalDot} />
              <Link to="/legal/sms-consent" style={styles.legalLink as any}>
                <Text style={styles.legalText}>
                  {t("footer.sms_consent", "SMS Consent")}
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: "100%",
    backgroundColor: "#0B1120",
  },
  footer: {
    width: "100%",
    maxWidth: 1400,
    marginHorizontal: "auto",
    paddingTop: 80,
    paddingBottom: 0,
  },
  footerMain: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 40,
    justifyContent: "space-between",
    paddingBottom: 60,
  },
  brandSection: {
    flex: 2,
    minWidth: 280,
    marginBottom: 40,
    paddingRight: 20,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  brandDesc: {
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 26,
    fontWeight: "300",
    marginBottom: 32,
    maxWidth: 400,
  },
  socialGrid: {
    flexDirection: "row",
    gap: 12,
  },
  socialBox: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  navSection: {
    flex: 3,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 40,
    minWidth: 300,
    justifyContent: "flex-start",
  },
  navCol: {
    minWidth: 140,
    flex: 1,
    marginBottom: 20,
  },
  complianceCol: {
    minWidth: 220,
  },
  colHeader: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 24,
    opacity: 0.9,
  },
  navLink: {
    marginBottom: 12,
  },
  navLinkText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "400",
  },
  contactItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  contactText: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "300",
    flex: 1,
  },
  hoursCompact: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  hoursSmall: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "400",
  },
  irsBadgePlacement: {
    marginTop: -4,
    alignSelf: "flex-start",
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingVertical: 32,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  footerBottomInner: {
    maxWidth: 1400,
    marginHorizontal: "auto",
    width: "100%",
    paddingHorizontal: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  copyrightText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "300",
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  legalLink: {
    textDecorationLine: "none",
  },
  legalText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "300",
  },
  legalDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});
