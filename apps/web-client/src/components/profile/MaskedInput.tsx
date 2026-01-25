import { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Text } from '@trusttax/ui';
import { Edit2 } from 'lucide-react';

interface MaskedInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    maskType?: 'ssn' | 'license' | 'passport' | 'generic';
    maxLength?: number;
    keyboardType?: 'default' | 'numeric';
    formatValue?: (value: string) => string;
    inline?: boolean;
    maskedDisplay?: string | null;
    onLoadDecrypted?: () => Promise<string | null>;
    hasError?: boolean;
    /** Convierte el valor a mayúsculas (licencia, pasaporte, etc.) */
    uppercase?: boolean;
}

export const MaskedInput = ({
    value,
    onChange,
    placeholder,
    label,
    maskType = 'generic',
    maxLength,
    keyboardType = 'default',
    formatValue,
    inline = false,
    maskedDisplay,
    onLoadDecrypted,
    hasError = false,
    uppercase = false,
}: MaskedInputProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingDecrypted, setIsLoadingDecrypted] = useState(false);
    const [originalDecryptedValue, setOriginalDecryptedValue] = useState<string | null>(null);

    const maskValue = (val: string, type: string): string => {
        if (!val) return '';
        
        if (type === 'ssn') {
            // Para SSN: XXX-XX-1234 (últimos 4)
            if (val.length >= 4) {
                const last4 = val.slice(-4).replace(/\D/g, '');
                if (last4.length === 4) {
                    return `XXX-XX-${last4}`;
                }
            }
            return 'XXX-XX-XXXX';
        }
        
        if (type === 'license' || type === 'passport') {
            // Para licencia/pasaporte: mostrar últimos 4 caracteres
            if (val.length >= 4) {
                const last4 = val.slice(-4);
                return `••••${last4}`;
            }
            return '••••••••';
        }
        
        // Generic: mostrar puntos
        return '•'.repeat(Math.min(val.length || 8, 12));
    };

    const hasValue = !!value && value.length > 0;
    const hasStoredValue = !!maskedDisplay;
    
    // Determinar si hay un valor nuevo pendiente de guardar (diferente al guardado)
    // Si hay value pero no hay maskedDisplay, o si el maskedDisplay no coincide con el value enmascarado
    const hasUnsavedChanges = hasValue && (
        !hasStoredValue || 
        maskValue(value, maskType) !== maskedDisplay
    );
    
    // Siempre mostrar enmascarado cuando no está editando
    const shouldShowMasked = !isEditing;

    // IMPORTANTE: Si hay un valor nuevo en el estado (value), usarlo para generar el maskedDisplay
    // Esto permite mostrar el valor nuevo enmascarado hasta que se guarde
    // Si no hay valor nuevo, usar maskedDisplay del backend (últimos 4 dígitos del valor guardado)
    const displayMasked = hasValue ? maskValue(value, maskType) : (maskedDisplay || '');

    const content = (
        <View style={[
            inline ? styles.inputWrapperInline : styles.inputWrapper,
            hasUnsavedChanges && styles.inputWrapperUnsaved,
            hasError && styles.errorWrapper
        ]}>
            {shouldShowMasked ? (
                <>
                    <View style={styles.maskedContainer}>
                        <Text style={[
                            styles.maskedText,
                            hasUnsavedChanges && styles.maskedTextUnsaved
                        ]} numberOfLines={1}>
                            {displayMasked}
                        </Text>
                        {hasUnsavedChanges && (
                            <View style={styles.unsavedBadge}>
                                <Text style={styles.unsavedBadgeText}>●</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={async () => {
                                if (onLoadDecrypted) {
                                    // Cargar valor descifrado del backend
                                    setIsLoadingDecrypted(true);
                                    try {
                                        const decryptedValue = await onLoadDecrypted();
                                        if (decryptedValue != null) {
                                            const v = String(decryptedValue);
                                            const next = uppercase ? v.toUpperCase() : v;
                                            onChange(next);
                                            setOriginalDecryptedValue(next);
                                        }
                                    } catch (error) {
                                        console.error('Failed to load decrypted value:', error);
                                    } finally {
                                        setIsLoadingDecrypted(false);
                                        setIsEditing(true);
                                    }
                                } else {
                                    // Si no hay función de carga, permitir escribir nuevo valor
                                    onChange('');
                                    setOriginalDecryptedValue(null);
                                    setIsEditing(true);
                                }
                            }}
                            style={styles.iconButton}
                            activeOpacity={0.7}
                            disabled={isLoadingDecrypted}
                        >
                            {isLoadingDecrypted ? (
                                <ActivityIndicator size={18} color="#2563EB" />
                            ) : (
                                <Edit2 size={18} color="#2563EB" />
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={(t) => onChange(uppercase ? t.toUpperCase() : t)}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    maxLength={maxLength}
                    keyboardType={keyboardType}
                    autoFocus={isEditing}
                    autoCapitalize={uppercase ? 'characters' : undefined}
                    onEndEditing={(e) => {
                        const raw = e.nativeEvent.text || value;
                        const currentValue = uppercase ? raw.toUpperCase() : raw;
                        const isEmpty = !currentValue || currentValue.trim().length === 0;

                        if (isEmpty) {
                            onChange('');
                            setOriginalDecryptedValue(null);
                            setIsEditing(false);
                        } else if (originalDecryptedValue && currentValue === originalDecryptedValue) {
                            setOriginalDecryptedValue(null);
                            setIsEditing(false);
                        } else {
                            onChange(currentValue);
                            setOriginalDecryptedValue(null);
                            setIsEditing(false);
                        }
                    }}
                />
            )}
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
    inputWrapperUnsaved: {
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF',
    },
    errorWrapper: {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    maskedContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputWrapperInline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        minHeight: 'auto',
    },
    maskedText: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
        fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
        letterSpacing: 1,
    },
    maskedTextUnsaved: {
        color: '#2563EB',
        fontWeight: '500',
    },
    unsavedBadge: {
        minWidth: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    unsavedBadgeText: {
        fontSize: 8,
        color: '#FFFFFF',
        lineHeight: 12,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        padding: 4,
        ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    } as any,
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
    } as any,
});
