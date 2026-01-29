import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text } from '@trusttax/ui';
import { Users, Globe } from 'lucide-react';

interface Step3DocumentTypeProps {
    onNext: (data: { idType: 'DL' | 'PASSPORT' }) => void;
    onBack: () => void;
    initialData?: any;
}

export const Step3DocumentType: React.FC<Step3DocumentTypeProps> = ({ onNext, onBack, initialData }) => {
    const [selection, setSelection] = React.useState<'DL' | 'PASSPORT' | null>(initialData?.idType || null);

    return (
        <View style={styles.container}>
            <Text style={styles.subtitle}>SELECT THE DOCUMENT YOU WISH TO USE FOR VERIFICATION. THIS WILL BE ENCRYPTED.</Text>

            <View style={styles.options}>
                <TouchableOpacity
                    style={[styles.card, selection === 'DL' && styles.cardActive]}
                    onPress={() => setSelection('DL')}
                    activeOpacity={0.9}
                >
                    <View style={[styles.iconBox, selection === 'DL' && styles.iconBoxActive]}>
                        <Users size={24} color={selection === 'DL' ? '#FFFFFF' : '#64748B'} />
                    </View>
                    <View>
                        <Text style={[styles.cardTitle, selection === 'DL' && styles.textActive]}>DRIVER'S LICENSE</Text>
                        <Text style={[styles.cardDesc, selection === 'DL' && styles.textActive]}>US STATE ISSUED ID</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, selection === 'PASSPORT' && styles.cardActive]}
                    onPress={() => setSelection('PASSPORT')}
                    activeOpacity={0.9}
                >
                    <View style={[styles.iconBox, selection === 'PASSPORT' && styles.iconBoxActive]}>
                        <Globe size={24} color={selection === 'PASSPORT' ? '#FFFFFF' : '#64748B'} />
                    </View>
                    <View>
                        <Text style={[styles.cardTitle, selection === 'PASSPORT' && styles.textActive]}>PASSPORT</Text>
                        <Text style={[styles.cardDesc, selection === 'PASSPORT' && styles.textActive]}>INTERNATIONAL TRAVEL DOC</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Button
                    onPress={() => selection && onNext({ idType: selection })}
                    disabled={!selection}
                    style={styles.btn}
                    textStyle={styles.btnText}
                >
                    CONTINUE
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
    subtitle: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Inter',
        lineHeight: 18,
        fontWeight: '500',
        marginBottom: 32,
    },
    options: {
        gap: 16,
        marginBottom: 40,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        gap: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 0,
    },
    cardActive: {
        borderColor: '#0F172A',
        backgroundColor: '#F8FAFC',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 0,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBoxActive: {
        backgroundColor: '#0F172A',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        fontFamily: 'Inter',
        letterSpacing: 1,
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 11,
        fontWeight: '500',
        color: '#64748B',
        fontFamily: 'Inter',
        letterSpacing: 0.5,
    },
    textActive: {
        // Keeps default colors for now, but allows future overrides
    },
    footer: {
        gap: 16,
    },
    btn: {
        height: 52,
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
