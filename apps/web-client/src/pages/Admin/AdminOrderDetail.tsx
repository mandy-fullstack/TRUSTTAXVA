import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { api } from '../../services/api';
import { H1, H3, Card, Text, Badge, Button, Input } from '@trusttax/ui';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, FileText, Clock, Save, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminOrderDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showAlert } = useAuth();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (!id) return;
                const data = await api.adminGetOrderById(id);
                setOrder(data);
                setStatus(data.status);
                setNotes(data.notes || '');
            } catch (error) {
                console.error('Failed to fetch order details:', error);
                showAlert({
                    title: 'Error',
                    message: 'Could not load order details',
                    variant: 'error'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleUpdate = async () => {
        try {
            if (!id) return;
            setSubmitting(true);
            await api.adminUpdateOrderStatus(id, status, notes);
            showAlert({
                title: t('admin.success', 'Success'),
                message: t('admin.order_updated_success', 'Order updated successfully'),
                variant: 'success'
            });
        } catch (error) {
            console.error('Failed to update order:', error);
            showAlert({
                title: 'Error',
                message: 'Failed to update order',
                variant: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'warning';
            case 'SUBMITTED': return 'primary';
            case 'REJECTED': return 'error';
            default: return 'info';
        }
    };

    if (loading) {
        return (
            <Layout>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            </Layout>
        );
    }

    if (!order) return null;

    const statusOptions = ['IN_PROGRESS', 'SUBMITTED', 'PENDING', 'COMPLETED', 'REJECTED'];

    return (
        <Layout>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <TouchableOpacity onPress={() => navigate('/admin/orders')} style={styles.backBtn}>
                    <ArrowLeft size={20} color="#2563EB" />
                    <Text style={styles.backText}>{t('admin.back_to_orders', 'Back to Orders')}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <View>
                        <H1>{t('admin.order_details', 'Order Details')}</H1>
                        <Text style={styles.orderId}>ID: {order.id}</Text>
                    </View>
                    <Badge label={order.status} variant={getStatusVariant(order.status) as any} />
                </View>

                <View style={styles.grid}>
                    {/* Main Content */}
                    <View style={styles.mainColumn}>
                        {/* Status Management */}
                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Clock size={20} color="#2563EB" />
                                <H3>{t('admin.status_management', 'Status & Progress')}</H3>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t('admin.update_status', 'Order Status')}</Text>
                                <View style={styles.statusGrid}>
                                    {statusOptions.map((opt) => (
                                        <TouchableOpacity
                                            key={opt}
                                            onPress={() => setStatus(opt)}
                                            style={[
                                                styles.statusBadge,
                                                status === opt && styles.statusBadgeActive
                                            ]}
                                        >
                                            <Text style={[
                                                styles.statusBadgeText,
                                                status === opt && styles.statusBadgeTextActive
                                            ]}>{opt}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <View style={styles.labelRow}>
                                    <MessageSquare size={16} color="#64748B" />
                                    <Text style={styles.label}>{t('admin.admin_notes', 'Internal Admin Notes')}</Text>
                                </View>
                                <Input
                                    multiline
                                    numberOfLines={4}
                                    placeholder={t('admin.notes_placeholder', 'Add notes about this order...')}
                                    value={notes}
                                    onChangeText={setNotes}
                                    style={styles.notesInput}
                                />
                                <Text style={styles.hint}>{t('admin.notes_hint', 'These notes are only visible to administrators.')}</Text>
                            </View>

                            <Button
                                title={t('admin.save_changes', 'Save Changes')}
                                onPress={handleUpdate}
                                loading={submitting}
                                Icon={Save}
                                style={styles.saveBtn}
                            />
                        </Card>

                        {/* Order Progress / Data */}
                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <FileText size={20} color="#2563EB" />
                                <H3>{t('admin.order_data', 'Submission Data')}</H3>
                            </View>
                            {order.progress?.length > 0 ? (
                                order.progress.map((step: any, idx: number) => (
                                    <View key={step.id} style={styles.stepSection}>
                                        <Text style={styles.stepTitle}>Step {idx + 1}: {step.stepIndex === 0 ? 'Personal Info' : step.stepIndex === 1 ? 'Income Sources' : 'Submission'}</Text>
                                        <View style={styles.dataGrid}>
                                            {Object.entries(step.data || {}).map(([key, value]: [string, any]) => (
                                                <View key={key} style={styles.dataItem}>
                                                    <Text style={styles.dataKey}>{key}:</Text>
                                                    <Text style={styles.dataValue}>
                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noData}>{t('admin.no_progress_data', 'No submission data available.')}</Text>
                            )}
                        </Card>

                        {/* Documents Section */}
                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <FileText size={20} color="#2563EB" />
                                <H3>{t('admin.documents', 'Attached Documents')}</H3>
                            </View>
                            {order.documents?.length > 0 ? (
                                order.documents.map((doc: any) => (
                                    <View key={doc.id} style={styles.stepSection}>
                                        <View style={styles.infoRow}>
                                            <View>
                                                <Text style={styles.infoValue}>{doc.title}</Text>
                                                <Text style={styles.infoLabel}>{doc.type}</Text>
                                            </View>
                                            <Button
                                                title={t('common.view', 'View')}
                                                variant="outline"
                                                size="sm"
                                                onPress={() => window.open(doc.url, '_blank')}
                                            />
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noData}>{t('admin.no_documents', 'No documents uploaded for this order.')}</Text>
                            )}
                        </Card>
                    </View>

                    {/* Sidebar */}
                    <View style={styles.sideColumn}>
                        {/* Client Card */}
                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <User size={20} color="#2563EB" />
                                <H3>{t('admin.client_info', 'Client')}</H3>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('common.name', 'Name')}</Text>
                                <Text style={styles.infoValue}>{order.user?.name}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('common.email', 'Email')}</Text>
                                <Text style={styles.infoValue}>{order.user?.email}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('admin.registered_since', 'Client since')}</Text>
                                <Text style={styles.infoValue}>{new Date(order.user?.createdAt).toLocaleDateString()}</Text>
                            </View>
                            <Button
                                title={t('admin.view_client_profile', 'View Profile')}
                                variant="ghost"
                                onPress={() => { }}
                                style={styles.fullWidthBtn}
                            />
                        </Card>

                        {/* Service Card */}
                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <FileText size={20} color="#2563EB" />
                                <H3>{t('admin.service_info', 'Service')}</H3>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('admin.type', 'Type')}</Text>
                                <Text style={styles.infoValue}>{order.service?.name}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('admin.category', 'Category')}</Text>
                                <Badge label={order.service?.category} variant="info" />
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('admin.price', 'Price')}</Text>
                                <Text style={styles.infoValue}>${order.total}</Text>
                            </View>
                        </Card>
                    </View>
                </View>
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 24, paddingBottom: 60, maxWidth: 1200, alignSelf: 'center', width: '100%' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 100 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
    backText: { color: '#2563EB', fontWeight: '600' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
    orderId: { color: '#64748B', marginTop: 4, fontFamily: 'monospace' },
    grid: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
    mainColumn: { flex: 2, minWidth: 350, gap: 24 },
    sideColumn: { flex: 1, minWidth: 300, gap: 24 },
    card: { padding: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statusBadge: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF'
    },
    statusBadgeActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB'
    },
    statusBadgeText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
    statusBadgeTextActive: { color: '#FFFFFF' },
    notesInput: {
        minHeight: 120,
        textAlignVertical: 'top',
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 0
    } as any,
    hint: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
    saveBtn: { marginTop: 8 },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    infoLabel: { fontSize: 14, color: '#64748B' },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
    fullWidthBtn: { width: '100%', marginTop: 8 },
    stepSection: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    stepTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 12 },
    dataGrid: { gap: 8 },
    dataItem: { flexDirection: 'row', gap: 8 },
    dataKey: { fontSize: 13, color: '#94A3B8', width: 120 },
    dataValue: { fontSize: 13, color: '#1E293B', fontWeight: '500', flex: 1 },
    noData: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic' }
});
