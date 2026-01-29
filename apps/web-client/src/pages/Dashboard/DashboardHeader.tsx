import { View, StyleSheet } from 'react-native';
import { H1, Subtitle, Text } from '@trusttax/ui';
import { useTranslation } from 'react-i18next';
import { useCompany } from '../../context/CompanyContext';
import { Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
    userName: string;
}

function getGreetingKey(): 'greeting_morning' | 'greeting_afternoon' | 'greeting_evening' {
    const h = new Date().getHours();
    if (h < 12) return 'greeting_morning';
    if (h < 18) return 'greeting_afternoon';
    return 'greeting_evening';
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
    const { t } = useTranslation();
    const { profile } = useCompany();
    const primaryColor = profile?.primaryColor || '#2563EB';
    const secondaryColor = profile?.secondaryColor || '#0F172A';

    const greetingKey = getGreetingKey();
    const greeting = t(`dashboard.${greetingKey}`);

    return (
        <View style={styles.wrapper}>
            <View style={styles.headerContent}>
                <View style={[styles.textSection, { flex: 1 }]}>
                    <View style={styles.greetingRow}>
                        <Sparkles size={16} color={primaryColor} />
                        <Text style={[styles.greeting, { color: primaryColor }]}>
                            {greeting}
                        </Text>
                    </View>
                    <H1 style={[styles.title, { color: secondaryColor }]}>{userName}</H1>
                    <Subtitle style={styles.subtitle}>
                        {t('dashboard.subtitle', 'Your professional tax workspace')}
                    </Subtitle>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        maxWidth: 1200,
        width: '100%',
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
    },
    textSection: {
        // flex: 1, // handled inline
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'capitalize',
        letterSpacing: 0.3,
    },
    title: {
        marginBottom: 8,
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
        lineHeight: 40,
    },
    subtitle: {
        color: '#64748B',
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    }
});
