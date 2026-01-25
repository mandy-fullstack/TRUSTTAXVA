import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Layout } from '../components/Layout';
import { CheckCircle, AlertCircle, FileText, LayoutDashboard, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, H1, H4, Subtitle, Text, Button, StatsCard, Badge } from '@trusttax/ui';
import { useTranslation } from 'react-i18next';

export const DashboardPage = () => {
    const { t } = useTranslation();
    const { user, isLoading: authLoading, error: authError, clearError } = useAuth();

    if (authLoading) {
        return (
            <Layout>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    {authError && (
                        <Text style={styles.errorText}>{authError}</Text>
                    )}
                </View>
            </Layout>
        );
    }

    if (authError && !user) {
        return (
            <Layout>
                <View style={styles.center}>
                    <AlertCircle size={48} color="#EF4444" />
                    <H4 style={{ marginTop: 16, color: '#EF4444' }}>{t('dashboard.unable_load', 'Unable to Load Dashboard')}</H4>
                    <Text style={styles.errorText}>{authError}</Text>
                    <Button
                        title={t('common.retry', 'Retry')}
                        icon={<RefreshCw size={18} color="#FFFFFF" />}
                        onPress={() => {
                            clearError();
                            window.location.reload();
                        }}
                        style={{ marginTop: 24 }}
                    />
                </View>
            </Layout>
        );
    }

    const userName = user?.name || 'Client';
    const orders = (user as any)?.orders || [];
    const pendingInvoices = (user as any)?.invoices || [];

    return (
        <Layout>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.hero}>
                    <View>
                        <H1>{t('dashboard.welcome', 'Welcome')}, {userName}</H1>
                        <Subtitle>{t('dashboard.subtitle', 'Your professional tax workspace')}</Subtitle>
                    </View>
                    <View style={styles.heroActions}>
                        <Button
                            title={t('dashboard.new_order', 'New Order')}
                            variant="primary"
                            onPress={() => { }}
                        />
                        <Button
                            title={t('dashboard.upload_docs', 'Upload Documents')}
                            variant="outline"
                            icon={<FileText size={18} color="#2563EB" />}
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Activity Overview */}
                <View style={styles.grid}>
                    <View style={styles.gridCol}>
                        <H4 style={styles.gridTitle}>{t('dashboard.overview', 'Overview')}</H4>
                        <View style={styles.statsRow}>
                            <StatsCard
                                label={t('dashboard.total_orders', 'Total Orders')}
                                value={orders.length.toString()}
                                trend
                                trendValue={t('dashboard.live', 'Live')}
                                trendColor="#64748B"
                                style={styles.flex1}
                            />
                            <StatsCard
                                label={t('dashboard.action_required', 'Action Required')}
                                value={pendingInvoices.length.toString()}
                                trend
                                trendValue={pendingInvoices.length > 0 ? t('dashboard.urgent', "Urgent") : t('dashboard.none', "None")}
                                trendColor={pendingInvoices.length > 0 ? "#EF4444" : "#10B981"}
                                style={styles.flex1}
                            />
                        </View>
                    </View>

                    {/* Recent Orders */}
                    <View style={styles.gridCol}>
                        <H4 style={styles.gridTitle}>{t('dashboard.recent_orders', 'Recent Orders')}</H4>
                        <Card padding="none" elevated>
                            {orders.length > 0 ? (
                                orders.map((order: any, i: number) => (
                                    <View key={order.id} style={[styles.orderItem, i === orders.length - 1 && styles.noBorder]}>
                                        <View style={styles.orderInfo}>
                                            <View style={styles.orderIconWrapper}>
                                                <LayoutDashboard size={18} color="#2563EB" />
                                            </View>
                                            <View>
                                                <Text style={styles.orderText}>{order.service?.name || 'Tax Service'}</Text>
                                                <Text style={styles.orderSubtext}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                                            </View>
                                        </View>
                                        <Badge label={order.status} variant="primary" />
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <CheckCircle size={32} color="#10B981" />
                                    <Text style={styles.emptyText}>{t('dashboard.no_orders', "You don't have any active orders yet.")}</Text>
                                    <Button title={t('common.browse_services', "Browse Services")} variant="outline" style={{ marginTop: 16 }} />
                                </View>
                            )}
                        </Card>
                    </View>
                </View>

                {/* Pending Payments */}
                {pendingInvoices.length > 0 && (
                    <View style={{ marginTop: 40 }}>
                        <H4 style={styles.gridTitle}>{t('dashboard.pending_payments', 'Pending Payments')}</H4>
                        <Card padding="none" elevated>
                            {pendingInvoices.map((inv: any, i: number) => (
                                <View key={inv.id} style={[styles.actionItem, i === pendingInvoices.length - 1 && styles.noBorder]}>
                                    <View style={styles.actionInfo}>
                                        <View style={styles.actionIconWrapper}>
                                            <AlertCircle size={18} color="#F59E0B" />
                                        </View>
                                        <View>
                                            <Text style={styles.actionText}>{inv.description || 'Service Invoice'}</Text>
                                            <Text style={styles.actionSubtext}>{t('dashboard.amount_due', 'Amount due')}: ${inv.amount}</Text>
                                        </View>
                                    </View>
                                    <Badge label={t('dashboard.pay_now', 'Pay Now')} variant="warning" />
                                </View>
                            ))}
                        </Card>
                    </View>
                )}
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scrollContent: { paddingBottom: 40 },
    hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, flexWrap: 'wrap', gap: 24 },
    heroActions: { flexDirection: 'row', gap: 12 },
    grid: { flexDirection: 'row', gap: 32, flexWrap: 'wrap' },
    gridCol: { flex: 1, minWidth: 340, gap: 24 },
    gridTitle: { marginBottom: 16 },
    statsRow: { flexDirection: 'row', gap: 16 },
    flex1: { flex: 1 },
    orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    noBorder: { borderBottomWidth: 0 },
    orderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    orderIconWrapper: { width: 40, height: 40, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 4 } as any,
    orderText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    orderSubtext: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    actionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    actionInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    actionIconWrapper: { width: 44, height: 44, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
    actionText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    actionSubtext: { fontSize: 12, color: '#64748B', marginTop: 2 },
    emptyState: { padding: 48, alignItems: 'center', gap: 12 },
    emptyText: { color: '#64748B', fontSize: 14, fontWeight: '500', textAlign: 'center' },
    errorText: { color: '#EF4444', fontSize: 14, marginTop: 12, textAlign: 'center' }
});
