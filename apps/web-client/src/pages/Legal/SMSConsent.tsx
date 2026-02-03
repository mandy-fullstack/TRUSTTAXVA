import { View, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Text, H1, H2 } from "@trusttax/ui";
import { PublicLayout } from "../../components/PublicLayout";
import { PageMeta } from "../../components/PageMeta";
import { useCompany } from "../../context/CompanyContext";
import { Shield, Phone, MessageSquare, AlertCircle } from "lucide-react";

export const SMSConsentPage = () => {
    const { t } = useTranslation();
    const { profile } = useCompany();
    const companyName = profile?.companyName || "TrustTax";
    const companyPhone = profile?.phone || "(540) 876-9748";

    return (
        <PublicLayout>
            <PageMeta
                title={t("legal.sms_consent.title", {
                    companyName,
                    defaultValue: `SMS Consent | ${companyName}`,
                })}
                description={t(
                    "legal.sms_consent.description",
                    "Learn about our SMS messaging consent policy and how we use text messages to communicate with you.",
                )}
            />
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <MessageSquare size={32} color="#2563EB" />
                    </View>
                    <H1 style={styles.title}>
                        {t("legal.sms_consent.page_title", "SMS Consent Policy")}
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
                                "legal.sms_consent.intro",
                                `By providing your mobile phone number to ${companyName} and opting in to receive SMS (text message) communications, you agree to the terms and conditions outlined in this SMS Consent Policy.`,
                            )}
                        </Text>
                    </View>

                    {/* What We Send */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Phone size={20} color="#2563EB" />
                            <H2 style={styles.sectionTitle}>
                                {t("legal.sms_consent.what_we_send", "What We Send")}
                            </H2>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.sms_consent.what_we_send_text",
                                `${companyName} may send you SMS messages for the following purposes:`,
                            )}
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.purpose_1",
                                    "Order status updates and notifications",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.purpose_2",
                                    "Appointment reminders and scheduling confirmations",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.purpose_3",
                                    "Important tax filing deadlines and reminders",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.purpose_4",
                                    "Document upload confirmations and requests",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.purpose_5",
                                    "Security alerts (e.g., login attempts, password changes)",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.purpose_6",
                                    "Customer support responses and follow-ups",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.purpose_7",
                                    "Promotional messages (only if you opt-in separately)",
                                )}
                            </Text>
                        </View>
                    </View>

                    {/* Message Frequency */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MessageSquare size={20} color="#2563EB" />
                            <H2 style={styles.sectionTitle}>
                                {t("legal.sms_consent.frequency", "Message Frequency")}
                            </H2>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.sms_consent.frequency_text",
                                "Message frequency varies based on your account activity and the services you use. You may receive messages as needed for service-related communications. Promotional messages, if opted in, are sent no more than 4 times per month.",
                            )}
                        </Text>
                    </View>

                    {/* Opt-In Process */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Shield size={20} color="#2563EB" />
                            <H2 style={styles.sectionTitle}>
                                {t("legal.sms_consent.opt_in", "Opt-In Process")}
                            </H2>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.sms_consent.opt_in_text",
                                "You can opt-in to receive SMS messages by:",
                            )}
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.opt_in_1",
                                    "Providing your mobile phone number during account registration or profile setup",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.opt_in_2",
                                    "Checking the SMS consent checkbox in your account settings",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.opt_in_3",
                                    "Replying 'YES' or 'START' to a promotional SMS message",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.opt_in_4",
                                    "Visiting our SMS consent page and completing the opt-in form",
                                )}
                            </Text>
                        </View>
                    </View>

                    {/* Opt-Out Process */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AlertCircle size={20} color="#EF4444" />
                            <H2 style={styles.sectionTitle}>
                                {t("legal.sms_consent.opt_out", "How to Opt-Out")}
                            </H2>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.sms_consent.opt_out_text",
                                "You can opt-out of receiving SMS messages at any time by:",
                            )}
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.opt_out_1",
                                    "Replying 'STOP', 'END', 'CANCEL', 'UNSUBSCRIBE', or 'QUIT' to any SMS message from us",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.opt_out_2",
                                    "Unchecking the SMS consent option in your account settings",
                                )}
                            </Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.opt_out_3",
                                    "Contacting our customer support team at {phone}",
                                    { phone: companyPhone },
                                )}
                            </Text>
                        </View>
                        <View style={styles.alertBox}>
                            <AlertCircle size={20} color="#EF4444" />
                            <Text style={styles.alertText}>
                                {t(
                                    "legal.sms_consent.opt_out_warning",
                                    "Note: After opting out, you will no longer receive SMS messages from us. However, you may still receive important account-related messages via email. Opting out of SMS does not affect your ability to use our services.",
                                )}
                            </Text>
                        </View>
                    </View>

                    {/* Message and Data Rates */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.sms_consent.rates", "Message and Data Rates May Apply")}
                        </H2>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.sms_consent.rates_text",
                                "Standard message and data rates may apply to SMS messages sent and received, as determined by your mobile carrier. We are not responsible for any charges incurred as a result of receiving SMS messages from us.",
                            )}
                        </Text>
                    </View>

                    {/* Supported Carriers */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.sms_consent.carriers", "Supported Carriers")}
                        </H2>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.sms_consent.carriers_text",
                                "SMS messages are supported by major U.S. carriers including, but not limited to:",
                            )}
                        </Text>
                        <View style={styles.list}>
                            <Text style={styles.listItem}>• AT&T</Text>
                            <Text style={styles.listItem}>• Verizon</Text>
                            <Text style={styles.listItem}>• T-Mobile</Text>
                            <Text style={styles.listItem}>• Sprint</Text>
                            <Text style={styles.listItem}>• US Cellular</Text>
                            <Text style={styles.listItem}>• Cricket</Text>
                            <Text style={styles.listItem}>• Boost Mobile</Text>
                            <Text style={styles.listItem}>• MetroPCS</Text>
                            <Text style={styles.listItem}>
                                •{" "}
                                {t(
                                    "legal.sms_consent.other_carriers",
                                    "Other participating carriers",
                                )}
                            </Text>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.sms_consent.carriers_note",
                                "Carrier support may vary, and we cannot guarantee SMS delivery to all carriers or phone numbers.",
                            )}
                        </Text>
                    </View>

                    {/* Privacy and Security */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Shield size={20} color="#2563EB" />
                            <H2 style={styles.sectionTitle}>
                                {t("legal.sms_consent.privacy", "Privacy and Security")}
                            </H2>
                        </View>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.sms_consent.privacy_text",
                                "Your mobile phone number and SMS preferences are protected in accordance with our Privacy Policy. We do not sell, rent, or share your phone number with third parties for their marketing purposes. SMS messages are sent through secure, encrypted channels.",
                            )}
                        </Text>
                    </View>

                    {/* Help and Support */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.sms_consent.help", "Help and Support")}
                        </H2>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.sms_consent.help_text",
                                "If you need assistance with SMS messages or have questions about this policy, please contact us:",
                            )}
                        </Text>
                        <View style={styles.contactBox}>
                            <Text style={styles.contactItem}>
                                {t("legal.sms_consent.phone", "Phone:")} {companyPhone}
                            </Text>
                            <Text style={styles.contactItem}>
                                {t("legal.sms_consent.email", "Email:")}{" "}
                                {profile?.email || "contact@trusttax.com"}
                            </Text>
                        </View>
                    </View>

                    {/* Changes to Policy */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.sms_consent.changes", "Changes to This Policy")}
                        </H2>
                        <Text style={styles.paragraph}>
                            {t(
                                "legal.sms_consent.changes_text",
                                "We reserve the right to modify this SMS Consent Policy at any time. We will notify you of any material changes by posting the updated policy on our website and updating the 'Last Updated' date. Your continued use of SMS services after such changes constitutes acceptance of the updated policy.",
                            )}
                        </Text>
                    </View>

                    {/* Consent Acknowledgment */}
                    <View style={styles.section}>
                        <View style={styles.acknowledgmentBox}>
                            <Text style={styles.acknowledgmentTitle}>
                                {t(
                                    "legal.sms_consent.acknowledgment_title",
                                    "Consent Acknowledgment",
                                )}
                            </Text>
                            <Text style={styles.acknowledgmentText}>
                                {t(
                                    "legal.sms_consent.acknowledgment",
                                    "By opting in to receive SMS messages from {companyName}, you acknowledge that you have read, understood, and agree to this SMS Consent Policy. You understand that you can opt-out at any time and that message and data rates may apply.",
                                    { companyName },
                                )}
                            </Text>
                        </View>
                    </View>

                    {/* Related Links */}
                    <View style={styles.section}>
                        <H2 style={styles.sectionTitle}>
                            {t("legal.sms_consent.related", "Related Policies")}
                        </H2>
                        <View style={styles.linkList}>
                            <Text style={styles.linkItem}>
                                • {/* eslint-disable-next-line react-native/no-inline-styles */}
                                <a href="/legal/privacy" style={styles.link}>
                                    {t("legal.privacy_policy", "Privacy Policy")}
                                </a>
                            </Text>
                            <Text style={styles.linkItem}>
                                • {/* eslint-disable-next-line react-native/no-inline-styles */}
                                <a href="/legal/terms" style={styles.link}>
                                    {t("legal.terms_of_service", "Terms of Service")}
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
    acknowledgmentBox: {
        padding: 20,
        backgroundColor: "#F0F9FF",
        borderWidth: 1,
        borderColor: "#0EA5E9",
        borderLeftWidth: 4,
        borderLeftColor: "#2563EB",
    },
    acknowledgmentTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0C4A6E",
        marginBottom: 12,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    acknowledgmentText: {
        fontSize: 15,
        lineHeight: 24,
        color: "#075985",
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
