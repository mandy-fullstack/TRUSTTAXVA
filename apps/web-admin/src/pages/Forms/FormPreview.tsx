import { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput, Switch, ScrollView } from 'react-native';
import { H4, Text, spacing, Spacer, Stack } from '@trusttax/ui';
import { formBuilder } from '../../styles/formBuilder';

type ShowWhenRule = { field: string; value: boolean | string | number };
type FormFieldType = {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string | null;
  helpText?: string | null;
  required?: boolean;
  order: number;
  rules?: { showWhen?: ShowWhenRule } | null;
  options?: Array<{ value: string; label: string }> | null;
};

function isFieldVisible(field: FormFieldType, formData: Record<string, any>): boolean {
  const r = field.rules?.showWhen;
  if (!r?.field) return true;
  const v = formData[r.field];
  const expected = r.value;
  if (typeof expected === 'boolean') return !!v === expected;
  if (typeof expected === 'number') return Number(v) === expected;
  return String(v ?? '') === String(expected);
}

type I18n = { en?: string; es?: string } | undefined;
const localeKey = (l: string) => (l.startsWith('es') ? 'es' : 'en');

function resolveFormName(form: any, locale: string): string {
  const k = localeKey(locale);
  const ni = form?.nameI18n as I18n;
  return (ni?.[k as 'en' | 'es'] ?? form?.name ?? '') || '';
}

function resolveFormDesc(form: any, locale: string): string {
  const k = localeKey(locale);
  const di = form?.descriptionI18n as I18n;
  return (di?.[k as 'en' | 'es'] ?? form?.description ?? '') || '';
}

function resolveSectionTitle(sec: any, locale: string): string {
  const k = localeKey(locale);
  const ti = sec?.titleI18n as I18n;
  return (ti?.[k as 'en' | 'es'] ?? sec?.title ?? '') || '';
}

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

function resolveOptionLabel(o: { value: string; label: string; labelI18n?: I18n }, locale: string): string {
  const k = localeKey(locale);
  const li = o?.labelI18n;
  return (li?.[k as 'en' | 'es'] ?? o?.label ?? o?.value ?? '') || '';
}

