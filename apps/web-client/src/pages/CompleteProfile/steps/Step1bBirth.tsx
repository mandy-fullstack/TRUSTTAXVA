import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Button, Text } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { WizardDateSelect } from "../components/WizardDateSelect";

interface Step1bProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step1bBirth: React.FC<Step1bProps> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const { t } = useTranslation();
  const [dateOfBirth, setDateOfBirth] = useState<string>(
    initialData?.dateOfBirth || "",
  );
  const [error, setError] = useState("");

  // Reactive hydration
  React.useEffect(() => {
    if (initialData?.dateOfBirth) {
      setDateOfBirth(initialData.dateOfBirth);
    }
  }, [initialData]);

  const validateDate = (isoDate: string): { valid: boolean; error?: string } => {
    if (!isoDate || !isoDate.includes("-")) {
      return { valid: false, error: t("profile_wizard.step1b.required", "DATE OF BIRTH IS REQUIRED") };
    }
    const [year, month, day] = isoDate.split("-").map(Number);
    if (!year || !month || !day) {
      return { valid: false, error: t("profile_wizard.step1b.invalid", "INVALID DATE FORMAT") };
    }

    // Validate date is valid
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return { valid: false, error: t("profile_wizard.step1b.invalid_date", "INVALID DATE") };
    }

    // Validate age (18-100 years)
    const today = new Date();
    let age = today.getFullYear() - year;
    const monthDiff = today.getMonth() - (month - 1);
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
      age--;
    }

    if (age < 18) {
      return { valid: false, error: t("profile_wizard.step1b.age_min", "MUST BE AT LEAST 18 YEARS OLD") };
    }
    if (age > 100) {
      return { valid: false, error: t("profile_wizard.step1b.age_max", "AGE EXCEEDS MAXIMUM LIMIT") };
    }

    return { valid: true };
  };

  const handleDateChange = (isoDate: string) => {
    setDateOfBirth(isoDate);
    const validation = validateDate(isoDate);
    if (validation.error) {
      setError(validation.error);
    } else {
      setError("");
    }
  };

  const isValid = dateOfBirth ? validateDate(dateOfBirth).valid : false;

  const handleNext = () => {
    if (!dateOfBirth) {
      setError(t("profile_wizard.step1b.required", "DATE OF BIRTH IS REQUIRED"));
      return;
    }
    const validation = validateDate(dateOfBirth);
    if (!validation.valid) {
      setError(validation.error || t("profile_wizard.step1b.invalid", "INVALID DATE"));
      return;
    }
    setError("");
    onNext({ dateOfBirth });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.group, { zIndex: 1 }]}>
        <WizardDateSelect
          value={dateOfBirth}
          onChange={handleDateChange}
          label={t(
            "profile_wizard.step1b.dob",
            "DATE OF BIRTH",
          )}
          error={error}
          minAge={18}
          maxAge={100}
        />
        <Text style={styles.info}>
          {t(
            "profile_wizard.step1b.hint",
            "CHRONOLOGICAL ALIGNMENT IS REQUIRED BY THE IRS.",
          )}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          disabled={!isValid}
          style={styles.btn}
          textStyle={styles.btnText}
        >
          {t("profile_wizard.step1b.proceed", "PROCEED TO ORIGIN")}
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
    maxWidth: "100%",
  },
  group: {
    marginBottom: 40,
    width: "100%",
  },
  info: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
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
});
