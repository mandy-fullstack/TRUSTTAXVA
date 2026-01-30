import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@trusttax/ui';
import { ChevronDown, Languages } from 'lucide-react';

export const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
] as const;

interface PrimaryLanguageSelectProps {
    value: string;
    onChange: (code: string) => void;
    label?: string;
    required?: boolean;
    hasError?: boolean; // Indica si hay un error de validación
}

export const PrimaryLanguageSelect = ({
    value,
    onChange,
    label,
    required,
    hasError = false,
}: PrimaryLanguageSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const selected = LANGUAGES.find((l) => l.code === value) || LANGUAGES[0];

    return (
        <View style={styles.wrapper}>
            {label && (
                <Text style={styles.label}>
                    {label}{required ? <Text style={styles.requiredAsterisk}> *</Text> : null}
                </Text>
            )}
            <TouchableOpacity
                style={[styles.trigger, hasError && styles.triggerError]}
                onPress={() => setIsOpen(!isOpen)}
                activeOpacity={0.7}
            >
                <Languages size={18} color="#64748B" />
                <Text style={styles.triggerText}>
                    {selected.name}
                </Text>
                <ChevronDown
                    size={18}
                    color="#64748B"
                    style={Platform.OS === 'web' && isOpen ? ({ transform: 'rotate(180deg)' } as any) : undefined}
                />
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.dropdown}>
                    {LANGUAGES.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[styles.option, value === lang.code && styles.optionActive]}
                            onPress={() => {
                                onChange(lang.code);
                                setIsOpen(false);
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.optionText}>{lang.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    requiredAsterisk: {
        color: '#DC2626',
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 48,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    } as any,
    triggerError: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    triggerText: {
        fontSize: 16,
        color: '#0F172A',
        flex: 1,
    },
    dropdown: {
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        ...(Platform.OS === 'web' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}),
    } as any,
    option: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    optionActive: {
        backgroundColor: '#EFF6FF',
    },
    optionText: {
        fontSize: 16,
        color: '#1E293B',
    },
});
