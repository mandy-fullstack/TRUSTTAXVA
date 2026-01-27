import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { H3, Text, spacing, Spacer, Stack } from '@trusttax/ui';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaxIntakeData, W2Detected } from '../../../../types/taxIntake';

const s = spacing;

interface TaxW2ConfirmStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
}

function DetectedRow({ label, value }: { label: string; value?: string | number }) {
  if (value == null || value === '') return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );
}

export function TaxW2ConfirmStep({ data, onChange }: TaxW2ConfirmStepProps) {
  const { t } = useTranslation();
  const uploads = data.w2Uploads ?? [];
  const first = uploads[0];
  const detected: W2Detected | undefined = first?.detected;
  const confirmCorrect = data.w2ConfirmCorrect;
  const note = data.w2CorrectionNote ?? '';

  const setCorrect = (v: boolean) => {
    onChange({ w2ConfirmCorrect: v, w2CorrectionNote: v ? undefined : note || undefined });
  };

  const setNote = (text: string) => {
    onChange({ w2CorrectionNote: text });
  };

  if (uploads.length === 0) {
    return (
      <Stack gap="xl">
        <H3>{t('tax_wizard.w2_confirm.title')}</H3>
        <Text style={styles.desc}>{t('tax_wizard.w2_confirm.complete_first')}</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <View>
        <H3>{t('tax_wizard.w2_confirm.title')}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t('tax_wizard.w2_confirm.description')}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.cardTitle}>{t('tax_wizard.w2_confirm.detected_from')}</Text>
        </View>
        <Spacer size="md" />
        {detected ? (
          <View style={styles.rows}>
            <DetectedRow label={t('tax_wizard.w2_confirm.taxpayer_name')} value={detected.taxpayerName} />
            <DetectedRow label={t('tax_wizard.w2_confirm.taxpayer_ssn')} value={detected.taxpayerSsnMasked} />
            <DetectedRow label={t('tax_wizard.w2_confirm.address')} value={detected.address} />
            <DetectedRow label={t('tax_wizard.w2_confirm.employer_name')} value={detected.employerName} />
            <DetectedRow label={t('tax_wizard.w2_confirm.wages')} value={detected.wages != null ? `$${detected.wages.toLocaleString()}` : undefined} />
            <DetectedRow
              label={t('tax_wizard.w2_confirm.federal_withholding')}
              value={detected.federalWithholding != null ? `$${detected.federalWithholding.toLocaleString()}` : undefined}
            />
            {detected.stateWages != null && (
              <DetectedRow label={t('tax_wizard.w2_confirm.state_wages')} value={`$${detected.stateWages.toLocaleString()}`} />
            )}
            {detected.stateWithholding != null && (
              <DetectedRow label={t('tax_wizard.w2_confirm.state_withholding')} value={`$${detected.stateWithholding.toLocaleString()}`} />
            )}
          </View>
        ) : (
          <Text style={styles.muted}>{t('tax_wizard.w2_confirm.no_data')}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <Text style={styles.actionLabel}>{t('tax_wizard.w2_confirm.is_correct')}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, confirmCorrect === true && styles.btnSuccess]}
            onPress={() => setCorrect(true)}
          >
            <CheckCircle size={18} color={confirmCorrect === true ? '#FFF' : '#10B981'} />
            <Text style={[styles.btnText, confirmCorrect === true && styles.btnTextActive]}>{t('tax_wizard.w2_confirm.correct')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnOutline, confirmCorrect === false && styles.btnWarning]}
            onPress={() => setCorrect(false)}
          >
            <AlertCircle size={18} color={confirmCorrect === false ? '#FFF' : '#F59E0B'} />
            <Text style={[styles.btnText, confirmCorrect === false && styles.btnTextActive]}>{t('tax_wizard.w2_confirm.needs_correction')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {confirmCorrect === false && (
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>{t('tax_wizard.w2_confirm.correction_note')}</Text>
          <Spacer size="sm" />
          <TextInput
            style={styles.noteInput}
            placeholder={t('tax_wizard.w2_confirm.correction_placeholder')}
            placeholderTextColor="#94A3B8"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.noteHint}>
            {t('tax_wizard.w2_confirm.correction_hint')}
          </Text>
        </View>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  card: {
    padding: s[5],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#F8FAFC',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: s[2] },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  rows: { gap: s[2] },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: s[2], borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  label: { fontSize: 14, color: '#64748B' },
  value: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  muted: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic' },
  actions: {},
  actionLabel: { fontSize: 15, fontWeight: '600', color: '#334155', marginBottom: s[3] },
  buttonRow: { flexDirection: 'row', gap: s[3], flexWrap: 'wrap' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s[2],
    paddingVertical: s[3],
    paddingHorizontal: s[4],
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  btnOutline: { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' },
  btnSuccess: { backgroundColor: '#10B981', borderColor: '#10B981' },
  btnWarning: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  btnText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  btnTextActive: { color: '#FFF' },
  noteSection: {},
  noteLabel: { fontSize: 14, fontWeight: '600', color: '#334155' },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    padding: s[4],
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FFF',
    minHeight: 88,
    textAlignVertical: 'top',
  },
  noteHint: { fontSize: 13, color: '#64748B', marginTop: s[2], lineHeight: 20 },
});
