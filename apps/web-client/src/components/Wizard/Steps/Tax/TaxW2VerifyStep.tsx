import { View, StyleSheet, TextInput, ScrollView } from "react-native";
import { H3, Text, spacing, Stack, Spacer } from "@trusttax/ui";
import {
  ShieldCheck,
  User,
  DollarSign,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import type { TaxIntakeData, W2Detected } from "../../../../types/taxIntake";
import { SquareSwitch } from "../../../../components/SquareSwitch";

const s = spacing;

interface TaxW2VerifyStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
  w2Index: number;
  subStep: "employer_employee" | "federal" | "state_local";
}

export function TaxW2VerifyStep({
  data,
  onChange,
  w2Index,
  subStep,
}: TaxW2VerifyStepProps) {
  const { t } = useTranslation();
  const w2 = data.w2Uploads[w2Index];
  const [ssnError, setSsnError] = useState(false);

  if (!w2) return null;

  const detected = w2.detected || {};

  // Logic: If SSN is masked (contains X) or empty, we must ask for it twice.
  const isSsnIncomplete =
    !detected.taxpayerSsnMasked || detected.taxpayerSsnMasked.includes("X");

  useEffect(() => {
    if (detected.taxpayerSsnConfirm && detected.taxpayerSsnMasked) {
      // Compare stripped values to ignore dashes vs no dashes
      const val1 = detected.taxpayerSsnConfirm.replace(/\D/g, "");
      const val2 = detected.taxpayerSsnMasked.replace(/\D/g, "");
      setSsnError(val1 !== val2);
    } else {
      setSsnError(false);
    }
  }, [detected.taxpayerSsnConfirm, detected.taxpayerSsnMasked]);

  const updateDetected = (patch: Partial<W2Detected>) => {
    const nextUploads = [...data.w2Uploads];
    nextUploads[w2Index] = {
      ...w2,
      detected: { ...detected, ...patch },
    };
    onChange({ w2Uploads: nextUploads });
  };

  const formatSSN = (value: string) => {
    // Strip non-numeric characters
    const digits = value.replace(/\D/g, "");
    const trimmed = digits.slice(0, 9);

    // Format as XXX-XX-XXXX
    if (trimmed.length > 5) {
      return `${trimmed.slice(0, 3)}-${trimmed.slice(3, 5)}-${trimmed.slice(5)}`;
    } else if (trimmed.length > 3) {
      return `${trimmed.slice(0, 3)}-${trimmed.slice(3)}`;
    }

    return trimmed;
  };

  const renderEmployerEmployee = () => (
    <Stack gap="xl">
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <User size={24} color="#2563EB" />
        </View>
        <Stack gap="xs">
          <H3>
            {t(
              "tax_wizard.w2_verify.personal_info_title",
              "Información del Empleador y Empleado",
            )}
          </H3>
          <Text style={styles.sub}>W-2: {w2.fileName}</Text>
        </Stack>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          {t("tax_wizard.w2_verify.employer_info")}
        </Text>
        <Stack gap="md">
          <View>
            <Text style={styles.label}>
              {t(
                "tax_wizard.w2_verify.employer_name",
                "Nombre del Empleador (Box c)",
              )}
            </Text>
            <TextInput
              style={styles.input}
              value={detected.employerName}
              onChangeText={(v) => updateDetected({ employerName: v })}
            />
          </View>
          <View>
            <Text style={styles.label}>
              {t(
                "tax_wizard.w2_verify.employer_ein",
                "EIN del Empleador (Box b)",
              )}
            </Text>
            <TextInput
              style={styles.input}
              value={detected.employerEin}
              onChangeText={(v) => updateDetected({ employerEin: v })}
              placeholder="XX-XXXXXXX"
            />
          </View>
          <View>
            <Text style={styles.label}>
              {t(
                "tax_wizard.w2_verify.employer_address",
                "Dirección del Empleador",
              )}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={detected.employerAddress}
              onChangeText={(v) => updateDetected({ employerAddress: v })}
              multiline
            />
          </View>
        </Stack>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          {t("tax_wizard.w2_verify.employee_info")}
        </Text>
        <Stack gap="md">
          <View>
            <Text style={styles.label}>
              {t("tax_wizard.w2_verify.employee_name")}
            </Text>
            <TextInput
              style={styles.input}
              value={detected.taxpayerName}
              onChangeText={(v) => updateDetected({ taxpayerName: v })}
            />
          </View>
          <View>
            <Text style={styles.label}>
              {t("tax_wizard.w2_verify.employee_ssn")}
            </Text>
            <TextInput
              style={[styles.input, isSsnIncomplete && styles.inputWarning]}
              value={detected.taxpayerSsnMasked}
              onChangeText={(v) =>
                updateDetected({ taxpayerSsnMasked: formatSSN(v) })
              }
              placeholder="XXX-XX-XXXX"
              keyboardType="numeric"
              maxLength={11}
            />
            {isSsnIncomplete && (
              <Text style={styles.hintText}>
                {t(
                  "tax_wizard.w2_verify.ssn_required_hint",
                  "Por favor ingresa tu SSN completo ya que no pudimos detectarlo.",
                )}
              </Text>
            )}
          </View>

          <View>
            <Text style={styles.label}>
              {t("tax_wizard.w2_verify.employee_ssn_confirm")}
            </Text>
            <TextInput
              style={[styles.input, ssnError && styles.inputError]}
              value={detected.taxpayerSsnConfirm}
              onChangeText={(v) =>
                updateDetected({ taxpayerSsnConfirm: formatSSN(v) })
              }
              placeholder="XXX-XX-XXXX"
              keyboardType="numeric"
              maxLength={11}
            />
            {ssnError && (
              <View style={styles.errorRow}>
                <AlertTriangle size={14} color="#EF4444" />
                <Text style={styles.errorText}>
                  {t(
                    "tax_wizard.w2_verify.ssn_mismatch",
                    "Los números no coinciden",
                  )}
                </Text>
              </View>
            )}
          </View>

          <View>
            <Text style={styles.label}>
              {t("tax_wizard.w2_verify.employee_address")}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={detected.address}
              onChangeText={(v) => updateDetected({ address: v })}
              multiline
            />
          </View>
        </Stack>
      </View>
    </Stack>
  );

  const renderFederal = () => (
    <Stack gap="xl">
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <DollarSign size={24} color="#059669" />
        </View>
        <Stack gap="xs">
          <H3>
            {t(
              "tax_wizard.w2_verify.federal_info_title",
              "Wages e Impuestos Federales",
            )}
          </H3>
          <Text style={styles.sub}>W-2: {w2.fileName}</Text>
        </Stack>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          {t("tax_wizard.w2_verify.wages_section")}
        </Text>
        <View style={styles.grid2}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>{t("tax_wizard.w2_verify.box1")}</Text>
            <TextInput
              style={styles.input}
              value={detected.wages?.toString()}
              keyboardType="decimal-pad"
              onChangeText={(v) =>
                updateDetected({ wages: parseFloat(v) || 0 })
              }
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>{t("tax_wizard.w2_verify.box2")}</Text>
            <TextInput
              style={styles.input}
              value={detected.federalWithholding?.toString()}
              keyboardType="decimal-pad"
              onChangeText={(v) =>
                updateDetected({ federalWithholding: parseFloat(v) || 0 })
              }
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>{t("tax_wizard.w2_verify.box3")}</Text>
            <TextInput
              style={styles.input}
              value={detected.socialSecurityWages?.toString()}
              keyboardType="decimal-pad"
              onChangeText={(v) =>
                updateDetected({ socialSecurityWages: parseFloat(v) || 0 })
              }
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>{t("tax_wizard.w2_verify.box4")}</Text>
            <TextInput
              style={styles.input}
              value={detected.socialSecurityWithheld?.toString()}
              keyboardType="decimal-pad"
              onChangeText={(v) =>
                updateDetected({ socialSecurityWithheld: parseFloat(v) || 0 })
              }
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>{t("tax_wizard.w2_verify.box5")}</Text>
            <TextInput
              style={styles.input}
              value={detected.medicareWages?.toString()}
              keyboardType="decimal-pad"
              onChangeText={(v) =>
                updateDetected({ medicareWages: parseFloat(v) || 0 })
              }
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>{t("tax_wizard.w2_verify.box6")}</Text>
            <TextInput
              style={styles.input}
              value={detected.medicareWithheld?.toString()}
              keyboardType="decimal-pad"
              onChangeText={(v) =>
                updateDetected({ medicareWithheld: parseFloat(v) || 0 })
              }
            />
          </View>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          {t("tax_wizard.w2_verify.other_federal")}
        </Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {t("tax_wizard.w2_verify.statutory", "Statutory Employee (Box 13)")}
          </Text>
          <SquareSwitch
            value={!!detected.statutoryEmployee}
            onValueChange={(v) => updateDetected({ statutoryEmployee: v })}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            {t("tax_wizard.w2_verify.retirement", "Retirement Plan (Box 13)")}
          </Text>
          <SquareSwitch
            value={!!detected.retirementPlan}
            onValueChange={(v) => updateDetected({ retirementPlan: v })}
          />
        </View>
      </View>
    </Stack>
  );

  const renderStateLocal = () => (
    <Stack gap="xl">
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MapPin size={24} color="#D97706" />
        </View>
        <Stack gap="xs">
          <H3>
            {t(
              "tax_wizard.w2_verify.state_info_title",
              "Información Estatal y Local",
            )}
          </H3>
          <Text style={styles.sub}>W-2: {w2.fileName}</Text>
        </Stack>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          {t("tax_wizard.w2_verify.state_section")}
        </Text>
        <View style={styles.grid2}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>
              {t("tax_wizard.w2_verify.box15_code")}
            </Text>
            <TextInput
              style={styles.input}
              value={detected.stateCode}
              onChangeText={(v) => updateDetected({ stateCode: v })}
              placeholder="Ej: VA"
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>
              {t("tax_wizard.w2_verify.box15_id")}
            </Text>
            <TextInput
              style={styles.input}
              value={detected.stateIdNumber}
              onChangeText={(v) => updateDetected({ stateIdNumber: v })}
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>{t("tax_wizard.w2_verify.box16")}</Text>
            <TextInput
              style={styles.input}
              value={detected.stateWages?.toString()}
              keyboardType="decimal-pad"
              onChangeText={(v) =>
                updateDetected({ stateWages: parseFloat(v) || 0 })
              }
            />
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>{t("tax_wizard.w2_verify.box17")}</Text>
            <TextInput
              style={styles.input}
              value={detected.stateWithholding?.toString()}
              keyboardType="decimal-pad"
              onChangeText={(v) =>
                updateDetected({ stateWithholding: parseFloat(v) || 0 })
              }
            />
          </View>
        </View>
      </View>

      {detected.localityName && (
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            {t("tax_wizard.w2_verify.local_section")}
          </Text>
          <Stack gap="md">
            <View>
              <Text style={styles.label}>
                {t("tax_wizard.w2_verify.box20", "Locality (Box 20)")}
              </Text>
              <TextInput
                style={styles.input}
                value={detected.localityName}
                onChangeText={(v) => updateDetected({ localityName: v })}
              />
            </View>
            <View style={styles.grid2}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>
                  {t("tax_wizard.w2_verify.box18", "Local Wages (Box 18)")}
                </Text>
                <TextInput
                  style={styles.input}
                  value={detected.localWages?.toString()}
                  keyboardType="decimal-pad"
                  onChangeText={(v) =>
                    updateDetected({ localWages: parseFloat(v) || 0 })
                  }
                />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>
                  {t("tax_wizard.w2_verify.box19", "Local Tax (Box 19)")}
                </Text>
                <TextInput
                  style={styles.input}
                  value={detected.localTax?.toString()}
                  keyboardType="decimal-pad"
                  onChangeText={(v) =>
                    updateDetected({ localTax: parseFloat(v) || 0 })
                  }
                />
              </View>
            </View>
          </Stack>
        </View>
      )}

      <View style={styles.securityHint}>
        <ShieldCheck size={16} color="#059669" />
        <Text style={styles.securityText}>
          {t(
            "tax_wizard.w2_verify.security_msg",
            "Tus datos están cifrados y seguros.",
          )}
        </Text>
      </View>
      <Spacer size="xl" />
    </Stack>
  );

  const wrapInScroll = (content: React.ReactNode) => (
    <ScrollView showsVerticalScrollIndicator={false}>{content}</ScrollView>
  );

  switch (subStep) {
    case "employer_employee":
      return wrapInScroll(renderEmployerEmployee());
    case "federal":
      return wrapInScroll(renderFederal());
    case "state_local":
      return wrapInScroll(renderStateLocal());
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[4],
    marginBottom: s[4],
    paddingHorizontal: s[2],
  },
  iconCircle: {
    width: 48,
    height: 48,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  },
  sub: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  formSection: {
    backgroundColor: "#FFF",
    padding: s[5],
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    textTransform: "uppercase",
    marginBottom: s[5],
    letterSpacing: 0.5,
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
    backgroundColor: "#FFF",
    paddingHorizontal: s[4],
    fontSize: 16,
    color: "#0F172A",
    borderRadius: 0,
    width: "100%",
  },
  inputWarning: { borderColor: "#F59E0B", backgroundColor: "#FFFBEB" },
  inputError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  hintText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: s[1],
    fontStyle: "italic",
    lineHeight: 18,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[2],
    marginTop: s[1],
  },
  errorText: { fontSize: 12, color: "#EF4444", fontWeight: "600" },
  textArea: { height: 100, paddingTop: s[3], textAlignVertical: "top" },
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: s[4] },
  gridItem: { flex: 1, minWidth: 260 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: s[4],
    backgroundColor: "#F8FAFC",
    borderRadius: 0,
    marginBottom: s[2],
  },
  switchLabel: { fontSize: 14, color: "#334155", fontWeight: "500" },
  securityHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: s[4],
    opacity: 0.6,
  },
  securityText: { fontSize: 12, color: "#059669", fontWeight: "600" },
});
