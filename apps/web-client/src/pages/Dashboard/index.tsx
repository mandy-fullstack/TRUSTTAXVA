import { View, ScrollView, StyleSheet } from 'react-native';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { DashboardHeader } from './DashboardHeader';
import { DashboardOverview } from './DashboardOverview';
import { DashboardRecentOrders } from './DashboardRecentOrders';
import { DashboardPendingPayments } from './DashboardPendingPayments';
import { DashboardLoading } from './DashboardLoading';
import { DashboardError } from './DashboardError';
import { ProfileIncompleteBanner } from '../../components/ProfileIncompleteBanner';
import { PageMeta } from '../../components/PageMeta';
import { useTranslation } from 'react-i18next';

interface UserWithRelations {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    profileComplete?: boolean;
    orders?: Array<{
        id: string;
        createdAt: string;
        status: string;
        service?: { name?: string };
    }>;
    invoices?: Array<{
        id: string;
        description?: string;
        amount?: number | string;
        status?: string;
    }>;
}

export const DashboardPage = () => {
    const { t } = useTranslation();
    const {
        user,
        isLoading: authLoading,
        error: authError,
        clearError,
    } = useAuth();

    if (authLoading) {
        return (
            <Layout>
                <DashboardLoading error={authError ?? undefined} />
            </Layout>
        );
    }

    if (authError != null && authError !== '' && !user) {
        return (
            <Layout>
                <DashboardError
                    message={authError}
                    onRetry={() => {
                        clearError();
                        window.location.reload();
                    }}
                />
            </Layout>
        );
    }

    const userData = user as UserWithRelations | null;
    const userName = userData?.name ?? 'Client';
    const orders = userData?.orders ?? [];
    const pendingInvoices = userData?.invoices ?? [];

    return (
        <Layout>
            <PageMeta
                title={`${t('header.dashboard', 'Dashboard')} | TrustTax`}
                description={t('dashboard.subtitle', 'Your professional tax workspace')}
            />
            {/* Dashboard Header - Componente independiente separado */}
            <View style={styles.headerSection}>
                <DashboardHeader userName={userName} />
            </View>
            
            {/* Contenido principal del dashboard */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <ProfileIncompleteBanner profileComplete={userData?.profileComplete ?? false} />
                
                <View style={styles.grid}>
                    <DashboardOverview
                        totalOrders={orders.length}
                        actionRequiredCount={pendingInvoices.length}
                    />
                    <DashboardRecentOrders orders={orders} />
                </View>

                <DashboardPendingPayments invoices={pendingInvoices} />
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    headerSection: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingTop: 24,
        paddingBottom: 0,
    },
    scrollContent: { 
        paddingTop: 32,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        gap: 32,
        flexWrap: 'wrap',
    },
});