export function FormPreview({
  form,
  locale = 'en',
}: {
  form: any;
  locale?: 'en' | 'es';
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = useCallback((name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const sections = form?.sections ?? [];
  const formLevelFields = (form?.fields ?? [])
    .slice()
    .sort((a: any, b: any) => a.order - b.order)
    .filter((f: FormFieldType) => isFieldVisible(f, formData));

  const renderField = (f: FormFieldType) => {
    const label = resolveLabel(f, locale);
    const placeholder = resolvePlaceholder(f, locale);
    const required = f.required ?? false;
    const labelEl = (
      <>
        <Text style={[formBuilder.label, local.labelOverride]}>
          {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
        </Text>
        <Spacer size="xs" />
      </>
    );
    const opts = (f.options ?? []) as Array<{ value: string; label: string; labelI18n?: I18n }>;
    const value = formData[f.name];

    switch (f.type) {
      case 'checkbox':
        return (
          <View key={f.id} style={local.field}>
            {labelEl}
            <View style={local.switchRow}>
              <Text style={local.switchLabel}>{label}</Text>
              <Switch
                value={!!value}
                onValueChange={(v) => handleChange(f.name, v)}
                trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              />
            </View>
          </View>
        );
      case 'textarea':
        return (
          <View key={f.id} style={local.field}>
            {labelEl}
            <TextInput
              style={[formBuilder.input, formBuilder.inputMultiline]}
              placeholder={placeholder}
              placeholderTextColor="#94A3B8"
              value={value ?? ''}
              onChangeText={(t) => handleChange(f.name, t)}
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 'number':
        return (
          <View key={f.id} style={local.field}>
            {labelEl}
            <TextInput
              style={formBuilder.input}
              placeholder={placeholder}
              placeholderTextColor="#94A3B8"
              value={value != null ? String(value) : ''}
              onChangeText={(t) => handleChange(f.name, t === '' ? undefined : Number(t))}
              keyboardType="numeric"
            />
          </View>
        );
      case 'phone':
      case 'email':
        return (
          <View key={f.id} style={local.field}>
            {labelEl}
            <TextInput
              style={formBuilder.input}
              placeholder={placeholder}
              placeholderTextColor="#94A3B8"
              value={value ?? ''}
              onChangeText={(t) => handleChange(f.name, t)}
              keyboardType={f.type === 'email' ? 'email-address' : 'phone-pad'}
            />
          </View>
        );
      case 'date':
        return (
          <View key={f.id} style={local.field}>
            {labelEl}
            <TextInput
              style={formBuilder.input}
              placeholder={placeholder || 'YYYY-MM-DD'}
              placeholderTextColor="#94A3B8"
              value={value ?? ''}
              onChangeText={(t) => handleChange(f.name, t)}
            />
          </View>
        );
      case 'select':
        return (
          <View key={f.id} style={local.field}>
            {labelEl}
            <View style={local.selectWrap}>
              <select
                value={value ?? ''}
                onChange={(e) => handleChange(f.name, e.target.value || undefined)}
                style={formBuilder.select as any}
                aria-label={label}
              >
                <option value="">— Select —</option>
                {opts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {resolveOptionLabel(o, locale) || o.label || o.value}
                  </option>
                ))}
              </select>
            </View>
          </View>
        );
      case 'ssn':
        return (
          <View key={f.id} style={local.field}>
            {labelEl}
            <TextInput
              style={formBuilder.input}
              placeholder={placeholder || 'XXX-XX-XXXX'}
              placeholderTextColor="#94A3B8"
              value={value ?? ''}
              onChangeText={(t) => handleChange(f.name, t)}
              keyboardType="numeric"
            />
          </View>
        );
      default:
        return (
          <View key={f.id} style={local.field}>
            {labelEl}
            <TextInput
              style={formBuilder.input}
              placeholder={placeholder}
              placeholderTextColor="#94A3B8"
              value={value ?? ''}
              onChangeText={(t) => handleChange(f.name, t)}
            />
          </View>
        );
    }
  };

  const formName = resolveFormName(form, locale) || form?.name || 'Form preview';
  const formDesc = resolveFormDesc(form, locale) || form?.description;

  return (
    <ScrollView style={local.scroll} contentContainerStyle={local.scrollContent}>
      <Stack gap="xl">
        <View>
          <H4 style={local.title}>{formName}</H4>
          {formDesc ? (
            <>
              <Spacer size="sm" />
              <Text style={local.desc}>{formDesc}</Text>
            </>
          ) : null}
          <Spacer size="md" />
          <Text style={local.interactiveHint}>
            Vista previa interactiva: completa los campos para probar la lógica condicional (mostrar/ocultar).
          </Text>
        </View>

        {formLevelFields.length > 0 && (
          <View style={formBuilder.section}>
            <Text style={formBuilder.sectionTitle}>Form-level fields</Text>
            <Spacer size="md" />
            <Stack gap="lg">
              {formLevelFields.map((f: FormFieldType) => renderField(f))}
            </Stack>
          </View>
        )}

        {sections
          .slice()
          .sort((a: any, b: any) => a.order - b.order)
          .map((sec: any) => {
            const visibleFields = (sec.fields ?? [])
              .slice()
              .sort((a: any, b: any) => a.order - b.order)
              .filter((f: FormFieldType) => isFieldVisible(f, formData));
            if (visibleFields.length === 0) return null;
            const secTitle = resolveSectionTitle(sec, locale) || sec.title;
            return (
              <View key={sec.id} style={formBuilder.section}>
                <Text style={formBuilder.sectionTitle}>{secTitle}</Text>
                <Spacer size="md" />
                <Stack gap="lg">
                  {visibleFields.map((f: FormFieldType) => renderField(f))}
                </Stack>
              </View>
            );
          })}

        {formLevelFields.length === 0 && sections.every((s: any) => !((s.fields ?? []).length > 0)) && (
          <View style={local.empty}>
            <Text style={local.emptyText}>No sections or fields yet. Add them in Build mode.</Text>
          </View>
        )}
      </Stack>
    </ScrollView>
  );
}

const s = spacing;
const local = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: s[8] },
  title: {},
  desc: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  interactiveHint: { fontSize: 13, color: '#64748B', fontStyle: 'italic' },
  labelOverride: { textTransform: 'none' },
  field: { marginBottom: s[5] },
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
  switchLabel: { fontSize: 14, color: '#0F172A' },
  selectWrap: { width: '100%' },
  empty: { padding: s[12], alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#94A3B8' },
});
