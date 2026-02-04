import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Button, Text } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { WizardCountrySelect } from "../components/WizardCountrySelect";

interface Step1cProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step1cOrigin: React.FC<Step1cProps> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const { t } = useTranslation();
  const [countryOfBirth, setCountryOfBirth] = useState(
    initialData?.countryOfBirth || "",
  );
  const [primaryLanguage, setPrimaryLanguage] = useState(
    initialData?.primaryLanguage || "ENGLISH",
  );

  // Reactive hydration
  React.useEffect(() => {
    if (initialData?.countryOfBirth)
      setCountryOfBirth(initialData.countryOfBirth);
    if (initialData?.primaryLanguage)
      setPrimaryLanguage(initialData.primaryLanguage);
  }, [initialData]);

  const isValid = countryOfBirth.trim().length >= 2;

  return (
    <View style={styles.container}>
      <View style={styles.stack}>
        <View style={[styles.group, { zIndex: 2000 }]}>
          <Text style={styles.label}>
            {t("profile_wizard.step1c.country", "COUNTRY OF BIRTH")}
          </Text>
          <WizardCountrySelect
            value={countryOfBirth}
            onChange={(iso) => setCountryOfBirth(iso)}
            placeholder={t(
              "profile_wizard.step1c.country_placeholder",
              "SELECT GEOGRAPHICAL ORIGIN",
            )}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>
            {t("profile_wizard.step1c.language", "PRIMARY LANGUAGE")}
          </Text>
          <View style={styles.langRow}>
            {["ENGLISH", "SPANISH"].map((lang) => {
              const isSelected = primaryLanguage === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setPrimaryLanguage(lang)}
                  style={[styles.langBtn, isSelected && styles.langBtnActive]}
                >
                  <Text
                    style={[
                      styles.langText,
                      isSelected && styles.langTextActive,
                    ]}
                  >
                    {t(`common.${lang.toLowerCase()}`, lang)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={() => onNext({ countryOfBirth, primaryLanguage })}
          disabled={!isValid}
          style={styles.btn}
          textStyle={styles.btnText}
        >
          {t("profile_wizard.step1c.proceed", "PROCEED TO SECURITY")}
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
  stack: {
    gap: 24,
    marginBottom: 40,
  },
  group: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: "#334155",
    marginBottom: 8,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
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
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 1.5,
    color: "#FFFFFF",
    textTransform: "uppercase",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  back: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  langRow: {
    flexDirection: "row",
    gap: 12,
  },
  langBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  langBtnActive: {
    borderColor: "#0F172A",
    backgroundColor: "#0F172A",
  },
  langText: {
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: 0.5,
    color: "#64748B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  langTextActive: {
    color: "#FFFFFF",
  },
});
