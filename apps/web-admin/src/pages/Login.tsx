import { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, Input } from '@trusttax/ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, AuthenticationError, ForbiddenError, NetworkError } from '../services/api';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await api.login(email, password);

            // Verify ADMIN role
            if (data.user.role !== 'ADMIN') {
                setError('Access denied. Admin privileges required.');
                return;
            }

            // Save session and navigate
            login(data.access_token, data.user);
            navigate('/dashboard');
        } catch (err: any) {
            // Show specific error messages based on error type
            if (err instanceof AuthenticationError) {
                setError('Invalid email or password. Please try again.');
            } else if (err instanceof ForbiddenError) {
                setError('Access denied. Admin privileges required.');
            } else if (err instanceof NetworkError) {
                setError('Unable to connect to server. Please check your connection.');
            } else {
                setError(err.message || 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Left Side: Branding/Visuals */}
            <View style={styles.brandSection}>
                <View style={styles.brandOverlay}>
                    <Text style={styles.brandTitle}>TrustTax Admin</Text>
                    <Text style={styles.brandSubtitle}>Manage your tax services with confidence.</Text>
                </View>
            </View>

            {/* Right Side: Login Form */}
            <View style={styles.formSection}>
                <View style={styles.formCard}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Please sign in to access the dashboard</Text>
                    </View>

                    <Input
                        label="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="admin@trusttax.com"
                        containerStyle={styles.inputContainer}
                    />
                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="••••••••"
                        containerStyle={styles.inputContainer}
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.button}
                    />

                    <Text style={styles.footerText}>
                        Protected area. Unauthorized access is prohibited.
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        minHeight: '100vh' as any,
        backgroundColor: '#F8FAFC',
    },
    brandSection: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        // In a real responsive scenario we would hide this on mobile
        // but for now we assume desktop-first for admin
        '@media (max-width: 768px)': {
            display: 'none',
        },
    } as any,
    brandOverlay: {
        padding: 40,
        maxWidth: 600,
    },
    brandTitle: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    brandSubtitle: {
        fontSize: 24,
        color: '#94A3B8',
        lineHeight: 32,
    },
    formSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    formCard: {
        width: '100%',
        maxWidth: 450,
        padding: 40,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    inputContainer: {
        marginBottom: 20,
    },
    button: {
        marginTop: 10,
        height: 50,
        backgroundColor: '#0F172A', // Brand dark color
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    footerText: {
        marginTop: 30,
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 12,
    },
});
