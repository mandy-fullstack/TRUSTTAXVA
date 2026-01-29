import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Input, Text } from '@trusttax/ui';

interface Step1bProps {
    onNext: (data: any) => void;
    onBack: () => void;
    initialData?: any;
}

export const Step1bBirth: React.FC<Step1bProps> = ({ onNext, onBack, initialData }) => {
    const [rawDate, setRawDate] = useState(() => {
        if (initialData?.dateOfBirth) {
            const [y, m, d] = initialData.dateOfBirth.split('-');
            return `${m}${d}${y}`;
        }
        return '';
    });

    // Reactive hydration
    React.useEffect(() => {
        if (initialData?.dateOfBirth && initialData.dateOfBirth.includes('-')) {
            const [y, m, d] = initialData.dateOfBirth.split('-');
            setRawDate(`${m}${d}${y}`);
        }
    }, [initialData]);

    const formatDisplay = (val: string) => {
        const d = val.replace(/\D/g, '');
        if (d.length <= 2) return d;
        if (d.length <= 4) return `${d.slice(0, 2)} / ${d.slice(2)}`;
        return `${d.slice(0, 2)} / ${d.slice(2, 4)} / ${d.slice(4, 8)}`;
    };

    const isValid = rawDate.replace(/\D/g, '').length === 8;

    const handleNext = () => {
        const d = rawDate.replace(/\D/g, '');
        const iso = `${d.slice(4, 8)}-${d.slice(0, 2)}-${d.slice(2, 4)}`;
        onNext({ dateOfBirth: iso });
    };

    return (
        <View style={styles.container}>
            <View style={styles.group}>
                <Input
                    label="DATE OF BIRTH (MM / DD / YYYY)"
                    value={formatDisplay(rawDate)}
                    onChangeText={(v: string) => setRawDate(v.replace(/\D/g, '').slice(0, 8))}
                    placeholder="MM / DD / YYYY"
                    keyboardType="numeric"
                />
                <Text style={styles.info}>CHRONOLOGICAL ALIGNMENT IS REQUIRED BY THE IRS.</Text>
            </View>

            <View style={styles.footer}>
                <Button
                    onPress={handleNext}
                    disabled={!isValid}
                    style={styles.btn}
                    textStyle={styles.btnText}
                >
                    PROCEED TO ORIGIN
                </Button>
                <TouchableOpacity onPress={onBack} style={styles.back}>
                    <Text style={styles.backText}>RETRACT STEP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    group: {
        marginBottom: 40,
    },
    info: {
        fontSize: 10,
        color: '#94A3B8',
        marginTop: 12,
        fontWeight: '500',
        letterSpacing: 0.5,
        fontFamily: 'Inter',
    },
    footer: {
        gap: 16,
    },
    btn: {
        height: 52, // Standard height
        backgroundColor: '#0F172A',
        borderRadius: 0,
    },
    btnText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1.5,
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
    back: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    backText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
        fontFamily: 'Inter',
    },
});
