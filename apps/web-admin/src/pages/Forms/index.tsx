import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';
import { H1, H4, Text, spacing, Spacer } from '@trusttax/ui';
import { ClipboardList, Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const MOBILE_BREAKPOINT = 768;

export function FormsPage() {
  const navigate = useNavigate();
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null; name: string }>({ isOpen: false, id: null, name: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getForms();
        if (!cancelled) setForms(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load forms');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    setError('');
    try {
      const f = await api.createForm({ name: 'Untitled form' });
      navigate(`/forms/${f.id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create form');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFromTemplate = async () => {
    if (creatingFromTemplate) return;
    setCreatingFromTemplate(true);
    setError('');
    try {
      const f = await api.createFormFromTemplate('tax');
      navigate(`/forms/${f.id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create form from template');
    } finally {
      setCreatingFromTemplate(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDelete({ isOpen: true, id, name });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.deleteForm(confirmDelete.id);
      setForms((prev) => prev.filter((f) => f.id !== confirmDelete.id));
      setConfirmDelete({ isOpen: false, id: null, name: '' });
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
      setConfirmDelete({ isOpen: false, id: null, name: '' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <View>
            <H1 style={isMobile ? styles.titleMobile : undefined}>Forms</H1>
            <Spacer size="xs" />
            <Text style={styles.subtitle}>Dynamic form templates (sections + fields)</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.templateBtn, (creating || creatingFromTemplate) && styles.createBtnDisabled]}
              onPress={handleCreateFromTemplate}
              disabled={creating || creatingFromTemplate}
              activeOpacity={0.7}
            >
              {creatingFromTemplate ? <ActivityIndicator size="small" color="#0F172A" /> : <ClipboardList size={18} color="#0F172A" />}
              <Text style={styles.templateBtnText}>{creatingFromTemplate ? 'Creating…' : 'Formulario de Impuesto'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.createBtn, (creating || creatingFromTemplate) && styles.createBtnDisabled]} onPress={handleCreate} disabled={creating || creatingFromTemplate} activeOpacity={0.7}>
              {creating ? <ActivityIndicator size="small" color="#FFF" /> : <Plus size={20} color="#FFF" />}
              <Text style={styles.createBtnText}>{creating ? 'Creating…' : 'New form'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Spacer size="xl" />
        {forms.length === 0 ? (
          <View style={styles.empty}>
            <ClipboardList size={48} color="#E2E8F0" />
            <H4 style={styles.emptyTitle}>No forms yet</H4>
            <Text style={styles.emptyText}>Create a form to use in service steps, or start from the tax template.</Text>
            <View style={styles.emptyActions}>
              <TouchableOpacity style={[styles.templateBtn, (creating || creatingFromTemplate) && styles.createBtnDisabled]} onPress={handleCreateFromTemplate} disabled={creating || creatingFromTemplate} activeOpacity={0.7}>
                {creatingFromTemplate ? <ActivityIndicator size="small" color="#0F172A" /> : <ClipboardList size={18} color="#0F172A" />}
                <Text style={styles.templateBtnText}>{creatingFromTemplate ? 'Creating…' : 'Formulario de Impuesto'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.createBtn, (creating || creatingFromTemplate) && styles.createBtnDisabled]} onPress={handleCreate} disabled={creating || creatingFromTemplate} activeOpacity={0.7}>
                {creating ? <ActivityIndicator size="small" color="#FFF" /> : <Plus size={20} color="#FFF" />}
                <Text style={styles.createBtnText}>{creating ? 'Creating…' : 'New form'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.grid}>
            {forms.map((f) => (
              <View key={f.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <ClipboardList size={20} color="#2563EB" />
                    <Text style={styles.cardTitle}>{f.name}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigate(`/forms/${f.id}`)}>
                      <Edit size={16} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(f.id, f.name)}>
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                {f.description ? <Text style={styles.cardDesc} numberOfLines={2}>{f.description}</Text> : null}
                <View style={styles.cardMeta}>
                  <Text style={styles.meta}>v{f.version ?? '1.0'}</Text>
                  <Text style={styles.meta}>•</Text>
                  <Text style={styles.meta}>{f._count?.sections ?? 0} sections</Text>
                  <Text style={styles.meta}>•</Text>
                  <Text style={styles.meta}>{f._count?.fields ?? 0} fields</Text>
                </View>
                <TouchableOpacity style={styles.cardLink} onPress={() => navigate(`/forms/${f.id}`)} activeOpacity={0.7}>
                  <Text style={styles.cardLinkText}>Edit form</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDeleteAction}
        title="Delete Form"
        message={`Delete form "${confirmDelete.name}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </Layout>
  );
}

const s = spacing;
const styles = StyleSheet.create({
  scroll: { flex: 1, width: '100%' },
  container: { padding: s[8], width: '100%', minWidth: '100%' as any, maxWidth: 1100, alignSelf: 'center', paddingBottom: s[12] },
  containerMobile: { padding: s[4], paddingTop: s[6] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: s[4] },
  headerMobile: { flexDirection: 'column', alignItems: 'stretch' },
  titleMobile: { fontSize: 24 },
  subtitle: { color: '#64748B' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: s[3], flexWrap: 'wrap' },
  templateBtn: { flexDirection: 'row', alignItems: 'center', gap: s[2], backgroundColor: '#FFF', paddingVertical: s[3], paddingHorizontal: s[5], borderRadius: 0, borderWidth: 1, borderColor: '#E2E8F0' },
  templateBtnText: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: s[2], backgroundColor: '#0F172A', paddingVertical: s[3], paddingHorizontal: s[5], borderRadius: 0 },
  createBtnDisabled: { opacity: 0.7 },
  createBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 14 },

  empty: { alignItems: 'center', padding: s[12], gap: s[3] },
  emptyTitle: { color: '#1E293B' },
  emptyText: { color: '#94A3B8', textAlign: 'center' },
  emptyActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: s[3], marginTop: s[2] },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: s[5], width: '100%' },
  card: {
    flexBasis: '31%' as any,
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 320,
    maxWidth: 380,
    backgroundColor: '#FFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: s[5],
  } as any,
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: s[3] },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: s[3] },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', flex: 1 },
  cardActions: { flexDirection: 'row', gap: s[1] },
  iconBtn: { padding: s[2] },
  cardDesc: { fontSize: 14, color: '#64748B', marginBottom: s[3] },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: s[2], marginBottom: s[4] },
  meta: { fontSize: 12, color: '#94A3B8' },
  cardLink: {},
  cardLinkText: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
});
