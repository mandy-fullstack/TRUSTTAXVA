import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, H1, H3, Text, Card, Badge } from '@trusttax/ui';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout';
import { PageMeta } from '../../components/PageMeta';

export const ProfilePage = () => {
    const { user, refreshUser } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Initial load
    useEffect(() => {
        if (!user) {
            refreshUser();
        }
    }, [user, refreshUser]);

    return (
        <Layout>
            <PageMeta title={t('header.profile', 'My Profile') + ' | TrustTax'} />
            <View style={styles.container}>
                <H1>{t('header.profile', 'My Profile')}</H1>
                <Text style={styles.subtitle}>{t('profile.subtitle', 'Manage your personal information')}</Text>

                {/* Profile Details Card */}
                <Card style={styles.card}>
                    <View style={styles.section}>
                        <H3>Personal Information</H3>
                        <View style={styles.row}>
                            <View style={styles.field}>
                                <Text style={styles.label}>Full Name</Text>
                                <Text style={styles.value}>{user?.firstName} {user?.lastName}</Text>
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.label}>Email</Text>
                                <Text style={styles.value}>{user?.email}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <H3>Account Status</H3>
                        <Badge
                            variant={user?.isProfileComplete ? 'success' : 'warning'}
                            label={user?.isProfileComplete ? 'VERIFIED' : 'PENDING COMPLETION'}
                            style={{ marginTop: 8 }}
                        />
                        {!user?.isProfileComplete && (
                            <Button
                                title="Complete Profile Setup"
                                onPress={() => navigate('/profile/complete')}
                                style={{ marginTop: 16 }}
                            />
                        )}
                    </View>
                </Card>
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    subtitle: {
        marginBottom: 32,
        color: '#64748B',
    },
    card: {
        padding: 32,
    },
    section: {
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        gap: 40,
        marginTop: 16,
        flexWrap: 'wrap',
    },
    field: {
        minWidth: 200,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 24,
    }
});
