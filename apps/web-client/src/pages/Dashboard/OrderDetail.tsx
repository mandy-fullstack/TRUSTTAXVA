import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { H1, H4, Text, Card, Badge, Button } from '@trusttax/ui';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { useTranslation } from 'react-i18next';

const ProgressStepper = ({ steps, currentStepIndex }: { steps: any[], currentStepIndex: number }) => {
    return (
        <View style={styles.stepperContainer}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;
                return (
                    <View key={step.id} style={styles.stepItem}>
                        <View style={[
                            styles.stepCircle,
                            isCompleted && styles.stepCircleCompleted,
                            isActive && styles.stepCircleActive
                        ]}>
                            {isCompleted ? <CheckCircle size={16} color="#FFF" /> : <Text style={[styles.stepNumber, (isActive || isCompleted) && styles.textWhite]}>{index + 1}</Text>}
                        </View>
                        <Text style={[styles.stepTitle, isActive && styles.stepTitleActive]}>{step.title}</Text>
                        {index < steps.length - 1 && <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />}
                    </View>
                );
            })}
        </View>
    );
};

export const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [respondingId, setRespondingId] = useState<string | null>(null);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await api.getOrderById(id);
            setOrder(data);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (approvalId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            setRespondingId(approvalId);
            await api.respondToApproval(approvalId, status);
            await fetchOrder();
        } catch (error) {
            console.error('Failed to respond to approval:', error);
            Alert.alert('Error', 'No se pudo procesar la respuesta.');
        } finally {
            setRespondingId(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Order not found.</Text>
            </View>
        );
    }

    const serviceSteps = order.service?.steps || [];
    const currentStepIndex = order.progress?.length || 0;

    return (
        <Layout>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigate('/dashboard')}>
                    <ArrowLeft size={20} color="#2563EB" />
                    <Text style={styles.backText}>{t('common.back', 'Back')}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <View>
                        <H1>{order.service?.name}</H1>
                        <View style={styles.headerSub}>
                            <Text style={styles.orderId}>{order.displayId || `ID: ${order.id}`}</Text>
                            <View style={styles.dot} />
                            <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                        </View>
                    </View>
                    <Badge label={order.status} variant="primary" />
                </View>

                {/* Stepper Section */}
                <Card style={styles.stepperCard}>
                    <H4 style={styles.sectionTitle}>Progreso de tu Solicitud</H4>
                    <ProgressStepper steps={serviceSteps} currentStepIndex={currentStepIndex} />
                </Card>

                <View style={styles.grid}>
                    <View style={styles.mainColumn}>
                        {/* Approvals Section */}
                        {order.approvals?.length > 0 && order.approvals.some((a: any) => a.status === 'PENDING') && (
                            <Card style={styles.approvalCard}>
                                <View style={styles.cardHeader}>
                                    <AlertCircle size={20} color="#E11D48" />
                                    <Text style={[styles.label, { color: '#E11D48' }]}>Acción Requerida: Aprobaciones Pendientes</Text>
                                </View>
                                {order.approvals.filter((a: any) => a.status === 'PENDING').map((approval: any) => (
                                    <View key={approval.id} style={styles.approvalItem}>
                                        <Text style={styles.approvalTitle}>{approval.title}</Text>
                                        <Text style={styles.approvalDesc}>{approval.description}</Text>
                                        <View style={styles.approvalActions}>
                                            <Button
                                                title="Aprobar"
                                                onPress={() => handleApproval(approval.id, 'APPROVED')}
                                                loading={respondingId === approval.id}
                                                style={styles.actionBtn}
                                            />
                                            <Button
                                                title="Rechazar"
                                                variant="outline"
                                                onPress={() => handleApproval(approval.id, 'REJECTED')}
                                                loading={respondingId === approval.id}
                                                style={styles.actionBtn}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </Card>
                        )}

                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Clock size={20} color="#64748B" />
                                <Text style={styles.label}>{t('order.timeline', 'Historial de Actualizaciones')}</Text>
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
                                    <Text style={styles.noData}>{t('order.no_updates', 'No hay actualizaciones aún.')}</Text>
                                )}
                            </View>
                        </Card>

                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <FileText size={20} color="#64748B" />
                                <Text style={styles.label}>{t('order.submission_details', 'Resumen de Datos Enviados')}</Text>
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
                                <Text style={styles.noData}>Aún no has completado formularios para esta orden.</Text>
                            )}
                        </Card>
                    </View>

                    <View style={styles.sideColumn}>
                        <Card style={[styles.card, { backgroundColor: '#F8FAFC' }]}>
                            <Text style={styles.label}>{t('order.summary', 'Resumen de Orden')}</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('order.status', 'Estado')}</Text>
                                <Badge label={order.status} variant="primary" />
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('order.total', 'Costo Total')}</Text>
                                <Text style={styles.infoValue}>${Number(order.total || 0).toFixed(2)}</Text>
                            </View>
                        </Card>

                        <Card style={[styles.card, { marginTop: 20 }]}>
                            <View style={styles.cardHeader}>
                                <MessageSquare size={18} color="#64748B" />
                                <Text style={styles.label}>Soporte</Text>
                            </View>
                            <Text style={styles.supportText}>¿Tienes dudas sobre tu solicitud? Contacta a nuestro equipo de preparadores profesionales.</Text>
                            <Button title="Enviar Mensaje" variant="outline" onPress={() => navigate('/contact')} style={{ marginTop: 12 }} />
                        </Card>
                    </View>
                </View>
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { padding: 24, paddingBottom: 60, maxWidth: 1200, alignSelf: 'center', width: '100%' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 400 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
    backText: { color: '#2563EB', fontWeight: '600' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
    headerSub: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
    orderId: { color: '#64748B', fontFamily: 'monospace', fontSize: 13 },
    orderDate: { color: '#64748B', fontSize: 13 },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' },

    stepperCard: { padding: 24, marginBottom: 24, borderRadius: 0, borderWidth: 1, borderColor: '#E2E8F0' },
    sectionTitle: { marginBottom: 24, color: '#0F172A' },
    stepperContainer: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 10, position: 'relative' },
    stepItem: { flex: 1, alignItems: 'center', gap: 8, position: 'relative' },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E2E8F0', zIndex: 1 },
    stepCircleActive: { backgroundColor: '#FFFFFF', borderColor: '#2563EB' },
    stepCircleCompleted: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    stepNumber: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    stepTitle: { fontSize: 11, fontWeight: '600', color: '#64748B', textAlign: 'center' },
    stepTitleActive: { color: '#2563EB' },
    stepLine: { position: 'absolute', height: 2, backgroundColor: '#F1F5F9', top: 15, left: '60%', width: '80%', zIndex: 0 },
    stepLineCompleted: { backgroundColor: '#2563EB' },
    textWhite: { color: '#FFF' },

    grid: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
    mainColumn: { flex: 2, minWidth: 350, gap: 24 },
    sideColumn: { flex: 1, minWidth: 300, gap: 24 },
    card: { padding: 24, borderRadius: 0, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#334155' },

    approvalCard: { padding: 24, marginBottom: 24, backgroundColor: '#FFF1F2', borderColor: '#FECDD3', borderLeftWidth: 4, borderLeftColor: '#E11D48' },
    approvalItem: { marginTop: 16, padding: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FECDD3' },
    approvalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
    approvalDesc: { fontSize: 14, color: '#475569', marginBottom: 16 },
    approvalActions: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1 },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
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
    dataGrid: { gap: 8 },
    dataItem: { flexDirection: 'row', gap: 8 },
    dataKey: { fontSize: 13, color: '#94A3B8', width: 120 },
    dataValue: { fontSize: 13, color: '#1E293B', fontWeight: '500', flex: 1 },
    noData: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic' },
    supportText: { fontSize: 13, color: '#64748B', lineHeight: 20 },

    timeline: { paddingLeft: 8, marginTop: 10 },
    timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 24, minHeight: 60 },
    timelinePoint: { width: 12, height: 12, borderRadius: 0, backgroundColor: '#3B82F6', marginTop: 4, zIndex: 1 },
    timelineLine: { position: 'absolute', left: 5, top: 16, width: 2, height: '100%', backgroundColor: '#E2E8F0' },
    timelineContent: { flex: 1 },
    timelineTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    timelineDesc: { fontSize: 14, color: '#64748B', marginTop: 4 },
    timelineDate: { fontSize: 12, color: '#94A3B8', marginTop: 6 },
});
