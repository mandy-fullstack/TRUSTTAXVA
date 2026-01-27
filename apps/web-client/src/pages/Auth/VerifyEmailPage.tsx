import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigate, useParams } from 'react-router-dom';
import { Text, H3 } from '@trusttax/ui';
import { CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export function VerifyEmailPage() {
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>();
    const { t } = useTranslation();
    const { login: authLogin } = useAuth();
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        if (!token) {
            setError(t('auth.invalid_verification_link'));
            setVerifying(false);
            return;
        }

        try {
            setVerifying(true);
            const result = await api.verifyEmail(token);

            // Auto-login with the received token
            if (result.access_token && result.user) {
                localStorage.setItem('token', result.access_token);
                authLogin(result.access_token, result.user);
                setSuccess(true);

                // Redirect to dashboard after 2 seconds
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        } catch (err: any) {
            setError(err.message || t('auth.verification_failed'));
        } finally {
            setVerifying(false);
        }
    };

    if (verifying) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <ActivityIndicator size="large" color="#0F172A" />
                    <Text style={styles.verifyingText}>{t('auth.verifying_email')}</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <XCircle size={64} color="#EF4444" />
                    <H3 style={styles.errorTitle}>{t('auth.verification_failed')}</H3>
                    <Text style={styles.errorText}>{error}</Text>
                    <Text
                        style={styles.linkText}
                        onPress={() => navigate('/login')}
                    >
                        {t('auth.go_to_login')}
                    </Text>
                </View>
            </View>
        );
    }

    if (success) {
        return (
            <View style={styles.container}>
                <View style={styles.successCard}>
                    <CheckCircle size={64} color="#10B981" />
                    <H3 style={styles.successTitle}>{t('auth.email_verified')}</H3>
                    <Text style={styles.successText}>{t('auth.email_verified_description')}</Text>
                    <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color="#10B981" />
                        <Text style={styles.redirectText}>{t('auth.redirecting_to_dashboard')}</Text>
                    </View>
                </View>
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#FFF',
        borderRadius: 0,
        padding: 48,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    successCard: {
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#FFF',
        borderRadius: 0,
        padding: 48,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    verifyingText: {
        marginTop: 16,
        color: '#64748B',
        fontSize: 15,
    },
    errorTitle: {
        marginTop: 24,
        marginBottom: 12,
        color: '#EF4444',
    },
    errorText: {
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 15,
        lineHeight: 22,
    },
    successTitle: {
        marginTop: 24,
        marginBottom: 12,
        color: '#10B981',
    },
    successText: {
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 15,
        lineHeight: 22,
    },
    linkText: {
        color: '#2563EB',
        fontSize: 15,
        fontWeight: '600',
        textDecorationLine: 'underline',
        cursor: 'pointer',
    } as any,
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    redirectText: {
        color: '#64748B',
        fontSize: 14,
    },
});
