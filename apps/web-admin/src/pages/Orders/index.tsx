import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { H1, H4, Text, Badge } from '@trusttax/ui';
import { FileText, User, Calendar, DollarSign } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';

interface Order {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    service: {
        id: string;
        name: string;
        category: string;
        price: number;
    };
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#F59E0B',
    IN_PROGRESS: '#3B82F6',
    COMPLETED: '#10B981',
    CANCELLED: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

export const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getOrders();
            setOrders(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);

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
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <H1>Orders & Cases</H1>
                        <Text style={styles.subtitle}>{orders.length} total orders</Text>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterTabs}>
                    {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[styles.filterTab, filter === status && styles.filterTabActive]}
                            onPress={() => setFilter(status)}
                        >
                            <Text style={[styles.filterTabText, filter === status && styles.filterTabTextActive]}>
                                {status === 'ALL' ? 'All' : STATUS_LABELS[status]}
                            </Text>
                            {status !== 'ALL' && (
                                <View style={[styles.filterBadge, { backgroundColor: STATUS_COLORS[status] }]}>
                                    <Text style={styles.filterBadgeText}>
                                        {orders.filter(o => o.status === status).length}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colService]}>Service</Text>
                        <Text style={[styles.tableHeaderText, styles.colClient]}>Client</Text>
                        <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
                        <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
                        <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
                        <Text style={[styles.tableHeaderText, styles.colActions]}>Actions</Text>
                    </View>

                    {filteredOrders.map((order) => (
                        <TouchableOpacity
                            key={order.id}
                            style={styles.tableRow}
                            onPress={() => navigate(`/orders/${order.id}`)}
                        >
                            <View style={styles.colService}>
                                <FileText size={16} color="#64748B" />
                                <View>
                                    <Text style={styles.serviceName}>{order.service.name}</Text>
                                    <Text style={styles.serviceCategory}>{order.service.category}</Text>
                                </View>
                            </View>

                            <View style={styles.colClient}>
                                <User size={14} color="#94A3B8" />
                                <View>
                                    <Text style={styles.clientName}>{order.user.name || 'No name'}</Text>
                                    <Text style={styles.clientEmail}>{order.user.email}</Text>
                                </View>
                            </View>

                            <View style={styles.colStatus}>
                                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[order.status] }]} />
                                    <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
                                        {STATUS_LABELS[order.status]}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.colAmount}>
                                <DollarSign size={14} color="#10B981" />
                                <Text style={styles.amountText}>${order.total.toFixed(2)}</Text>
                            </View>

                            <View style={styles.colDate}>
                                <Calendar size={14} color="#94A3B8" />
                                <Text style={styles.dateText}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </Text>
                            </View>

                            <View style={styles.colActions}>
                                <TouchableOpacity style={styles.actionButton}>
                                    <FileText size={16} color="#2563EB" />
                                    <Text style={styles.actionText}>View</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {filteredOrders.length === 0 && (
                    <View style={styles.emptyState}>
                        <FileText size={48} color="#E2E8F0" />
                        <H4 style={styles.emptyTitle}>No Orders Found</H4>
                        <Text style={styles.emptyText}>
                            {filter === 'ALL'
                                ? 'Orders will appear here once clients start requesting services.'
                                : `No orders with status "${STATUS_LABELS[filter]}".`}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 40, width: '100%', minHeight: '100%' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
    header: { marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    subtitle: { color: '#64748B', marginTop: 4 },
    errorText: { color: '#EF4444', fontSize: 14 },

    filterTabs: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', gap: 8 },
    filterTabActive: { backgroundColor: '#0F172A' },
    filterTabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    filterTabTextActive: { color: '#FFFFFF' },
    filterBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, minWidth: 24, alignItems: 'center' },
    filterBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

    tableContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', width: '100%' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tableHeaderText: { fontSize: 12, fontWeight: '600', color: '#64748B', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },

    colService: { flex: 3, flexDirection: 'row', alignItems: 'center', gap: 12 },
    colClient: { flex: 3, flexDirection: 'row', alignItems: 'center', gap: 8 },
    colStatus: { flex: 2 },
    colAmount: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 },
    colDate: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 },
    colActions: { flex: 2 },

    serviceName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    serviceCategory: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    clientName: { fontSize: 13, fontWeight: '500', color: '#1E293B' },
    clientEmail: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 12, fontWeight: '600' },

    amountText: { fontSize: 14, fontWeight: '600', color: '#10B981' },
    dateText: { fontSize: 13, color: '#64748B' },

    actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#EFF6FF' },
    actionText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },

    emptyState: { padding: 64, alignItems: 'center', gap: 16 },
    emptyTitle: { color: '#1E293B', marginTop: 16 },
    emptyText: { color: '#94A3B8', textAlign: 'center', maxWidth: 400 }
});

