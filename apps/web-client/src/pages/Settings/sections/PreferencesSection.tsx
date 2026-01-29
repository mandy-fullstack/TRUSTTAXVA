import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H3, Text, Card, Tabs, Switch } from '@trusttax/ui';
import { Globe, Bell } from 'lucide-react';

export const PreferencesSection = () => {
    const { t, i18n } = useTranslation();

    // Notification states (local only for now)
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);

    const languages = [
        { id: 'en', label: 'English' },
        { id: 'es', label: 'Español' }
    ];

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <View style={styles.section}>
            <H3 style={styles.sectionTitle}>{t('settings.preferences', 'Preferences')}</H3>
            <Card style={styles.card}>

                {/* Language Selection */}
                <View style={styles.settingItem}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Globe size={20} color="#64748B" />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.label}>{t('common.language', 'Language')}</Text>
                            <Text style={styles.helper}>{t('settings.language_desc', 'Select your preferred language')}</Text>
                        </View>
                        <View style={{ width: 200 }}>
                            <Tabs
                                tabs={languages}
                                activeTab={i18n.language.split('-')[0]}
                                onTabChange={handleLanguageChange}
                                style={{ marginBottom: 0 }}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Notifications */}
                <View style={styles.settingItem}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Bell size={20} color="#64748B" />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.label}>{t('common.notifications', 'Notifications')}</Text>
                            <Text style={styles.helper}>{t('settings.notifications_desc', 'Manage your alert preferences')}</Text>
                        </View>
                    </View>

                    <View style={styles.optionsList}>
                        <View style={styles.optionRow}>
                            <Text style={styles.optionLabel}>{t('settings.push_notifications', 'Push Notifications')}</Text>
                            <Switch
                                value={pushEnabled}
                                onValueChange={setPushEnabled}
                            />
                        </View>
                        <View style={styles.optionRow}>
                            <Text style={styles.optionLabel}>{t('settings.email_notifications', 'Email Notifications')}</Text>
                            <Switch
                                value={emailEnabled}
                                onValueChange={setEmailEnabled}
                            />
                        </View>
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
    settingItem: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
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
    helper: {
        fontSize: 13,
        color: '#64748B',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    optionsList: {
        marginTop: 20,
        paddingLeft: 56, // Align with rowContent
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    optionLabel: {
        fontSize: 14,
        color: '#334155',
    }
});
