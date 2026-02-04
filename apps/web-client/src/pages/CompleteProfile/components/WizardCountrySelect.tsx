import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Text } from "@trusttax/ui";
import { ChevronDown, Check } from "lucide-react";
import { getCountries } from "../../../utils/geo";

interface WizardCountrySelectProps {
  value: string; // ISO code
  onChange: (isoCode: string) => void;
  placeholder?: string;
}

export const WizardCountrySelect: React.FC<WizardCountrySelectProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const justSelectedRef = useRef(false);
  const countries = useMemo(() => getCountries(), []);

  const selected = useMemo(
    () => countries.find((c) => c.isoCode === value),
    [value],
  );

  useEffect(() => {
    if (selected) {
      setQuery(selected.name.toUpperCase());
    } else if (!value) {
      setQuery("");
    }
  }, [selected, value]);

  const filtered = useMemo(() => {
    if (!query.trim()) return countries.slice(0, 50);
    const q = query.toLowerCase();
    return countries
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.isoCode.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [query]);

  const handleSelect = (isoCode: string) => {
    const selectedCountry = countries.find((c) => c.isoCode === isoCode);
    if (selectedCountry) {
      justSelectedRef.current = true;
      setQuery(selectedCountry.name.toUpperCase());
      onChange(isoCode);
      setIsOpen(false);
      // Prevent blur from interfering
      setTimeout(() => {
        justSelectedRef.current = false;
        inputRef.current?.blur();
      }, 100);
    }
  };

  return (
    <View style={[styles.wrapper, { zIndex: isOpen ? 3000 : 1 }]}>
      <View
        style={[styles.inputContainer, isOpen && styles.inputContainerActive]}
      >
        <TextInput
          ref={inputRef as any}
          style={styles.input}
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            // Keep current query when focusing, don't clear it
          }}
          onBlur={() => {
            // Don't update query if we just selected something
            if (justSelectedRef.current) {
              return;
            }
            setTimeout(() => {
              setIsOpen(false);
              // Use the current value prop to find the selected country
              const currentSelected = countries.find((c) => c.isoCode === value);
              if (currentSelected) {
                setQuery(currentSelected.name.toUpperCase());
              } else if (!query.trim()) {
                setQuery("");
              }
            }, 200);
          }}
          placeholder={placeholder || "TYPE TO SEARCH..."}
          placeholderTextColor="#94A3B8"
        />
        <ChevronDown size={16} color="#64748B" />
      </View>

      {isOpen && (
        <View style={styles.dropdown}>
          <ScrollView style={styles.list} keyboardShouldPersistTaps="always">
            {filtered.map((c) => (
              <TouchableOpacity
                key={c.isoCode}
                style={[
                  styles.option,
                  value === c.isoCode && styles.optionActive,
                ]}
                onPress={() => handleSelect(c.isoCode)}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === c.isoCode && styles.optionTextActive,
                  ]}
                >
                  {c.name.toUpperCase()}
                </Text>
                {value === c.isoCode && <Check size={14} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}
            {filtered.length === 0 && (
              <Text style={styles.empty}>NO MATCHES FOUND</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    position: "relative",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48, // Match Input component height
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    borderRadius: 0, // Strict design system
  },
  inputContainerActive: {
    borderColor: "#0F172A", // Brand color
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontWeight: "400",
    color: "#0F172A",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    letterSpacing: 0.2,
    outlineStyle: "none", // Remove web outline
  } as any,
  dropdown: {
    position: "absolute",
    top: 47, // offset by 1px for overlap (48 - 1)
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#0F172A", // Match active input
    borderTopWidth: 0,
    maxHeight: 250,
    zIndex: 9999,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }
      : {}),
  } as any,
  list: {
    maxHeight: 200,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  optionActive: {
    backgroundColor: "#0F172A",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#475569",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  empty: {
    padding: 16,
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    fontWeight: "400",
  },
});
