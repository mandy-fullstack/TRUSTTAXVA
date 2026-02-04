import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Button } from "@trusttax/ui";

interface Step1Props {
  onNext: (data: any) => void;
  initialData?: any;
}

export const Step1PersonalDetails: React.FC<Step1Props> = ({
  onNext,
  initialData,
}) => {
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleNext = () => {
    if (!isValid) return;
    onNext({
      firstName,
      lastName,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputStack}>
        <View style={styles.field}>
          <Text style={styles.label}>FIRST NAME</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="e.g. ARMANDO"
            placeholderTextColor="#CBD5E1"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>LAST NAME</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="e.g. FERRO"
            placeholderTextColor="#CBD5E1"
            autoCapitalize="characters"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          disabled={!isValid}
          style={styles.primaryButton}
          textStyle={styles.buttonText}
        >
          CONTINUE TO SECURITY
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputStack: {
    gap: 40,
    marginBottom: 60,
  },
  field: {
    width: "100%",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: "uppercase",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  input: {
    height: 72,
    borderBottomWidth: 2,
    borderBottomColor: "#0F172A",
    borderRadius: 0,
    fontSize: 24,
    fontWeight: "600",
    color: "#0F172A",
    paddingHorizontal: 0,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    letterSpacing: -0.3,
  },
  footer: {
    width: "100%",
  },
  primaryButton: {
    height: 72,
    backgroundColor: "#0F172A",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#FFFFFF",
    textTransform: "uppercase",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
});
