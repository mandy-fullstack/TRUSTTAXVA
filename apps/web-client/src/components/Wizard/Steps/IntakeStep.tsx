import { View, StyleSheet, TextInput, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H3, Text, spacing, Spacer, Stack } from '@trusttax/ui';
import type { ServiceStep, FormField as FormFieldType, ShowWhenRule } from '../../../types';

type I18n = { en?: string; es?: string } | undefined;
const localeKey = (l: string) => (l.startsWith('es') ? 'es' : 'en');

function resolveLabel(f: FormFieldType, locale: string): string {
  const k = localeKey(locale);
  const li = (f as any).labelI18n as I18n;
  return (li?.[k as 'en' | 'es'] ?? f.label ?? '') || '';
}
function resolvePlaceholder(f: FormFieldType, locale: string): string {
  const k = localeKey(locale);
  const pi = (f as any).placeholderI18n as I18n;
  return (pi?.[k as 'en' | 'es'] ?? f.placeholder ?? '') || '';
}
function resolveSectionTitle(sec: any, locale: string): string {
  const k = localeKey(locale);
  const ti = sec?.titleI18n as I18n;
  return (ti?.[k as 'en' | 'es'] ?? sec?.title ?? '') || '';
}
function resolveOptionLabel(o: { value: string; label: string; labelI18n?: I18n }, locale: string): string {
  const k = localeKey(locale);
  const li = o?.labelI18n;
  return (li?.[k as 'en' | 'es'] ?? o?.label ?? o?.value ?? '') || '';
}

interface IntakeStepProps {
  step: ServiceStep;
  data: any;
  onChange: (data: any) => void;
}

function isFieldVisible(field: FormFieldType, formData: Record<string, any>): boolean {
  const r = field.rules?.showWhen as ShowWhenRule | undefined;
  if (!r?.field) return true;
  const v = formData[r.field];
  const expected = r.value;
  if (typeof expected === 'boolean') return !!v === expected;
  if (typeof expected === 'number') return Number(v) === expected;
  return String(v ?? '') === String(expected);
}

