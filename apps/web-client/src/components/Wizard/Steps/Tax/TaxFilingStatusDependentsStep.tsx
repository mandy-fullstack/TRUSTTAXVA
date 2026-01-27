import { View, StyleSheet, TouchableOpacity, TextInput, Switch } from 'react-native';
import { H3, Text, spacing, Spacer, Stack } from '@trusttax/ui';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaxIntakeData, Dependent, FilingStatus } from '../../../../types/taxIntake';
import { DEPENDENT_RELATIONSHIPS } from '../../../../types/taxIntake';

const s = spacing;

const TAX_YEARS = [2025, 2024, 2023] as const;

interface TaxFilingStatusDependentsStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
}

function emptyDependent(): Dependent {
  return {
    id: `dep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    legalName: '',
    dateOfBirth: '',
    relationship: '',
    ssnOrItin: '',
    monthsLivedWithYou: 0,
    fullTimeStudent: false,
    permanentDisability: false,
    someoneElseCanClaim: 'unknown',
    childcare: false,
    noSsnYet: false,
  };
}

export function TaxFilingStatusDependentsStep({ data, onChange }: TaxFilingStatusDependentsStepProps) {
  const { t } = useTranslation();
  const taxYear = data.taxYear ?? new Date().getFullYear();
  const filingStatus = data.filingStatus ?? '';
  const filingWithSpouse = data.filingWithSpouse ?? '';
  const paidOver50 = data.paidOver50PercentHousehold ?? false;
  const hasQualifyingDep = data.hasQualifyingDependent ?? false;
  const claimableAsDep = data.claimableAsDependent ?? '';
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

  const showSpouse = filingStatus === 'Married Filing Jointly' || filingStatus === 'Married Filing Separately';
  const showHoH = filingStatus === 'Head of Household';

  const FILING_STATUSES: { value: FilingStatus; labelKey: string }[] = [
    { value: 'Single', labelKey: 'filing_status_single' },
    { value: 'Married Filing Jointly', labelKey: 'filing_status_mfj' },
    { value: 'Married Filing Separately', labelKey: 'filing_status_mfs' },
    { value: 'Head of Household', labelKey: 'filing_status_hoh' },
    { value: 'Qualifying Surviving Spouse', labelKey: 'filing_status_qss' },
  ];

  const getRelationshipLabel = (value: string) => {
    const rel = DEPENDENT_RELATIONSHIPS.find((r) => r.value === value);
    if (!rel) return value;
    const keyMap: Record<string, string> = {
      child: 'relationship_child',
      stepchild: 'relationship_stepchild',
      grandchild: 'relationship_grandchild',
      sibling: 'relationship_sibling',
      parent: 'relationship_parent',
      niece_nephew: 'relationship_niece_nephew',
      other: 'relationship_other',
    };
    return t(`tax_wizard.filing_status.${keyMap[value] || value}`);
  };

  return (
    <Stack gap="xl">
      <View>
        <H3>{t('tax_wizard.filing_status.title')}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t('tax_wizard.filing_status.description')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('tax_wizard.filing_status.tax_year')}</Text>
        <View style={styles.selectWrap}>
          <select
            value={taxYear}
            onChange={(e) => set({ taxYear: Number(e.target.value) })}
            style={styles.select as any}
          >
            {TAX_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('tax_wizard.filing_status.filing_status')}</Text>
        <Spacer size="sm" />
        <View style={styles.options}>
          {FILING_STATUSES.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, filingStatus === opt.value && styles.optionActive]}
              onPress={() => set({ filingStatus: opt.value as FilingStatus, filingWithSpouse: '' })}
            >
              <Text style={[styles.optionText, filingStatus === opt.value && styles.optionTextActive]}>
                {t(`tax_wizard.filing_status.${opt.labelKey}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showSpouse && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tax_wizard.filing_status.filing_with_spouse')}</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, filingWithSpouse === 'yes' && styles.toggleBtnActive]}
              onPress={() => set({ filingWithSpouse: 'yes' })}
            >
              <Text style={[styles.toggleText, filingWithSpouse === 'yes' && styles.toggleTextActive]}>{t('tax_wizard.filing_status.filing_with_spouse_yes')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, filingWithSpouse === 'no' && styles.toggleBtnActive]}
              onPress={() => set({ filingWithSpouse: 'no' })}
            >
              <Text style={[styles.toggleText, filingWithSpouse === 'no' && styles.toggleTextActive]}>{t('tax_wizard.filing_status.filing_with_spouse_no')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showHoH && (
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('tax_wizard.filing_status.paid_over_50')}</Text>
            <Switch
              value={paidOver50}
              onValueChange={(v) => set({ paidOver50PercentHousehold: v })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('tax_wizard.filing_status.has_qualifying_dep')}</Text>
            <Switch
              value={hasQualifyingDep}
              onValueChange={(v) => set({ hasQualifyingDependent: v })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
            />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('tax_wizard.filing_status.claimable_as_dependent')}</Text>
        <View style={styles.toggleRow}>
          {(['yes', 'no', ''] as const).map((v) => (
            <TouchableOpacity
              key={v || 'unknown'}
              style={[styles.toggleBtn, claimableAsDep === v && styles.toggleBtnActive]}
              onPress={() => set({ claimableAsDependent: v || '' })}
            >
              <Text style={[styles.toggleText, claimableAsDep === v && styles.toggleTextActive]}>
                {v === 'yes' ? t('tax_wizard.filing_status.claimable_yes') : v === 'no' ? t('tax_wizard.filing_status.claimable_no') : t('tax_wizard.filing_status.claimable_unknown')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('tax_wizard.filing_status.dependents')}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={addDependent}>
            <Plus size={18} color="#2563EB" />
            <Text style={styles.addBtnText}>{t('tax_wizard.filing_status.add_dependent')}</Text>
          </TouchableOpacity>
        </View>
        <Spacer size="sm" />
        <Text style={styles.hint}>
          {t('tax_wizard.filing_status.dependent_hint')}
        </Text>
        <Spacer size="md" />

        {dependents.map((d, idx) => (
          <View key={d.id} style={styles.depCard}>
            <View style={styles.depHeader}>
              <Text style={styles.depTitle}>{t('tax_wizard.filing_status.dependent_number', { number: idx + 1 })}</Text>
              <TouchableOpacity onPress={() => removeDependent(d.id)}>
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <Stack gap="md">
              <View>
                <Text style={styles.label}>{t('tax_wizard.filing_status.dependent_legal_name')}</Text>
                <TextInput
                  style={styles.input}
                  value={d.legalName}
                  onChangeText={(t) => updateDependent(d.id, { legalName: t })}
                  placeholder={t('tax_wizard.filing_status.dependent_legal_name_placeholder', { defaultValue: 'Full name' })}
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('tax_wizard.filing_status.dependent_dob')}</Text>
                  <TextInput
                    style={styles.input}
                    value={d.dateOfBirth}
                    onChangeText={(t) => updateDependent(d.id, { dateOfBirth: t })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('tax_wizard.filing_status.dependent_relationship')}</Text>
                  <View style={styles.selectWrap}>
                    <select
                      value={d.relationship}
                      onChange={(e) => updateDependent(d.id, { relationship: e.target.value })}
                      style={styles.select as any}
                    >
                      <option value="">{t('tax_wizard.filing_status.select_relationship')}</option>
                      {DEPENDENT_RELATIONSHIPS.map((r) => (
                        <option key={r.value} value={r.value}>{getRelationshipLabel(r.value)}</option>
                      ))}
                    </select>
                  </View>
                </View>
              </View>
              <View>
                <Text style={styles.label}>{t('tax_wizard.filing_status.dependent_ssn')}</Text>
                <TextInput
                  style={styles.input}
                  value={d.ssnOrItin}
                  onChangeText={(t) => updateDependent(d.id, { ssnOrItin: t })}
                  placeholder="XXX-XX-XXXX"
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => updateDependent(d.id, { noSsnYet: !d.noSsnYet })}
                >
                  <View style={[styles.checkbox, d.noSsnYet && styles.checkboxChecked]} />
                  <Text style={styles.checkLabel}>{t('tax_wizard.filing_status.dependent_no_ssn')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('tax_wizard.filing_status.dependent_months')}</Text>
                  <TextInput
                    style={styles.input}
                    value={d.monthsLivedWithYou ? String(d.monthsLivedWithYou) : ''}
                    onChangeText={(t) => updateDependent(d.id, { monthsLivedWithYou: Math.min(12, Math.max(0, parseInt(t, 10) || 0)) })}
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('tax_wizard.filing_status.dependent_student')}</Text>
                <Switch
                  value={d.fullTimeStudent}
                  onValueChange={(v) => updateDependent(d.id, { fullTimeStudent: v })}
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('tax_wizard.filing_status.dependent_disability')}</Text>
                <Switch
                  value={d.permanentDisability}
                  onValueChange={(v) => updateDependent(d.id, { permanentDisability: v })}
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('tax_wizard.filing_status.dependent_claimable')}</Text>
                <View style={styles.toggleRow}>
                  {(['yes', 'no', 'unknown'] as const).map((v) => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.toggleBtnSmall, d.someoneElseCanClaim === v && styles.toggleBtnActive]}
                      onPress={() => updateDependent(d.id, { someoneElseCanClaim: v })}
                    >
                      <Text style={[styles.toggleText, d.someoneElseCanClaim === v && styles.toggleTextActive]}>
                        {v === 'yes' ? t('tax_wizard.filing_status.dependent_claimable_yes') : v === 'no' ? t('tax_wizard.filing_status.dependent_claimable_no') : t('tax_wizard.filing_status.dependent_claimable_unknown')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('tax_wizard.filing_status.dependent_childcare')}</Text>
                <Switch
                  value={d.childcare}
                  onValueChange={(v) => updateDependent(d.id, { childcare: v })}
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                />
              </View>
              {d.childcare && (
                <Stack gap="sm">
                  <View>
                    <Text style={styles.label}>{t('tax_wizard.filing_status.childcare_provider')}</Text>
                    <TextInput
                      style={styles.input}
                      value={d.childcareProvider ?? ''}
                      onChangeText={(t) => updateDependent(d.id, { childcareProvider: t })}
                      placeholder={t('tax_wizard.filing_status.childcare_provider_placeholder')}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={styles.row2}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>{t('tax_wizard.filing_status.childcare_ein')}</Text>
                      <TextInput
                        style={styles.input}
                        value={d.childcareEin ?? ''}
                        onChangeText={(t) => updateDependent(d.id, { childcareEin: t })}
                        placeholder={t('tax_wizard.filing_status.childcare_ein_placeholder')}
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>{t('tax_wizard.filing_status.childcare_amount')}</Text>
                      <TextInput
                        style={styles.input}
                        value={d.childcareAmount != null ? String(d.childcareAmount) : ''}
                        onChangeText={(t) => updateDependent(d.id, { childcareAmount: t ? parseFloat(t) : undefined })}
                        placeholder={t('tax_wizard.filing_status.childcare_amount_placeholder')}
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
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: s[2] },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: s[2] },
  hint: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  selectWrap: { width: '100%' },
  select: {
    width: '100%',
    padding: s[3],
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#FFF',
    color: '#0F172A',
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: s[2] },
  option: {
    paddingVertical: s[2],
    paddingHorizontal: s[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#FFF',
  },
  optionActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  optionText: { fontSize: 14, fontWeight: '500', color: '#334155' },
  optionTextActive: { color: '#FFF' },
  toggleRow: { flexDirection: 'row', gap: s[2], flexWrap: 'wrap' },
  toggleBtn: {
    paddingVertical: s[2],
    paddingHorizontal: s[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#FFF',
  },
  toggleBtnSmall: { paddingVertical: s[1], paddingHorizontal: s[3] },
  toggleBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  toggleText: { fontSize: 14, fontWeight: '500', color: '#334155' },
  toggleTextActive: { color: '#FFF' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: s[2] },
  switchLabel: { fontSize: 14, color: '#334155', flex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: s[2] },
  addBtnText: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  depCard: {
    padding: s[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#F8FAFC',
    marginBottom: s[4],
  },
  depHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s[3] },
  depTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: s[1] },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    paddingHorizontal: s[3],
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#FFF',
  },
  textArea: { height: 80, paddingTop: s[3], textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: s[3] },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: s[2], marginTop: s[2] },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 0 },
  checkboxChecked: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  checkLabel: { fontSize: 13, color: '#64748B' },
});
