import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { H3, Text, spacing, Spacer, Stack } from '@trusttax/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaxIntakeData, OtherIncomeFlags } from '../../../../types/taxIntake';

const s = spacing;

const OTHER_INCOME_ITEMS: { key: keyof OtherIncomeFlags; labelKey: string; hintKey: string }[] = [
  { key: 'has1099NEC', labelKey: 'has_1099nec', hintKey: 'has_1099nec_hint' },
  { key: 'has1099K', labelKey: 'has_1099k', hintKey: 'has_1099k_hint' },
  { key: 'has1099G', labelKey: 'has_1099g', hintKey: 'has_1099g_hint' },
  { key: 'has1099INTorDIV', labelKey: 'has_1099int', hintKey: 'has_1099int_hint' },
  { key: 'has1099R', labelKey: 'has_1099r', hintKey: 'has_1099r_hint' },
  { key: 'hasSSA1099', labelKey: 'has_ssa1099', hintKey: 'has_ssa1099_hint' },
  { key: 'hasCrypto', labelKey: 'has_crypto', hintKey: 'has_crypto_hint' },
  { key: 'hasW2G', labelKey: 'has_w2g', hintKey: 'has_w2g_hint' },
  { key: 'has1099B', labelKey: 'has_1099b', hintKey: 'has_1099b_hint' },
  { key: 'hasRental', labelKey: 'has_rental', hintKey: 'has_rental_hint' },
];

interface TaxOtherIncomeStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
}

export function TaxOtherIncomeStep({ data, onChange }: TaxOtherIncomeStepProps) {
  const { t } = useTranslation();
  const other = data.otherIncome ?? {};

  const toggle = (key: keyof OtherIncomeFlags) => {
    const next = { ...other, [key]: !other[key] };
    onChange({ otherIncome: next });
  };

  const count = Object.values(other).filter(Boolean).length;

  return (
    <Stack gap="xl">
      <View>
        <H3>{t('tax_wizard.other_income.title')}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t('tax_wizard.other_income.description')}
        </Text>
      </View>

      <View style={styles.checklist}>
        {OTHER_INCOME_ITEMS.map(({ key, labelKey, hintKey }) => {
          const isYes = !!other[key];
          return (
            <View key={key} style={styles.item}>
              <TouchableOpacity
                style={[styles.toggleRow, isYes && styles.toggleRowActive]}
                onPress={() => toggle(key)}
              >
                <View style={[styles.checkbox, isYes && styles.checkboxChecked]} />
                <Text style={[styles.itemLabel, isYes && styles.itemLabelActive]}>{t(`tax_wizard.other_income.${labelKey}`)}</Text>
                {isYes ? (
                  <ChevronUp size={18} color="#2563EB" />
                ) : (
                  <ChevronDown size={18} color="#94A3B8" />
                )}
              </TouchableOpacity>
              {isYes && (
                <View style={styles.detail}>
                  <Text style={styles.hint}>{t(`tax_wizard.other_income.${hintKey}`)}</Text>
                  <TextInput
                    style={styles.noteInput}
                    placeholder={t('tax_wizard.other_income.note_placeholder')}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {t('tax_wizard.other_income.summary', { count })}
        </Text>
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  checklist: { gap: s[2] },
  item: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s[3],
    padding: s[4],
  },
  toggleRowActive: { backgroundColor: '#EFF6FF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 0,
  },
  checkboxChecked: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  itemLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#334155' },
  itemLabelActive: { color: '#0F172A', fontWeight: '600' },
  detail: { padding: s[4], paddingTop: s[2], backgroundColor: '#F8FAFC' },
  hint: { fontSize: 13, color: '#64748B', marginBottom: s[2] },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    padding: s[3],
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFF',
    minHeight: 40,
  },
  summary: { padding: s[4], backgroundColor: '#F0FDF4', borderRadius: 0, borderWidth: 1, borderColor: '#BBF7D0' },
  summaryText: { fontSize: 14, color: '#166534', lineHeight: 22 },
});
