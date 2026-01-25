import { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@trusttax/ui';
import { HelpCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CountrySelect } from './CountrySelect';
import { ExpirationDatePicker } from './ExpirationDatePicker';
import { MaskedInput } from './MaskedInput';
import { getExpirationInfo } from '../../utils/expiration';

interface ProfilePassportProps {
    number: string;
    countryOfIssue: string;
    expirationDate: string;
    onNumberChange: (v: string) => void;
    onCountryChange: (code: string, name: string) => void;
    onExpirationChange: (v: string) => void;
    passportMasked?: string | null;
    onLoadDecrypted?: () => Promise<{ number: string, countryOfIssue: string, expirationDate: string } | null>; // Función async que carga los datos descifrados completos
}

export const ProfilePassport = ({
    number,
    countryOfIssue,
    expirationDate,
    onNumberChange,
    onCountryChange,
    onExpirationChange,
    passportMasked,
    onLoadDecrypted,
}: ProfilePassportProps) => {
    const { t } = useTranslation();
    const [showWhy, setShowWhy] = useState(false);
    const expirationInfo = useMemo(() => getExpirationInfo(expirationDate || ''), [expirationDate]);

    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <Text style={styles.label}>
                    {t('profile.passport', 'Passport')}
                </Text>
                <TouchableOpacity
                    onPress={() => setShowWhy(!showWhy)}
                    style={styles.whyButton}
                    activeOpacity={0.7}
                >
                    <HelpCircle size={16} color="#2563EB" />
                    <Text style={styles.whyText}>{t('profile.why_we_need', 'Why we need this')}</Text>
                    {showWhy ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
                </TouchableOpacity>
            </View>

            {showWhy && (
                <View style={styles.whyBox}>
                    <Text style={styles.whyTitle}>
                        {t('profile.why_passport_title', 'Why we ask for passport')}
                    </Text>
                    <Text style={styles.whyBody}>
                        {t('profile.why_passport_body', 'We use your passport number, country of issue, and expiration date for identity verification in immigration-related tax services and IRS compliance. All data is encrypted with AES-256-GCM before storage. We never display the full passport number.')}
                    </Text>
                </View>
            )}

            <View style={styles.row}>
                <View style={[styles.group, { flex: 1 }]}>
                    <MaskedInput
                        label={t('profile.passport_number', 'Passport number')}
                        value={number}
                        onChange={onNumberChange}
                        placeholder={t('profile.passport_placeholder', 'Enter passport number')}
                        maskType="passport"
                        maskedDisplay={passportMasked || null}
                        uppercase
                        onLoadDecrypted={onLoadDecrypted ? async () => {
                            const decrypted = await onLoadDecrypted();
                            if (decrypted) {
                                onNumberChange((decrypted.number || '').toUpperCase());
                                onCountryChange((decrypted.countryOfIssue || '').toUpperCase(), '');
                                onExpirationChange((decrypted.expirationDate || '').toUpperCase());
                                return (decrypted.number || '').toUpperCase();
                            }
                            return null;
                        } : undefined}
                    />
                </View>
                <View style={[styles.group, { flex: 1 }]}>
                    <Text style={styles.sublabel}>{t('profile.passport_country', 'Country of issue')}</Text>
                    <CountrySelect
                        value={countryOfIssue}
                        onChange={onCountryChange}
                        placeholder={t('profile.select_country', 'Select country')}
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.group, { flex: 1 }]}>
                    <ExpirationDatePicker
                        value={expirationDate}
                        onChange={onExpirationChange}
                        label={t('profile.passport_expiration', 'Expiration date')}
                    />
                    {expirationInfo && (expirationInfo.status === 'expired' || expirationInfo.status === 'soon') && (
                        <View style={[styles.expirationBanner, expirationInfo.status === 'expired' ? styles.expirationExpired : styles.expirationSoon]}>
                            <AlertTriangle size={16} color={expirationInfo.status === 'expired' ? '#DC2626' : '#D97706'} />
                            <Text style={[styles.expirationText, expirationInfo.status === 'expired' ? styles.expirationTextExpired : styles.expirationTextSoon]}>
                                {expirationInfo.status === 'expired'
                                    ? t('profile.expiration_expired', 'Expired')
                                    : t('profile.expiration_soon', { days: expirationInfo.daysLeft })}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { marginBottom: 24, width: '100%' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155' },
    whyButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    whyText: { fontSize: 13, color: '#2563EB', fontWeight: '500' },
    whyBox: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        padding: 14,
        marginBottom: 12,
        borderRadius: 0,
    },
    whyTitle: { fontSize: 14, fontWeight: '600', color: '#1E40AF', marginBottom: 6 },
    whyBody: { fontSize: 13, color: '#1E3A8A', lineHeight: 20 },
    row: { flexDirection: 'row', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
    group: { minWidth: 180 },
    sublabel: { fontSize: 13, fontWeight: '500', color: '#64748B', marginBottom: 6 },
    input: {
        height: 48,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#0F172A',
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
    },
    expirationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        padding: 10,
        borderRadius: 0,
    },
    expirationExpired: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
    expirationSoon: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
    expirationText: { fontSize: 13, fontWeight: '600' },
    expirationTextExpired: { color: '#DC2626' },
    expirationTextSoon: { color: '#D97706' },
});
