import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet, Platform } from "react-native";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  secure?: boolean;
  autoFocus?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
  value,
  onChange,
  length = 6,
  secure = true,
  autoFocus = true,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(autoFocus ? 0 : -1);

  const handleChange = (text: string, index: number) => {
    // Convert to uppercase immediately
    const char = text.toUpperCase();

    // Only allow alphanumeric
    if (char !== "" && !/^[A-Z0-9]$/.test(char)) return;

    const newValue = value.split("");
    newValue[index] = char;
    const finalValue = newValue.join("").slice(0, length);
    onChange(finalValue);

    // Move to next box if entry made
    if (char !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (value[index] === "" || value[index] === undefined) {
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
          const newValue = value.split("");
          newValue[index - 1] = "";
          onChange(newValue.join(""));
        }
      } else {
        const newValue = value.split("");
        newValue[index] = "";
        onChange(newValue.join(""));
      }
    }
  };

  const handleFocus = (index: number) => setFocusedIndex(index);

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.box,
            focusedIndex === i && styles.boxFocused,
            value[i] ? styles.boxFilled : null,
          ]}
        >
          <TextInput
            ref={(ref) => (inputRefs.current[i] = ref)}
            style={styles.input}
            value={value[i] || ""}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            onFocus={() => handleFocus(i)}
            onBlur={() => setFocusedIndex(-1)}
            maxLength={1}
            secureTextEntry={secure}
            autoCapitalize="characters"
            keyboardType={Platform.OS === "ios" ? "ascii-capable" : "default"}
            autoFocus={autoFocus && i === 0}
            selectionColor="#2563EB"
            placeholderTextColor="#94A3B8"
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
    marginVertical: 16,
  },
  box: {
    flex: 1,
    height: 64,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  boxFocused: {
    borderColor: "#2563EB",
    backgroundColor: "#F8FAFC",
  },
  boxFilled: {
    borderColor: "#0F172A",
  },
  input: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    width: "100%",
    height: "100%",
    ...(Platform.select({
      web: {
        outlineStyle: "none",
      },
    }) as any),
  },
});
