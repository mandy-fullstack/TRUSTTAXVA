import { View, StyleSheet, TextInput, Platform } from 'react-native';
import { Text } from '@trusttax/ui';
import { Calendar } from 'lucide-react';
import { createElement } from 'react';

interface DatePickerProps {
    value: string; // YYYY-MM-DD format
    onChange: (date: string) => void;
    placeholder?: string;
    label?: string;
    minDate?: string; // YYYY-MM-DD
    maxDate?: string; // YYYY-MM-DD
    required?: boolean;
    hasError?: boolean; // Indica si hay un error de validación
}

export const DatePicker = ({
    value,
    onChange,
    placeholder,
    label,
    minDate,
    maxDate,
    required,
    hasError = false,
}: DatePickerProps) => {

    const formatDateForDisplay = (dateStr: string): string => {
        if (!dateStr) return '';
        // Si ya está en formato YYYY-MM-DD, devolverlo
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        // Intentar parsear otros formatos
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleChange = (newValue: string) => {
        // Asegurar formato YYYY-MM-DD
        const formatted = formatDateForDisplay(newValue);
        if (formatted || !newValue) {
            onChange(formatted);
        }
    };

    return (
        <View style={styles.wrapper}>
            {label && (
                <Text style={styles.label}>
                    {label}{required ? <Text style={styles.requiredAsterisk}> *</Text> : null}
                </Text>
            )}
            <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
                <Calendar size={18} color={hasError ? "#DC2626" : "#64748B"} />
                {Platform.OS === 'web' ? (
                    createElement('input', {
                        type: 'date',
                        value: value || '',
                        onChange: (e: any) => handleChange(e.target.value),
                        placeholder: placeholder || 'YYYY-MM-DD',
                        min: minDate,
                        max: maxDate,
                        style: {
                            flex: 1,
                            fontSize: 16,
                            color: '#0F172A',
                            border: 'none',
                            padding: 0,
                            margin: 0,
                            background: 'transparent',
                            fontFamily: 'inherit',
                        },
                    })
                ) : (
                    <TextInput
                        style={styles.input}
                        value={value || ''}
                        onChangeText={handleChange}
                        placeholder={placeholder || 'YYYY-MM-DD'}
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                    />
                )}
            </View>
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 48,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
    },
    inputWrapperError: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
    } as any,
});
