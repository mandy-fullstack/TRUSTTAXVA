import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { H1, H4, Text, StatsCard } from '@trusttax/ui';
import { LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { Layout } from '../components/Layout';

export const DashboardPage = () => {
    const { user, isLoading } = useAuth();
    const [metrics, setMetrics] = useState<any>(null);
    const [loadingMetrics, setLoadingMetrics] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            const data = await adminApi.getDashboardMetrics();
            setMetrics(data);
        } catch (err) {
            console.error('Failed to load metrics:', err);
        } finally {
            setLoadingMetrics(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0F172A" />
                </View>
            </Layout>
        );
    }

    const adminName = user?.name || user?.email || 'Admin';

    return (
        <Layout>
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <H1>Welcome, {adminName}</H1>
                    <Text style={styles.subtitle}>Real-time platform status and business metrics.</Text>
                </View>

                <View style={styles.statsGrid}>
                    <StatsCard
                        label="Total Clients"
                        value={loadingMetrics ? '...' : metrics?.totalClients?.toString() || '0'}
                        trend
                        trendValue="Active"
                        trendColor="#64748B"
                    />
                    <StatsCard
                        label="Active Orders"
                        value={loadingMetrics ? '...' : metrics?.activeOrders?.toString() || '0'}
                        trend
                        trendValue="In Progress"
                        trendColor="#3B82F6"
                    />
                    <StatsCard
                        label="Pending"
                        value={loadingMetrics ? '...' : metrics?.pendingOrders?.toString() || '0'}
                        trend
                        trendValue={metrics?.pendingOrders > 0 ? 'Action Required' : 'All Clear'}
                        trendColor={metrics?.pendingOrders > 0 ? '#F59E0B' : '#10B981'}
                    />
                    <StatsCard
                        label="Revenue"
                        value={loadingMetrics ? '...' : `$${(metrics?.totalRevenue || 0).toFixed(2)}`}
                        trend
                        trendValue="Completed"
                        trendColor="#10B981"
                    />
                </View>

                <View style={styles.emptyContainer}>
                    <LayoutDashboard size={48} color="#E2E8F0" />
                    <H4 style={styles.emptyTitle}>Operational Dashboard</H4>
                    <Text style={styles.emptyText}>
                        {metrics?.totalOrders > 0
                            ? `You have ${metrics.totalOrders} total orders. ${metrics.completedOrders} completed.`
                            : 'All systems are running normally. No manual intervention required.'}
                    </Text>
                </View>
            </ScrollView>
        </Layout>
    );
};


const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
    scrollContent: { padding: 40, width: '100%', minHeight: '100%' },
    header: { marginBottom: 48 },
    subtitle: { color: '#64748B', marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginBottom: 48, width: '100%' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 64, backgroundColor: '#FFFFFF', borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0' },
    emptyTitle: { marginTop: 24, color: '#1E293B' },
    emptyText: { color: '#94A3B8', textAlign: 'center', maxWidth: 400, marginTop: 12 }
});

