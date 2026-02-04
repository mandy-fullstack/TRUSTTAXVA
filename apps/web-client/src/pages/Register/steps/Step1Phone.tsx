import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Text, Button } from "@trusttax/ui";
import { PhoneNumberInput } from "../../../components/PhoneNumberInput";
import { Phone, Check } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useCompany } from "../../../context/CompanyContext";
import { renderLinkedText } from "../../../utils/text";

interface Step1PhoneProps {
  phoneNumber: string;
  smsOptIn: boolean;
  onPhoneChange: (phone: string) => void;
  onOptInChange: (optIn: boolean) => void;
  onNext: () => void;
  error?: string;
}

export const Step1Phone = ({
  phoneNumber,
  smsOptIn,
  onPhoneChange,
  onOptInChange,
  onNext,
  error,
}: Step1PhoneProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useCompany();
  const [localError, setLocalError] = useState("");

  const companyName = profile?.companyName || "TrustTax";
  const companyPhone = profile?.phone || "(888) 652-1989 / (540) 876-9748";

  const handleNext = () => {
    setLocalError("");

    // Phone is optional, but if SMS opt-in is checked, phone number is required
    if (smsOptIn) {
      if (!phoneNumber.trim()) {
        setLocalError(t("sms.phone_required", "Phone number is required for SMS opt-in"));
        return;
      }

      if (!isValidPhoneNumber(phoneNumber)) {
        setLocalError(t("sms.invalid_phone", "Please enter a valid phone number"));
        return;
      }
    } else {
      // If opt-in is NOT checked, phone is optional
      // But if a phone number is provided, validate its format
      if (phoneNumber.trim()) {
        if (!isValidPhoneNumber(phoneNumber)) {
          setLocalError(
            t(
              "sms.invalid_phone",
              "Please enter a valid phone number or leave it empty",
            ),
          );
          return;
        }
      }
    }

    // If we get here, validation passed - phone is optional, so we can always proceed
    setLocalError("");
    onNext();
  };

  const displayError = error || localError;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Phone size={32} color="#2563EB" />
        </View>
        <Text style={styles.title}>
          {t("register.step1_title_phone", "Phone Number (Optional)")}
        </Text>
        <Text style={styles.description}>
          {t(
            "register.step1_description_phone",
            "Add your phone number to receive important updates via SMS. You can skip this step if you prefer.",
          )}
        </Text>

        <View style={styles.form}>
          <PhoneNumberInput
            label={t("sms.phone_label", "Phone Number")}
            placeholder={t("sms.phone_placeholder", "Enter phone number with country code")}
            value={phoneNumber}
            onChangeText={(value) => {
              onPhoneChange(value);
              setLocalError("");
            }}
            error={displayError && displayError.includes("phone") ? displayError : undefined}
          />

          <View style={styles.smsBox}>
            <TouchableOpacity
              style={styles.smsCheckboxRow}
              onPress={() => {
                onOptInChange(!smsOptIn);
                setLocalError("");
              }}
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
                  {t("auth.sms_opt_in_label")}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.smsDescriptionText}>
              {renderLinkedText(
                t("auth.sms_registration.full_disclaimer", {
                  companyName,
                  phone: companyPhone
                }),
                {
                  privacy: {
                    label: t("legal.privacy_policy", "Privacy Policy"),
                    onPress: () => navigate("/legal/privacy")
                  },
                  terms: {
                    label: t("legal.terms_of_service", "Terms and Conditions"),
                    onPress: () => navigate("/legal/terms")
                  }
                }
              )}
            </Text>

            {/* OTP verification temporarily disabled until RingCentral is ready */}
          </View>

          {displayError && (
            <Text style={styles.errorText}>{displayError}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title={t("common.skip", "Skip")}
          variant="neutral"
          onPress={onNext}
          style={styles.skipButton}
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
    width: "100%",
  },
  content: {
    width: "100%",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
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
  smsLinkTouch: {
    borderRadius: 0,
  },
  smsDescriptionText: {
    marginTop: 12,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },
  link: {
    color: "#2563EB",
    fontWeight: "600",
    textDecorationLine: "underline",
    cursor: Platform.OS === "web" ? "pointer" : "auto",
  } as any,
  smsLinkSep: {
    color: "#94A3B8",
    fontSize: 12,
  },
  otpBox: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 16,
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  otpRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  otpInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  otpVerifyBtn: {
    width: 130,
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
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
});
