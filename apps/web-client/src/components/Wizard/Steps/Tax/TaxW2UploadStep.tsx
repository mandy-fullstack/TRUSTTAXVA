import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { H3, Text, Button, spacing, Spacer, Stack } from '@trusttax/ui';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaxIntakeData, W2Upload } from '../../../../types/taxIntake';

const s = spacing;

interface TaxW2UploadStepProps {
  data: TaxIntakeData;
  onChange: (data: Partial<TaxIntakeData>) => void;
}

function mockW2Upload(): W2Upload {
  return {
    id: `w2_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fileName: `W-2_${new Date().getFullYear()}.pdf`,
    status: 'uploaded',
    detected: {
      employerName: 'Sample Employer Inc.',
      wages: 52000,
      federalWithholding: 4200,
      taxpayerName: 'Taxpayer Name',
      taxpayerSsnMasked: 'XXX-XX-1234',
      address: '123 Main St, City, ST 12345',
    },
  };
}

export function TaxW2UploadStep({ data, onChange }: TaxW2UploadStepProps) {
  const { t } = useTranslation();
  const uploads = data.w2Uploads ?? [];
  const hasMore = data.hasMoreThanOneW2;

  const handleAdd = () => {
    const next = [...uploads, mockW2Upload()];
    onChange({ w2Uploads: next, hasMoreThanOneW2: next.length > 1 });
  };

  const handleRemove = (id: string) => {
    const next = uploads.filter((u) => u.id !== id);
    onChange({ w2Uploads: next, hasMoreThanOneW2: next.length > 1 });
  };

  const handleToggleMore = (v: boolean) => {
    onChange({ hasMoreThanOneW2: v });
  };

  return (
    <Stack gap="xl">
      <View>
        <H3>{t('tax_wizard.w2_upload.title')}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>
          {t('tax_wizard.w2_upload.description')}
        </Text>
      </View>

      <View style={styles.list}>
        {uploads.map((w) => (
          <View key={w.id} style={styles.docItem}>
            <View style={styles.docInfo}>
              <View style={[styles.iconBox, w.status === 'uploaded' ? styles.iconBoxSuccess : styles.iconBoxPending]}>
                {w.status === 'uploaded' ? (
                  <CheckCircle size={20} color="#10B981" />
                ) : (
                  <FileText size={20} color="#64748B" />
                )}
              </View>
              <View>
                <Text style={styles.docTitle}>{w.fileName}</Text>
                <Text style={styles.docStatus}>
                  {w.status === 'uploaded' ? t('tax_wizard.w2_upload.uploaded') : t('tax_wizard.w2_upload.pending')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleRemove(w.id)} style={styles.removeBtn}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title={uploads.length === 0 ? t('tax_wizard.w2_upload.upload_button') : t('tax_wizard.w2_upload.add_another')}
          variant="outline"
          onPress={handleAdd}
          icon={<Upload size={14} color="#2563EB" />}
          style={styles.uploadBtn}
        />
      </View>

      {uploads.length > 0 && (
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('tax_wizard.w2_upload.has_more')}</Text>
          <Switch
            value={hasMore}
            onValueChange={handleToggleMore}
            trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
          />
        </View>
      )}

      {uploads.length === 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            {t('tax_wizard.w2_upload.hint')}
          </Text>
        </View>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  list: { gap: s[3] },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: s[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#FFF',
  },
  docInfo: { flexDirection: 'row', alignItems: 'center', gap: s[3] },
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
  docTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  docStatus: { fontSize: 13, color: '#64748B', marginTop: 2 },
  removeBtn: { padding: s[2] },
  actions: {},
  uploadBtn: { alignSelf: 'flex-start' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: s[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#F8FAFC',
  },
  switchLabel: { fontSize: 15, color: '#334155', fontWeight: '500' },
  hint: { padding: s[4], backgroundColor: '#EFF6FF', borderRadius: 0, borderWidth: 1, borderColor: '#BFDBFE' },
  hintText: { fontSize: 14, color: '#1E40AF', lineHeight: 22 },
});
