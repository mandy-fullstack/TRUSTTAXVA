import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Card, Button, Input, H1, Subtitle, Text } from '@trusttax/ui';
import { useTranslation } from 'react-i18next';
import { TrustTaxLogo } from '../components/TrustTaxLogo';

export const RegisterPage = () => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setError(t('auth.error_fill_all', 'Please fill in all fields'));
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.register({ name, email, password });
            alert(t('auth.reg_success', 'Registration successful! Please sign in.'));
            navigate('/login');
        } catch (err: any) {
            setError(err.message || t('auth.error_unexpected', 'Something went wrong. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <TrustTaxLogo size={64} />
                    </View>
                    <H1 style={styles.title}>{t('auth.create_account', 'Create Account')}</H1>
                    <Subtitle>{t('auth.join_us', 'Join TrustTax and start your journey')}</Subtitle>
                </View>

                <Card style={styles.formCard} elevated>
                    <View style={styles.formContainer}>
                        <Input
                            label={t('auth.name_label', 'Full Name')}
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                        />
                        <Input
                            label={t('auth.email_label', 'Email Address')}
                            placeholder="name@example.com"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <Input
                            label={t('auth.password_label', 'Password')}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Button
                            title={t('auth.register', 'Register')}
                            onPress={handleRegister}
                            loading={isLoading}
                        />

                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>{t('auth.already_have_account', 'Already have an account?')}</Text>
                            <Link to="/login">
                                <Text style={styles.linkText}>{t('auth.sign_in', 'Sign In')}</Text>
                            </Link>
                        </View>
                    </View>
                </Card>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: 24, minHeight: '100%' },
    wrapper: { width: '100%', maxWidth: 400 },
    header: { alignItems: 'center', marginBottom: 32 },
    logoContainer: { marginBottom: 16 },
    title: { fontSize: 28, marginBottom: 4, fontWeight: '700', letterSpacing: -0.5 },
    formCard: { padding: 40, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
    formContainer: { gap: 24 },
    errorText: { color: '#EF4444', fontSize: 13, textAlign: 'center' },
    footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 16 },
    footerText: { color: '#64748B', fontSize: 14 },
    linkText: { color: '#2563EB', fontWeight: '600', fontSize: 14 } as any,
});
