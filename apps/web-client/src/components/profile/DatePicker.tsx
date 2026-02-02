import { View, StyleSheet, TextInput, Platform } from "react-native";
import { Text } from "@trusttax/ui";
import { Calendar } from "lucide-react";
import { createElement } from "react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  required?: boolean;
  hasError?: boolean; // Indica si hay un error de validación
}

export const DatePicker = ({
  value,
  onChange,
  placeholder,
  label,
  required,
  hasError = false,
}: DatePickerProps) => {
  // Internal format helper: YYYY-MM-DD -> MM/DD/YYYY
  const toDisplay = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${m}/${d}/${y}`;
  };

  // Internal parse helper: MM/DD/YYYY -> YYYY-MM-DD
  const toISO = (display: string) => {
    const parts = display.split("/");
    if (parts.length !== 3) return "";
    const [m, d, y] = parts;
    if (m.length !== 2 || d.length !== 2 || y.length !== 4) return "";
    return `${y}-${m}-${d}`;
  };

  // Better strategy for controlled input with mask:
  // 1. Maintain local display state derived from props, but allow typing.
  // 2. OR, assume parent allows arbitrary string storage and we just format it.
  // TaxDependentsStep stores string. StepPersonalDetails stores string.
  // Let's implement robust handling.

  const onInputChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "");
    let final = clean;
    if (clean.length > 2) final = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    if (clean.length > 4)
      final = `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4, 8)}`;

    // If we have a valid date MM/DD/YYYY, convert to YYYY-MM-DD for the parent
    // IF the parent *requires* YYYY-MM-DD.
    // Assuming strict contract: value IS YYYY-MM-DD.
    if (joinDate(final).length === 10) {
      // It's full. Convert.
      const iso = toISO(final);
      onChange(iso);
    } else {
      // We can't really pass partial up if the contract is strict.
      // BUT if we don't pass partial up, 'value' prop won't change, and input won't update?
      // Actually, if we use local state or just pass the partial string (if parent allows).
      // Let's rely on the fact that existing code likely handles string state loosely until submission.
      // Wait, StepPersonalDetails uses `hasError`.
      // Let's call onChange with the RAW input if not complete, or ISO if complete,
      // dependent on whether parent accepts non-ISO.
      // Safest: Use local state for the input display.
      // However we are stateless component.
      // Let's emit the custom format string if partial?
      // Or just emit the ISO if valid, else emit the raw string?
      // If we emit "12/", parent state becomes "12/".
      // Next render: toDisplay("12/") -> "12/". Perfect.
      onChange(final);
    }
  };

  const joinDate = (str: string) => str; // Helper not really needed if we trust the logic

  // Correct logic:
  // Value coming in: could be YYYY-MM-DD (saved) OR MM/DD/YYYY (typing) OR partial.
  // We need to detect format.
  const displayValue = (val: string) => {
    if (!val) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return toDisplay(val);
    return val; // Assume it's already masked or partial
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.requiredAsterisk}> *</Text> : null}
        </Text>
      )}
      <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
        <Calendar size={18} color={hasError ? "#DC2626" : "#64748B"} />
        {Platform.OS === "web" ? (
          createElement("input", {
            type: "text",
            value: displayValue(value) || "",
            onChange: (e: any) => onInputChange(e.target.value),
            placeholder: placeholder || "MM/DD/YYYY",
            maxLength: 10,
            className: "native-input", // We might need to inject style since we used inline before
            style: {
              flex: 1,
              fontSize: 16,
              color: "#0F172A",
              border: "none",
              padding: 0,
              margin: 0,
              background: "transparent",
              fontFamily: "inherit",
              outline: "none",
            },
          })
        ) : (
          <TextInput
            style={styles.input}
            value={displayValue(value) || ""}
            onChangeText={onInputChange}
            placeholder={placeholder || "MM/DD/YYYY"}
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            maxLength={10}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: "#DC2626",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
  },
  inputWrapperError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  } as any,
});
