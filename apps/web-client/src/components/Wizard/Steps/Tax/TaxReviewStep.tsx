import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { H3, Text, Card, spacing, Spacer, Stack } from "@trusttax/ui";
import {
  CheckCircle2,
  FileText,
  Pencil,
  Calendar,
  Users,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Info,
  ClipboardList,
  Package,
  Eye,
  MapPin,
} from "lucide-react";
import { api } from "../../../../services/api";
import { useTranslation } from "react-i18next";
import type { TaxIntakeData } from "../../../../types/taxIntake";

const s = spacing;

interface TaxReviewStepProps {
  data: TaxIntakeData;
  docData: Record<string, { fileName: string; status: string; id?: string }>;
  serviceName: string;
  onAcceptTerms?: (accepted: boolean) => void;
  termsAccepted?: boolean;
  onEditStep?: (stepId: string) => void;
}

export function TaxReviewStep({
  data,
  docData,
  serviceName,
  onAcceptTerms,
  termsAccepted = false,
  onEditStep,
}: TaxReviewStepProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const agreed = termsAccepted;
  const w2s = data.w2Uploads ?? [];
  const deps = data.dependents ?? [];
  const other = data.otherIncome ?? {};
  const ded = data.deductions ?? {};
  const otherCount = Object.values(other).filter(Boolean).length;
  const dedCount = Object.values(ded).filter(Boolean).length;

  const OTHER_MAP: Record<string, string> = {
    has1099NEC: "has_1099nec",
    has1099K: "has_1099k",
    has1099G: "has_1099g",
    has1099INTorDIV: "has_1099int",
    has1099R: "has_1099r",
    hasSSA1099: "has_ssa1099",
    hasCrypto: "has_crypto",
    hasW2G: "has_w2g",
    has1099B: "has_1099b",
    hasRental: "has_rental",
  };

  const DED_MAP: Record<string, string> = {
    mortgageInterest: "has_mortgage",
    tuition1098T: "has_tuition",
    studentLoanInterest: "has_student_loan",
    iraContribution: "has_ira",
    hsa: "has_hsa",
    charitable: "has_charitable",
    medical: "has_medical",
    energy: "has_energy",
  };

  const toggleAgree = (v: boolean) => {
    onAcceptTerms?.(v);
  };

  const renderEditButton = (stepId: string) => (
    <TouchableOpacity
      onPress={() => onEditStep?.(stepId)}
      style={styles.editBtn}
    >
      <Pencil size={12} color="#2563EB" />
      <Text style={styles.edittext}>{t("common.edit", "EDIT")}</Text>
    </TouchableOpacity>
  );

  const handleViewDocument = async (docId: string) => {
    try {
      const blob = await api.downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to view document", error);
    }
  };

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <Stack gap="xl">
        <View>
          <H3>{t("tax_wizard.review.title")}</H3>
          <Spacer size="sm" />
          <Text style={styles.desc}>{t("tax_wizard.review.description")}</Text>
        </View>

        {/* 1. Basic Info, Identity & Service */}
        <View style={styles.section}>
          <View style={styles.titleWithIcon}>
            <Package size={18} color="#0F172A" />
            <Text style={styles.sectionTitle}>
              {t("tax_wizard.review.service")}
            </Text>
          </View>
          <Card style={styles.card}>
            <Text style={[styles.value, { fontSize: 16 }]}>{serviceName}</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Calendar size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>
                {t("tax_wizard.review.tax_year_status")}
              </Text>
            </View>
            {renderEditButton("filing_status")}
          </View>
          <Card style={styles.card}>
            <View style={[styles.row, isMobile && styles.mobileRow]}>
              <Text style={styles.label}>
                {t("tax_wizard.review.tax_year")}
              </Text>
              <Text style={styles.value}>{data.taxYear ?? "—"}</Text>
            </View>
            <View style={[styles.row, isMobile && styles.mobileRow]}>
              <Text style={styles.label}>
                {t("tax_wizard.review.filing_status")}
              </Text>
              <Text style={styles.value}>
                {data.filingStatus
                  ? t(
                      `tax_wizard.filing_status.filing_status_${
                        {
                          Single: "single",
                          "Married Filing Jointly": "mfj",
                          "Married Filing Separately": "mfs",
                          "Head of Household": "hoh",
                          "Qualifying Surviving Spouse": "qss",
                        }[data.filingStatus] || data.filingStatus
                      }`,
                    )
                  : "—"}
              </Text>
            </View>

            {/* Taxpayer Identity */}
            {w2s.length > 0 && w2s[0].detected && (
              <>
                <View style={[styles.row, isMobile && styles.mobileRow]}>
                  <Text style={styles.label}>
                    {t("tax_wizard.review.taxpayer_name")}
                  </Text>
                  <Text style={styles.value}>
                    {w2s[0].detected.taxpayerName || "—"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.row,
                    isMobile && styles.mobileRow,
                    { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={styles.label}>
                    {t("tax_wizard.review.taxpayer_ssn")}
                  </Text>
                  <Text style={styles.value}>
                    {w2s[0].detected.taxpayerSsnMasked || "—"}
                  </Text>
                </View>
              </>
            )}

            {/* Spouse Info */}
            {data.spouseInfo && data.filingWithSpouse === "yes" && (
              <>
                <View
                  style={[
                    styles.row,
                    isMobile && styles.mobileRow,
                    {
                      borderTopWidth: 1,
                      borderTopColor: "#F1F5F9",
                      marginTop: 8,
                      paddingTop: 8,
                    },
                  ]}
                >
                  <Text style={styles.label}>
                    {t("tax_wizard.review.spouse_info")}
                  </Text>
                  <Text style={styles.value}>
                    {[data.spouseInfo.firstName, data.spouseInfo.lastName]
                      .filter(Boolean)
                      .join(" ")}
                  </Text>
                </View>
                <View style={[styles.row, isMobile && styles.mobileRow]}>
                  <Text style={styles.label}>{t("tax_wizard.spouse.ssn")}</Text>
                  <Text style={styles.value}>
                    {data.spouseInfo.ssn
                      ? "XXX-XX-" + data.spouseInfo.ssn.slice(-4)
                      : "—"}
                  </Text>
                </View>
              </>
            )}

            {data.claimableAsDependent && (
              <View style={[styles.row, isMobile && styles.mobileRow]}>
                <Text style={styles.label}>
                  {t("tax_wizard.review.claimable_as_dependent")}
                </Text>
                <Text style={styles.value}>
                  {data.claimableAsDependent === "yes"
                    ? t("tax_wizard.filing_status.claimable_yes")
                    : data.claimableAsDependent === "no"
                      ? t("tax_wizard.filing_status.claimable_no")
                      : t("tax_wizard.filing_status.claimable_unknown")}
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* 2. Mailing Address */}
        {data.mailingAddress && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleWithIcon}>
                <MapPin size={18} color="#0F172A" />
                <Text style={styles.sectionTitle}>
                  {t("tax_wizard.review.mailing_address")}
                </Text>
              </View>
              {renderEditButton("tax-address")}
            </View>
            <Card style={styles.card}>
              <View style={[styles.row, isMobile && styles.mobileRow]}>
                <Text style={styles.label}>
                  {t("tax_wizard.address.street")}
                </Text>
                <Text style={styles.value}>
                  {data.mailingAddress.street} {data.mailingAddress.apartment}
                </Text>
              </View>
              <View
                style={[
                  styles.row,
                  isMobile && styles.mobileRow,
                  { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.label}>{t("tax_wizard.address.city")}</Text>
                <Text style={styles.value}>
                  {data.mailingAddress.city}, {data.mailingAddress.state}{" "}
                  {data.mailingAddress.zipCode}
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* 3. W-2 Forms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <FileText size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>
                {t("tax_wizard.review.w2s")}
              </Text>
            </View>
            {renderEditButton("w2-upload")}
          </View>
          <Card style={styles.card}>
            {w2s.length === 0 ? (
              <Text style={styles.muted}>{t("tax_wizard.review.w2_none")}</Text>
            ) : (
              w2s.map((w, idx) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => handleViewDocument(w.id)}
                  style={[
                    styles.w2Block,
                    idx === w2s.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.rowNoBorder}>
                    <FileText size={16} color="#64748B" />
                    <Text
                      style={[
                        styles.value,
                        { flex: 1, textTransform: "uppercase" },
                      ]}
                    >
                      {w.detected?.employerName || w.fileName}
                    </Text>
                    <Eye size={16} color="#2563EB" />
                    {w.status === "uploaded" && (
                      <CheckCircle2 size={16} color="#10B981" />
                    )}
                  </View>
                  {w.detected && (
                    <View style={styles.taxGrid}>
                      {!!w.detected.wages && (
                        <View style={styles.taxCol}>
                          <Text style={styles.taxLabel}>
                            {t("tax_wizard.review.wages_box1")}
                          </Text>
                          <Text style={styles.taxValue}>
                            ${w.detected.wages.toLocaleString()}
                          </Text>
                        </View>
                      )}
                      {!!w.detected.federalWithholding && (
                        <View style={styles.taxCol}>
                          <Text style={styles.taxLabel}>
                            {t("tax_wizard.review.fed_tax")}
                          </Text>
                          <Text style={styles.taxValue}>
                            ${w.detected.federalWithholding.toLocaleString()}
                          </Text>
                        </View>
                      )}
                      {!!w.detected.socialSecurityWithheld && (
                        <View style={styles.taxCol}>
                          <Text style={styles.taxLabel}>
                            {t("tax_wizard.review.ss_tax")}
                          </Text>
                          <Text style={styles.taxValue}>
                            $
                            {w.detected.socialSecurityWithheld.toLocaleString()}
                          </Text>
                        </View>
                      )}
                      {!!w.detected.medicareWithheld && (
                        <View style={styles.taxCol}>
                          <Text style={styles.taxLabel}>
                            {t("tax_wizard.review.medicare_tax")}
                          </Text>
                          <Text style={styles.taxValue}>
                            ${w.detected.medicareWithheld.toLocaleString()}
                          </Text>
                        </View>
                      )}
                      {!!w.detected.stateWithholding && (
                        <View style={styles.taxCol}>
                          <Text style={styles.taxLabel}>
                            {t("tax_wizard.review.state_tax")} (
                            {w.detected.stateCode})
                          </Text>
                          <Text style={styles.taxValue}>
                            ${w.detected.stateWithholding.toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </Card>
        </View>

        {/* 4. Other Income & Deductions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <DollarSign size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>
                {t("tax_wizard.review.other_income")}
              </Text>
            </View>
            {renderEditButton("other-income")}
          </View>
          <Card style={styles.card}>
            {otherCount === 0 ? (
              <Text style={styles.muted}>{t("common.none")}</Text>
            ) : (
              Object.entries(other)
                .filter(([_, v]) => v)
                .map(([k], idx, arr) => {
                  return (
                    <View
                      key={k}
                      style={[
                        styles.row,
                        idx === arr.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <CheckCircle2 size={16} color="#2563EB" />
                      <Text style={styles.value}>
                        {t(`tax_wizard.other_income.${OTHER_MAP[k] || k}`)}
                      </Text>
                    </View>
                  );
                })
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <TrendingDown size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>
                {t("tax_wizard.review.deductions")}
              </Text>
            </View>
            {renderEditButton("deductions")}
          </View>
          <Card style={styles.card}>
            {dedCount === 0 ? (
              <Text style={styles.muted}>{t("common.none")}</Text>
            ) : (
              Object.entries(ded)
                .filter(([_, v]) => v)
                .map(([k], idx, arr) => {
                  return (
                    <View
                      key={k}
                      style={[
                        styles.row,
                        idx === arr.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <CheckCircle2 size={16} color="#2563EB" />
                      <Text style={styles.value}>
                        {t(`tax_wizard.deductions.${DED_MAP[k] || k}`)}
                      </Text>
                    </View>
                  );
                })
            )}
          </Card>
        </View>

        {/* 5. Dependents */}
        {deps.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleWithIcon}>
                <Users size={18} color="#0F172A" />
                <Text style={styles.sectionTitle}>
                  {t("tax_wizard.review.dependents")}
                </Text>
              </View>
              {renderEditButton("dependents")}
            </View>
            <Card style={styles.card}>
              {deps.map((d, idx) => (
                <View
                  key={d.id}
                  style={[
                    styles.depBlock,
                    idx === deps.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View
                    style={[
                      styles.rowNoBorder,
                      isMobile && {
                        flexDirection: "column",
                        alignItems: "flex-start",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.value,
                        { fontSize: 15, textTransform: "uppercase" },
                      ]}
                    >
                      {[d.firstName, d.middleName, d.lastName]
                        .filter(Boolean)
                        .join(" ") || t("tax_wizard.review.unnamed")}
                    </Text>
                    <Text style={styles.subValue}>
                      {t(
                        `tax_wizard.filing_status.relationship_${d.relationship || "other"}`,
                      )}{" "}
                      • {d.dateOfBirth}
                    </Text>
                  </View>

                  <View style={styles.chipRow}>
                    {d.monthsLivedWithYou !== undefined && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>
                          {d.monthsLivedWithYou} {t("tax_wizard.review.months")}
                        </Text>
                      </View>
                    )}
                    {d.fullTimeStudent && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>
                          {t("tax_wizard.review.student")}
                        </Text>
                      </View>
                    )}
                    {d.permanentDisability && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>
                          {t("tax_wizard.review.disabled")}
                        </Text>
                      </View>
                    )}
                    {d.childcare && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>
                          {t("tax_wizard.review.childcare")}
                        </Text>
                      </View>
                    )}
                    {d.noSsnYet && (
                      <View
                        style={[styles.chip, { backgroundColor: "#FEF3C7" }]}
                      >
                        <Text style={[styles.chipText, { color: "#B45309" }]}>
                          {t("tax_wizard.review.no_ssn")}
                        </Text>
                      </View>
                    )}
                  </View>

                  {d.someoneElseCanClaim &&
                    d.someoneElseCanClaim !== "unknown" && (
                      <Text style={styles.detailText}>
                        {t("tax_wizard.review.claimable_by_other")}:{" "}
                        <Text style={{ fontWeight: "700" }}>
                          {d.someoneElseCanClaim === "yes"
                            ? t("common.yes")
                            : t("common.no")}
                        </Text>
                      </Text>
                    )}
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* 6. Bank Info */}
        {data.bankInfo && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleWithIcon}>
                <DollarSign size={18} color="#0F172A" />
                <Text style={styles.sectionTitle}>
                  {t("tax_wizard.review.bank_info")}
                </Text>
              </View>
              {renderEditButton("tax-bank")}
            </View>
            <Card style={styles.card}>
              <View style={[styles.row, isMobile && styles.mobileRow]}>
                <Text style={styles.label}>
                  {t("tax_wizard.bank.bank_name")}
                </Text>
                <Text style={styles.value}>
                  {data.bankInfo.bankName || "—"}
                </Text>
              </View>
              <View style={[styles.row, isMobile && styles.mobileRow]}>
                <Text style={styles.label}>
                  {t("tax_wizard.bank.routing_number")}
                </Text>
                <Text style={styles.value}>
                  {data.bankInfo.routingNumber
                    ? "XXXXX" + data.bankInfo.routingNumber.slice(-4)
                    : "—"}
                </Text>
              </View>
              <View
                style={[
                  styles.row,
                  isMobile && styles.mobileRow,
                  { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.label}>
                  {t("tax_wizard.bank.account_number")}
                </Text>
                <Text style={styles.value}>
                  {data.bankInfo.accountNumber
                    ? "XXXXX" + data.bankInfo.accountNumber.slice(-4)
                    : "—"}
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* 7. Documents */}
        {data.missingDocs && data.missingDocs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.titleWithIcon}>
              <AlertTriangle size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>
                {t("tax_wizard.review.missing_docs_list")}
              </Text>
            </View>
            <Card
              style={[
                styles.card,
                { borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" },
              ]}
            >
              {data.missingDocs.map((doc, i) => (
                <View
                  key={i}
                  style={[
                    styles.row,
                    { borderBottomColor: "#FEE2E2" },
                    i === data.missingDocs.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  <AlertTriangle size={14} color="#EF4444" />
                  <Text style={[styles.value, { color: "#B91C1C" }]}>
                    {doc}
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <ClipboardList size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>
                {t("tax_wizard.review.documents")}
              </Text>
            </View>
            {renderEditButton("missing-docs")}
          </View>
          <Card style={styles.card}>
            {Object.keys(docData).length === 0 ? (
              <Text style={styles.muted}>
                {t("tax_wizard.review.documents_none", "None")}
              </Text>
            ) : (
              Object.entries(docData).map(([k, v], idx, arr) => (
                <TouchableOpacity
                  key={k}
                  onPress={() => v.id && handleViewDocument(v.id)}
                  style={[
                    styles.row,
                    idx === arr.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <FileText size={16} color="#64748B" />
                  <Text style={styles.value}>{v.fileName}</Text>
                  <Spacer size="xs" direction="horizontal" />
                  {v.status === "uploaded" && (
                    <CheckCircle2 size={16} color="#10B981" />
                  )}
                  <Spacer size="xs" direction="horizontal" />
                  {v.id && <Eye size={16} color="#2563EB" />}
                </TouchableOpacity>
              ))
            )}
            {Object.keys(docData).length > 0 && (
              <Text style={[styles.muted, { fontSize: 12, marginTop: 8 }]}>
                {t(
                  "tax_wizard.review.documents_secure_msg",
                  "Your sensitive documents are encrypted and only accessible by authorized professionals.",
                )}
              </Text>
            )}
          </Card>
        </View>

        {data.needsInfo && data.needsInfo.length > 0 && (
          <View style={styles.section}>
            <View style={styles.titleWithIcon}>
              <Info size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>
                {t("tax_wizard.review.needs_info")}
              </Text>
            </View>
            <Card
              style={[
                styles.card,
                { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" },
              ]}
            >
              <Text style={styles.needsInfoList}>
                {data.needsInfo.join(" • ")}
              </Text>
            </Card>
          </View>
        )}

        {/* 8. Policies & Terms */}
        <View style={styles.policies}>
          <TouchableOpacity
            style={styles.agreeRow}
            onPress={() => toggleAgree(!agreed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <CheckCircle2 size={16} color="#FFF" />}
            </View>
            <Text style={styles.policyText}>
              {t("tax_wizard.review.terms_text")}
            </Text>
          </TouchableOpacity>
        </View>
      </Stack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {},
  desc: { fontSize: 16, color: "#64748B", lineHeight: 24 },
  section: {},
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: s[2],
  },
  titleWithIcon: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#EFF6FF",
  },
  edittext: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#FFF",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    padding: s[4],
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: s[3],
    paddingVertical: s[3],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  mobileRow: { flexDirection: "column", alignItems: "flex-start", gap: 4 },
  w2Block: {
    paddingVertical: s[3],
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  depBlock: {
    paddingVertical: s[3],
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: s[1],
  },
  rowNoBorder: { flexDirection: "row", alignItems: "center", gap: s[2] },
  taxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s[4],
    marginTop: s[2],
    backgroundColor: "#F1F5F9",
    padding: s[2],
    borderRadius: 0,
  },
  taxCol: { width: "45%", gap: 2 },
  taxLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  taxValue: { fontSize: 13, color: "#0F172A", fontWeight: "700" },
  depRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: s[2],
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  }, // Kept for legacy if needed, but depBlock replaces it largely
  label: { fontSize: 14, color: "#64748B", flex: 1 },
  value: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  subValue: { fontSize: 13, color: "#64748B" },
  detailText: { fontSize: 13, color: "#475569", marginTop: 2 },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s[2],
    marginTop: s[1],
  },
  chip: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    textTransform: "uppercase",
  },
  muted: { fontSize: 14, color: "#94A3B8", fontStyle: "italic" },
  needsInfo: { fontSize: 12, color: "#F59E0B", fontWeight: "600" },
  needsInfoList: { fontSize: 14, color: "#92400E", lineHeight: 22 },
  policies: {
    padding: s[4],
    backgroundColor: "#EFF6FF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  agreeRow: { flexDirection: "row", alignItems: "flex-start", gap: s[3] },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#94A3B8",
    borderRadius: 0,
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  policyText: { flex: 1, fontSize: 13, color: "#475569", lineHeight: 20 },
});
