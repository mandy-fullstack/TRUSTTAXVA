import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { H1, H4, Text, StatsCard, spacing, Spacer } from '@trusttax/ui';
import { LayoutDashboard, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const { permission, requestPermission, notifications, unreadCount, markAsRead } = useNotification();
  const navigate = useNavigate();

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
        <View style={styles.topBar}>
          <H1 style={isMobile ? styles.titleMobile : undefined}>Welcome, {adminName}</H1>

          {/* Notification Area */}
          <View style={{ position: 'relative', zIndex: 9999 }}>
            <TouchableOpacity
              style={styles.iconBox}
              onPress={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={24} color="#0F172A" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {showNotifications && (
              <View style={styles.notificationDropdown}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownTitle}>Notifications</Text>
                  {unreadCount > 0 && (
                    <Text style={styles.markAll} onPress={() => notifications.forEach(n => markAsRead(n.id))}>
                      Mark all read
                    </Text>
                  )}
                </View>
                <ScrollView style={styles.dropdownList}>
                  {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>No new notifications</Text>
                    </View>
                  ) : (
                    notifications.map(n => (
                      <TouchableOpacity
                        key={n.id}
                        style={[styles.notifItem, !n.read && styles.notifUnread]}
                        onPress={() => {
                          markAsRead(n.id);
                          setShowNotifications(false);
                          // Admin routes might differ, assuming typical dashboard routes for now
                          // In a real app we'd map types to admin routes
                          navigate(n.link.replace('/dashboard', '/admin'));
                        }}
                      >
                        <View style={[styles.dot, { backgroundColor: n.type === 'message' ? '#3B82F6' : '#10B981' }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.notifTitle}>{n.title}</Text>
                          <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
                          <Text style={styles.notifTime}>{new Date(n.date).toLocaleTimeString()}</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        <View style={styles.header}>
          <Spacer size="xs" />
          <Text style={styles.subtitle}>
            Real-time platform status and business metrics.
          </Text>
        </View>

        {permission === 'default' && (
          <View style={styles.notificationBanner}>
            <Text style={styles.notificationText}>Enable notifications to stay updated on new orders and messages.</Text>
            <Text style={styles.bannerBtn} onPress={requestPermission}>Enable</Text>
          </View>
        )}

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s[2]
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
  notificationBanner: {
    backgroundColor: '#EFF6FF',
    padding: s[4],
    marginBottom: s[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  notificationText: {
    color: '#1E3A8A',
    fontWeight: '500',
    flex: 1,
  },
  bannerBtn: {
    color: '#2563EB',
    fontWeight: 'bold',
    marginLeft: 16,
    cursor: 'pointer' as any
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer' as any
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 0,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4
  },
  notificationDropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 9999,
    maxHeight: 400
  },
  dropdownHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dropdownTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#0F172A'
  },
  markAll: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
    cursor: 'pointer' as any
  },
  dropdownList: {
    maxHeight: 340
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notifItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  notifUnread: {
    backgroundColor: '#F8FAFC'
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 0,
    marginTop: 6
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2
  },
  notifBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 4
  },
  notifTime: {
    fontSize: 10,
    color: '#94A3B8'
  }
});
