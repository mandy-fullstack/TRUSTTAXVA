import { View, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Text, H1, H2 } from "@trusttax/ui";
import { PublicLayout } from "../../components/PublicLayout";
import { PageMeta } from "../../components/PageMeta";
import { useCompany } from "../../context/CompanyContext";
import { FileText, AlertCircle, Shield, CheckCircle } from "lucide-react";

export const TermsOfServicePage = () => {
  const { t } = useTranslation();
  const { profile } = useCompany();
  const companyName = profile?.companyName || "TrustTax";
  const companyEmail = profile?.email || "contact@trusttax.com";
  const companyPhone = profile?.phone || "(540) 876-9748";

  return (
    <PublicLayout>
      <PageMeta
        title={t("legal.terms.title", {
          companyName,
          defaultValue: `Terms of Service | ${companyName}`,
        })}
        description={t(
          "legal.terms.description",
          "Read our terms of service and understand your rights and obligations when using our services.",
        )}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <FileText size={32} color="#2563EB" />
          </View>
          <H1 style={styles.title}>
            {t("legal.terms.page_title", "Terms of Service")}
          </H1>
          <Text style={styles.lastUpdated}>
            {t("legal.last_updated", "Last Updated: January 27, 2026")}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.intro",
                `Welcome to ${companyName}. These Terms of Service ("Terms") govern your access to and use of our tax preparation, immigration services, and related services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.`,
              )}
            </Text>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.intro_2",
                "If you do not agree to these Terms, please do not use our Services.",
              )}
            </Text>
          </View>

          {/* Acceptance of Terms */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckCircle size={20} color="#2563EB" />
              <H2 style={styles.sectionTitle}>
                {t("legal.terms.acceptance", "Acceptance of Terms")}
              </H2>
            </View>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.acceptance_text",
                "By creating an account, accessing our website, or using any of our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding agreement between you and {companyName}.",
                { companyName },
              )}
            </Text>
          </View>

          {/* Eligibility */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.eligibility", "Eligibility")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.eligibility_text",
                "You must be at least 18 years old and have the legal capacity to enter into contracts to use our Services. By using our Services, you represent and warrant that:",
              )}
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.eligibility_1",
                  "You are at least 18 years of age",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.eligibility_2",
                  "You have the legal authority to enter into these Terms",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.eligibility_3",
                  "All information you provide is accurate and truthful",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.eligibility_4",
                  "You will comply with all applicable laws and regulations",
                )}
              </Text>
            </View>
          </View>

          {/* Services Description */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.services", "Description of Services")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.services_text",
                `${companyName} provides professional tax preparation, immigration services, and business consulting services. Our Services include:`,
              )}
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.service_1",
                  "Tax return preparation and filing",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.service_2",
                  "Immigration document preparation and consultation",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.service_3",
                  "Business consulting and advisory services",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.service_4",
                  "Document management and secure storage",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.service_5",
                  "Customer support and communication",
                )}
              </Text>
            </View>
          </View>

          {/* User Responsibilities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertCircle size={20} color="#EF4444" />
              <H2 style={styles.sectionTitle}>
                {t("legal.terms.responsibilities", "User Responsibilities")}
              </H2>
            </View>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.responsibilities_text",
                "You are responsible for:",
              )}
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.responsibility_1",
                  "Providing accurate, complete, and truthful information",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.responsibility_2",
                  "Maintaining the security of your account credentials",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.responsibility_3",
                  "Promptly notifying us of any unauthorized access to your account",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.responsibility_4",
                  "Reviewing all prepared documents before submission",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.responsibility_5",
                  "Complying with all applicable tax laws and regulations",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.responsibility_6",
                  "Paying all fees and charges in a timely manner",
                )}
              </Text>
            </View>
          </View>

          {/* IRS Compliance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color="#2563EB" />
              <H2 style={styles.sectionTitle}>
                {t("legal.terms.irs_compliance", "IRS Compliance and Accuracy")}
              </H2>
            </View>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.irs_compliance_text",
                "You certify that all information provided to us is accurate and truthful. Providing false Social Security Numbers, Taxpayer Identification Numbers, or identity documents may result in:",
              )}
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • {t("legal.terms.irs_1", "Immediate account termination")}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t(
                  "legal.terms.irs_2",
                  "Legal action and reporting to appropriate authorities",
                )}
              </Text>
              <Text style={styles.listItem}>
                •{" "}
                {t("legal.terms.irs_3", "Criminal penalties under federal law")}
              </Text>
            </View>
            <View style={styles.alertBox}>
              <AlertCircle size={20} color="#EF4444" />
              <Text style={styles.alertText}>
                {t(
                  "legal.terms.irs_warning",
                  "You are legally responsible for the accuracy of all information on your tax returns, regardless of who prepares them.",
                )}
              </Text>
            </View>
          </View>

          {/* Data Protection */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.data_protection", "Data Protection & Encryption")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.data_protection_text",
                "Your sensitive personal information, including Social Security Number (SSN), driver's license number, and passport number, is protected using industry-standard AES-256-GCM encryption. This means your data is encrypted before being stored in our secure database and can only be decrypted by authorized personnel when necessary for tax preparation services.",
              )}
            </Text>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.data_protection_2",
                "By using our Services, you consent to the secure storage and processing of your sensitive information as described in our Privacy Policy.",
              )}
            </Text>
          </View>

          {/* Electronic Signature */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t(
                "legal.terms.electronic_signature",
                "Electronic Signature and Transactions",
              )}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.electronic_signature_text",
                "By activating your profile and using our Services, you agree to conduct transactions electronically. You acknowledge that your digital acceptance of these Terms and any electronic signatures on tax documents carry the same legal weight as physical signatures under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and applicable state laws.",
              )}
            </Text>
          </View>

          {/* Fees and Payment */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.fees", "Fees and Payment")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.fees_text",
                "Service fees are disclosed at the time of service selection. You agree to pay all fees associated with the Services you select. Payment is due as specified in your service agreement. We reserve the right to change our fees at any time, but will notify you of any changes before they take effect.",
              )}
            </Text>
          </View>

          {/* Refund Policy */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.refund", "Refund Policy")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.refund_text",
                "Refund policies vary by service type. Please review the specific refund policy for your selected service. Generally, refunds are not available for completed tax preparation services, but may be available for unused services or in cases of service errors. Contact us for specific refund inquiries.",
              )}
            </Text>
          </View>

          {/* Intellectual Property */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.intellectual", "Intellectual Property")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.intellectual_text",
                "All content, features, and functionality of our Services, including but not limited to text, graphics, logos, and software, are owned by {companyName} or its licensors and are protected by copyright, trademark, and other intellectual property laws.",
                { companyName },
              )}
            </Text>
          </View>

          {/* Limitation of Liability */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.liability", "Limitation of Liability")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.liability_text",
                "To the maximum extent permitted by law, {companyName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our Services.",
                { companyName },
              )}
            </Text>
          </View>

          {/* Termination */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.termination", "Termination")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.termination_text",
                "We reserve the right to suspend or terminate your account and access to our Services at any time, with or without cause or notice, for any reason, including but not limited to violation of these Terms, fraudulent activity, or non-payment of fees.",
              )}
            </Text>
          </View>

          {/* Changes to Terms */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.changes", "Changes to Terms")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.changes_text",
                "We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on our website and updating the 'Last Updated' date. Your continued use of our Services after such changes constitutes acceptance of the updated Terms.",
              )}
            </Text>
          </View>

          {/* Governing Law */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.governing", "Governing Law")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.governing_text",
                "These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Virginia, without regard to its conflict of law provisions.",
              )}
            </Text>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.contact", "Contact Us")}
            </H2>
            <Text style={styles.paragraph}>
              {t(
                "legal.terms.contact_text",
                "If you have questions about these Terms, please contact us:",
              )}
            </Text>
            <View style={styles.contactBox}>
              <Text style={styles.contactItem}>
                {t("legal.terms.email", "Email:")} {companyEmail}
              </Text>
              <Text style={styles.contactItem}>
                {t("legal.terms.phone", "Phone:")} {companyPhone}
              </Text>
            </View>
          </View>

          {/* Related Links */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>
              {t("legal.terms.related", "Related Policies")}
            </H2>
            <View style={styles.linkList}>
              <Text style={styles.linkItem}>
                •{" "}
                <a href="/legal/privacy" style={styles.link}>
                  {t("legal.privacy_policy", "Privacy Policy")}
                </a>
              </Text>
              <Text style={styles.linkItem}>
                •{" "}
                <a href="/legal/sms-consent" style={styles.link}>
                  {t("legal.sms_consent.title", "SMS Consent Policy")}
                </a>
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </PublicLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  lastUpdated: {
    fontSize: 14,
    color: "#64748B",
    fontStyle: "italic",
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 12,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  list: {
    marginLeft: 20,
    marginTop: 8,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 8,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  alertBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    marginTop: 16,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#991B1B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  contactBox: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  contactItem: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 4,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  linkList: {
    marginLeft: 20,
  },
  linkItem: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 8,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  link: {
    color: "#2563EB",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
