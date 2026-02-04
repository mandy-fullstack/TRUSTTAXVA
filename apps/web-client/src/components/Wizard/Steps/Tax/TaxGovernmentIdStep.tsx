import { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  useWindowDimensions,
} from "react-native";
import { H3, Text, spacing, Spacer, Stack, Card, Button } from "@trusttax/ui";
import { Upload, CheckCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TaxIntakeData, GovernmentIdInfo, GovernmentIdType } from "../../../../types/taxIntake";
import { US_STATES, type StateOption } from "../../../../utils/geo";
import { DocumentSelector } from "../../../../components/DocumentSelector";
import { api } from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";

const s = spacing;

type DocDataMap = Record<string, { fileName: string; status: string; id?: string }>;

interface TaxGovernmentIdStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
  docData?: DocDataMap;
  onDocChange?: (docData: DocDataMap) => void;
}

const DOC_KEY_TAXPAYER = "TAXPAYER_GOV_ID";
const DOC_KEY_SPOUSE = "SPOUSE_GOV_ID";

function ensureGovId(value: GovernmentIdInfo | undefined): GovernmentIdInfo {
  return (
    value ?? {
      idType: "",
      idNumber: "",
      issuingState: "",
      expirationDate: "",
    }
  );
}

export function TaxGovernmentIdStep({
  data,
  onChange,
  docData = {},
  onDocChange,
}: TaxGovernmentIdStepProps) {
  const { t } = useTranslation();
  const { showAlert } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const [modalOpen, setModalOpen] = useState(false);
  const [activePerson, setActivePerson] = useState<"taxpayer" | "spouse" | null>(null);
  const [uploading, setUploading] = useState(false);

  const taxpayer = ensureGovId(data.taxpayerGovId);
  const spouse = ensureGovId(data.spouseGovId);
  const hasSpouse = data.filingWithSpouse === "yes";

  const states: StateOption[] = useMemo(() => {
    return [...US_STATES].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const setTaxpayer = (patch: Partial<GovernmentIdInfo>) =>
    onChange({ taxpayerGovId: { ...taxpayer, ...patch } });
  const setSpouse = (patch: Partial<GovernmentIdInfo>) =>
    onChange({ spouseGovId: { ...spouse, ...patch } });

  const openPicker = (person: "taxpayer" | "spouse") => {
    if (!onDocChange) return;
    setActivePerson(person);
    setModalOpen(true);
  };

  const getDocType = (idType: GovernmentIdType) => {
    if (idType === "DRIVER_LICENSE") return "DRIVER_LICENSE";
    return "ID_CARD";
  };

  const formatMMDDYYYY = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const processFile = async (file: File) => {
    if (!activePerson || !onDocChange) return;
    setUploading(true);
    try {
      const idInfo = activePerson === "taxpayer" ? taxpayer : spouse;
      const docType = getDocType(idInfo.idType);
      const label =
        activePerson === "taxpayer"
          ? t("tax_wizard.gov_id.taxpayer_doc_label", "Taxpayer Government ID")
          : t("tax_wizard.gov_id.spouse_doc_label", "Spouse Government ID");

      const result = await api.uploadDocument(file, label, docType);
      const key = activePerson === "taxpayer" ? DOC_KEY_TAXPAYER : DOC_KEY_SPOUSE;
      onDocChange({
        ...docData,
        [key]: { fileName: file.name, status: "uploaded", id: result.id },
      });
      setModalOpen(false);
      setActivePerson(null);
    } catch (error: any) {
      console.error("Upload failed", error);
      showAlert({
        title: t("wizard.error_title"),
        message: error?.message || t("wizard.upload_error"),
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const processExistingFile = async (doc: { id: string; fileName: string; type?: string }) => {
    if (!activePerson || !onDocChange) return;
    const key = activePerson === "taxpayer" ? DOC_KEY_TAXPAYER : DOC_KEY_SPOUSE;
    onDocChange({
      ...docData,
      [key]: { fileName: doc.fileName, status: "uploaded", id: doc.id },
    });
    setModalOpen(false);
    setActivePerson(null);
  };

  const renderPersonCard = (
    person: "taxpayer" | "spouse",
    value: GovernmentIdInfo,
    setValue: (patch: Partial<GovernmentIdInfo>) => void,
    docKey: string,
    title: string,
  ) => {
    const uploaded = !!docData?.[docKey]?.id;
    const currentDocType = getDocType(value.idType);

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          {uploaded && (
            <View style={styles.badge}>
              <CheckCircle size={14} color="#16A34A" />
              <Text style={styles.badgeText}>
                {t("tax_wizard.gov_id.uploaded", "Documento adjunto")}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.row, isMobile && styles.column]}>
          <View style={[styles.col, isMobile && styles.fullWidth]}>
            <Text style={styles.label}>{t("tax_wizard.gov_id.id_type", "Tipo de ID")}</Text>
            <View style={styles.selectWrap}>
              <select
                value={value.idType}
                onChange={(e) => setValue({ idType: e.target.value as GovernmentIdType })}
                style={styles.select as any}
              >
                <option value="">{t("tax_wizard.gov_id.select", "Seleccionar")}</option>
                <option value="DRIVER_LICENSE">
                  {t("tax_wizard.gov_id.driver_license", "Licencia de Conducir")}
                </option>
                <option value="ID_CARD">{t("tax_wizard.gov_id.id_card", "ID estatal")}</option>
              </select>
            </View>
          </View>

          <View style={[styles.col, isMobile && styles.fullWidth]}>
            <Text style={styles.label}>{t("tax_wizard.gov_id.id_number", "Número")}</Text>
            <TextInput
              value={value.idNumber}
              onChangeText={(v) => setValue({ idNumber: v })}
              style={styles.input}
              placeholder={t("tax_wizard.gov_id.id_number_placeholder", "Ej: D1234567")}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={[styles.row, isMobile && styles.column]}>
          <View style={[styles.col, isMobile && styles.fullWidth]}>
            <Text style={styles.label}>
              {t("tax_wizard.gov_id.issuing_state", "Estado emisor")}
            </Text>
            <View style={styles.selectWrap}>
              <select
                value={value.issuingState}
                onChange={(e) => setValue({ issuingState: e.target.value })}
                style={styles.select as any}
              >
                <option value="">{t("tax_wizard.gov_id.select", "Seleccionar")}</option>
                {states.map((st: StateOption) => (
                  <option key={st.isoCode} value={st.isoCode}>
                    {st.name}
                  </option>
                ))}
              </select>
            </View>
          </View>

          <View style={[styles.col, isMobile && styles.fullWidth]}>
            <Text style={styles.label}>
              {t("tax_wizard.gov_id.expiration", "Vencimiento")}
            </Text>
            <TextInput
              value={value.expirationDate}
              onChangeText={(v) =>
                setValue({ expirationDate: formatMMDDYYYY(v) })
              }
              style={styles.input}
              placeholder={t("tax_wizard.gov_id.expiration_placeholder", "MM/DD/YYYY")}
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {onDocChange && (
          <View style={styles.uploadRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.smallHint}>
                {t(
                  "tax_wizard.gov_id.upload_hint",
                  "Adjunta una foto/PDF de tu licencia/ID (recomendado).",
                )}
              </Text>
              {docData?.[docKey]?.fileName ? (
                <Text style={styles.fileName} numberOfLines={1}>
                  {docData[docKey].fileName}
                </Text>
              ) : (
                <Text style={styles.fileNameMuted} numberOfLines={1}>
                  {t("tax_wizard.gov_id.no_doc", "Sin documento adjunto")}
                </Text>
              )}
            </View>
            <Button
              title={t("tax_wizard.gov_id.upload_button", "Adjuntar")}
              variant="outline"
              onPress={() => openPicker(person)}
              icon={<Upload size={16} color="#2563EB" />}
              disabled={!value.idType}
            />

            <Modal visible={modalOpen && activePerson === person} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {t("tax_wizard.gov_id.select_doc", "Seleccionar documento")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setModalOpen(false);
                        setActivePerson(null);
                      }}
                      style={styles.modalClose}
                    >
                      <X size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <DocumentSelector
                    uploading={uploading}
                    onUpload={processFile}
                    onSelect={processExistingFile}
                    docFilter={currentDocType}
                    accept="image/*,.pdf"
                  />
                </View>
              </View>
            </Modal>
          </View>
        )}
      </Card>
    );
  };

  return (
    <Stack gap="xl">
      <View>
        <H3>{t("tax_wizard.gov_id.title", "Licencia de Conducir / ID")}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t(
            "tax_wizard.gov_id.description",
            "Ingresa los datos de identificación para las personas involucradas (Taxpayer y, si aplica, Spouse).",
          )}
        </Text>
      </View>

      {renderPersonCard(
        "taxpayer",
        taxpayer,
        setTaxpayer,
        DOC_KEY_TAXPAYER,
        t("tax_wizard.gov_id.taxpayer_title", "Taxpayer"),
      )}

      {hasSpouse &&
        renderPersonCard(
          "spouse",
          spouse,
          setSpouse,
          DOC_KEY_SPOUSE,
          t("tax_wizard.gov_id.spouse_title", "Spouse"),
        )}

      {!hasSpouse && (
        <View style={styles.note}>
          <Text style={styles.noteText}>
            {t(
              "tax_wizard.gov_id.spouse_note",
              "Si declaras con tu esposo/a, selecciona 'Filing with spouse: Yes' en el paso de Filing Status para habilitar su sección.",
            )}
          </Text>
        </View>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    padding: s[6],
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: s[4],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 0,
  },
  badgeText: { color: "#166534", fontSize: 12, fontWeight: "600" },
  row: {
    flexDirection: "row",
    gap: s[4],
    marginBottom: s[4],
  },
  column: {
    flexDirection: "column",
  },
  col: { flex: 1 },
  fullWidth: { width: "100%" },
  label: { color: "#0F172A", fontSize: 12, fontWeight: "600", marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  selectWrap: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  select: {
    width: "100%",
    height: 48,
    padding: 12,
    borderWidth: 0,
    outline: "none",
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "transparent",
  } as any,
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[4],
    marginTop: s[3],
  },
  smallHint: { color: "#475569", fontSize: 12, lineHeight: 16 },
  fileName: { color: "#0F172A", fontSize: 12, marginTop: 6, fontWeight: "600" },
  fileNameMuted: { color: "#94A3B8", fontSize: 12, marginTop: 6 },
  note: {
    padding: s[4],
    borderRadius: 0,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  noteText: { color: "#475569", fontSize: 13, lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    padding: 12,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  modalTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
});