export function IntakeStep({ step, data, onChange }: IntakeStepProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language || 'en';
  const handleChange = (name: string, value: any) => {
    onChange({ ...data, [name]: value });
  };

  const form = step.form;
  const formConfig = step.formConfig;
  const useForm = form && (form.sections?.length > 0 || (form.fields?.length ?? 0) > 0);

  if (useForm) {
    const sections = form!.sections ?? [];
    const formLevelFields = (form!.fields ?? []).filter((f) => isFieldVisible(f, data));

    return (
      <Stack gap="xl">
        <View>
          <H3>{step.title}</H3>
          {step.description ? (
            <>
              <Spacer size="sm" />
              <Text style={styles.desc}>{step.description}</Text>
            </>
          ) : null}
        </View>
        {formLevelFields.length > 0 && (
          <View style={styles.section}>
            <Stack gap="lg">
              {formLevelFields
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((f) => (
                  <FormField key={f.id} field={f} value={data[f.name]} onChange={(v) => handleChange(f.name, v)} locale={locale} />
                ))}
            </Stack>
          </View>
        )}
        {sections
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((sec) => {
            const visibleFields = (sec.fields ?? [])
              .slice()
              .sort((a, b) => a.order - b.order)
              .filter((f) => isFieldVisible(f, data));
            if (visibleFields.length === 0) return null;
            const secTitle = resolveSectionTitle(sec, locale) || sec.title;
            return (
              <View key={sec.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{secTitle}</Text>
                <Spacer size="md" />
                <Stack gap="lg">
                  {visibleFields.map((f) => (
                    <FormField key={f.id} field={f} value={data[f.name]} onChange={(v) => handleChange(f.name, v)} locale={locale} />
                  ))}
                </Stack>
              </View>
            );
          })}
      </Stack>
    );
  }

  if (formConfig && formConfig.length > 0) {
    return (
      <Stack gap="xl">
        <View>
          <H3>{step.title}</H3>
          <Spacer size="sm" />
          <Text style={styles.desc}>{step.description}</Text>
        </View>
        <View style={styles.form}>
          {formConfig.map((field) => (
            <View key={field.name} style={styles.field}>
              <Text style={styles.label}>
                {field.label} {field.required && <Text style={{ color: '#EF4444' }}>*</Text>}
              </Text>
              {field.type === 'boolean' || field.type === 'checkbox' ? (
                <View style={styles.switchRow}>
                  <Text style={{ color: '#0F172A' }}>{field.label}?</Text>
                  <Switch
                    value={!!data[field.name]}
                    onValueChange={(v) => handleChange(field.name, v)}
                    trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                  />
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94A3B8"
                  value={data[field.name] || ''}
                  onChangeText={(t) => handleChange(field.name, t)}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                />
              )}
            </View>
          ))}
        </View>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <View>
        <H3>{step.title}</H3>
        <Spacer size="sm" />
        <Text style={styles.desc}>{step.description || 'Please provide details for this step.'}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="Enter any relevant information..."
          placeholderTextColor="#94A3B8"
          value={data.notes || ''}
          onChangeText={(t) => handleChange('notes', t)}
        />
      </View>
    </Stack>
  );
}

function FormField({ field, value, onChange, locale = 'en' }: { field: FormFieldType; value: any; onChange: (v: any) => void; locale?: string }) {
  const opts = field.options as Array<{ value: string; label: string; labelI18n?: I18n }> | undefined;
  const required = field.required ?? false;
  const labelStr = resolveLabel(field, locale) || field.label;
  const placeholderStr = resolvePlaceholder(field, locale) || field.placeholder;

  const label = (
    <Text style={styles.label}>
      {labelStr} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
    </Text>
  );

  switch (field.type) {
    case 'checkbox':
      return (
        <View style={styles.field}>
          {label}
          <View style={styles.switchRow}>
            <Text style={{ color: '#0F172A' }}>{labelStr}</Text>
            <Switch
              value={!!value}
              onValueChange={onChange}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
            />
          </View>
        </View>
      );

    case 'textarea':
      return (
        <View style={styles.field}>
          {label}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={placeholderStr ?? ''}
            placeholderTextColor="#94A3B8"
            value={value ?? ''}
            onChangeText={(t) => onChange(t)}
            multiline
            numberOfLines={4}
          />
        </View>
      );

    case 'number':
      return (
        <View style={styles.field}>
          {label}
          <TextInput
            style={styles.input}
            placeholder={placeholderStr ?? ''}
            placeholderTextColor="#94A3B8"
            value={value != null ? String(value) : ''}
            onChangeText={(t) => onChange(t === '' ? undefined : Number(t))}
            keyboardType="numeric"
          />
        </View>
      );

    case 'phone':
    case 'email':
      return (
        <View style={styles.field}>
          {label}
          <TextInput
            style={styles.input}
            placeholder={placeholderStr ?? ''}
            placeholderTextColor="#94A3B8"
            value={value ?? ''}
            onChangeText={onChange}
            keyboardType={field.type === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
          />
        </View>
      );

    case 'date':
      return (
        <View style={styles.field}>
          {label}
          <TextInput
            style={styles.input}
            placeholder={placeholderStr ?? 'YYYY-MM-DD'}
            placeholderTextColor="#94A3B8"
            value={value ?? ''}
            onChangeText={onChange}
          />
        </View>
      );

    case 'select':
      return (
        <View style={styles.field}>
          {label}
          <View style={styles.selectWrap}>
            <select
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value || undefined)}
              style={styles.select as any}
              aria-label={labelStr}
            >
              <option value="">— Select —</option>
              {(opts ?? []).map((o) => (
                <option key={o.value} value={o.value}>{resolveOptionLabel(o, locale) || o.label || o.value}</option>
              ))}
            </select>
          </View>
        </View>
      );

    case 'ssn':
      return (
        <View style={styles.field}>
          {label}
          <TextInput
            style={styles.input}
            placeholder={placeholderStr ?? 'XXX-XX-XXXX'}
            placeholderTextColor="#94A3B8"
            value={value ?? ''}
            onChangeText={onChange}
            keyboardType="numeric"
          />
        </View>
      );

    case 'file_upload':
    case 'image_upload':
    case 'signature':
      return (
        <View style={styles.field}>
          {label}
          <Text style={styles.unsupported}>Upload / signature not yet supported for this field.</Text>
        </View>
      );

    default:
      return (
        <View style={styles.field}>
          {label}
          <TextInput
            style={styles.input}
            placeholder={placeholderStr ?? ''}
            placeholderTextColor="#94A3B8"
            value={value ?? ''}
            onChangeText={onChange}
            keyboardType="default"
          />
        </View>
      );
  }
}

const s = spacing;
const styles = StyleSheet.create({
  desc: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  form: { gap: s[5] },
  section: { marginBottom: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  field: { gap: s[2] },
  label: { fontSize: 14, fontWeight: '600', color: '#334155' },
  input: {
    height: 48,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    paddingHorizontal: s[4],
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#FFF',
  },
  textArea: { height: 120, paddingTop: s[3], textAlignVertical: 'top', fontSize: 16, borderRadius: 0 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    backgroundColor: '#F8FAFC',
  },
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
  unsupported: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic' },
});
