import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigate, useParams } from 'react-router-dom';
import { Text, H3 } from '@trusttax/ui';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>();
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        if (!token) {
            Alert.alert(t('common.error'), t('auth.invalid_reset_link'));
            navigate('/login');
            return;
        }

        try {
            setVerifying(true);
            const result = await api.verifyResetToken(token);
            setTokenValid(true);
            setEmail(result.email);
        } catch (error) {
            Alert.alert(t('common.error'), t('auth.invalid_or_expired_token'));
            setTimeout(() => navigate('/login'), 2000);
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async () => {
        if (!password.trim() || !confirmPassword.trim()) {
            Alert.alert(t('common.error'), t('auth.password_required'));
            return;
        }

        if (password.length < 6) {
            Alert.alert(t('common.error'), t('auth.password_too_short'));
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(t('common.error'), t('auth.passwords_dont_match'));
            return;
        }

        try {
            setLoading(true);
            await api.resetPassword(token!, password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error('Password reset failed:', error);
            Alert.alert(t('common.error'), t('auth.password_reset_failed'));
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0F172A" />
                <Text style={styles.verifyingText}>{t('auth.verifying_link')}</Text>
            </View>
        );
    }

    if (!tokenValid) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{t('auth.invalid_reset_link')}</Text>
            </View>
        );
    }

    if (success) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <CheckCircle size={64} color="#10B981" />
                    <H3 style={styles.successTitle}>{t('auth.password_reset_success')}</H3>
                    <Text style={styles.successText}>{t('auth.password_reset_success_description')}</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigate('/login')}
                    >
                        <Text style={styles.loginButtonText}>{t('auth.go_to_login')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <H3 style={styles.title}>{t('auth.reset_password')}</H3>
                <Text style={styles.subtitle}>{email}</Text>

                <View style={styles.inputContainer}>
                    <Lock size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder={t('auth.new_password')}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                            <EyeOff size={20} color="#94A3B8" />
                        ) : (
                            <Eye size={20} color="#94A3B8" />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Lock size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder={t('auth.confirm_new_password')}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        editable={!loading}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? (
                            <EyeOff size={20} color="#94A3B8" />
                        ) : (
                            <Eye size={20} color="#94A3B8" />
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={styles.hint}>{t('auth.password_requirements')}</Text>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>{t('auth.reset_password')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
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
        padding: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    title: {
        marginBottom: 8,
        color: '#0F172A',
    },
    subtitle: {
        color: '#2563EB',
        marginBottom: 32,
        fontSize: 15,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 0,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#F8FAFC',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 15,
        color: '#0F172A',
        outlineStyle: 'none',
    } as any,
    hint: {
        color: '#64748B',
        fontSize: 13,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#0F172A',
        borderRadius: 0,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    verifyingText: {
        marginTop: 16,
        color: '#64748B',
        fontSize: 15,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
        textAlign: 'center',
    },
    successContainer: {
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
    successTitle: {
        marginTop: 24,
        marginBottom: 12,
        color: '#0F172A',
    },
    successText: {
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 32,
        fontSize: 15,
        lineHeight: 22,
    },
    loginButton: {
        backgroundColor: '#0F172A',
        borderRadius: 0,
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
