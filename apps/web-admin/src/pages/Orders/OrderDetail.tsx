import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { api } from '../../services/api';
import { H1, Text } from '@trusttax/ui';
import { ArrowLeft, User, FileText, Clock, Save, AlertCircle } from 'lucide-react';

// Custom local components for web-admin consistency
const Card = ({ children, style }: any) => <View style={[styles.card, style]}>{children}</View>;
const Badge = ({ label, style }: any) => (
    <View style={[styles.badgeBase, style]}>
        <Text style={styles.badgeText}>{label}</Text>
    </View>
);
const Button = ({ title, onPress, loading, Icon, style, variant = 'primary' }: any) => (
    <TouchableOpacity
        style={[
            styles.buttonBase,
            variant === 'outline' && styles.buttonOutline,
            style
        ]}
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.7}
    >
        {Icon && <Icon size={18} color={variant === 'outline' ? '#0F172A' : "#FFF"} />}
        <Text style={[styles.buttonText, variant === 'outline' && styles.buttonTextOutline]}>{title}</Text>
    </TouchableOpacity>
);

export const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [newUpdate, setNewUpdate] = useState({ title: '', description: '' });
    const [postingUpdate, setPostingUpdate] = useState(false);

    // New Approval State
    const [newApproval, setNewApproval] = useState({ type: 'DOCUMENT', title: '', description: '' });
    const [postingApproval, setPostingApproval] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await api.getOrderDetails(id);
            setOrder(data);
            setStatus(data.status);
            setNotes(data.notes || '');
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!id) return;
        try {
            setUpdating(true);
            await api.updateOrderStatus(id, status, notes);
            await fetchOrder();
        } catch (error) {
            console.error('Failed to update order:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleAddUpdate = async () => {
        if (!id || !newUpdate.title.trim()) return;
        try {
            setPostingUpdate(true);
            await api.addOrderTimelineEntry(id, newUpdate.title, newUpdate.description);
            setNewUpdate({ title: '', description: '' });
            await fetchOrder();
        } catch (error) {
            console.error('Failed to add update:', error);
        } finally {
            setPostingUpdate(false);
        }
    };

    const handleCreateApproval = async () => {
        if (!id || !newApproval.title.trim()) return;
        try {
            setPostingApproval(true);
            await api.createOrderApproval(id, newApproval);
            setNewApproval({ type: 'DOCUMENT', title: '', description: '' });
            await fetchOrder();
            Alert.alert('Éxito', 'Solicitud de aprobación enviada al cliente.');
        } catch (error) {
            console.error('Failed to create approval:', error);
        } finally {
            setPostingApproval(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0F172A" />
                </View>
            </Layout>
        );
    }

    if (!order) {
        return (
            <Layout>
                <View style={styles.loadingContainer}>
                    <Text>Order not found.</Text>
                </View>
            </Layout>
        );
    }

    return (
        <Layout>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigate('/orders')}>
                    <ArrowLeft size={20} color="#2563EB" />
                    <Text style={styles.backText}>Back to Orders</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <View>
                        <H1>{order.service?.name}</H1>
                        <Text style={styles.orderId}>{order.displayId || `ID: ${order.id}`}</Text>
                    </View>
                    <Badge label={order.status} />
                </View>

                <View style={styles.grid}>
                    <View style={styles.mainColumn}>
                        {/* Approvals Management */}
                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <AlertCircle size={20} color="#64748B" />
                                <Text style={styles.label}>Solicitudes de Aprobación</Text>
                            </View>

                            {order.approvals?.length > 0 ? (
                                <View style={styles.approvalList}>
                                    {order.approvals.map((approval: any) => (
                                        <View key={approval.id} style={styles.approvalItem}>
                                            <View style={styles.approvalHeader}>
                                                <Text style={styles.approvalTitle}>{approval.title}</Text>
                                                <View style={[
                                                    styles.statusDot,
                                                    approval.status === 'APPROVED' ? styles.dotGreen :
                                                        approval.status === 'REJECTED' ? styles.dotRed : styles.dotYellow
                                                ]} />
                                                <Text style={styles.approvalStatusText}>{approval.status}</Text>
                                            </View>
                                            <Text style={styles.approvalDesc}>{approval.description}</Text>
                                            {approval.clientNote && (
                                                <View style={styles.clientNoteBox}>
                                                    <Text style={styles.clientNoteLabel}>Respuesta del cliente:</Text>
                                                    <Text style={styles.clientNoteText}>{approval.clientNote}</Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noData}>No hay solicitudes de aprobación pendientes.</Text>
                            )}

                            <View style={styles.newUpdateForm}>
                                <Text style={[styles.label, { marginTop: 16 }]}>Nueva Solicitud de Aprobación</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Título (ej: Revisión de Cotización Final)"
                                    value={newApproval.title}
                                    onChangeText={(t) => setNewApproval({ ...newApproval, title: t })}
                                />
                                <TextInput
                                    style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                                    placeholder="Instrucciones para el cliente..."
                                    multiline
                                    value={newApproval.description}
                                    onChangeText={(t) => setNewApproval({ ...newApproval, description: t })}
                                />
                                <Button
                                    title={postingApproval ? 'Enviando...' : 'Pedir Aprobación'}
                                    onPress={handleCreateApproval}
                                    loading={postingApproval}
                                    style={{ marginTop: 8 }}
                                />
                            </View>
                        </Card>

                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <User size={20} color="#64748B" />
                                <Text style={styles.label}>Información del Cliente</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Nombre</Text>
                                <Text style={styles.infoValue}>{order.user?.name || 'Unknown'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{order.user?.email}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Fecha de Orden</Text>
                                <Text style={styles.infoValue}>{new Date(order.createdAt).toLocaleString()}</Text>
                            </View>
                        </Card>

                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <FileText size={20} color="#64748B" />
                                <Text style={styles.label}>Detalles Enviados</Text>
                            </View>
                            {order.progress?.length > 0 ? (
                                order.progress.map((step: any, idx: number) => (
                                    <View key={idx} style={styles.stepSection}>
                                        <Text style={styles.stepTitle}>Paso {step.stepIndex + 1}</Text>
                                        <View style={styles.dataGrid}>
                                            {step.data && Object.entries(step.data).map(([key, val]: [string, any]) => (
                                                <View key={key} style={styles.dataItem}>
                                                    <Text style={styles.dataKey}>{key}:</Text>
                                                    <Text style={styles.dataValue}>{String(val)}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noData}>Aún no se han enviado datos de formulario.</Text>
                            )}
                        </Card>

                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Clock size={20} color="#64748B" />
                                <Text style={styles.label}>Línea de Tiempo (Cliente)</Text>
                            </View>
                            <View style={styles.timeline}>
                                {order.timeline?.length > 0 ? (
                                    order.timeline.map((t: any, idx: number) => (
                                        <View key={t.id} style={styles.timelineItem}>
                                            <View style={styles.timelinePoint} />
                                            {idx < order.timeline.length - 1 && <View style={styles.timelineLine} />}
                                            <View style={styles.timelineContent}>
                                                <Text style={styles.timelineTitle}>{t.title}</Text>
                                                <Text style={styles.timelineDesc}>{t.description}</Text>
                                                <Text style={styles.timelineDate}>{new Date(t.createdAt).toLocaleString()}</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noData}>Aún no hay hitos registrados.</Text>
                                )}
                            </View>

                            <View style={styles.newUpdateForm}>
                                <Text style={[styles.label, { marginTop: 16 }]}>Nueva actualización para el cliente</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Título (ej: Documentos recibidos)"
                                    value={newUpdate.title}
                                    onChangeText={(t) => setNewUpdate({ ...newUpdate, title: t })}
                                />
                                <TextInput
                                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="Descripción corta..."
                                    multiline
                                    value={newUpdate.description}
                                    onChangeText={(t) => setNewUpdate({ ...newUpdate, description: t })}
                                />
                                <Button
                                    title={postingUpdate ? 'Publicando...' : 'Añadir Hito'}
                                    onPress={handleAddUpdate}
                                    loading={postingUpdate}
                                    style={{ marginTop: 8 }}
                                />
                            </View>
                        </Card>
                    </View>

                    <View style={styles.sideColumn}>
                        <Card style={[styles.card, { backgroundColor: '#F8FAFC' }]}>
                            <View style={styles.cardHeader}>
                                <Save size={20} color="#64748B" />
                                <Text style={styles.label}>Status Maestro</Text>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Estado Actual</Text>
                                <View style={styles.statusGrid}>
                                    {['SUBMITTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
                                        <TouchableOpacity
                                            key={s}
                                            style={[
                                                styles.statusBadge,
                                                status === s && styles.statusBadgeActive
                                            ]}
                                            onPress={() => setStatus(s)}
                                        >
                                            <Text style={[
                                                styles.statusBadgeText,
                                                status === s && styles.statusBadgeTextActive
                                            ]}>{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <Button
                                title={updating ? 'Guardando...' : 'Cambiar Estado'}
                                Icon={Save}
                                onPress={handleUpdate}
                                loading={updating}
                                style={styles.fullWidthBtn}
                            />
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
    card: { padding: 24, borderRadius: 0, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
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
        backgroundColor: '#0F172A',
        borderColor: '#0F172A'
    },
    statusBadgeText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
    statusBadgeTextActive: { color: '#FFFFFF' },
    fullWidthBtn: { width: '100%', marginTop: 8 },

    approvalList: { gap: 12, marginBottom: 20 },
    approvalItem: { padding: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
    approvalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    approvalTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    dotYellow: { backgroundColor: '#EAB308' },
    dotGreen: { backgroundColor: '#22C55E' },
    dotRed: { backgroundColor: '#EF4444' },
    approvalStatusText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
    approvalDesc: { fontSize: 13, color: '#475569' },
    clientNoteBox: { marginTop: 12, padding: 8, backgroundColor: '#EFF6FF', borderLeftWidth: 3, borderLeftColor: '#3B82F6' },
    clientNoteLabel: { fontSize: 11, fontWeight: '700', color: '#1E40AF', marginBottom: 2 },
    clientNoteText: { fontSize: 12, color: '#1E40AF', fontStyle: 'italic' },

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
    noData: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic' },
    badgeBase: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#0F172A', borderRadius: 0 },
    badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
    buttonBase: { padding: 12, backgroundColor: '#0F172A', borderRadius: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#0F172A' },
    buttonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
    buttonTextOutline: { color: '#0F172A' },

    timeline: { paddingLeft: 8, marginTop: 10 },
    timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 24, minHeight: 60 },
    timelinePoint: { width: 12, height: 12, borderRadius: 0, backgroundColor: '#3B82F6', marginTop: 4, zIndex: 1 },
    timelineLine: { position: 'absolute', left: 5, top: 16, width: 2, height: '100%', backgroundColor: '#E2E8F0' },
    timelineContent: { flex: 1 },
    timelineTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    timelineDesc: { fontSize: 14, color: '#64748B', marginTop: 4 },
    timelineDate: { fontSize: 12, color: '#94A3B8', marginTop: 6 },

    newUpdateForm: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 24 },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        borderRadius: 0,
        backgroundColor: '#F8FAFC',
        marginBottom: 12,
        fontSize: 14,
        color: '#0F172A'
    }
});
