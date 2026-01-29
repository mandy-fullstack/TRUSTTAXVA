import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { ShieldCheck, X, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '@trusttax/ui';
import { PinInput } from './PinInput';

interface PinSetupModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const WEAK_PATTERNS = [
    '123456', '654321', '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999',
    'ABCDEF', '123123', 'QWERTY', 'ASDFGH'
];

export const PinSetupModal: React.FC<PinSetupModalProps> = ({ visible, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState<'enter' | 'confirm'>('enter');
    const [pin1, setPin1] = useState('');
    const [pin2, setPin2] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const isWeak = (pin: string) => {
        if (pin.length < 6) return false;
        // Simple repetition
        if (/^(.)\1+$/.test(pin)) return true;
        // Sequences
        if (WEAK_PATTERNS.includes(pin.toUpperCase())) return true;
        return false;
    };

    const handleNext = () => {
        if (pin1.length !== 6) {
            setError(t('pin.enter_pin', 'PIN must be 6 digits'));
            return;
        }

        if (isWeak(pin1)) {
            setWarning(t('pin.common_pattern', 'Sequences or repetitions are not allowed'));
            return;
        }

        setStep('confirm');
        setError(null);
        setWarning(null);
    };

    const handleSave = async () => {
        if (pin2 !== pin1) {
            setError(t('pin.mismatch', 'PINs do not match'));
            return;
        }

        setIsLoading(true);
        try {
            await api.setupPin(pin1);
            onSuccess();
        } catch (err: any) {
            setError(err.message || t('pin.setup_error', 'Failed to setup PIN'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <ShieldCheck size={24} color="#10B981" />
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>{t('pin.setup_title', 'Create Security PIN')}</Text>
                    <View style={styles.descriptionRow}>
                        <Text style={styles.description}>
                            {step === 'enter' ? t('pin.setup_step1_desc', 'Choose a 6-digit PIN to secure your sensitive actions.') : t('pin.setup_step2_desc', 'Please confirm your new PIN.')}
                        </Text>
                        <Text style={styles.tipText}>{t('pin.alphanumeric_tip', 'You can use letters and numbers')}</Text>
                    </View>

                    <PinInput
                        value={step === 'enter' ? pin1 : pin2}
                        onChange={(val) => {
                            if (step === 'enter') setPin1(val);
                            else setPin2(val);
                            setError(null);
                            setWarning(null);
                        }}
                        secure={true}
                    />

                    {warning && (
                        <View style={styles.warningBox}>
                            <AlertTriangle size={16} color="#B45309" />
                            <Text style={styles.warningText}>{warning}</Text>
                        </View>
                    )}

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <View style={styles.infoBox}>
                        <ShieldCheck size={20} color="#3B82F6" />
                        <Text style={styles.infoText}>
                            {t('pin.usage_explanation', 'This security PIN acts as a second layer of authentication for high-security actions.')}
                        </Text>
                    </View>

                    <Button
                        onPress={step === 'enter' ? handleNext : handleSave}
                        disabled={isLoading || (step === 'enter' ? pin1.length !== 6 : pin2.length !== 6)}
                        style={{ marginTop: 16 }}
                    >
                        {isLoading ? t('pin.saving', 'Saving...') : (step === 'enter' ? t('pin.continue', 'Continue') : t('pin.activate', 'Activate PIN'))}
                    </Button>
                </View>
            </View>
        </Modal>
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
        padding: 40,
        width: '100%',
        maxWidth: 500,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 0,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    descriptionRow: {
        marginBottom: 24,
    },
    description: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 24,
    },
    tipText: {
        fontSize: 12,
        color: '#2563EB',
        fontWeight: '600',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FEF3C7',
        padding: 12,
        gap: 12,
        marginBottom: 16,
    },
    warningText: {
        color: '#B45309',
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 12,
        textAlign: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 0,
        gap: 12,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#DBEAFE',
        marginTop: 24,
    },
    infoText: {
        color: '#1E40AF',
        fontSize: 13,
        lineHeight: 20,
        flex: 1,
    },
});
