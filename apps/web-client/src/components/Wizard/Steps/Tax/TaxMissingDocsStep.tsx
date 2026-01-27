import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { H3, Text, Button, spacing, Spacer, Stack } from '@trusttax/ui';
import { FileText, CheckCircle, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaxIntakeData, OtherIncomeFlags, DeductionFlags } from '../../../../types/taxIntake';

const s = spacing;

const OTHER_DOCS: { key: keyof OtherIncomeFlags; label: string }[] = [
  { key: 'has1099NEC', label: '1099-NEC' },
  { key: 'has1099K', label: '1099-K' },
  { key: 'has1099G', label: '1099-G' },
  { key: 'has1099INTorDIV', label: '1099-INT / 1099-DIV' },
  { key: 'has1099R', label: '1099-R' },
  { key: 'hasSSA1099', label: 'SSA-1099' },
  { key: 'hasCrypto', label: 'Crypto statements' },
  { key: 'hasW2G', label: 'W-2G' },
  { key: 'has1099B', label: '1099-B' },
  { key: 'hasRental', label: 'Rental docs' },
];

const DEDUCTION_DOCS: { key: keyof DeductionFlags; label: string }[] = [
  { key: 'mortgageInterest', label: '1098 (mortgage)' },
  { key: 'tuition1098T', label: '1098-T (tuition)' },
  { key: 'studentLoanInterest', label: '1098-E (student loan)' },
  { key: 'iraContribution', label: 'IRA contribution confirmation' },
  { key: 'hsa', label: '1095 / 1099-SA (HSA)' },
  { key: 'charitable', label: 'Charitable receipts' },
  { key: 'medical', label: 'Medical expense docs' },
  { key: 'energy', label: 'Energy improvement docs' },
];

function buildMissingList(data: TaxIntakeData): string[] {
  const list: string[] = [];
  const other = data.otherIncome ?? {};
  const ded = data.deductions ?? {};
  OTHER_DOCS.forEach(({ key, label }) => {
    if (other[key]) list.push(label);
  });
  DEDUCTION_DOCS.forEach(({ key, label }) => {
    if (ded[key]) list.push(label);
  });
  const deps = data.dependents ?? [];
  deps.forEach((d) => {
    if (d.childcare && (d.childcareProvider || d.childcareAmount)) {
      list.push(`Childcare provider info for ${d.legalName || 'dependent'}`);
    }
  });
  return list;
}

interface TaxMissingDocsStepProps {
  data: TaxIntakeData;
  docData: Record<string, { fileName: string; status: string }>;
  onDocChange: (docData: Record<string, { fileName: string; status: string }>) => void;
}

export function TaxMissingDocsStep({ data, docData, onDocChange }: TaxMissingDocsStepProps) {
  const { t } = useTranslation();
  const missing = buildMissingList(data);

  const handleUploadMock = (label: string) => {
    const key = label.replace(/\s*\/\s*/g, '_').replace(/\s+/g, '_');
    onDocChange({
      ...docData,
      [key]: { fileName: `${key}_${Date.now()}.pdf`, status: 'uploaded' },
    });
  };

  const handleRemove = (label: string) => {
    const key = label.replace(/\s*\/\s*/g, '_').replace(/\s+/g, '_');
    const next = { ...docData };
    delete next[key];
    onDocChange(next);
  };

  if (missing.length === 0) {
    return (
      <Stack gap="xl">
        <H3>{t('tax_wizard.missing_docs.no_missing_title')}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t('tax_wizard.missing_docs.no_missing_desc')}
        </Text>
        <View style={styles.empty}>
          <CheckCircle size={32} color="#10B981" />
          <Text style={styles.emptyText}>{t('tax_wizard.missing_docs.no_missing_text')}</Text>
        </View>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <View>
        <H3>{t('tax_wizard.missing_docs.title')}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t('tax_wizard.missing_docs.description')}
        </Text>
      </View>

      <View style={styles.list}>
        {missing.map((label) => {
          const key = label.replace(/\s*\/\s*/g, '_').replace(/\s+/g, '_');
          const file = docData[key];
          return (
            <View key={key} style={styles.item}>
              <View style={styles.itemInfo}>
                <View style={[styles.iconBox, file ? styles.iconBoxSuccess : styles.iconBoxPending]}>
                  {file ? <CheckCircle size={20} color="#10B981" /> : <FileText size={20} color="#64748B" />}
                </View>
                <View>
                  <Text style={styles.itemTitle}>{label}</Text>
                  <Text style={styles.itemStatus}>
                    {file ? file.fileName : t('tax_wizard.missing_docs.upload_or_enter')}
                  </Text>
                </View>
              </View>
              {file ? (
                <TouchableOpacity onPress={() => handleRemove(label)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>{t('tax_wizard.missing_docs.remove')}</Text>
                </TouchableOpacity>
              ) : (
                <Button
                  title={t('tax_wizard.missing_docs.upload')}
                  variant="outline"
                  onPress={() => handleUploadMock(label)}
                  icon={<Upload size={14} color="#2563EB" />}
                  style={styles.uploadBtn}
                />
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.needsInfo}>
        <Text style={styles.needsInfoText}>
          {t('tax_wizard.missing_docs.needs_info_note')}
        </Text>
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s[3],
    padding: s[5],
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 0,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#166534' },
  list: { gap: s[3] },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: s[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#FFF',
  },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: s[3] },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    borderWidth: 1,
  },
  iconBoxPending: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  iconBoxSuccess: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  itemStatus: { fontSize: 13, color: '#64748B', marginTop: 2 },
  removeBtn: {},
  removeText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  uploadBtn: {},
  needsInfo: { padding: s[4], backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 0 },
  needsInfoText: { fontSize: 14, color: '#92400E', lineHeight: 22 },
});
