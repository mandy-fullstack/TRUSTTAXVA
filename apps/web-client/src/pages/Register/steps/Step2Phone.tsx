import { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Text, Button } from "@trusttax/ui";
import { PhoneNumberInput } from "../../../components/PhoneNumberInput";
import { Check } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";

interface Step2PhoneProps {
    phoneNumber: string;
    smsOptIn: boolean;
    onPhoneChange: (phone: string) => void;
    onOptInChange: (optIn: boolean) => void;
    onNext: () => void;
    onBack: () => void;
    error?: string;
}

export const Step2Phone = ({
    phoneNumber,
    smsOptIn,
    onPhoneChange,
    onOptInChange,
    onNext,
    onBack,
    error,
}: Step2PhoneProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [localError, setLocalError] = useState("");

    const handleNext = () => {
        // Validate: if SMS opt-in is checked, phone number is required
        if (smsOptIn && !phoneNumber.trim()) {
            setLocalError(t("sms.phone_required", "Phone number is required for SMS opt-in"));
            return;
        }

        // Validate phone number format if provided
        if (phoneNumber.trim()) {
            try {
                if (!isValidPhoneNumber(phoneNumber)) {
                    setLocalError(t("sms.invalid_phone", "Please enter a valid phone number"));
                    return;
                }
            } catch (e) {
                // If validation library fails, continue anyway
            }
        }

        setLocalError("");
        onNext();
    };

    const displayError = error || localError;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>
                    {t("register.step2_title", "Phone Number & SMS")}
                </Text>
                <Text style={styles.description}>
                    {t(
                        "register.step2_description",
                        "Add your phone number to receive important updates via SMS (optional).",
                    )}
                </Text>

                <View style={styles.form}>
                    <PhoneNumberInput
                        label={t("sms.phone_label", "Phone Number")}
                        placeholder={t("sms.phone_placeholder", "Enter phone number")}
                        value={phoneNumber}
                        onChangeText={(value) => {
                            onPhoneChange(value);
                            setLocalError(""); // Clear error when user types
                        }}
                        error={displayError}
                    />

                    <View style={styles.smsBox}>
                        <TouchableOpacity
                            style={styles.smsCheckboxRow}
                            onPress={() => onOptInChange(!smsOptIn)}
                        >
                            <View
                                style={[
                                    styles.smsCheckbox,
                                    smsOptIn && styles.smsCheckboxActive,
                                ]}
                            >
                                {smsOptIn && (
                                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                                )}
                            </View>
                            <View style={styles.checkboxTextContainer}>
                                <Text style={styles.smsLabel}>
                                    {t(
                                        "auth.sms_opt_in_label",
                                        "I agree to receive recurring SMS messages at the number provided.",
                                    )}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.smsDisclosure}>
                            {t(
                                "sms.disclosure_text",
                                "Message frequency varies. Message and data rates may apply. Reply STOP to cancel, HELP for help.",
                            )}
                        </Text>

                        <View style={styles.smsLinksRow}>
                            <TouchableOpacity onPress={() => navigate("/legal/sms-consent")} activeOpacity={0.85}>
                                <Text style={styles.smsLink}>
                                    {t("sms.read_consent", "Read SMS Consent Policy")}
                                </Text>
                            </TouchableOpacity>
                            <Text style={styles.smsLinkSep}>•</Text>
                            <TouchableOpacity onPress={() => navigate("/legal/privacy")} activeOpacity={0.85}>
                                <Text style={styles.smsLink}>
                                    {t("sms.read_privacy", "Read Privacy Policy")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {displayError && (
                        <Text style={styles.errorText}>{displayError}</Text>
                    )}
                </View>
            </View>

            <View style={styles.actions}>
                <Button
                    title={t("common.back", "Back")}
                    variant="neutral"
                    onPress={onBack}
                    style={styles.backButton}
                />
                <Button
                    title={t("common.next", "Next")}
                    onPress={handleNext}
                    style={styles.nextButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        maxWidth: 500,
        alignSelf: "center",
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 8,
        textAlign: "center",
    },
    description: {
        fontSize: 14,
        color: "#64748B",
        marginBottom: 32,
        textAlign: "center",
        lineHeight: 20,
    },
    form: {
        gap: 24,
    },
    smsBox: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        backgroundColor: "#F8FAFC",
        padding: 16,
        borderRadius: 0,
    },
    smsCheckboxRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    smsCheckbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: "#CBD5E1",
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 0,
        marginTop: 2,
    },
    smsCheckboxActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    checkboxTextContainer: {
        flex: 1,
    },
    smsLabel: {
        fontSize: 14,
        color: "#0F172A",
        lineHeight: 20,
    },
    smsDisclosure: {
        marginTop: 12,
        fontSize: 12,
        color: "#64748B",
        lineHeight: 16,
    },
    smsLinksRow: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    smsLink: {
        color: "#2563EB",
        fontWeight: "600",
        fontSize: 12,
    } as any,
    smsLinkSep: {
        color: "#94A3B8",
        fontSize: 12,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 13,
        textAlign: "center",
        marginTop: 8,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    backButton: {
        flex: 1,
    },
    nextButton: {
        flex: 1,
    },
});
