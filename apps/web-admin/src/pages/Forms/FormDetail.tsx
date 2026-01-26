import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  useWindowDimensions,
  Switch,
} from 'react-native';
import { H4, Text, spacing, Spacer, Stack, Inline } from '@trusttax/ui';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Wrench, X } from 'lucide-react';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { FormPreview } from './FormPreview';
import { formBuilder } from '../../styles/formBuilder';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { AlertDialog } from '../../components/AlertDialog';

const MOBILE_BREAKPOINT = 768;

const FIELD_TYPES: { type: string; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'textarea', label: 'Text area' },
  { type: 'number', label: 'Number' },
  { type: 'phone', label: 'Phone' },
  { type: 'email', label: 'Email' },
  { type: 'date', label: 'Date' },
  { type: 'select', label: 'Select' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'ssn', label: 'SSN' },
  { type: 'file_upload', label: 'File' },
  { type: 'image_upload', label: 'Image' },
  { type: 'signature', label: 'Signature' },
];

export function FormDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { width, height } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const modalMaxHeight = Math.max(400, height * 0.88);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({
    name: '',
    description: '',
    nameEn: '',
    nameEs: '',
    descriptionEn: '',
    descriptionEs: '',
    version: '1.0',
    active: true,
  });
  const [tab, setTab] = useState<'build' | 'preview'>('build');
  const [previewLocale, setPreviewLocale] = useState<'en' | 'es'>('en');
  const [sectionModal, setSectionModal] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionTitleEn, setSectionTitleEn] = useState('');
  const [sectionTitleEs, setSectionTitleEs] = useState('');
  const [fieldModal, setFieldModal] = useState<'add' | 'edit' | null>(null);
  const [confirmDeleteSection, setConfirmDeleteSection] = useState<{ isOpen: boolean; sectionId: string | null }>({ isOpen: false, sectionId: null });
  const [confirmDeleteField, setConfirmDeleteField] = useState<{ isOpen: boolean; fieldId: string | null }>({ isOpen: false, fieldId: null });
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string; variant: 'success' | 'error' | 'info' | 'warning' }>({ 
    isOpen: false, 
    title: '', 
    message: '', 
    variant: 'info' 
  });
  const [fieldSectionId, setFieldSectionId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState<{
    type: string;
    name: string;
    label: string;
    placeholder: string;
    helpText: string;
    labelEn: string;
    labelEs: string;
    placeholderEn: string;
    placeholderEs: string;
    helpTextEn: string;
    helpTextEs: string;
    required: boolean;
    optionsList: { value: string; label: string; labelEn?: string; labelEs?: string }[];
    accept: string;
    maxFiles: number;
    maxSize: number;
    showWhenField: string;
    showWhenValue: string;
  }>({
    type: 'text',
    name: '',
    label: '',
    placeholder: '',
    helpText: '',
    labelEn: '',
    labelEs: '',
    placeholderEn: '',
    placeholderEs: '',
    helpTextEn: '',
    helpTextEs: '',
    required: false,
    optionsList: [],
    accept: '',
    maxFiles: 5,
    maxSize: 5_000_000,
    showWhenField: '',
    showWhenValue: '',
  });

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getForm(id);
      setForm(data);
      const ni = data.nameI18n as { en?: string; es?: string } | undefined;
      const di = data.descriptionI18n as { en?: string; es?: string } | undefined;
      setMeta({
        name: data.name ?? '',
        description: data.description ?? '',
        nameEn: ni?.en ?? '',
        nameEs: ni?.es ?? '',
        descriptionEn: di?.en ?? '',
        descriptionEs: di?.es ?? '',
        version: data.version ?? '1.0',
        active: !!data.active,
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const saveMeta = async (overrides?: Partial<typeof meta>, showDialog: boolean = false) => {
    if (!id || saving) return;
    setSaving(true);
    const next = overrides ? { ...meta, ...overrides } : meta;
    const payload: any = {
      name: next.name || next.nameEn || next.nameEs,
      description: next.description || next.descriptionEn || next.descriptionEs || undefined,
      version: next.version,
      active: next.active,
    };
    if (next.nameEn || next.nameEs) payload.nameI18n = { en: next.nameEn || undefined, es: next.nameEs || undefined };
    if (next.descriptionEn || next.descriptionEs) payload.descriptionI18n = { en: next.descriptionEn || undefined, es: next.descriptionEs || undefined };
    try {
      await api.updateForm(id, payload);
      setMeta(next);
      setForm((f: any) => (f ? { ...f, ...next, nameI18n: payload.nameI18n, descriptionI18n: payload.descriptionI18n } : f));
      if (showDialog) {
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Form metadata saved successfully', variant: 'success' });
      }
    } catch (e: any) {
      setAlertDialog({ isOpen: true, title: 'Error', message: (e as Error)?.message || 'Failed to save', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const addSection = async () => {
    const t = sectionTitle.trim() || sectionTitleEn.trim() || sectionTitleEs.trim();
    if (!id || !t) return;
    try {
      const payload: any = { title: t };
      if (sectionTitleEn.trim() || sectionTitleEs.trim()) {
        payload.titleI18n = { en: sectionTitleEn.trim() || undefined, es: sectionTitleEs.trim() || undefined };
      }
      await api.createFormSection(id, payload);
      setSectionTitle('');
      setSectionTitleEn('');
      setSectionTitleEs('');
      setSectionModal(false);
      setAlertDialog({ isOpen: true, title: 'Success', message: 'Section added successfully', variant: 'success' });
      load();
    } catch (e: any) {
      setAlertDialog({ isOpen: true, title: 'Error', message: (e as Error)?.message || 'Failed to add section', variant: 'error' });
    }
  };

  const deleteSection = (sectionId: string) => {
    setConfirmDeleteSection({ isOpen: true, sectionId });
  };

  const confirmDeleteSectionAction = async () => {
    if (!id || !confirmDeleteSection.sectionId) return;
    try {
      await api.deleteFormSection(id, confirmDeleteSection.sectionId);
      setConfirmDeleteSection({ isOpen: false, sectionId: null });
      setAlertDialog({ isOpen: true, title: 'Success', message: 'Section deleted successfully', variant: 'success' });
      load();
    } catch (e: any) {
      setConfirmDeleteSection({ isOpen: false, sectionId: null });
      setAlertDialog({ isOpen: true, title: 'Error', message: (e as Error)?.message || 'Failed to delete section', variant: 'error' });
    }
  };

  const openAddField = (sectionId: string | null) => {
    setEditingField(null);
    setFieldSectionId(sectionId);
    setSelectedType(null);
    setFieldForm({
      type: 'text',
      name: '',
      label: '',
      placeholder: '',
      helpText: '',
      labelEn: '',
      labelEs: '',
      placeholderEn: '',
      placeholderEs: '',
      helpTextEn: '',
      helpTextEs: '',
      required: false,
      optionsList: [],
      accept: '',
      maxFiles: 5,
      maxSize: 5_000_000,
      showWhenField: '',
      showWhenValue: '',
    });
    setFieldModal('add');
  };

  const openEditField = (field: any, sectionId: string | null) => {
    setEditingField(field);
    setFieldSectionId(sectionId);
    setSelectedType(field.type);
    const sw = field.rules?.showWhen;
    const li = field.labelI18n as { en?: string; es?: string } | undefined;
    const pi = field.placeholderI18n as { en?: string; es?: string } | undefined;
    const hi = field.helpTextI18n as { en?: string; es?: string } | undefined;
    let optionsList: { value: string; label: string; labelEn?: string; labelEs?: string }[] = [];
    if (Array.isArray(field.options)) {
      optionsList = field.options.map((o: any) => ({
        value: typeof o === 'object' && o?.value != null ? String(o.value) : '',
        label: (typeof o === 'object' && o?.label != null ? String(o.label) : '') as string,
        labelEn: (o?.labelI18n as { en?: string })?.en ?? '',
        labelEs: (o?.labelI18n as { es?: string })?.es ?? '',
      }));
    }
    setFieldForm({
      type: field.type ?? 'text',
      name: field.name ?? '',
      label: field.label ?? '',
      placeholder: field.placeholder ?? '',
      helpText: field.helpText ?? '',
      labelEn: li?.en ?? '',
      labelEs: li?.es ?? '',
      placeholderEn: pi?.en ?? '',
      placeholderEs: pi?.es ?? '',
      helpTextEn: hi?.en ?? '',
      helpTextEs: hi?.es ?? '',
      required: !!field.required,
      optionsList,
      accept: field.accept ?? '',
      maxFiles: field.maxFiles ?? 5,
      maxSize: field.maxSize ?? 5_000_000,
      showWhenField: sw?.field ?? '',
      showWhenValue: sw?.value === true ? 'true' : sw?.value === false ? 'false' : (sw?.value != null ? String(sw.value) : ''),
    });
    setFieldModal('edit');
  };

  const pickType = (t: string) => {
    setSelectedType(t);
    setFieldForm((f) => ({ ...f, type: t }));
  };

  const saveField = async () => {
    if (!id) return;
    let optionsObj: any = undefined;
    if (fieldForm.type === 'select') {
      const list = (fieldForm.optionsList || [])
        .filter((o) => (o.value?.trim() ?? '') !== '' || (o.label?.trim() ?? '') !== '' || (o.labelEn ?? '').trim() !== '' || (o.labelEs ?? '').trim() !== '')
        .map((o) => {
          const v = (o.value ?? '').trim() || (o.labelEn ?? o.labelEs ?? o.label ?? '').trim();
          const l = (o.label ?? o.labelEn ?? o.labelEs ?? '').trim() || v;
          const opt: any = { value: v, label: l };
          if ((o.labelEn ?? '').trim() || (o.labelEs ?? '').trim()) opt.labelI18n = { en: (o.labelEn ?? '').trim() || undefined, es: (o.labelEs ?? '').trim() || undefined };
          return opt;
        });
      if (list.length) optionsObj = list;
    }
    let rules: { showWhen?: { field: string; value: boolean | string | number } } | null = null;
    if (fieldForm.showWhenField?.trim()) {
      const v = fieldForm.showWhenValue?.trim();
      let parsed: boolean | string | number = v ?? '';
      if (v === 'true') parsed = true;
      else if (v === 'false') parsed = false;
      else if (v !== '' && !Number.isNaN(Number(v))) parsed = Number(v);
      rules = { showWhen: { field: fieldForm.showWhenField.trim(), value: parsed } };
    }
    const label = fieldForm.label.trim() || fieldForm.labelEn.trim() || fieldForm.labelEs.trim() || 'Untitled';
    const payload: any = {
      sectionId: fieldSectionId || null,
      type: fieldForm.type,
      name: fieldForm.name.trim() || `field_${Date.now()}`,
      label,
      placeholder: fieldForm.placeholder.trim() || fieldForm.placeholderEn.trim() || fieldForm.placeholderEs.trim() || undefined,
      helpText: fieldForm.helpText.trim() || fieldForm.helpTextEn.trim() || fieldForm.helpTextEs.trim() || undefined,
      required: fieldForm.required,
      rules: rules ?? undefined,
      options: optionsObj,
      accept: fieldForm.accept.trim() || undefined,
      maxFiles: fieldForm.type === 'image_upload' ? fieldForm.maxFiles : undefined,
      maxSize: (fieldForm.type === 'file_upload' || fieldForm.type === 'image_upload') ? fieldForm.maxSize : undefined,
    };
    if (rules === null && editingField) payload.rules = null;
    if (fieldForm.labelEn.trim() || fieldForm.labelEs.trim()) payload.labelI18n = { en: fieldForm.labelEn.trim() || undefined, es: fieldForm.labelEs.trim() || undefined };
    if (fieldForm.placeholderEn.trim() || fieldForm.placeholderEs.trim()) payload.placeholderI18n = { en: fieldForm.placeholderEn.trim() || undefined, es: fieldForm.placeholderEs.trim() || undefined };
    if (fieldForm.helpTextEn.trim() || fieldForm.helpTextEs.trim()) payload.helpTextI18n = { en: fieldForm.helpTextEn.trim() || undefined, es: fieldForm.helpTextEs.trim() || undefined };
    try {
      if (editingField) {
        await api.updateFormField(id, editingField.id, payload);
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Field updated successfully', variant: 'success' });
      } else {
        await api.createFormField(id, payload);
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Field created successfully', variant: 'success' });
      }
      setFieldModal(null);
      setSelectedType(null);
      load();
    } catch (e: any) {
      setAlertDialog({ isOpen: true, title: 'Error', message: (e as Error)?.message || 'Failed to save field', variant: 'error' });
    }
  };

  const deleteField = (fieldId: string) => {
    setConfirmDeleteField({ isOpen: true, fieldId });
  };

  const confirmDeleteFieldAction = async () => {
    if (!id || !confirmDeleteField.fieldId) return;
    try {
      await api.deleteFormField(id, confirmDeleteField.fieldId);
      setConfirmDeleteField({ isOpen: false, fieldId: null });
      setAlertDialog({ isOpen: true, title: 'Success', message: 'Field deleted successfully', variant: 'success' });
      load();
    } catch (e: any) {
      setConfirmDeleteField({ isOpen: false, fieldId: null });
      setAlertDialog({ isOpen: true, title: 'Error', message: (e as Error)?.message || 'Failed to delete field', variant: 'error' });
    }
  };

  if (loading && !form) {
    return (
      <Layout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      </Layout>
    );
  }

  if (error && !form) {
    return (
      <Layout>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigate('/forms')} activeOpacity={0.7}>
            <ArrowLeft size={18} color="#2563EB" />
            <Text style={styles.backTxt}>Back to Forms</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  if (!form) return null;

  const sections = form.sections ?? [];
  const formLevelFields = form.fields ?? [];

  return (
    <Layout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigate('/forms')} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#64748B" />
          <Text style={styles.backTxt}>Back to Forms</Text>
        </TouchableOpacity>
        <Spacer size="xl" />

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, tab === 'build' && styles.tabActive]}
            onPress={() => setTab('build')}
            activeOpacity={0.7}
          >
            <Wrench size={18} color={tab === 'build' ? '#0F172A' : '#64748B'} />
            <Text style={[styles.tabText, tab === 'build' && styles.tabTextActive]}>Build</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'preview' && styles.tabActive]}
            onPress={() => setTab('preview')}
            activeOpacity={0.7}
          >
            <Eye size={18} color={tab === 'preview' ? '#0F172A' : '#64748B'} />
            <Text style={[styles.tabText, tab === 'preview' && styles.tabTextActive]}>Preview</Text>
          </TouchableOpacity>
        </View>

        {tab === 'preview' ? (
          <>
            <View style={styles.previewToolbar}>
              <Text style={formBuilder.label}>Idioma / Language</Text>
              <View style={styles.localeToggle}>
                <TouchableOpacity
                  style={[styles.localeBtn, previewLocale === 'en' && styles.localeBtnActive]}
                  onPress={() => setPreviewLocale('en')}
                >
                  <Text style={[styles.localeBtnText, previewLocale === 'en' && styles.localeBtnTextActive]}>EN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.localeBtn, previewLocale === 'es' && styles.localeBtnActive]}
                  onPress={() => setPreviewLocale('es')}
                >
                  <Text style={[styles.localeBtnText, previewLocale === 'es' && styles.localeBtnTextActive]}>ES</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Spacer size="lg" />
            <FormPreview form={form} locale={previewLocale} />
          </>
        ) : (
          <>
            <Stack gap="xl">
              <View style={[formBuilder.card, styles.metaCard]}>
                <Text style={formBuilder.label}>Form</Text>
                <Spacer size="md" />
                <Stack gap="lg">
                  <View>
                    <Text style={formBuilder.label}>Name (fallback)</Text>
                    <Spacer size="xs" />
                    <TextInput
                      style={formBuilder.input}
                      value={meta.name}
                      onChangeText={(t) => setMeta((m) => ({ ...m, name: t }))}
                      onBlur={() => saveMeta()}
                      placeholder="Form name"
                    />
                  </View>
                  <Inline gap="lg" wrap>
                    <View style={{ flex: 1, minWidth: 160 }}>
                      <Text style={formBuilder.label}>Name (EN)</Text>
                      <Spacer size="xs" />
                      <TextInput
                        style={formBuilder.input}
                        value={meta.nameEn}
                        onChangeText={(t) => setMeta((m) => ({ ...m, nameEn: t }))}
                        onBlur={() => saveMeta()}
                        placeholder="English"
                      />
                    </View>
                    <View style={{ flex: 1, minWidth: 160 }}>
                      <Text style={formBuilder.label}>Name (ES)</Text>
                      <Spacer size="xs" />
                      <TextInput
                        style={formBuilder.input}
                        value={meta.nameEs}
                        onChangeText={(t) => setMeta((m) => ({ ...m, nameEs: t }))}
                        onBlur={() => saveMeta()}
                        placeholder="Español"
                      />
                    </View>
                  </Inline>
                  <View>
                    <Text style={formBuilder.label}>Description (fallback)</Text>
                    <Spacer size="xs" />
                    <TextInput
                      style={[formBuilder.input, formBuilder.inputMultiline]}
                      value={meta.description}
                      onChangeText={(t) => setMeta((m) => ({ ...m, description: t }))}
                      onBlur={() => saveMeta()}
                      placeholder="Optional"
                      multiline
                    />
                  </View>
                  <Inline gap="lg" wrap>
                    <View style={{ flex: 1, minWidth: 160 }}>
                      <Text style={formBuilder.label}>Description (EN)</Text>
                      <Spacer size="xs" />
                      <TextInput
                        style={[formBuilder.input, formBuilder.inputMultiline]}
                        value={meta.descriptionEn}
                        onChangeText={(t) => setMeta((m) => ({ ...m, descriptionEn: t }))}
                        onBlur={() => saveMeta()}
                        placeholder="English"
                        multiline
                      />
                    </View>
                    <View style={{ flex: 1, minWidth: 160 }}>
                      <Text style={formBuilder.label}>Description (ES)</Text>
                      <Spacer size="xs" />
                      <TextInput
                        style={[formBuilder.input, formBuilder.inputMultiline]}
                        value={meta.descriptionEs}
                        onChangeText={(t) => setMeta((m) => ({ ...m, descriptionEs: t }))}
                        onBlur={() => saveMeta()}
                        placeholder="Español"
                        multiline
                      />
                    </View>
                  </Inline>
                  <Inline gap="lg" wrap>
                    <View style={{ flex: 1, minWidth: 120 }}>
                      <Text style={formBuilder.label}>Version</Text>
                      <Spacer size="xs" />
                      <TextInput
                        style={formBuilder.input}
                        value={meta.version}
                        onChangeText={(t) => setMeta((m) => ({ ...m, version: t }))}
                        onBlur={() => saveMeta()}
                        placeholder="1.0"
                      />
                    </View>
                    <View>
                      <Text style={formBuilder.label}>Active</Text>
                      <Spacer size="xs" />
                      <Inline gap="sm" style={{ alignItems: 'center' }}>
                        <Switch
                          value={meta.active}
                          onValueChange={(v) => saveMeta({ active: v }, false)}
                          trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                        />
                      </Inline>
                    </View>
                  </Inline>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: s[4] }}>
                    {saving && <Text style={styles.savingText}>Saving…</Text>}
                    <View style={{ marginLeft: 'auto' }}>
                      <TouchableOpacity
                        style={[formBuilder.btn, formBuilder.btnPrimary]}
                        onPress={() => saveMeta(undefined, true)}
                        disabled={saving}
                        activeOpacity={0.7}
                      >
                        <Text style={formBuilder.btnPrimaryText}>Save Form Metadata</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Stack>
              </View>

              <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <H4 style={styles.sectionTitle}>Sections & fields</H4>
                <TouchableOpacity
                  style={[formBuilder.btn, formBuilder.btnPrimary]}
                  onPress={() => { setSectionTitle(''); setSectionTitleEn(''); setSectionTitleEs(''); setSectionModal(true); }}
                  activeOpacity={0.7}
                >
                  <Plus size={18} color="#FFF" />
                  <Text style={formBuilder.btnPrimaryText}>Add section</Text>
                </TouchableOpacity>
              </View>

              {(formLevelFields.length > 0 || sections.length > 0) && (
                <View style={formBuilder.section}>
                  <Text style={formBuilder.sectionTitle}>Form-level fields</Text>
                  {formLevelFields.map((f: any) => (
                    <View key={f.id} style={formBuilder.fieldRow}>
                      <Text style={formBuilder.fieldType}>{f.type}</Text>
                      <Text style={formBuilder.fieldLabel}>{f.label}</Text>
                      <TouchableOpacity onPress={() => openEditField(f, null)} style={formBuilder.iconBtn}>
                        <Edit size={16} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteField(f.id)} style={formBuilder.iconBtn}>
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity style={styles.addFieldBtn} onPress={() => openAddField(null)} activeOpacity={0.7}>
                    <Plus size={16} color="#64748B" />
                    <Text style={styles.addFieldTxt}>Add form-level field</Text>
                  </TouchableOpacity>
                </View>
              )}

              {sections.map((sec: any) => (
                <View key={sec.id} style={formBuilder.section}>
                  <View style={styles.sectionBlockHeader}>
                    <Text style={formBuilder.sectionTitle}>{sec.title}</Text>
                    <TouchableOpacity onPress={() => deleteSection(sec.id)} style={formBuilder.iconBtn}>
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  {(sec.fields ?? []).map((f: any) => (
                    <View key={f.id} style={formBuilder.fieldRow}>
                      <Text style={formBuilder.fieldType}>{f.type}</Text>
                      <Text style={formBuilder.fieldLabel}>{f.label}</Text>
                      <TouchableOpacity onPress={() => openEditField(f, sec.id)} style={formBuilder.iconBtn}>
                        <Edit size={16} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteField(f.id)} style={formBuilder.iconBtn}>
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity style={styles.addFieldBtn} onPress={() => openAddField(sec.id)} activeOpacity={0.7}>
                    <Plus size={16} color="#64748B" />
                    <Text style={styles.addFieldTxt}>Add field</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {sections.length === 0 && formLevelFields.length === 0 && (
                <TouchableOpacity style={styles.addFieldBtn} onPress={() => openAddField(null)} activeOpacity={0.7}>
                  <Plus size={16} color="#64748B" />
                  <Text style={styles.addFieldTxt}>Add first field</Text>
                </TouchableOpacity>
              )}
            </View>
            </Stack>
          </>
        )}

        <SectionModal
          visible={sectionModal}
          title={sectionTitle}
          titleEn={sectionTitleEn}
          titleEs={sectionTitleEs}
          onChangeTitle={setSectionTitle}
          onChangeTitleEn={setSectionTitleEn}
          onChangeTitleEs={setSectionTitleEs}
          onAdd={addSection}
          onClose={() => setSectionModal(false)}
          maxHeight={modalMaxHeight}
        />

        <FieldModal
          visible={!!fieldModal}
          isEdit={fieldModal === 'edit'}
          selectedType={selectedType}
          onPickType={pickType}
          fieldForm={fieldForm}
          setFieldForm={setFieldForm}
          onSave={saveField}
          onClose={() => { setFieldModal(null); setSelectedType(null); }}
          maxHeight={modalMaxHeight}
          allFields={[
            ...formLevelFields.map((f: any) => ({ name: f.name, label: f.label, type: f.type })),
            ...sections.flatMap((s: any) => (s.fields ?? []).map((f: any) => ({ name: f.name, label: f.label, type: f.type }))),
          ].filter((x) => !editingField || x.name !== editingField.name)}
        />

        {/* Confirm Dialogs */}
        <ConfirmDialog
          isOpen={confirmDeleteSection.isOpen}
          onClose={() => setConfirmDeleteSection({ isOpen: false, sectionId: null })}
          onConfirm={confirmDeleteSectionAction}
          title="Delete Section"
          message="Delete this section and its fields? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />

        <ConfirmDialog
          isOpen={confirmDeleteField.isOpen}
          onClose={() => setConfirmDeleteField({ isOpen: false, fieldId: null })}
          onConfirm={confirmDeleteFieldAction}
          title="Delete Field"
          message="Delete this field? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />

        {/* Alert Dialog */}
        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog({ isOpen: false, title: '', message: '', variant: 'info' })}
          title={alertDialog.title}
          message={alertDialog.message}
          variant={alertDialog.variant}
        />
      </ScrollView>
    </Layout>
  );
}

function SectionModal({
  visible,
  title,
  titleEn,
  titleEs,
  onChangeTitle,
  onChangeTitleEn,
  onChangeTitleEs,
  onAdd,
  onClose,
  maxHeight,
}: {
  visible: boolean;
  title: string;
  titleEn: string;
  titleEs: string;
  onChangeTitle: (t: string) => void;
  onChangeTitleEn: (t: string) => void;
  onChangeTitleEs: (t: string) => void;
  onAdd: () => void;
  onClose: () => void;
  maxHeight?: number;
}) {
  const canAdd = !!(title.trim() || titleEn.trim() || titleEs.trim());
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[formBuilder.card, styles.modalBox, styles.modalDialog, { maxHeight: maxHeight ?? '90%' }]}>
          <View style={styles.modalHeader}>
            <H4 style={styles.modalTitle}>New section</H4>
            <TouchableOpacity onPress={onClose} style={styles.modalClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Spacer size="md" />
          <Text style={formBuilder.label}>Title (fallback)</Text>
          <Spacer size="xs" />
          <TextInput
            style={formBuilder.input}
            value={title}
            onChangeText={onChangeTitle}
            placeholder="e.g. Personal data"
          />
          <Spacer size="md" />
          <Text style={formBuilder.label}>Title (EN) / Title (ES)</Text>
          <Spacer size="xs" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput
              style={[formBuilder.input, { flex: 1 }]}
              value={titleEn}
              onChangeText={onChangeTitleEn}
              placeholder="English"
            />
            <TextInput
              style={[formBuilder.input, { flex: 1 }]}
              value={titleEs}
              onChangeText={onChangeTitleEs}
              placeholder="Español"
            />
          </View>
          <Spacer size="xl" />
          <View style={[styles.modalActions, { borderTopWidth: 0, marginTop: 0, paddingTop: s[4] }]}>
            <TouchableOpacity style={formBuilder.btn} onPress={onClose} activeOpacity={0.7}>
              <Text style={formBuilder.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[formBuilder.btn, formBuilder.btnPrimary]}
              onPress={onAdd}
              disabled={!canAdd}
              activeOpacity={0.7}
            >
              <Text style={formBuilder.btnPrimaryText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FieldModal({
  visible,
  isEdit,
  selectedType,
  onPickType,
  fieldForm,
  setFieldForm,
  onSave,
  onClose,
  maxHeight,
  allFields,
}: {
  visible: boolean;
  isEdit: boolean;
  selectedType: string | null;
  onPickType: (t: string) => void;
  fieldForm: any;
  setFieldForm: (v: any) => void;
  onSave: () => void;
  onClose: () => void;
  maxHeight?: number;
  allFields: { name: string; label: string; type: string }[];
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[formBuilder.card, styles.modalBoxWide, styles.modalDialog, { maxHeight: maxHeight ?? '90%' }]}>
          <View style={styles.modalHeader}>
            <H4 style={styles.modalTitle}>{isEdit ? 'Edit field' : 'Add component'}</H4>
            <TouchableOpacity onPress={onClose} style={styles.modalClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalScrollBody}
            contentContainerStyle={styles.modalScrollInner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
          <Spacer size="lg" />
          {!isEdit && (
            <>
              <Text style={formBuilder.label}>Choose component type</Text>
              <Spacer size="sm" />
              <View style={formBuilder.palette}>
                {FIELD_TYPES.map(({ type, label }) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      formBuilder.paletteItem,
                      selectedType === type && { borderColor: '#0F172A', backgroundColor: '#F8FAFC' },
                    ]}
                    onPress={() => onPickType(type)}
                    activeOpacity={0.7}
                  >
                    <Text style={[formBuilder.paletteItemText, selectedType === type && { color: '#0F172A', fontWeight: '600' }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {(isEdit || selectedType) && (
            <>
              <Spacer size="xl" />
              <Text style={formBuilder.label}>Configure</Text>
              <Spacer size="md" />
              <View style={styles.modalRow}>
                <Text style={formBuilder.label}>Name (key)</Text>
                <TextInput
                  style={formBuilder.input}
                  value={fieldForm.name}
                  onChangeText={(t) => setFieldForm((f: any) => ({ ...f, name: t }))}
                  placeholder="e.g. fullName"
                />
              </View>
              <View style={styles.modalRow}>
                <Text style={formBuilder.label}>Label (fallback)</Text>
                <TextInput
                  style={formBuilder.input}
                  value={fieldForm.label}
                  onChangeText={(t) => setFieldForm((f: any) => ({ ...f, label: t }))}
                  placeholder="Display label"
                />
              </View>
              <View style={[styles.modalRow, { flexDirection: 'row', gap: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={formBuilder.label}>Label (EN)</Text>
                  <TextInput
                    style={formBuilder.input}
                    value={fieldForm.labelEn ?? ''}
                    onChangeText={(t) => setFieldForm((f: any) => ({ ...f, labelEn: t }))}
                    placeholder="English"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={formBuilder.label}>Label (ES)</Text>
                  <TextInput
                    style={formBuilder.input}
                    value={fieldForm.labelEs ?? ''}
                    onChangeText={(t) => setFieldForm((f: any) => ({ ...f, labelEs: t }))}
                    placeholder="Español"
                  />
                </View>
              </View>
              <View style={styles.modalRow}>
                <Text style={formBuilder.label}>Placeholder (fallback)</Text>
                <TextInput
                  style={formBuilder.input}
                  value={fieldForm.placeholder}
                  onChangeText={(t) => setFieldForm((f: any) => ({ ...f, placeholder: t }))}
                  placeholder="Optional"
                />
              </View>
              <View style={[styles.modalRow, { flexDirection: 'row', gap: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={formBuilder.label}>Placeholder (EN) / (ES)</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      style={[formBuilder.input, { flex: 1 }]}
                      value={fieldForm.placeholderEn ?? ''}
                      onChangeText={(t) => setFieldForm((f: any) => ({ ...f, placeholderEn: t }))}
                      placeholder="EN"
                    />
                    <TextInput
                      style={[formBuilder.input, { flex: 1 }]}
                      value={fieldForm.placeholderEs ?? ''}
                      onChangeText={(t) => setFieldForm((f: any) => ({ ...f, placeholderEs: t }))}
                      placeholder="ES"
                    />
                  </View>
                </View>
              </View>
              <View style={styles.modalRow}>
                <Text style={formBuilder.label}>Help text (fallback)</Text>
                <TextInput
                  style={formBuilder.input}
                  value={fieldForm.helpText}
                  onChangeText={(t) => setFieldForm((f: any) => ({ ...f, helpText: t }))}
                  placeholder="Optional"
                />
              </View>
              <View style={[styles.modalRow, { flexDirection: 'row', gap: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={formBuilder.label}>Help (EN) / (ES)</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      style={[formBuilder.input, { flex: 1 }]}
                      value={fieldForm.helpTextEn ?? ''}
                      onChangeText={(t) => setFieldForm((f: any) => ({ ...f, helpTextEn: t }))}
                      placeholder="EN"
                    />
                    <TextInput
                      style={[formBuilder.input, { flex: 1 }]}
                      value={fieldForm.helpTextEs ?? ''}
                      onChangeText={(t) => setFieldForm((f: any) => ({ ...f, helpTextEs: t }))}
                      placeholder="ES"
                    />
                  </View>
                </View>
              </View>
              <View style={[styles.modalRow, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <Switch
                  value={fieldForm.required}
                  onValueChange={(v) => setFieldForm((f: any) => ({ ...f, required: v }))}
                  trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                />
                <Text style={formBuilder.label}>Required</Text>
              </View>
              <View style={[styles.modalRow, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
                <Text style={formBuilder.label}>Show when (optional)</Text>
                <Spacer size="xs" />
                <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>Show this field only when another field has a specific value.</Text>
                <View style={styles.modalRow}>
                  <Text style={formBuilder.label}>Depends on field</Text>
                  <View style={{ width: '100%' }}>
                    <select
                      value={fieldForm.showWhenField ?? ''}
                      onChange={(e) => setFieldForm((f: any) => ({ ...f, showWhenField: e.target.value }))}
                      style={formBuilder.select as any}
                      aria-label="Depends on field"
                    >
                      <option value="">— None —</option>
                      {allFields.map((x) => (
                        <option key={x.name} value={x.name}>{x.label} ({x.name})</option>
                      ))}
                    </select>
                  </View>
                </View>
                {fieldForm.showWhenField ? (
                  <View style={styles.modalRow}>
                    <Text style={formBuilder.label}>Show when value equals</Text>
                    <TextInput
                      style={formBuilder.input}
                      value={fieldForm.showWhenValue ?? ''}
                      onChangeText={(t) => setFieldForm((f: any) => ({ ...f, showWhenValue: t }))}
                      placeholder="true / false (checkbox) or option value"
                    />
                  </View>
                ) : null}
              </View>
              {fieldForm.type === 'select' && (
                <View style={styles.modalRow}>
                  <Text style={formBuilder.label}>Opciones (Value, Label EN, Label ES)</Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>Añade valor y etiquetas en ambos idiomas para cada opción.</Text>
                  {(fieldForm.optionsList || []).map((opt: { value: string; label: string; labelEn?: string; labelEs?: string }, idx: number) => (
                    <View key={idx} style={[formBuilder.optionsRow, { flexWrap: 'wrap' }]}>
                      <TextInput
                        style={[formBuilder.input, { flex: 1, minWidth: 80 }]}
                        value={opt.value}
                        onChangeText={(t) => {
                          const list = [...(fieldForm.optionsList || [])];
                          list[idx] = { ...list[idx], value: t };
                          setFieldForm((f: any) => ({ ...f, optionsList: list }));
                        }}
                        placeholder="Valor"
                      />
                      <TextInput
                        style={[formBuilder.input, { flex: 1, minWidth: 80 }]}
                        value={opt.labelEn ?? ''}
                        onChangeText={(t) => {
                          const list = [...(fieldForm.optionsList || [])];
                          list[idx] = { ...list[idx], labelEn: t, label: list[idx].label || t };
                          setFieldForm((f: any) => ({ ...f, optionsList: list }));
                        }}
                        placeholder="Label (EN)"
                      />
                      <TextInput
                        style={[formBuilder.input, { flex: 1, minWidth: 80 }]}
                        value={opt.labelEs ?? ''}
                        onChangeText={(t) => {
                          const list = [...(fieldForm.optionsList || [])];
                          list[idx] = { ...list[idx], labelEs: t };
                          setFieldForm((f: any) => ({ ...f, optionsList: list }));
                        }}
                        placeholder="Label (ES)"
                      />
                      <TouchableOpacity
                        onPress={() => setFieldForm((f: any) => ({ ...f, optionsList: (f.optionsList || []).filter((_: any, i: number) => i !== idx) }))}
                        style={formBuilder.btnIcon}
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={formBuilder.btnOutline}
                    onPress={() => setFieldForm((f: any) => ({ ...f, optionsList: [...(f.optionsList || []), { value: '', label: '', labelEn: '', labelEs: '' }] }))}
                  >
                    <Plus size={18} color="#0F172A" />
                    <Text style={formBuilder.btnOutlineText}>Añadir opción</Text>
                  </TouchableOpacity>
                </View>
              )}
              {(fieldForm.type === 'file_upload' || fieldForm.type === 'image_upload') && (
                <>
                  <View style={styles.modalRow}>
                    <Text style={formBuilder.label}>Accept (MIME)</Text>
                    <TextInput
                      style={formBuilder.input}
                      value={fieldForm.accept}
                      onChangeText={(t) => setFieldForm((f: any) => ({ ...f, accept: t }))}
                      placeholder="e.g. image/*"
                    />
                  </View>
                  {fieldForm.type === 'image_upload' && (
                    <View style={styles.modalRow}>
                      <Text style={formBuilder.label}>Max files</Text>
                      <TextInput
                        style={formBuilder.input}
                        value={String(fieldForm.maxFiles)}
                        onChangeText={(t) => setFieldForm((f: any) => ({ ...f, maxFiles: parseInt(t, 10) || 5 }))}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                  <View style={styles.modalRow}>
                    <Text style={formBuilder.label}>Max size (bytes)</Text>
                    <TextInput
                      style={formBuilder.input}
                      value={String(fieldForm.maxSize)}
                      onChangeText={(t) => setFieldForm((f: any) => ({ ...f, maxSize: parseInt(t, 10) || 0 }))}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
            </>
          )}

          <Spacer size="xl" />
          </ScrollView>
          <View style={[styles.modalActions, styles.modalFooter]}>
            <TouchableOpacity style={formBuilder.btn} onPress={onClose} activeOpacity={0.7}>
              <Text style={formBuilder.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[formBuilder.btn, formBuilder.btnPrimary]}
              onPress={onSave}
              disabled={!isEdit && !selectedType}
              activeOpacity={0.7}
            >
              <Text style={formBuilder.btnPrimaryText}>{isEdit ? 'Save' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = spacing;
const styles = StyleSheet.create({
  scroll: { flex: 1, width: '100%' },
  container: { padding: s[8], maxWidth: 800, alignSelf: 'center', paddingBottom: s[12] },
  containerMobile: { padding: s[4], paddingTop: s[6] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  errorText: { color: '#EF4444', marginBottom: s[4] },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: s[2] },
  backTxt: { color: '#64748B', fontSize: 14, fontWeight: '500' },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: s[6],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s[2],
    paddingVertical: s[3],
    paddingHorizontal: s[5],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#0F172A' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#64748B' },
  tabTextActive: { color: '#0F172A', fontWeight: '600' },

  previewToolbar: { flexDirection: 'row', alignItems: 'center', gap: s[4], flexWrap: 'wrap' },
  localeToggle: { flexDirection: 'row', gap: 0, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 0 },
  localeBtn: { paddingVertical: s[2], paddingHorizontal: s[4], backgroundColor: '#FFF' },
  localeBtnActive: { backgroundColor: '#0F172A' },
  localeBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  localeBtnTextActive: { color: '#FFF' },

  metaCard: {},
  savingText: { fontSize: 13, color: '#64748B', marginTop: s[2] },

  section: {},
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s[4], flexWrap: 'wrap', gap: s[3] },
  sectionTitle: { marginBottom: 0 },
  sectionBlockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s[3] },
  addFieldBtn: { flexDirection: 'row', alignItems: 'center', gap: s[2], paddingVertical: s[3], marginTop: s[2] },
  addFieldTxt: { fontSize: 14, color: '#64748B', fontWeight: '500' },

  modalOverlay: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: s[4],
  } as any,
  modalDialog: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '90%',
    overflow: 'hidden',
    flexDirection: 'column',
  } as any,
  modalBox: { width: '100%', maxWidth: 420 },
  modalBoxWide: { width: '100%', maxWidth: 560 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s[4],
    paddingBottom: s[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: { marginBottom: 0, flex: 1 },
  modalClose: { padding: s[2] },
  modalScrollBody: { flex: 1, minHeight: 0 } as any,
  modalScrollInner: { paddingBottom: s[6] },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: s[4],
    marginTop: 0,
  },
  modalRow: { marginBottom: s[4] },
  modalActions: { flexDirection: 'row', gap: s[3], marginTop: s[6], justifyContent: 'flex-end' },
});
