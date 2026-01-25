import { View, StyleSheet, TextInput } from 'react-native';
import { Text } from '@trusttax/ui';

interface EditableTextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    maxLength?: number;
    keyboardType?: 'default' | 'numeric' | 'email-address';
    inline?: boolean;
    isSaved?: boolean;
    hasError?: boolean;
    /** Convierte el valor a mayúsculas al escribir (personal info, etc.) */
    autoUppercase?: boolean;
}

export const EditableTextInput = ({
    value,
    onChange,
    placeholder,
    label,
    maxLength,
    keyboardType = 'default',
    inline = false,
    isSaved = false,
    hasError = false,
    autoUppercase = false,
}: EditableTextInputProps) => {
    const hasValue = !!value && value.length > 0;

    const content = (
        <View style={[
            inline ? styles.inputWrapperInline : styles.inputWrapper, 
            isSaved && hasValue && styles.savedWrapper,
            hasError && styles.errorWrapper
        ]}>
            <TextInput
                style={[
                    styles.input,
                    isSaved && hasValue && styles.savedInput,
                    hasError && styles.errorInput
                ]}
                value={value}
                onChangeText={(t) => onChange(autoUppercase ? t.toUpperCase() : t)}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                maxLength={maxLength}
                keyboardType={keyboardType}
                autoCapitalize={autoUppercase ? 'characters' : undefined}
            />
        </View>
    );

    if (inline) {
        return content;
    }

    return (
        <View style={styles.wrapper}>
            {label && (
                <Text style={styles.label}>
                    {label}
                </Text>
            )}
            {content}
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 48,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
    },
    savedWrapper: {
        opacity: 0.6,
        backgroundColor: '#F8FAFC',
    },
    inputWrapperInline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        minHeight: 'auto',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
    } as any,
    savedInput: {
        color: '#64748B',
    },
    errorWrapper: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    errorInput: {
        color: '#DC2626',
    },
});
