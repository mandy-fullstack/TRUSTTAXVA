import {
  View,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  Platform,
} from "react-native";
import { H3, Text, spacing, Spacer, Stack } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import type { TaxIntakeData } from "../../../../types/taxIntake";
import { useState } from "react";

const s = spacing;

interface TaxAddressStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
}

export function TaxAddressStep({ data, onChange }: TaxAddressStepProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const address = data.mailingAddress || {
    street: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
  };

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const setAddr = (patch: Partial<typeof address>) => {
    onChange({ mailingAddress: { ...address, ...patch } });
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <Stack gap="xl">
      <View>
        <H3>{t("tax_wizard.address.title", "Dirección Postal")}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t(
            "tax_wizard.address.description",
            "Necesitamos tu dirección actual para el envío de notificaciones oficiales del IRS.",
          )}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.section}>
          <Text style={styles.label}>
            {t("tax_wizard.address.street", "Calle y Número")}
          </Text>
          <TextInput
            style={inputStyle("street")}
            value={address.street}
            onChangeText={(text) => setAddr({ street: text.toUpperCase() })}
            placeholder={t(
              "tax_wizard.address.street_placeholder",
              "Ej. 123 Main St",
            )}
            placeholderTextColor="#94A3B8"
            onFocus={() => setFocusedField("street")}
            onBlur={() => setFocusedField(null)}
            autoComplete="street-address" // Browser autocomplete
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t(
              "tax_wizard.address.apartment",
              "Apartamento / Unidad (Opcional)",
            )}
          </Text>
          <TextInput
            style={inputStyle("apartment")}
            value={address.apartment}
            onChangeText={(text) => setAddr({ apartment: text.toUpperCase() })}
            placeholder={t(
              "tax_wizard.address.apartment_placeholder",
              "Ej. Apt 4B",
            )}
            placeholderTextColor="#94A3B8"
            onFocus={() => setFocusedField("apartment")}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <View style={[styles.row, isMobile && styles.col]}>
          <View
            style={[styles.section, isMobile ? { width: "100%" } : { flex: 2 }]}
          >
            <Text style={styles.label}>
              {t("tax_wizard.address.city", "Ciudad")}
            </Text>
            <TextInput
              style={inputStyle("city")}
              value={address.city}
              onChangeText={(text) => setAddr({ city: text.toUpperCase() })}
              placeholder={t("tax_wizard.address.city_placeholder", "Ciudad")}
              placeholderTextColor="#94A3B8"
              onFocus={() => setFocusedField("city")}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          <View style={[styles.row, { flex: 2, gap: s[4] }]}>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>
                {t("tax_wizard.address.state", "Estado")}
              </Text>
              <TextInput
                style={inputStyle("state")}
                value={address.state}
                onChangeText={(text) => setAddr({ state: text.toUpperCase() })}
                placeholder="VA"
                placeholderTextColor="#94A3B8"
                maxLength={2}
                autoCapitalize="characters"
                onFocus={() => setFocusedField("state")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View style={[styles.section, { flex: 1.5 }]}>
              <Text style={styles.label}>
                {t("tax_wizard.address.zip", "Código Postal")}
              </Text>
              <TextInput
                style={inputStyle("zip")}
                value={address.zipCode}
                onChangeText={(text) => setAddr({ zipCode: text })}
                placeholder="12345"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                onFocus={() => setFocusedField("zip")}
                onBlur={() => setFocusedField(null)}
                autoComplete="postal-code"
              />
            </View>
          </View>
        </View>
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  formContainer: {
    gap: 20,
  },
  section: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 2,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#FFF",
    ...Platform.select({
      web: {
        outlineStyle: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      } as any,
    }),
  },
  inputFocused: {
    borderColor: "#2563EB",
    ...Platform.select({
      web: {
        boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.1)",
      } as any,
    }),
  },
  row: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  col: {
    flexDirection: "column",
    gap: 20,
  },
});
