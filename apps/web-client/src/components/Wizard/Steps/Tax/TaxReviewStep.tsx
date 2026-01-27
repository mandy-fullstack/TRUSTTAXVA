import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { H3, Text, Card, spacing, Spacer, Stack } from '@trusttax/ui';
import { CheckCircle2, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaxIntakeData } from '../../../../types/taxIntake';

const s = spacing;

interface TaxReviewStepProps {
  data: TaxIntakeData;
  docData: Record<string, { fileName: string; status: string }>;
  serviceName: string;
  onAcceptTerms?: (accepted: boolean) => void;
  termsAccepted?: boolean;
}

export function TaxReviewStep({
  data,
  docData,
  serviceName,
  onAcceptTerms,
  termsAccepted = false,
}: TaxReviewStepProps) {
  const { t } = useTranslation();
  const agreed = termsAccepted;
  const w2s = data.w2Uploads ?? [];
  const deps = data.dependents ?? [];
  const other = data.otherIncome ?? {};
  const ded = data.deductions ?? {};
  const otherCount = Object.values(other).filter(Boolean).length;
  const dedCount = Object.values(ded).filter(Boolean).length;

  const toggleAgree = (v: boolean) => {
    onAcceptTerms?.(v);
  };

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <Stack gap="xl">
        <View>
          <H3>{t('tax_wizard.review.title')}</H3>
          <Spacer size="sm" />
          <Text style={styles.desc}>
            {t('tax_wizard.review.description')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tax_wizard.review.service')}</Text>
          <Card style={styles.card}>
            <Text style={styles.value}>{serviceName}</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tax_wizard.review.tax_year_status')}</Text>
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>{t('tax_wizard.review.tax_year')}</Text>
              <Text style={styles.value}>{data.taxYear ?? '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t('tax_wizard.review.filing_status')}</Text>
              <Text style={styles.value}>{data.filingStatus || '—'}</Text>
            </View>
            {data.filingWithSpouse && (
              <View style={styles.row}>
                <Text style={styles.label}>{t('tax_wizard.review.file_with_spouse')}</Text>
                <Text style={styles.value}>{data.filingWithSpouse === 'yes' ? t('tax_wizard.review.file_with_spouse_yes') : t('tax_wizard.review.file_with_spouse_no')}</Text>
              </View>
            )}
            {data.claimableAsDependent && (
              <View style={styles.row}>
                <Text style={styles.label}>{t('tax_wizard.review.claimable_as_dependent')}</Text>
                <Text style={styles.value}>{data.claimableAsDependent}</Text>
              </View>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tax_wizard.review.w2s')}</Text>
          <Card style={styles.card}>
            {w2s.length === 0 ? (
              <Text style={styles.muted}>{t('tax_wizard.review.w2_none')}</Text>
            ) : (
              w2s.map((w) => (
                <View key={w.id} style={styles.row}>
                  <FileText size={16} color="#64748B" />
                  <Text style={styles.value}>{w.fileName}</Text>
                  {w.status === 'uploaded' && <CheckCircle2 size={16} color="#10B981" />}
                </View>
              ))
            )}
          </Card>
        </View>

        {deps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('tax_wizard.review.dependents')}</Text>
            <Card style={styles.card}>
              {deps.map((d) => (
                <View key={d.id} style={styles.depRow}>
                  <Text style={styles.value}>
                    {t('tax_wizard.review.dependent_info', { name: d.legalName || t('tax_wizard.review.unnamed'), relationship: d.relationship || '—', dob: d.dateOfBirth || '—' })}
                  </Text>
                  {d.noSsnYet && <Text style={styles.needsInfo}>{t('tax_wizard.review.needs_info')} (SSN)</Text>}
                </View>
              ))}
            </Card>
          </View>
        )}

        {(otherCount > 0 || dedCount > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('tax_wizard.review.other_income_deductions')}</Text>
            <Card style={styles.card}>
              <Text style={styles.value}>
                {t('tax_wizard.review.other_income_summary', { otherCount, dedCount })}
              </Text>
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tax_wizard.review.documents')}</Text>
          <Card style={styles.card}>
            {Object.keys(docData).length === 0 ? (
              <Text style={styles.muted}>{t('tax_wizard.review.documents_none')}</Text>
            ) : (
              Object.entries(docData).map(([k, v]) => (
                <View key={k} style={styles.row}>
                  <FileText size={16} color="#64748B" />
                  <Text style={styles.value}>{v.fileName}</Text>
                  <CheckCircle2 size={16} color="#10B981" />
                </View>
              ))
            )}
          </Card>
        </View>

        {data.needsInfo && data.needsInfo.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('tax_wizard.review.needs_info')}</Text>
            <Card style={[styles.card, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <Text style={styles.needsInfoList}>{data.needsInfo.join(' • ')}</Text>
            </Card>
          </View>
        )}

        <View style={styles.policies}>
          <View style={styles.agreeRow}>
            <TouchableOpacity
              style={[styles.checkbox, agreed && styles.checkboxChecked]}
              onPress={() => toggleAgree(!agreed)}
            />
            <Text style={styles.policyText}>
              {t('tax_wizard.review.terms_text')}
            </Text>
          </View>
        </View>
      </Stack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {},
  desc: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  section: {},
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: s[2] },
  card: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1, padding: s[4], borderRadius: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: s[2], paddingVertical: s[2], borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  depRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: s[2], borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  label: { fontSize: 14, color: '#64748B', flex: 1 },
  value: { fontSize: 14, fontWeight: '500', color: '#0F172A' },
  muted: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic' },
  needsInfo: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },
  needsInfoList: { fontSize: 14, color: '#92400E', lineHeight: 22 },
  policies: { padding: s[4], backgroundColor: '#EFF6FF', borderRadius: 0, borderWidth: 1, borderColor: '#BFDBFE' },
  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: s[3] },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#94A3B8', borderRadius: 0, marginTop: 2 },
  checkboxChecked: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  policyText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 20 },
});
