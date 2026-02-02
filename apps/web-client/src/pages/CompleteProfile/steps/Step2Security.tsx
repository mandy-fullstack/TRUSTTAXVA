import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Button, Input, Text } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { api } from "../../../services/api";

interface Step2Props {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step2Security: React.FC<Step2Props> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const { t } = useTranslation();
  const [taxIdType, setTaxIdType] = useState(initialData?.taxIdType || "SSN");
  const [ssn, setSsn] = useState(initialData?.ssn || "");

  const [error, setError] = useState("");

  // Reactive hydration with Lazy Loading
  React.useEffect(() => {
    if (initialData?.taxIdType !== undefined)
      setTaxIdType(initialData.taxIdType);

    // Lazy load SSN if not provided
    const loadSSN = async () => {
      // Only load if we don't have it and not provided in initialData
      if (initialData?.ssn) {
        setSsn(initialData.ssn);
        return;
      }
      try {
        // Return value is string | null
        const decrypted = await api.getDecryptedSSN();
        if (decrypted) setSsn(decrypted);
      } catch (e) {
        // ignore
      }
    };
    loadSSN();
  }, [initialData]);

  const formatSsn = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 5)
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  const handleNext = () => {
    const rawDigits = ssn.replace(/\D/g, "");
    if (rawDigits.length !== 9) {
      setError(
        t("profile_wizard.common.invalid_id_format", "INVALID ID FORMAT"),
      );
      return;
    }
    setError("");
    onNext({ taxIdType, ssn });
  };

  // const isValid = ssn.replace(/\D/g, '').length === 9; // redundant, used inside handleNext

  return (
    <View style={styles.container}>
      <View style={styles.selector}>
        {(["SSN", "ITIN"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.opt, taxIdType === type && styles.optActive]}
            onPress={() => setTaxIdType(type)}
          >
            <Text
              style={[
                styles.optText,
                taxIdType === type && styles.optTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.group}>
        <Input
          label={t("profile_wizard.step2.id_label", {
            type: taxIdType,
            defaultValue: `${taxIdType} IDENTIFICATION NUMBER`,
          })}
          value={ssn}
          onChangeText={(v: string) => {
            setSsn(formatSsn(v));
            setError(""); // Clear error on type
          }}
          placeholder="XXX-XX-XXXX"
          keyboardType="numeric"
          maxLength={11}
          // Apply red border style if error exists
          style={error ? { borderColor: "#EF4444" } : undefined}
        />
        {error ? (
          <Text style={[styles.info, { color: "#EF4444" }]}>{error}</Text>
        ) : (
          <Text style={styles.info}>
            {t(
              "profile_wizard.step2.encryption_note",
              "AES-256-GCM ENCRYPTION ACTIVE. PREVIOUS DATA HYDRATED.",
            )}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          style={styles.btn}
          textStyle={styles.btnText}
        >
          {t("profile_wizard.step2.proceed", "VALIDATE SECURITY")}
        </Button>
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>
            {t("profile_wizard.common.retract_step", "RETRACT STEP")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  selector: {
    flexDirection: "row",
    marginBottom: 40,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 0,
  },
  opt: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  optActive: {
    backgroundColor: "#0F172A",
  },
  optText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 1,
    fontFamily: "Inter",
  },
  optTextActive: {
    color: "#FFFFFF",
  },
  group: {
    marginBottom: 40,
  },
  info: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    fontFamily: "Inter",
  },
  footer: {
    gap: 16,
  },
  btn: {
    height: 52, // Standard height
    backgroundColor: "#0F172A",
    borderRadius: 0,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#FFFFFF",
    fontFamily: "Inter",
  },
  back: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
    fontFamily: "Inter",
  },
});
