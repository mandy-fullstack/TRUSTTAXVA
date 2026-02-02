import { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { H3, Text, spacing, Spacer, Stack } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import type { TaxIntakeData } from "../../../../types/taxIntake";

const s = spacing;

interface TaxBankStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
}

export function TaxBankStep({ data, onChange }: TaxBankStepProps) {
  const { t } = useTranslation();
  const bank = data.bankInfo || {};

  // Validar confirmación
  const [confirmRouting, setConfirmRouting] = useState(
    bank.routingNumber || "",
  );
  const [confirmAccount, setConfirmAccount] = useState(
    bank.accountNumber || "",
  );
  const [touchedRouting, setTouchedRouting] = useState(false);
  const [touchedAccount, setTouchedAccount] = useState(false);

  // Solo mostrar error si hay diferencia Y el usuario ha interactuado con el campo de confirmación
  const routingMismatch =
    bank.routingNumber &&
    confirmRouting &&
    bank.routingNumber !== confirmRouting &&
    touchedRouting;
  const accountMismatch =
    bank.accountNumber &&
    confirmAccount &&
    bank.accountNumber !== confirmAccount &&
    touchedAccount;

  const setBank = (patch: Partial<typeof bank>) => {
    onChange({ bankInfo: { ...bank, ...patch } });
  };

  return (
    <Stack gap="xl">
      <View>
        <H3>{t("tax_wizard.bank.title")}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>{t("tax_wizard.bank.description")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t("tax_wizard.bank.bank_name")}</Text>
        <TextInput
          style={styles.input}
          value={bank.bankName}
          onChangeText={(text) => setBank({ bankName: text.toUpperCase() })}
          placeholder={t("tax_wizard.bank.bank_name_placeholder")}
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t("tax_wizard.bank.account_type")}</Text>
        <View style={styles.toggleRow}>
          {(["checking", "savings"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.toggleBtn,
                bank.accountType === type && styles.toggleBtnActive,
              ]}
              onPress={() => setBank({ accountType: type })}
            >
              <Text
                style={[
                  styles.toggleText,
                  bank.accountType === type && styles.toggleTextActive,
                ]}
              >
                {t(`tax_wizard.bank.${type}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>
            {t("tax_wizard.bank.routing_number")}
          </Text>
          <TextInput
            style={[styles.input, routingMismatch && styles.inputError]}
            value={bank.routingNumber}
            onChangeText={(text) =>
              setBank({ routingNumber: text.replace(/\D/g, "") })
            }
            placeholder="000000000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            maxLength={9}
          />
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>
            {t("tax_wizard.bank.confirm_routing_number", "Confirm Routing No.")}
          </Text>
          <TextInput
            style={[styles.input, routingMismatch && styles.inputError]}
            value={confirmRouting}
            onChangeText={(text) => {
              setConfirmRouting(text.replace(/\D/g, ""));
              setTouchedRouting(true);
            }}
            placeholder="000000000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            maxLength={9}
            onBlur={() => setTouchedRouting(true)}
          />
        </View>
      </View>

      {routingMismatch && (
        <View style={{ paddingHorizontal: s[2], marginTop: -s[1] }}>
          <Text style={styles.errorText}>
            {t(
              "tax_wizard.bank.routing_mismatch",
              "Routing numbers do not match",
            )}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>
            {t("tax_wizard.bank.account_number")}
          </Text>
          <TextInput
            style={[styles.input, accountMismatch && styles.inputError]}
            value={bank.accountNumber}
            onChangeText={(text) => {
              setBank({ accountNumber: text.replace(/\D/g, "") });
            }}
            placeholder="0000000000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>
            {t("tax_wizard.bank.confirm_account_number", "Confirm Account No.")}
          </Text>
          <TextInput
            style={[styles.input, accountMismatch && styles.inputError]}
            value={confirmAccount}
            onChangeText={(text) => {
              setConfirmAccount(text.replace(/\D/g, ""));
              setTouchedAccount(true);
            }}
            placeholder="0000000000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            onBlur={() => setTouchedAccount(true)}
          />
        </View>
      </View>

      {accountMismatch && (
        <View style={{ paddingHorizontal: s[2], marginTop: -s[1] }}>
          <Text style={styles.errorText}>
            {t(
              "tax_wizard.bank.account_mismatch",
              "Account numbers do not match",
            )}
          </Text>
        </View>
      )}

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>{t("tax_wizard.bank.warning")}</Text>
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
    paddingHorizontal: s[2],
  },
  section: { gap: s[1], paddingHorizontal: s[2] },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    textTransform: "uppercase",
    marginBottom: s[1],
    letterSpacing: 0.5,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: s[4],
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#FFF",
    borderRadius: 0,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: { color: "#EF4444", fontSize: 13, fontWeight: "600" },
  row: { flexDirection: "row", gap: s[2], paddingRight: s[2] },
  toggleRow: { flexDirection: "row", gap: s[3] },
  toggleBtn: {
    flex: 1,
    paddingVertical: s[3],
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 0,
  },
  toggleBtnActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  toggleText: { fontSize: 14, fontWeight: "700", color: "#475569" },
  toggleTextActive: { color: "#FFF" },
  warningBox: {
    marginHorizontal: s[2],
    padding: s[4],
    backgroundColor: "#FFF7ED",
    borderLeftWidth: 4,
    borderLeftColor: "#F97316",
    borderRadius: 0,
  },
  warningText: { fontSize: 13, color: "#9A3412", lineHeight: 20 },
});
