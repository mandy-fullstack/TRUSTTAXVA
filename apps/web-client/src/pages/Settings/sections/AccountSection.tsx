import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H3, Text, Card } from '@trusttax/ui';
import { Mail } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const AccountSection = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <View style={styles.section}>
            <H3 style={styles.sectionTitle}>{t('settings.account', 'Account')}</H3>
            <Card style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.iconBox}>
                        <Mail size={20} color="#64748B" />
                    </View>
                    <View style={styles.rowContent}>
                        <Text style={styles.label}>{t('common.email', 'Email Address')}</Text>
                        <Text style={styles.value}>{user?.email}</Text>
                    </View>
                </View>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        marginBottom: 16,
        fontSize: 18,
        color: '#1E293B',
    },
    card: {
        padding: 0,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 0,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowContent: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        color: '#64748B',
    },
});
