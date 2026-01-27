import { View, StyleSheet, TextInput, Switch } from 'react-native';
import { H3, Text, spacing, Spacer, Stack } from '@trusttax/ui';
import { useTranslation } from 'react-i18next';
import type { TaxIntakeData, DeductionFlags } from '../../../../types/taxIntake';

const s = spacing;

const DEDUCTION_ITEMS: { key: keyof DeductionFlags; labelKey: string; hintKey: string }[] = [
  { key: 'mortgageInterest', labelKey: 'has_mortgage', hintKey: 'has_mortgage_hint' },
  { key: 'tuition1098T', labelKey: 'has_tuition', hintKey: 'has_tuition_hint' },
  { key: 'studentLoanInterest', labelKey: 'has_student_loan', hintKey: 'has_student_loan_hint' },
  { key: 'iraContribution', labelKey: 'has_ira', hintKey: 'has_ira_hint' },
  { key: 'hsa', labelKey: 'has_hsa', hintKey: 'has_hsa_hint' },
  { key: 'charitable', labelKey: 'has_charitable', hintKey: 'has_charitable_hint' },
  { key: 'medical', labelKey: 'has_medical', hintKey: 'has_medical_hint' },
  { key: 'energy', labelKey: 'has_energy', hintKey: 'has_energy_hint' },
];

interface TaxDeductionsStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
}

export function TaxDeductionsStep({ data, onChange }: TaxDeductionsStepProps) {
  const { t } = useTranslation();
  const ded = data.deductions ?? {};

  const toggle = (key: keyof DeductionFlags) => {
    const next = { ...ded, [key]: !ded[key] };
    onChange({ deductions: next });
  };

  return (
    <Stack gap="xl">
      <View>
        <H3>{t('tax_wizard.deductions.title')}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t('tax_wizard.deductions.description')}
        </Text>
      </View>

      <View style={styles.list}>
        {DEDUCTION_ITEMS.map(({ key, labelKey, hintKey }) => {
          const isYes = !!ded[key];
          return (
            <View key={key} style={styles.item}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>{t(`tax_wizard.deductions.${labelKey}`)}</Text>
                <Switch
                  value={isYes}
                  onValueChange={() => toggle(key)}
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                />
              </View>
              {isYes && (
                <View style={styles.detail}>
                  <Text style={styles.hint}>{t(`tax_wizard.deductions.${hintKey}`)}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('tax_wizard.deductions.note_placeholder')}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('tax_wizard.deductions.footer')}
        </Text>
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  list: { gap: s[2] },
  item: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#FFF',
    padding: s[4],
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '500', color: '#334155', flex: 1 },
  detail: { marginTop: s[3], paddingTop: s[3], borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  hint: { fontSize: 13, color: '#64748B', marginBottom: s[2] },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    paddingHorizontal: s[3],
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  footer: { padding: s[4], backgroundColor: '#EFF6FF', borderRadius: 0, borderWidth: 1, borderColor: '#BFDBFE' },
  footerText: { fontSize: 14, color: '#1E40AF', lineHeight: 22 },
});
