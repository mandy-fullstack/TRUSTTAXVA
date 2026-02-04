import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Button } from "@trusttax/ui";

interface Step2Props {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step2TaxID: React.FC<Step2Props> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const [taxIdType, setTaxIdType] = useState(initialData?.taxIdType || "SSN");
  const [ssn, setSsn] = useState(initialData?.ssn || "");

  const formatSsn = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 5)
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  const isValid = ssn.replace(/\D/g, "").length === 9;

  const handleNext = () => {
    if (!isValid) return;
    onNext({ taxIdType, ssn });
  };

  return (
    <View style={styles.container}>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeOption,
            taxIdType === "SSN" && styles.typeOptionActive,
          ]}
          onPress={() => setTaxIdType("SSN")}
        >
          <Text
            style={[
              styles.typeText,
              taxIdType === "SSN" && styles.typeTextActive,
            ]}
          >
            SSN
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeOption,
            taxIdType === "ITIN" && styles.typeOptionActive,
          ]}
          onPress={() => setTaxIdType("ITIN")}
        >
          <Text
            style={[
              styles.typeText,
              taxIdType === "ITIN" && styles.typeTextActive,
            ]}
          >
            ITIN
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{taxIdType} NUMBER</Text>
        <TextInput
          style={styles.input}
          value={ssn}
          onChangeText={(v) => setSsn(formatSsn(v))}
          placeholder="XXX-XX-XXXX"
          placeholderTextColor="#CBD5E1"
          keyboardType="numeric"
          maxLength={11}
        />
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          disabled={!isValid}
          style={styles.primaryButton}
          textStyle={styles.buttonText}
        >
          CONTINUE TO IDENTITY
        </Button>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 0,
    marginBottom: 60,
    borderWidth: 2,
    borderColor: "#0F172A",
    borderRadius: 0,
  },
  typeOption: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  typeOptionActive: {
    backgroundColor: "#0F172A",
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    color: "#0F172A",
  },
  typeTextActive: {
    color: "#FFFFFF",
  },
  field: {
    width: "100%",
    marginBottom: 60,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    letterSpacing: 2,
    marginBottom: 16,
  },
  input: {
    height: 72,
    borderBottomWidth: 2,
    borderBottomColor: "#0F172A",
    borderRadius: 0,
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    paddingHorizontal: 0,
    letterSpacing: 4,
  },
  footer: {
    width: "100%",
    gap: 20,
  },
  primaryButton: {
    height: 72,
    backgroundColor: "#0F172A",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    color: "#FFFFFF",
  },
  backButton: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 1,
  },
});
