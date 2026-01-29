import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, H3, Text } from '@trusttax/ui';
import { Lock, FileText } from 'lucide-react';
import { ProfileDriverLicense } from '../ProfileDriverLicense';
import { ProfilePassport } from '../ProfilePassport';

interface StepLegalDocsProps {
    data: any;
    onChange: (field: string, value: any) => void;
    onLoadDecryptedDriverLicense: () => Promise<any>;
    onLoadDecryptedPassport: () => Promise<any>;
    user: any;
}

export const StepLegalDocs = ({
    data,
    onChange,
    onLoadDecryptedDriverLicense,
    onLoadDecryptedPassport,
    user
}: StepLegalDocsProps) => {
    const { t } = useTranslation();

    const handleChange = (field: string, value: any) => {
        onChange(field, value);
    };

    return (
        <View style={styles.container}>
            <View style={styles.intro}>
                <Text style={styles.introText}>
                    {t('profile.legal_docs_intro', 'Please provide details from your official identification documents. This helps us verify your identity and facilitates accurate tax filing.')}
                </Text>
            </View>

            {/* Driver's License */}
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                        <Lock size={20} color="#2563EB" />
                    </View>
                    <H3>{t('profile.driver_license', 'Driver\'s License')}</H3>
                </View>
                <ProfileDriverLicense
                    number={data.driverLicenseNumber || ''}
                    stateCode={data.driverLicenseStateCode || ''}
                    stateName={data.driverLicenseStateName || ''}
                    expirationDate={data.driverLicenseExpiration || ''}
                    onNumberChange={(v) => handleChange('driverLicenseNumber', (v || '').toUpperCase())}
                    onStateChange={(code, name) => {
                        handleChange('driverLicenseStateCode', (code || '').toUpperCase());
                        handleChange('driverLicenseStateName', (name || '').toUpperCase());
                    }}
                    onExpirationChange={(v) => handleChange('driverLicenseExpiration', (v || '').toUpperCase())}
                    driverLicenseMasked={user?.driverLicenseMasked}
                    onLoadDecrypted={onLoadDecryptedDriverLicense}
                />
            </Card>

            {/* Passport */}
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                        <Lock size={20} color="#2563EB" />
                    </View>
                    <H3>{t('profile.passport', 'Passport')}</H3>
                </View>
                <ProfilePassport
                    number={data.passportNumber || ''}
                    countryOfIssue={data.passportCountryOfIssue || ''}
                    expirationDate={data.passportExpiration || ''}
                    onNumberChange={(v) => handleChange('passportNumber', (v || '').toUpperCase())}
                    onCountryChange={(code) => handleChange('passportCountryOfIssue', (code || '').toUpperCase())}
                    onExpirationChange={(v) => handleChange('passportExpiration', (v || '').toUpperCase())}
                    passportMasked={user?.passportMasked}
                    onLoadDecrypted={onLoadDecryptedPassport}
                />
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 24,
    },
    intro: {
        paddingHorizontal: 4,
    },
    introText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    card: {
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
