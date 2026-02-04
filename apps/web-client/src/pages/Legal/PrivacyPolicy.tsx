import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { Text, H1, H2 } from "@trusttax/ui";
import { PublicLayout } from "../../components/PublicLayout";
import { PageMeta } from "../../components/PageMeta";
import { useCompany } from "../../context/CompanyContext";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export const PrivacyPolicyPage = () => {
    const { t } = useTranslation();
    const { profile } = useCompany();
    const companyName = profile?.companyName || "TrustTax";
    const companyEmail = profile?.email || "contact@trusttax.com";
    const companyPhone = profile?.phone || "(540) 876-9748";
    const companyAddress = profile?.address || "123 Business Ave, VA";
    const openUrl = (url: string) =>
        Linking.openURL(url).catch((e) => console.error("Failed to open URL", e));

    return (
        <PublicLayout>
            <PageMeta
                title={t("legal.privacy.title", {
                    companyName,
                    defaultValue: `Privacy Policy | ${companyName}`,
                })}
                description={t(
                    "legal.privacy.description",
                    "Learn how we collect, use, and protect your personal information.",
                )}
            />
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <Shield size={32} color="#2563EB" />
                    </View>
                    <H1 style={styles.title}>
                        {t("legal.privacy.page_title", "Privacy Policy")}
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
                                "legal.privacy.intro",
                                `${companyName} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our tax preparation, immigration services, and related services (collectively, the "Services").`,
                            )}
                        </Text>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.intro_2",
                                "Please read this Privacy Policy carefully. By using our Services, you agree to the collection and use of information in accordance with this policy.",
                            )}
                        </Text>
                    </View>

                    {/* Information We Collect */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <FileText size={20} color="#2563EB" />
                            <H2 style={styles.sectionTitle}>
                                {t("legal.privacy.collect", "Information We Collect")}
                            </H2>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.collect_intro",
                                "We collect information that you provide directly to us, information collected automatically, and information from third parties:",
                            )}
                        </Text>

                        <Text style={styles.subsectionTitle}>
                            {t("legal.privacy.personal_info", "Personal Information")}
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.personal_1",
                                    "Name, email address, phone number",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.personal_2",
                                    "Social Security Number (SSN) or ITIN",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                • {t("legal.privacy.personal_3", "Date of birth")}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.personal_4",
                                    "Mailing address and physical address",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.personal_5",
                                    "Government-issued identification (driver's license, passport)",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.personal_6",
                                    "Tax information (W-2s, 1099s, deductions, dependents)",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.personal_7",
                                    "Bank account and routing numbers for refunds",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.personal_8",
                                    "Immigration status and documentation",
                                )}
                            </Text>
                        </View>

                        <Text style={styles.subsectionTitle}>
                            {t(
                                "legal.privacy.automatic_info",
                                "Automatically Collected Information",
                            )}
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.automatic_1",
                                    "IP address and device information",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                • {t("legal.privacy.automatic_2", "Browser type and version")}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.automatic_3",
                                    "Pages visited and time spent on pages",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.automatic_4",
                                    "Cookies and similar tracking technologies",
                                )}
                            </Text>
                        </View>
                    </View>

                    {/* How We Use Information */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Eye size={20} color="#2563EB" />
                            <H2 style={styles.sectionTitle}>
                                {t("legal.privacy.use", "How We Use Your Information")}
                            </H2>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.use_intro",
                                "We use the information we collect to:",
                            )}
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.use_1",
                                    "Provide, maintain, and improve our Services",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t("legal.privacy.use_2", "Prepare and file your tax returns")}
                            </Text>
                            <Text style={styles.listItem}>
                                • {t("legal.privacy.use_3", "Process payments and refunds")}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.use_4",
                                    "Communicate with you about your account and services",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.use_5",
                                    "Send you important updates, reminders, and notifications",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.use_6",
                                    "Respond to your inquiries and provide customer support",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.use_7",
                                    "Detect, prevent, and address technical issues and fraud",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.use_8",
                                    "Comply with legal obligations and enforce our terms",
                                )}
                            </Text>
                        </View>
                    </View>

                    {/* Data Protection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Lock size={20} color="#2563EB" />
                            <H2 style={styles.sectionTitle}>
                                {t("legal.privacy.protection", "Data Protection and Security")}
                            </H2>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.protection_text",
                                "We implement industry-standard security measures to protect your personal information:",
                            )}
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.protection_1",
                                    "AES-256-GCM encryption for sensitive data at rest",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.protection_2",
                                    "HTTPS/TLS encryption for data in transit",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.protection_3",
                                    "Access controls and authentication requirements",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.protection_4",
                                    "Regular security audits and vulnerability assessments",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.protection_5",
                                    "Secure document storage and transmission",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.protection_6",
                                    "Employee training on data protection practices",
                                )}
                            </Text>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.protection_note",
                                "While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest standards of data protection.",
                            )}
                        </Text>
                    </View>

                    {/* SMS Messaging Program */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Shield size={20} color="#2563EB" />
                            <H2 style={styles.sectionTitle}>
                                {t("legal.privacy.sms_program", "SMS Messaging Program")}
                            </H2>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.sms_program_text",
                                "If you opt in to receive SMS messages, we use your phone number and messaging preferences to send service-related communications (order updates, reminders, and document requests). Message frequency varies. Message and data rates may apply. Reply STOP to opt out, HELP for help.",
                            )}
                        </Text>
                        <Text style={styles.link} onPress={() => openUrl("/legal/sms-consent")}>
                            {t("legal.sms_consent.page_title", "SMS Consent Policy")}
                        </Text>
                    </View>

                    {/* Information Sharing */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.privacy.sharing", "Information Sharing and Disclosure")}
                        </H2>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.sharing_intro",
                                "We do not sell, rent, or trade your personal information. We may share your information only in the following circumstances:",
                            )}
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.sharing_1",
                                    "With the IRS and other tax authorities as required for tax filing",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.sharing_2",
                                    "With service providers who assist us in operating our Services (under strict confidentiality agreements)",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.sharing_3",
                                    "When required by law, court order, or government regulation",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.sharing_4",
                                    "To protect our rights, property, or safety, or that of our users",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.sharing_5",
                                    "In connection with a business transfer (merger, acquisition, etc.)",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                • {t("legal.privacy.sharing_6", "With your explicit consent")}
                            </Text>
                        </View>
                    </View>

                    {/* Your Rights */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.privacy.rights", "Your Rights and Choices")}
                        </H2>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.rights_intro",
                                "You have the following rights regarding your personal information:",
                            )}
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.rights_1",
                                    "Access: Request a copy of your personal information",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.rights_2",
                                    "Correction: Update or correct inaccurate information",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.rights_3",
                                    "Deletion: Request deletion of your account and data (subject to legal retention requirements)",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.rights_4",
                                    "Opt-Out: Unsubscribe from marketing communications",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.privacy.rights_5",
                                    "Data Portability: Request your data in a portable format",
                                )}
                            </Text>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.rights_contact",
                                "To exercise these rights, please contact us at {email} or {phone}.",
                                { email: companyEmail, phone: companyPhone },
                            )}
                        </Text>
                    </View>

                    {/* Cookies */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.privacy.cookies", "Cookies and Tracking Technologies")}
                        </H2>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.cookies_text",
                                "We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist with marketing efforts. You can control cookies through your browser settings, but disabling cookies may limit some functionality of our Services.",
                            )}
                        </Text>
                    </View>

                    {/* Children's Privacy */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.privacy.children", "Children's Privacy")}
                        </H2>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.children_text",
                                "Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.",
                            )}
                        </Text>
                    </View>

                    {/* Changes to Policy */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.privacy.changes", "Changes to This Privacy Policy")}
                        </H2>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.changes_text",
                                "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date. We encourage you to review this Privacy Policy periodically.",
                            )}
                        </Text>
                    </View>

                    {/* Contact Information */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.privacy.contact", "Contact Us")}
                        </H2>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.privacy.contact_text",
                                "If you have questions or concerns about this Privacy Policy or our data practices, please contact us:",
                            )}
                        </Text>
                        <View style={styles.contactBox}>
                            <Text style={styles.contactItem}>
                                {t("legal.privacy.company", "Company:")} {companyName}
                            </Text>
                            <Text style={styles.contactItem}>
                                {t("legal.privacy.address", "Address:")} {companyAddress}
                            </Text>
                            <Text style={styles.contactItem}>
                                {t("legal.privacy.email", "Email:")} {companyEmail}
                            </Text>
                            <Text style={styles.contactItem}>
                                {t("legal.privacy.phone", "Phone:")} {companyPhone}
                            </Text>
                        </View>
                    </View>

                    {/* Related Links */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.privacy.related", "Related Policies")}
                        </H2>
                        <View style={styles.linkList}>
                            <Text style={styles.linkItem}>
                                • {/* eslint-disable-next-line react-native/no-inline-styles */}
                                <a href="/legal/terms" style={styles.link}>
                                    {t("legal.terms_of_service", "Terms of Service")}
                                </a>
                            </Text>
                            <Text style={styles.linkItem}>
                                • {/* eslint-disable-next-line react-native/no-inline-styles */}
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
    subsectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#334155",
        marginTop: 16,
        marginBottom: 8,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
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
