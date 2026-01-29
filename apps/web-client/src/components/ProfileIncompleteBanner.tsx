import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@trusttax/ui';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface ProfileIncompleteBannerProps {
    profileComplete: boolean;
}

export const ProfileIncompleteBanner = ({ profileComplete }: ProfileIncompleteBannerProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (profileComplete) return null;

    return (
        <View style={styles.banner}>
            <View style={styles.bannerContent}>
                <View style={styles.iconBox}>
                    <AlertCircle size={20} color="#F59E0B" />
                </View>
                <View style={styles.textSection}>
                    <Text style={styles.title}>
                        {t('dashboard.profile_incomplete_title', 'Complete Your Profile')}
                    </Text>
                    <Text style={styles.message}>
                        {t('dashboard.profile_incomplete_message', 'Your profile is incomplete. Complete it to access all services and ensure accurate tax preparation.')}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigate('/profile/complete')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>
                        {t('dashboard.complete_profile', 'Complete Profile')}
                    </Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 0,
        marginBottom: 24,
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        } : {}),
    } as any,
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        flexWrap: 'wrap',
    },
    iconBox: {
        width: 40,
        height: 40,
        backgroundColor: '#FEF3C7',
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    textSection: {
        flex: 1,
        minWidth: 200,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92400E',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#B45309',
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#F59E0B',
        borderRadius: 0,
        ...(Platform.OS === 'web' ? {
            cursor: 'pointer',
        } : {}),
    } as any,
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});
