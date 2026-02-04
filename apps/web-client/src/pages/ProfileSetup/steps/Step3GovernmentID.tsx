import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Button } from "@trusttax/ui";

interface Step3Props {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step3GovernmentID: React.FC<Step3Props> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const [idType, setIdType] = useState<"DL" | "PASSPORT">(
    initialData?.passportNumber ? "PASSPORT" : "DL",
  );

  // DL State
  const [dlNumber, setDlNumber] = useState(
    initialData?.driverLicenseNumber || "",
  );
  const [dlState, setDlState] = useState(
    initialData?.driverLicenseStateCode || "",
  );

  // Passport State
  const [passportNumber, setPassportNumber] = useState(
    initialData?.passportNumber || "",
  );
  const [country, setCountry] = useState(
    initialData?.passportCountryOfIssue || "",
  );

  const isValid =
    idType === "DL"
      ? dlNumber.length > 0 && dlState.length === 2
      : passportNumber.length > 0;

  const handleNext = () => {
    if (!isValid) return;
    onNext({
      driverLicenseNumber: idType === "DL" ? dlNumber : "",
      driverLicenseStateCode: idType === "DL" ? dlState : "",
      passportNumber: idType === "PASSPORT" ? passportNumber : "",
      passportCountryOfIssue: idType === "PASSPORT" ? country : "",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeOption,
            idType === "DL" && styles.typeOptionActive,
          ]}
          onPress={() => setIdType("DL")}
        >
          <Text
            style={[styles.typeText, idType === "DL" && styles.typeTextActive]}
          >
            DRIVER LICENSE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeOption,
            idType === "PASSPORT" && styles.typeOptionActive,
          ]}
          onPress={() => setIdType("PASSPORT")}
        >
          <Text
            style={[
              styles.typeText,
              idType === "PASSPORT" && styles.typeTextActive,
            ]}
          >
            PASSPORT
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formStack}>
        {idType === "DL" ? (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>LICENSE NUMBER</Text>
              <TextInput
                style={styles.input}
                value={dlNumber}
                onChangeText={setDlNumber}
                placeholder="E00000000"
                placeholderTextColor="#CBD5E1"
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>STATE CODE</Text>
              <TextInput
                style={styles.input}
                value={dlState}
                onChangeText={setDlState}
                placeholder="CA"
                placeholderTextColor="#CBD5E1"
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>PASSPORT NUMBER</Text>
              <TextInput
                style={styles.input}
                value={passportNumber}
                onChangeText={setPassportNumber}
                placeholder="000000000"
                placeholderTextColor="#CBD5E1"
                autoCapitalize="characters"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>COUNTRY OF ISSUE</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="USA"
                placeholderTextColor="#CBD5E1"
                autoCapitalize="characters"
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          disabled={!isValid}
          style={styles.primaryButton}
          textStyle={styles.buttonText}
        >
          CONTINUE TO AGREEMENT
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
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#0F172A",
  },
  typeTextActive: {
    color: "#FFFFFF",
  },
  formStack: {
    gap: 40,
    marginBottom: 60,
  },
  field: {
    width: "100%",
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
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    paddingHorizontal: 0,
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
