import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { ShieldCheck, X, Lock, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Button } from '@trusttax/ui';
import { PinInput } from './PinInput';
import { PinSetupModal } from './PinSetupModal';

interface PinGuardProps {
    children: React.ReactElement;
    onVerify: () => void;
    title?: string;
    description?: string;
}

export const PinGuard: React.FC<PinGuardProps> = ({ children, onVerify, title = 'Security Verification', description = 'Please enter your security PIN to continue.' }) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasPin, setHasPin] = useState<boolean | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showSetup, setShowSetup] = useState(false);

    // Initial check
    useEffect(() => {
        checkPinStatus();
    }, []);

    const checkPinStatus = async () => {
        try {
            const status = await api.getPinStatus();
            setHasPin(status.hasPin);
        } catch (e) {
            console.error('Failed to check PIN status', e);
        }
    };

    const handlePress = async () => {
        if (hasPin === false) {
            setShowSetup(true);
            return;
        }
        setIsVisible(true);
        setPin('');
        setError(null);
    };

    const handleVerify = async () => {
        if (pin.length !== 6) {
            setError('PIN must be 6 digits');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await api.verifyPin(pin);
            if (result.valid) {
                setIsVisible(false);
                onVerify();
            } else {
                setError('Incorrect PIN');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Clone child to intercept onPress/onClick
    const child = React.Children.only(children);

    // Safety check for valid element
    if (!React.isValidElement(child)) return null;

    return (
        <>
            <TouchableOpacity onPress={handlePress} style={{ width: '100%' }}>
                <View pointerEvents="none">
                    {children}
                </View>
            </TouchableOpacity>

            {/* Verification Modal */}
            <Modal visible={isVisible} transparent animationType="fade" onRequestClose={() => setIsVisible(false)}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Lock size={24} color="#2563EB" />
                            </View>
                            <TouchableOpacity onPress={() => setIsVisible(false)}>
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.description}>{description}</Text>

                        <View style={styles.inputContainer}>
                            <PinInput
                                value={pin}
                                onChange={setPin}
                                autoFocus={true}
                                secure={true}
                            />
                            {error && <Text style={styles.errorText}>{error}</Text>}
                        </View>

                        <View style={styles.infoBox}>
                            <Info size={16} color="#64748B" style={{ marginTop: 2 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoTitle}>
                                    {t('pin.why_needed_title', 'Why is this PIN required?')}
                                </Text>
                                <Text style={styles.infoText}>
                                    {t('pin.usage_explanation', 'This security PIN acts as a second layer of authentication for high-security actions.')}
                                </Text>
                            </View>
                        </View>

                        <Button
                            onPress={handleVerify}
                            disabled={isLoading || pin.length !== 6}
                            style={{ marginTop: 16 }}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Identity'}
                        </Button>
                    </View>
                </View>
            </Modal>

            {/* Setup Modal */}
            <PinSetupModal visible={showSetup} onClose={() => setShowSetup(false)} onSuccess={() => {
                setShowSetup(false);
                setHasPin(true);
                // Optionally auto-trigger verify flow or just let user click again
            }} />
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 0,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        // Glassmorphism-ish shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 0,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 24,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 8,
        textAlign: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#F8FAFC',
        padding: 16,
        marginTop: 24,
        borderLeftWidth: 3,
        borderLeftColor: '#64748B',
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
    },
});
