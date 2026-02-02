import { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text } from "@trusttax/ui";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { State } from "country-state-city";
import { ExpirationDatePicker } from "./ExpirationDatePicker";
import { MaskedInput } from "./MaskedInput";
import { getExpirationInfo } from "../../utils/expiration";

interface ProfileDriverLicenseProps {
  number: string;
  stateCode: string;
  stateName: string;
  expirationDate: string;
  onNumberChange: (v: string) => void;
  onStateChange: (code: string, name: string) => void;
  onExpirationChange: (v: string) => void;
  driverLicenseMasked?: string | null;
  onLoadDecrypted?: () => Promise<{
    number: string;
    stateCode: string;
    stateName: string;
    expirationDate: string;
  } | null>; // Función async que carga los datos descifrados completos
}

const US_STATES = State.getStatesOfCountry("US") ?? [];

export const ProfileDriverLicense = ({
  number,
  stateCode,
  stateName: _stateName,
  expirationDate,
  onNumberChange,
  onStateChange,
  onExpirationChange,
  driverLicenseMasked,
  onLoadDecrypted,
}: ProfileDriverLicenseProps) => {
  const { t } = useTranslation();
  const [showWhy, setShowWhy] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [stateQuery, setStateQuery] = useState("");

  const filteredStates = useMemo(() => {
    if (!stateQuery.trim()) return US_STATES.slice(0, 60);
    const q = stateQuery.toLowerCase();
    return US_STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.isoCode && s.isoCode.toLowerCase().includes(q)),
    ).slice(0, 60);
  }, [stateQuery]);

  const selectedState = US_STATES.find((s) => s.isoCode === stateCode);
  const expirationInfo = useMemo(
    () => getExpirationInfo(expirationDate || ""),
    [expirationDate],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {t("profile.driver_license", "Driver's License")}
        </Text>
        <TouchableOpacity
          onPress={() => setShowWhy(!showWhy)}
          style={styles.whyButton}
          activeOpacity={0.7}
        >
          <HelpCircle size={16} color="#2563EB" />
          <Text style={styles.whyText}>
            {t("profile.why_we_need", "Why we need this")}
          </Text>
          {showWhy ? (
            <ChevronUp size={16} color="#64748B" />
          ) : (
            <ChevronDown size={16} color="#64748B" />
          )}
        </TouchableOpacity>
      </View>

      {showWhy && (
        <View style={styles.whyBox}>
          <Text style={styles.whyTitle}>
            {t("profile.why_dl_title", "Why we ask for driver's license")}
          </Text>
          <Text style={styles.whyBody}>
            {t(
              "profile.why_dl_body",
              "We use your driver's license details (number, state of issue, expiration) to verify your identity for tax preparation and to comply with IRS due diligence requirements. All data is encrypted with AES-256-GCM before storage. We never display the full number.",
            )}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={[styles.group, { flex: 1 }]}>
          <MaskedInput
            label={t("profile.dl_number", "License number")}
            value={number}
            onChange={onNumberChange}
            placeholder={t(
              "profile.dl_number_placeholder",
              "Enter license number",
            )}
            maskType="license"
            maskedDisplay={driverLicenseMasked || null}
            uppercase
            onLoadDecrypted={
              onLoadDecrypted
                ? async () => {
                    const decrypted = await onLoadDecrypted();
                    if (decrypted) {
                      onNumberChange((decrypted.number || "").toUpperCase());
                      onStateChange(
                        (decrypted.stateCode || "").toUpperCase(),
                        (decrypted.stateName || "").toUpperCase(),
                      );
                      onExpirationChange(
                        (decrypted.expirationDate || "").toUpperCase(),
                      );
                      return (decrypted.number || "").toUpperCase();
                    }
                    return null;
                  }
                : undefined
            }
          />
        </View>
        <View style={[styles.group, { flex: 1 }]}>
          <Text style={styles.sublabel}>
            {t("profile.dl_state", "State of issue")}
          </Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setStateOpen(!stateOpen)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectText} numberOfLines={1}>
              {selectedState
                ? `${selectedState.name} (${selectedState.isoCode})`
                : t("profile.select_state", "Select state")}
            </Text>
            <ChevronDown size={18} color="#64748B" />
          </TouchableOpacity>
          {stateOpen && (
            <View style={styles.dropdown}>
              <TextInput
                style={styles.searchInput}
                value={stateQuery}
                onChangeText={setStateQuery}
                placeholder={t("profile.search_state", "Search state...")}
                placeholderTextColor="#94A3B8"
              />
              <ScrollView
                style={styles.options}
                keyboardShouldPersistTaps="handled"
              >
                {filteredStates.map((s) => (
                  <TouchableOpacity
                    key={s.isoCode}
                    style={[
                      styles.opt,
                      stateCode === s.isoCode && styles.optActive,
                    ]}
                    onPress={() => {
                      onStateChange(
                        (s.isoCode || "").toUpperCase(),
                        (s.name || "").toUpperCase(),
                      );
                      setStateOpen(false);
                      setStateQuery("");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optText}>
                      {s.name} ({s.isoCode})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.group, { flex: 1 }]}>
          <ExpirationDatePicker
            value={expirationDate}
            onChange={onExpirationChange}
            label={t("profile.dl_expiration", "Expiration date")}
          />
          {expirationInfo &&
            (expirationInfo.status === "expired" ||
              expirationInfo.status === "soon") && (
              <View
                style={[
                  styles.expirationBanner,
                  expirationInfo.status === "expired"
                    ? styles.expirationExpired
                    : styles.expirationSoon,
                ]}
              >
                <AlertTriangle
                  size={16}
                  color={
                    expirationInfo.status === "expired" ? "#DC2626" : "#D97706"
                  }
                />
                <Text
                  style={[
                    styles.expirationText,
                    expirationInfo.status === "expired"
                      ? styles.expirationTextExpired
                      : styles.expirationTextSoon,
                  ]}
                >
                  {expirationInfo.status === "expired"
                    ? t("profile.expiration_expired", "Expired")
                    : t("profile.expiration_soon", {
                        days: expirationInfo.daysLeft,
                      })}
                </Text>
              </View>
            )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24, width: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#334155" },
  whyButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  whyText: { fontSize: 13, color: "#2563EB", fontWeight: "500" },
  whyBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 14,
    marginBottom: 12,
    borderRadius: 0,
  },
  whyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 6,
  },
  whyBody: { fontSize: 13, color: "#1E3A8A", lineHeight: 20 },
  row: { flexDirection: "row", gap: 16, marginBottom: 16, flexWrap: "wrap" },
  group: { minWidth: 180 },
  sublabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
  },
  selectText: { fontSize: 16, color: "#0F172A", flex: 1 },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    maxHeight: 220,
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    fontSize: 15,
    color: "#0F172A",
  },
  options: { maxHeight: 180 },
  opt: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  optActive: { backgroundColor: "#EFF6FF" },
  optText: { fontSize: 15, color: "#1E293B" },
  expirationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 10,
    borderRadius: 0,
  },
  expirationExpired: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  expirationSoon: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  expirationText: { fontSize: 13, fontWeight: "600" },
  expirationTextExpired: { color: "#DC2626" },
  expirationTextSoon: { color: "#D97706" },
});
