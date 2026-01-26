import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { H1, H4, Text, StatsCard, spacing, Spacer } from '@trusttax/ui';
import { LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Layout } from '../components/Layout';

const MOBILE_BREAKPOINT = 768;

export function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const [metrics, setMetrics] = useState<{
    totalClients?: number;
    totalOrders?: number;
    pendingOrders?: number;
    completedOrders?: number;
    activeOrders?: number;
    totalRevenue?: number;
  } | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getDashboardMetrics();
        if (!cancelled) setMetrics(data);
      } catch (e) {
        console.error('Failed to load metrics:', e);
      } finally {
        if (!cancelled) setLoadingMetrics(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <H1 style={isMobile ? styles.titleMobile : undefined}>Welcome, {adminName}</H1>
          <Spacer size="xs" />
          <Text style={styles.subtitle}>
            Real-time platform status and business metrics.
          </Text>
        </View>
        <Spacer size="xl" />
        <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
          <StatsCard
            label="Total Clients"
            value={loadingMetrics ? '...' : String(metrics?.totalClients ?? 0)}
            trend
            trendValue="Active"
            trendColor="#64748B"
          />
          <StatsCard
            label="Active Orders"
            value={loadingMetrics ? '...' : String(metrics?.activeOrders ?? 0)}
            trend
            trendValue="In Progress"
            trendColor="#3B82F6"
          />
          <StatsCard
            label="Pending"
            value={loadingMetrics ? '...' : String(metrics?.pendingOrders ?? 0)}
            trend
            trendValue={(metrics?.pendingOrders ?? 0) > 0 ? 'Action Required' : 'All Clear'}
            trendColor={(metrics?.pendingOrders ?? 0) > 0 ? '#F59E0B' : '#10B981'}
          />
          <StatsCard
            label="Revenue"
            value={loadingMetrics ? '...' : `$${(metrics?.totalRevenue ?? 0).toFixed(2)}`}
            trend
            trendValue="Completed"
            trendColor="#10B981"
          />
        </View>
        <Spacer size="xl" />
        <View style={[styles.emptyContainer, isMobile && styles.emptyContainerMobile]}>
          <LayoutDashboard size={48} color="#E2E8F0" />
          <Spacer size="lg" />
          <H4 style={styles.emptyTitle}>Operational Dashboard</H4>
          <Spacer size="sm" />
          <Text style={styles.emptyText}>
            {(metrics?.totalOrders ?? 0) > 0
              ? `You have ${metrics?.totalOrders} total orders. ${metrics?.completedOrders ?? 0} completed.`
              : 'All systems are running normally. No manual intervention required.'}
          </Text>
        </View>
      </ScrollView>
    </Layout>
  );
}

const s = spacing;
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 200,
  },
  scroll: { flex: 1, width: '100%' },
  scrollContent: {
    padding: s[8],
    width: '100%',
    minWidth: '100%' as any,
    minHeight: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  scrollContentMobile: {
    padding: s[4],
    paddingTop: s[6],
  },
  header: {},
  titleMobile: { fontSize: 24 },
  subtitle: { color: '#64748B', fontSize: 15 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s[5],
    width: '100%',
  },
  statsGridMobile: {
    gap: s[3],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: s[12],
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
  },
  emptyContainerMobile: {
    padding: s[6],
  },
  emptyTitle: { color: '#1E293B' },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 400,
    fontSize: 14,
  },
});
