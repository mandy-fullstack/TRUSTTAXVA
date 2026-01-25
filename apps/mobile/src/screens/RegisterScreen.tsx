import { useState } from 'react';
import { View, StyleSheet, Alert, Text, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Input, theme } from '@trusttax/ui';

export const RegisterScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Use standard localhost for iOS simulator, 10.0.2.2 for Android emulator
            const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const apiUrl = `http://${host}:4000/auth/register`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Account created successfully');
                navigation.navigate('Login');
            } else {
                const error = await response.json();
                Alert.alert('Error', error.message || 'Registration failed');
            }
        } catch (err) {
            Alert.alert('Error', 'Network error. Ensure API is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.brandTitle}>TrustTax</Text>
                        <Text style={styles.brandSubtitle}>Join Us Today</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Enter your details below</Text>

                        <Input
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="John Doe"
                            containerStyle={styles.inputContainer}
                        />
                        <Input
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="john@example.com"
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

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            style={styles.button}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>Sign in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Dark background for mobile elegance
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    brandSubtitle: {
        fontSize: 16,
        color: '#94A3B8',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        height: 50,
        backgroundColor: '#0F172A',
        borderRadius: 12,
    },
    footer: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#64748B',
        fontSize: 14,
    },
    link: {
        color: '#2563EB',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
