import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { H1, H4, Text } from '@trusttax/ui';
import { FileText, User, Calendar, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  service: { id: string; name: string; category: string; price: number };
  user: { id: string; name: string | null; email: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  IN_PROGRESS: '#3B82F6',
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444',
  SUBMITTED: '#8B5CF6',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  SUBMITTED: 'Submitted',
};

const MOBILE_BREAKPOINT = 768;

export function OrdersPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getOrders();
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);
  const statusList = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

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

  const statusColor = (s: string) => STATUS_COLORS[s] || '#64748B';
  const statusLabel = (s: string) => STATUS_LABELS[s] || s;

  return (
    <Layout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <H1 style={isMobile ? styles.titleMobile : undefined}>Orders & Cases</H1>
            <Text style={styles.subtitle}>{orders.length} total orders</Text>
          </View>
        </View>

        <View style={[styles.filterTabs, isMobile && styles.filterTabsMobile]}>
          {statusList.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterTab, filter === s && styles.filterTabActive]}
              onPress={() => setFilter(s)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filter === s && styles.filterTabTextActive]}>
                {s === 'ALL' ? 'All' : statusLabel(s)}
              </Text>
              {s !== 'ALL' && (
                <View style={[styles.filterBadge, { backgroundColor: statusColor(s) }]}>
                  <Text style={styles.filterBadgeText}>
                    {orders.filter((o) => o.status === s).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={48} color="#E2E8F0" />
            <H4 style={styles.emptyTitle}>No Orders Found</H4>
            <Text style={styles.emptyText}>
              {filter === 'ALL'
                ? 'Orders will appear here once clients start requesting services.'
                : `No orders with status "${statusLabel(filter)}".`}
            </Text>
          </View>
        ) : isMobile ? (
          <View style={styles.cardList}>
            {filtered.map((o) => (
              <TouchableOpacity
                key={o.id}
                style={styles.card}
                onPress={() => navigate(`/orders/${o.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.serviceName}>{o.service?.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(o.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor(o.status) }]} />
                    <Text style={[styles.statusText, { color: statusColor(o.status) }]}>
                      {statusLabel(o.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardMeta}>
                  <User size={14} color="#94A3B8" />
                  <Text style={styles.metaText}>{o.user?.name || 'No name'} · {o.user?.email}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.amountRow}>
                    <DollarSign size={14} color="#10B981" />
                    <Text style={styles.amountText}>${Number(o.total || 0).toFixed(2)}</Text>
                  </View>
                  <View style={styles.dateRow}>
                    <Calendar size={14} color="#94A3B8" />
                    <Text style={styles.dateText}>{new Date(o.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colService]}>Service</Text>
              <Text style={[styles.th, styles.colClient]}>Client</Text>
              <Text style={[styles.th, styles.colStatus]}>Status</Text>
              <Text style={[styles.th, styles.colAmount]}>Amount</Text>
              <Text style={[styles.th, styles.colDate]}>Date</Text>
            </View>
            {filtered.map((o) => (
              <TouchableOpacity
                key={o.id}
                style={styles.tableRow}
                onPress={() => navigate(`/orders/${o.id}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.colService, styles.cell]}>
                  <FileText size={16} color="#64748B" />
                  <View>
                    <Text style={styles.serviceName}>{o.service?.name}</Text>
                    <Text style={styles.serviceCategory}>{o.service?.category}</Text>
                  </View>
                </View>
                <View style={[styles.colClient, styles.cell]}>
                  <User size={14} color="#94A3B8" />
                  <View>
                    <Text style={styles.clientName}>{o.user?.name || 'No name'}</Text>
                    <Text style={styles.clientEmail}>{o.user?.email}</Text>
                  </View>
                </View>
                <View style={[styles.colStatus, styles.cell]}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(o.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor(o.status) }]} />
                    <Text style={[styles.statusText, { color: statusColor(o.status) }]}>
                      {statusLabel(o.status)}
                    </Text>
                  </View>
                </View>
                <View style={[styles.colAmount, styles.cell]}>
                  <DollarSign size={14} color="#10B981" />
                  <Text style={styles.amountText}>${Number(o.total || 0).toFixed(2)}</Text>
                </View>
                <View style={[styles.colDate, styles.cell]}>
                  <Calendar size={14} color="#94A3B8" />
                  <Text style={styles.dateText}>{new Date(o.createdAt).toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, width: '100%' },
  container: {
    padding: 32,
    width: '100%',
    minWidth: '100%' as any,
    minHeight: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  containerMobile: { padding: 16, paddingTop: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  header: { marginBottom: 24 },
  titleMobile: { fontSize: 24 },
  subtitle: { color: '#64748B', marginTop: 4 },
  errorText: { color: '#EF4444', fontSize: 14 },

  filterTabs: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  filterTabsMobile: { marginBottom: 16 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 0,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTabActive: { backgroundColor: '#0F172A' },
  filterTabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterTabTextActive: { color: '#FFF' },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },

  tableContainer: {
    backgroundColor: '#FFF',
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  th: { fontSize: 12, fontWeight: '600', color: '#64748B', textTransform: 'uppercase' },
  tableRow: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  cell: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colService: { flex: 3 },
  colClient: { flex: 3 },
  colStatus: { flex: 2 },
  colAmount: { flex: 2 },
  colDate: { flex: 2 },

  serviceName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  serviceCategory: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  clientName: { fontSize: 13, fontWeight: '500', color: '#1E293B' },
  clientEmail: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  amountText: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  dateText: { fontSize: 13, color: '#64748B' },

  cardList: { gap: 12, width: '100%' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  metaText: { fontSize: 13, color: '#64748B' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  emptyState: { padding: 48, alignItems: 'center', gap: 12 },
  emptyTitle: { color: '#1E293B' },
  emptyText: { color: '#94A3B8', textAlign: 'center', maxWidth: 360 },
});
