import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Modal } from 'react-native';
import { H2, H4, Text } from '@trusttax/ui';
import { ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown, Edit, X } from 'lucide-react';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { AlertDialog } from '../../components/AlertDialog';

interface ServiceStep {
    id: string;
    title: string;
    description: string | null;
    formConfig?: any;
    formId?: string | null;
    orderIndex: number;
    form?: { id: string; name: string } | null;
}

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    originalPrice: number | null;
    steps: ServiceStep[];
}

export const ServiceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'steps'>('overview');

    // Step Editing
    const [editingStep, setEditingStep] = useState<ServiceStep | null>(null);
    const [isStepModalOpen, setIsStepModalOpen] = useState(false);
    const [stepFormData, setStepFormData] = useState({ title: '', description: '', formId: '' as string });
    const [forms, setForms] = useState<{ id: string; name: string }[]>([]);

    // Service Editing
    const [serviceFormData, setServiceFormData] = useState({
        name: '', description: '', category: '', price: '', originalPrice: ''
    });

    // Dialog states
    const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string; variant: 'success' | 'error' | 'info' | 'warning' }>({ 
        isOpen: false, 
        title: '', 
        message: '', 
        variant: 'info' 
    });
    const [confirmDeleteStep, setConfirmDeleteStep] = useState<{ isOpen: boolean; stepId: string | null }>({ isOpen: false, stepId: null });

    useEffect(() => {
        if (id) loadService();
    }, [id]);

    const loadService = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await api.getServiceDetails(id);
            setService(data);
            setServiceFormData({
                name: data.name,
                description: data.description,
                category: data.category,
                price: data.price.toString(),
                originalPrice: data.originalPrice?.toString() || ''
            });
        } catch (err: any) {
            setError(err.message || 'Failed to load service');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveService = async () => {
        if (!service || !id) return;
        try {
            await api.updateService(id, {
                name: serviceFormData.name,
                description: serviceFormData.description,
                category: serviceFormData.category,
                price: parseFloat(serviceFormData.price),
                originalPrice: parseFloat(serviceFormData.originalPrice) || undefined
            });
            setAlertDialog({ isOpen: true, title: 'Success', message: 'Service updated successfully', variant: 'success' });
            loadService();
        } catch (err: any) {
            setAlertDialog({ isOpen: true, title: 'Error', message: err.message || 'Failed to update service', variant: 'error' });
        }
    };

    const loadForms = async () => {
        try {
            const list = await api.getForms();
            setForms(Array.isArray(list) ? list.map((f: any) => ({ id: f.id, name: f.name })) : []);
        } catch {
            setForms([]);
        }
    };

    const handleOpenStepModal = (step: ServiceStep | null) => {
        setEditingStep(step);
        loadForms();
        if (step) {
            setStepFormData({
                title: step.title,
                description: step.description || '',
                formId: step.formId || ''
            });
        } else {
            setStepFormData({ title: '', description: '', formId: '' });
        }
        setIsStepModalOpen(true);
    };

    const handleSaveStep = async () => {
        if (!id) return;
        if (!stepFormData.formId?.trim()) {
            setAlertDialog({ isOpen: true, title: 'Warning', message: 'Selecciona un formulario. Crea o edita formularios en Forms.', variant: 'warning' });
            return;
        }
        try {
            const data = {
                title: stepFormData.title,
                description: stepFormData.description,
                formId: stepFormData.formId.trim()
            };
            if (editingStep) {
                await api.updateServiceStep(editingStep.id, data);
            } else {
                await api.createServiceStep(id, data);
            }
            setIsStepModalOpen(false);
            setAlertDialog({ isOpen: true, title: 'Success', message: 'Step saved successfully', variant: 'success' });
            loadService();
        } catch (err: any) {
            setAlertDialog({ isOpen: true, title: 'Error', message: (err as Error)?.message || 'Failed to save step', variant: 'error' });
        }
    };

    const handleDeleteStep = (stepId: string) => {
        setConfirmDeleteStep({ isOpen: true, stepId });
    };

    const confirmDeleteStepAction = async () => {
        if (!confirmDeleteStep.stepId) return;
        try {
            await api.deleteServiceStep(confirmDeleteStep.stepId);
            setConfirmDeleteStep({ isOpen: false, stepId: null });
            setAlertDialog({ isOpen: true, title: 'Success', message: 'Step deleted successfully', variant: 'success' });
            loadService();
        } catch (err: any) {
            setConfirmDeleteStep({ isOpen: false, stepId: null });
            setAlertDialog({ isOpen: true, title: 'Error', message: err.message || 'Failed to delete step', variant: 'error' });
        }
    };

    const handleMoveStep = async (index: number, direction: 'up' | 'down') => {
        if (!service) return;
        const steps = [...service.steps];
        if (direction === 'up' && index > 0) {
            [steps[index], steps[index - 1]] = [steps[index - 1], steps[index]];
        } else if (direction === 'down' && index < steps.length - 1) {
            [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
        } else {
            return;
        }

        // Optimistic update
        setService({ ...service, steps });

        try {
            const stepIds = steps.map(s => s.id);
            await api.reorderServiceSteps(stepIds);
        } catch (err) {
            loadService(); // Revert on error
            setAlertDialog({ isOpen: true, title: 'Error', message: 'Failed to reorder steps', variant: 'error' });
        }
    };

    if (loading) {
        return <Layout><View style={styles.center}><ActivityIndicator size="large" /></View></Layout>;
    }

    if (!service) {
        return <Layout><View style={styles.center}><Text>Service not found</Text></View></Layout>;
    }

    return (
        <Layout>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigate('/services')} style={styles.backButton}>
                        <ArrowLeft size={20} color="#64748B" />
                        <Text style={styles.backText}>Back to Services</Text>
                    </TouchableOpacity>
                    <H2>{service.name}</H2>
                </View>

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'steps' && styles.activeTab]}
                        onPress={() => setActiveTab('steps')}
                    >
                        <Text style={[styles.tabText, activeTab === 'steps' && styles.activeTabText]}>Process Steps ({service.steps.length})</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'overview' ? (
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Service Name</Text>
                        <TextInput style={styles.input} value={serviceFormData.name} onChangeText={t => setServiceFormData({ ...serviceFormData, name: t })} />

                        <Text style={styles.label}>Category</Text>
                        <TextInput style={styles.input} value={serviceFormData.category} onChangeText={t => setServiceFormData({ ...serviceFormData, category: t })} />

                        <Text style={styles.label}>Price</Text>
                        <TextInput style={styles.input} value={serviceFormData.price} onChangeText={t => setServiceFormData({ ...serviceFormData, price: t })} keyboardType="numeric" />

                        <Text style={styles.label}>Original Price (Sale View)</Text>
                        <TextInput style={styles.input} value={serviceFormData.originalPrice} onChangeText={t => setServiceFormData({ ...serviceFormData, originalPrice: t })} keyboardType="numeric" />

                        <Text style={styles.label}>Description</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={serviceFormData.description} onChangeText={t => setServiceFormData({ ...serviceFormData, description: t })} multiline />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveService}>
                            <Save size={18} color="#FFF" />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.stepsSection}>
                        {service.steps.map((step, index) => (
                            <View key={step.id} style={styles.stepCard}>
                                <View style={styles.stepHeader}>
                                    <View style={styles.stepOrderBadge}>
                                        <Text style={styles.stepOrderText}>{index + 1}</Text>
                                    </View>
                                    <View style={styles.stepInfo}>
                                        <Text style={styles.stepTitle}>{step.title}</Text>
                                        {step.description && <Text style={styles.stepDesc}>{step.description}</Text>}
                                    </View>
                                    <View style={styles.stepActions}>
                                        <TouchableOpacity onPress={() => handleMoveStep(index, 'up')} disabled={index === 0} style={{ opacity: index === 0 ? 0.3 : 1 }}>
                                            <ChevronUp size={20} color="#64748B" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleMoveStep(index, 'down')} disabled={index === service.steps.length - 1} style={{ opacity: index === service.steps.length - 1 ? 0.3 : 1 }}>
                                            <ChevronDown size={20} color="#64748B" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleOpenStepModal(step)} style={{ marginLeft: 8 }}>
                                            <Edit size={18} color="#2563EB" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteStep(step.id)} style={{ marginLeft: 8 }}>
                                            <Trash2 size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addStepButton} onPress={() => handleOpenStepModal(null)}>
                            <Plus size={20} color="#FFF" />
                            <Text style={styles.addStepText}>Add Step</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step Modal */}
                <Modal visible={isStepModalOpen} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <H4 style={styles.modalTitle}>{editingStep ? 'Edit Step' : 'New Step'}</H4>
                                <TouchableOpacity onPress={() => setIsStepModalOpen(false)} style={styles.modalClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                                    <X size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalScrollBody} contentContainerStyle={styles.modalScrollInner} keyboardShouldPersistTaps="handled">
                                <Text style={styles.label}>Title</Text>
                                <TextInput style={styles.input} value={stepFormData.title} onChangeText={t => setStepFormData({ ...stepFormData, title: t })} />

                                <Text style={styles.label}>Description</Text>
                                <TextInput style={styles.input} value={stepFormData.description} onChangeText={t => setStepFormData({ ...stepFormData, description: t })} />

                                <Text style={styles.label}>Formulario</Text>
                                <View style={styles.selectWrap}>
                                    <select
                                        value={stepFormData.formId}
                                        onChange={(e) => setStepFormData({ ...stepFormData, formId: e.target.value })}
                                        style={styles.select as any}
                                        aria-label="Formulario del paso"
                                    >
                                        <option value="">— Selecciona un formulario —</option>
                                        {forms.map((f) => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </View>
                                <View style={styles.hintRow}>
                                    <Text style={styles.hint}>Crea o edita formularios de forma visual en </Text>
                                    <TouchableOpacity onPress={() => typeof window !== 'undefined' && window.open('/forms', '_blank')}>
                                        <Text style={styles.link}>Forms</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.hint}> y asígnalos aquí.</Text>
                                </View>
                                {stepFormData.formId && (
                                    <TouchableOpacity
                                        style={styles.viewFormLink}
                                        onPress={() => typeof window !== 'undefined' && window.open(`/forms/${stepFormData.formId}`, '_blank')}
                                    >
                                        <Text style={styles.link}>Ver formulario →</Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                            <View style={styles.modalFooter}>
                                <TouchableOpacity onPress={() => setIsStepModalOpen(false)} style={styles.cancelButton}>
                                    <Text>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveStep} style={[styles.saveButton, { marginTop: 0 }]}>
                                    <Text style={styles.saveButtonText}>Save Step</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </ScrollView>

            {/* Confirm Dialog for Step Deletion */}
            <ConfirmDialog
                isOpen={confirmDeleteStep.isOpen}
                onClose={() => setConfirmDeleteStep({ isOpen: false, stepId: null })}
                onConfirm={confirmDeleteStepAction}
                title="Delete Step"
                message="Are you sure you want to delete this step? This action cannot be undone."
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
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 32, width: '100%', maxWidth: 900, alignSelf: 'center' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
    header: { marginBottom: 24 },
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
    backText: { color: '#64748B', fontSize: 14 },

    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 24 },
    tab: { paddingVertical: 12, paddingHorizontal: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#2563EB' },
    tabText: { color: '#64748B', fontWeight: '500' },
    activeTabText: { color: '#2563EB' },

    formSection: { maxWidth: 600 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginTop: 16 },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 0, padding: 12, fontSize: 16, color: '#0F172A', backgroundColor: '#FFF' },
    textArea: { minHeight: 100, textAlignVertical: 'top', fontSize: 16 },
    saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0F172A', padding: 12, borderRadius: 0, marginTop: 24 },
    saveButtonText: { color: '#FFF', fontWeight: '600' },

    stepsSection: { gap: 16 },
    stepCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 0, borderWidth: 1, borderColor: '#E2E8F0' },
    stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    stepOrderBadge: { width: 32, height: 32, borderRadius: 0, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    stepOrderText: { fontWeight: '700', color: '#64748B' },
    stepInfo: { flex: 1 },
    stepTitle: { fontWeight: '600', fontSize: 16 },
    stepDesc: { color: '#64748B', fontSize: 14 },
    stepActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },

    addStepButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', padding: 16, borderRadius: 0, marginTop: 16 },
    addStepText: { color: '#64748B', fontWeight: '600' },

    modalOverlay: {
        flex: 1,
        width: '100%',
        minHeight: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    } as any,
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        width: '100%',
        maxWidth: 500,
        maxHeight: '90%',
        overflow: 'hidden',
        flexDirection: 'column',
    } as any,
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: { margin: 0, flex: 1 },
    modalClose: { padding: 8 },
    modalScrollBody: { flex: 1, minHeight: 0 } as any,
    modalScrollInner: { padding: 24, paddingBottom: 24 },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    selectWrap: { width: '100%', marginBottom: 8 },
    select: { width: '100%', padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 0, backgroundColor: '#FFF', color: '#0F172A' },
    hintRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 12, gap: 4 },
    hint: { fontSize: 13, color: '#64748B' },
    link: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
    viewFormLink: { marginTop: 12, paddingVertical: 4 },
    cancelButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 0 },
});
