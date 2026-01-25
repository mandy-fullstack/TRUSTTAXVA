import { View, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react';
import { H4, Card, Text, Badge } from '@trusttax/ui';
import { useTranslation } from 'react-i18next';

interface Invoice {
    id: string;
    description?: string;
    amount?: number | string;
}

interface DashboardPendingPaymentsProps {
    invoices: Invoice[];
}

export const DashboardPendingPayments = ({
    invoices,
}: DashboardPendingPaymentsProps) => {
    const { t } = useTranslation();

    if (invoices.length === 0) return null;

    return (
        <View style={styles.wrapper}>
            <H4 style={styles.gridTitle}>
                {t('dashboard.pending_payments', 'Pending Payments')}
            </H4>
            <Card padding="none" elevated style={styles.card}>
                {invoices.map((inv, i) => (
                    <View
                        key={inv.id}
                        style={[
                            styles.actionItem,
                            i === invoices.length - 1 && styles.noBorder,
                        ]}
                    >
                        <View style={styles.actionInfo}>
                            <View style={styles.actionIconWrapper}>
                                <AlertCircle size={18} color="#F59E0B" />
                            </View>
                            <View>
                                <Text style={styles.actionText}>
                                    {inv.description || 'Service Invoice'}
                                </Text>
                                <Text style={styles.actionSubtext}>
                                    {t('dashboard.amount_due', 'Amount due')}: $
                                    {typeof inv.amount === 'number'
                                        ? inv.amount.toFixed(0)
                                        : inv.amount ?? '0'}
                                </Text>
                            </View>
                        </View>
                        <Badge
                            label={t('dashboard.pay_now', 'Pay Now')}
                            variant="warning"
                        />
                    </View>
                ))}
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { marginTop: 40 },
    gridTitle: { marginBottom: 16 },
    card: { overflow: 'hidden' },
    actionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    noBorder: { borderBottomWidth: 0 },
    actionInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    actionIconWrapper: {
        width: 44,
        height: 44,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    actionSubtext: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
