import { View, Text, Image, StyleSheet } from 'react-native';
import irsLogo from '../assets/IRS-Logo.svg';
import { useTranslation } from 'react-i18next';

interface AuthorizedIRSBadgeProps {
    variant?: 'light' | 'dark';
}

export const AuthorizedIRSBadge = ({ variant = 'light' }: AuthorizedIRSBadgeProps) => {
    const { t } = useTranslation();
    const isDark = variant === 'dark';

    return (
        <View style={[styles.container, isDark && { borderColor: '#FFF', backgroundColor: 'rgba(255,255,255,0.03)' }]}>
            <Image
                source={{ uri: irsLogo }}
                style={[styles.logo, isDark && { tintColor: '#FFF' }]}
                resizeMode="contain"
            />
            <View style={[styles.textContainer, isDark && { borderLeftColor: '#FFF' }]}>
                <Text style={[styles.authorizedText, isDark && { color: 'rgba(255,255,255,0.6)' }]}>{t('common.authorized', 'Authorized')}</Text>
                <Text style={[styles.providerText, isDark && { color: '#FFF' }]}>{t('common.efile_provider', 'e-file Provider')}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignSelf: 'flex-start',
        gap: 16
    },
    logo: {
        width: 64,
        height: 64,
    },
    textContainer: {
        flexDirection: 'column',
        borderLeftWidth: 1,
        borderLeftColor: '#E2E8F0',
        paddingLeft: 16,
    },
    authorizedText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    providerText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: 20,
        letterSpacing: -0.25,
    }
});

export default AuthorizedIRSBadge;
