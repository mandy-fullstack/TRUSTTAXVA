import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { H1, H4, Text, Badge } from '@trusttax/ui';
import { Users, Mail, Calendar, FileText } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';

interface Client {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    _count: {
        orders: number;
        invoices: number;
    };
}

export const ClientsPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getClients();
            setClients(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

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
                        <H1>Clients</H1>
                        <Text style={styles.subtitle}>{clients.length} total clients</Text>
                    </View>
                </View>

                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colName]}>Client</Text>
                        <Text style={[styles.tableHeaderText, styles.colEmail]}>Email</Text>
                        <Text style={[styles.tableHeaderText, styles.colOrders]}>Orders</Text>
                        <Text style={[styles.tableHeaderText, styles.colDate]}>Joined</Text>
                        <Text style={[styles.tableHeaderText, styles.colActions]}>Actions</Text>
                    </View>

                    {clients.map((client) => (
                        <TouchableOpacity
                            key={client.id}
                            style={styles.tableRow}
                            onPress={() => navigate(`/clients/${client.id}`)}
                        >
                            <View style={styles.colName}>
                                <View style={styles.avatar}>
                                    <Users size={16} color="#64748B" />
                                </View>
                                <Text style={styles.clientName}>{client.name || 'No name'}</Text>
                            </View>

                            <View style={styles.colEmail}>
                                <Mail size={14} color="#94A3B8" />
                                <Text style={styles.emailText}>{client.email}</Text>
                            </View>

                            <View style={styles.colOrders}>
                                <Badge
                                    label={`${client._count.orders} orders`}
                                    variant={client._count.orders > 0 ? 'primary' : 'secondary'}
                                />
                            </View>

                            <View style={styles.colDate}>
                                <Calendar size={14} color="#94A3B8" />
                                <Text style={styles.dateText}>
                                    {new Date(client.createdAt).toLocaleDateString()}
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

                {clients.length === 0 && (
                    <View style={styles.emptyState}>
                        <Users size={48} color="#E2E8F0" />
                        <H4 style={styles.emptyTitle}>No Clients Yet</H4>
                        <Text style={styles.emptyText}>Clients will appear here once they register.</Text>
                    </View>
                )}
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 40, width: '100%', minHeight: '100%' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
    header: { marginBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    subtitle: { color: '#64748B', marginTop: 4 },
    errorText: { color: '#EF4444', fontSize: 14 },

    tableContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', width: '100%' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tableHeaderText: { fontSize: 12, fontWeight: '600', color: '#64748B', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },

    colName: { flex: 3, flexDirection: 'row', alignItems: 'center', gap: 12 },
    colEmail: { flex: 3, flexDirection: 'row', alignItems: 'center', gap: 8 },
    colOrders: { flex: 2 },
    colDate: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 },
    colActions: { flex: 2 },

    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
    clientName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    emailText: { fontSize: 13, color: '#64748B' },
    dateText: { fontSize: 13, color: '#64748B' },

    actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#EFF6FF' },
    actionText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },

    emptyState: { padding: 64, alignItems: 'center', gap: 16 },
    emptyTitle: { color: '#1E293B', marginTop: 16 },
    emptyText: { color: '#94A3B8', textAlign: 'center' }
});

