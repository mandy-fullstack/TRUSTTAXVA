import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { H3, Text, spacing, Spacer, Stack } from "@trusttax/ui";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TaxIntakeData, Dependent } from "../../../../types/taxIntake";
import { DEPENDENT_RELATIONSHIPS } from "../../../../types/taxIntake";
import { DatePicker } from "../../../../components/profile/DatePicker";
import { SquareSwitch } from "../../../../components/SquareSwitch";

const s = spacing;

interface TaxDependentsStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
}

function emptyDependent(): Dependent {
  return {
    id: `dep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    relationship: "",
    ssnOrItin: "",
    monthsLivedWithYou: 0,
    fullTimeStudent: false,
    permanentDisability: false,
    someoneElseCanClaim: "unknown",
    childcare: false,
    noSsnYet: false,
  };
}

export function TaxDependentsStep({ data, onChange }: TaxDependentsStepProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const dependents = data.dependents ?? [];

  const set = (patch: Partial<TaxIntakeData>) => onChange(patch);

  const addDependent = () => {
    set({ dependents: [...dependents, emptyDependent()] });
  };

  const updateDependent = (id: string, patch: Partial<Dependent>) => {
    const next = dependents.map((d) => (d.id === id ? { ...d, ...patch } : d));
    set({ dependents: next });
  };

  const removeDependent = (id: string) => {
    set({ dependents: dependents.filter((d) => d.id !== id) });
  };

  const getRelationshipLabel = (value: string) => {
    const rel = DEPENDENT_RELATIONSHIPS.find((r) => r.value === value);
    if (!rel) return value;
    const keyMap: Record<string, string> = {
      child: "relationship_child",
      stepchild: "relationship_stepchild",
      grandchild: "relationship_grandchild",
      sibling: "relationship_sibling",
      parent: "relationship_parent",
      niece_nephew: "relationship_niece_nephew",
      other: "relationship_other",
    };
    return t(`tax_wizard.filing_status.${keyMap[value] || value}`);
  };

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const trimmed = digits.slice(0, 9);
    if (trimmed.length > 5) {
      return `${trimmed.slice(0, 3)}-${trimmed.slice(3, 5)}-${trimmed.slice(5)}`;
    } else if (trimmed.length > 3) {
      return `${trimmed.slice(0, 3)}-${trimmed.slice(3)}`;
    }
    return trimmed;
  };

  return (
    <Stack gap="xl">
      <View>
        <H3>{t("tax_wizard.filing_status.dependents")}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t("tax_wizard.filing_status.dependent_hint")}
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <TouchableOpacity style={styles.addBtn} onPress={addDependent}>
          <Plus size={18} color="#2563EB" />
          <Text style={styles.addBtnText}>
            {t("tax_wizard.filing_status.add_dependent")}
          </Text>
        </TouchableOpacity>
      </View>

      {dependents.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {t(
              "tax_wizard.filing_status.no_dependents_added",
              "No has agregado dependientes.",
            )}
          </Text>
        </View>
      )}

      {dependents.map((d, idx) => (
        <View key={d.id} style={styles.depCard}>
          <View style={styles.depHeader}>
            <Text style={styles.depTitle}>
              {t("tax_wizard.filing_status.dependent_number", {
                number: idx + 1,
              })}
            </Text>
            <TouchableOpacity onPress={() => removeDependent(d.id)}>
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
          <Stack gap="md">
            <View style={[styles.row2, isMobile && styles.column]}>
              <View style={[isMobile ? styles.fullWidth : { flex: 2 }]}>
                <Text style={styles.label}>
                  {t("tax_wizard.filing_status.dependent_first_name")}
                </Text>
                <TextInput
                  style={styles.input}
                  value={d.firstName}
                  onChangeText={(t) => updateDependent(d.id, { firstName: t })}
                  placeholder={t(
                    "tax_wizard.filing_status.dependent_first_name",
                  )}
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={[isMobile ? styles.fullWidth : { flex: 1 }]}>
                <Text style={styles.label}>
                  {t("tax_wizard.filing_status.dependent_middle_name")}
                </Text>
                <TextInput
                  style={styles.input}
                  value={d.middleName}
                  onChangeText={(t) => updateDependent(d.id, { middleName: t })}
                  placeholder={t(
                    "tax_wizard.filing_status.dependent_middle_name",
                  )}
                  placeholderTextColor="#94A3B8"
                  maxLength={30}
                />
              </View>
              <View style={[isMobile ? styles.fullWidth : { flex: 2 }]}>
                <Text style={styles.label}>
                  {t("tax_wizard.filing_status.dependent_last_name")}
                </Text>
                <TextInput
                  style={styles.input}
                  value={d.lastName}
                  onChangeText={(t) => updateDependent(d.id, { lastName: t })}
                  placeholder={t(
                    "tax_wizard.filing_status.dependent_last_name",
                  )}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
            <View style={[styles.row2, isMobile && styles.column]}>
              <View style={isMobile ? styles.fullWidth : styles.flex1}>
                <DatePicker
                  label={t("tax_wizard.filing_status.dependent_dob")}
                  value={d.dateOfBirth}
                  onChange={(v: string) =>
                    updateDependent(d.id, { dateOfBirth: v })
                  }
                  placeholder="MM/DD/YYYY"
                />
              </View>
              <View style={isMobile ? styles.fullWidth : styles.flex1}>
                <Text style={styles.label}>
                  {t("tax_wizard.filing_status.dependent_relationship")}
                </Text>
                <View style={styles.selectWrap}>
                  <select
                    value={d.relationship}
                    onChange={(e) =>
                      updateDependent(d.id, { relationship: e.target.value })
                    }
                    style={styles.select as any}
                  >
                    <option value="">
                      {t("tax_wizard.filing_status.select_relationship")}
                    </option>
                    {DEPENDENT_RELATIONSHIPS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {getRelationshipLabel(r.value)}
                      </option>
                    ))}
                  </select>
                </View>
              </View>
            </View>
            <View>
              <Text style={styles.label}>
                {t("tax_wizard.filing_status.dependent_ssn")}
              </Text>
              <TextInput
                style={styles.input}
                value={d.ssnOrItin}
                onChangeText={(t) =>
                  updateDependent(d.id, { ssnOrItin: formatSSN(t) })
                }
                placeholder="XXX-XX-XXXX"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={11}
              />
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => updateDependent(d.id, { noSsnYet: !d.noSsnYet })}
              >
                <View
                  style={[
                    styles.checkbox,
                    d.noSsnYet && styles.checkboxChecked,
                  ]}
                />
                <Text style={styles.checkLabel}>
                  {t("tax_wizard.filing_status.dependent_no_ssn")}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.row2, isMobile && styles.column]}>
              <View style={isMobile ? styles.fullWidth : styles.flex1}>
                <Text style={styles.label}>
                  {t("tax_wizard.filing_status.dependent_months")}
                </Text>
                <TextInput
                  style={styles.input}
                  value={
                    d.monthsLivedWithYou ? String(d.monthsLivedWithYou) : ""
                  }
                  onChangeText={(t) =>
                    updateDependent(d.id, {
                      monthsLivedWithYou: Math.min(
                        12,
                        Math.max(0, parseInt(t, 10) || 0),
                      ),
                    })
                  }
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {t("tax_wizard.filing_status.dependent_student")}
              </Text>
              <SquareSwitch
                value={d.fullTimeStudent}
                onValueChange={(v) =>
                  updateDependent(d.id, { fullTimeStudent: v })
                }
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {t("tax_wizard.filing_status.dependent_disability")}
              </Text>
              <SquareSwitch
                value={d.permanentDisability}
                onValueChange={(v) =>
                  updateDependent(d.id, { permanentDisability: v })
                }
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {t("tax_wizard.filing_status.dependent_claimable")}
              </Text>
              <View style={styles.toggleRow}>
                {(["yes", "no", "unknown"] as const).map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[
                      styles.toggleBtnSmall,
                      d.someoneElseCanClaim === v && styles.toggleBtnActive,
                    ]}
                    onPress={() =>
                      updateDependent(d.id, { someoneElseCanClaim: v })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        d.someoneElseCanClaim === v && styles.toggleTextActive,
                      ]}
                    >
                      {v === "yes"
                        ? t("tax_wizard.filing_status.dependent_claimable_yes")
                        : v === "no"
                          ? t("tax_wizard.filing_status.dependent_claimable_no")
                          : t(
                              "tax_wizard.filing_status.dependent_claimable_unknown",
                            )}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {t("tax_wizard.filing_status.dependent_childcare")}
              </Text>
              <SquareSwitch
                value={d.childcare}
                onValueChange={(v) => updateDependent(d.id, { childcare: v })}
              />
            </View>
            {d.childcare && (
              <Stack gap="sm">
                <View>
                  <Text style={styles.label}>
                    {t("tax_wizard.filing_status.childcare_provider")}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={d.childcareProvider ?? ""}
                    onChangeText={(t) =>
                      updateDependent(d.id, { childcareProvider: t })
                    }
                    placeholder={t(
                      "tax_wizard.filing_status.childcare_provider_placeholder",
                    )}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={[styles.row2, isMobile && styles.column]}>
                  <View style={isMobile ? styles.fullWidth : styles.flex1}>
                    <Text style={styles.label}>
                      {t("tax_wizard.filing_status.childcare_ein")}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={d.childcareEin ?? ""}
                      onChangeText={(t) =>
                        updateDependent(d.id, { childcareEin: t })
                      }
                      placeholder={t(
                        "tax_wizard.filing_status.childcare_ein_placeholder",
                      )}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={isMobile ? styles.fullWidth : styles.flex1}>
                    <Text style={styles.label}>
                      {t("tax_wizard.filing_status.childcare_amount")}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={
                        d.childcareAmount != null
                          ? String(d.childcareAmount)
                          : ""
                      }
                      onChangeText={(t) =>
                        updateDependent(d.id, {
                          childcareAmount: t ? parseFloat(t) : undefined,
                        })
                      }
                      placeholder={t(
                        "tax_wizard.filing_status.childcare_amount_placeholder",
                      )}
                      placeholderTextColor="#94A3B8"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </Stack>
            )}
          </Stack>
        </View>
      ))}
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: s[4],
    paddingHorizontal: s[2],
  },
  emptyState: {
    padding: s[6],
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    marginTop: s[2],
  },
  emptyStateText: { fontSize: 14, color: "#94A3B8", textAlign: "center" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[2],
    backgroundColor: "#EFF6FF",
    paddingHorizontal: s[5],
    paddingVertical: s[3],
    borderRadius: 0,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
    textTransform: "uppercase",
  },
  depCard: {
    padding: s[6],
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    backgroundColor: "#FFF",
    marginBottom: s[5],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  depHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: s[5],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: s[3],
  },
  depTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    textTransform: "uppercase",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: s[2],
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    paddingHorizontal: s[4],
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#FFF",
    width: "100%",
  },
  selectWrap: { width: "100%" },
  select: {
    width: "100%",
    height: 52,
    paddingHorizontal: s[4],
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    backgroundColor: "#FFF",
    color: "#0F172A",
  },
  row2: { flexDirection: "row", flexWrap: "wrap", gap: s[4] },
  flex1: { flex: 1 },
  fullWidth: { width: "100%" },
  column: { flexDirection: "column" },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[3],
    marginTop: s[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 0,
    backgroundColor: "#FFF",
  },
  checkboxChecked: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  checkLabel: { fontSize: 14, color: "#475569", fontWeight: "500" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: s[4],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: s[4],
  },
  switchLabel: { fontSize: 14, color: "#334155", flex: 1, fontWeight: "500" },
  toggleRow: { flexDirection: "row", gap: s[3], flexWrap: "wrap" },
  toggleBtnSmall: {
    paddingVertical: s[2],
    paddingHorizontal: s[4],
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
  },
  toggleBtnActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  toggleText: { fontSize: 14, fontWeight: "700", color: "#475569" },
  toggleTextActive: { color: "#FFF" },
});
