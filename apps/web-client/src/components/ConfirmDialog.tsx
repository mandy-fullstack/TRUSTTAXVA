import { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@trusttax/ui';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    variant = 'warning',
}: ConfirmDialogProps) => {
    const { t } = useTranslation();

    // NO permitir cerrar con Escape - solo con botones
    // Removido el handler de Escape para que el diálogo solo se cierre con los botones

    // Prevenir scroll del body cuando está abierto
    useEffect(() => {
        if (!isOpen || Platform.OS !== 'web') return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    // NO permitir cerrar haciendo click fuera - solo con botones
    // Removido el handler de overlay click

    const variantColors = {
        danger: { icon: '#EF4444', bg: '#FEF2F2', border: '#FECACA', buttonBg: '#EF4444', buttonText: '#FFFFFF' },
        warning: { icon: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', buttonBg: '#F59E0B', buttonText: '#FFFFFF' },
        info: { icon: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', buttonBg: '#2563EB', buttonText: '#FFFFFF' },
    };

    const colors = variantColors[variant];
    
    // Detectar si es un diálogo de logout (botón rojo)
    const isLogoutDialog = confirmText?.toLowerCase().includes('logout') || 
                           confirmText?.toLowerCase().includes('cerrar sesión') ||
                           variant === 'danger';

    return (
        <>
            {/* Overlay - NO clickeable, solo visual */}
            {Platform.OS === 'web' && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9998,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none', // No permite clicks
                    }}
                />
            )}
            <View style={styles.dialog}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
                    <View style={styles.headerContent}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
                            {isLogoutDialog ? (
                                <LogOut size={24} color={colors.icon} />
                            ) : (
                                <AlertTriangle size={24} color={colors.icon} />
                            )}
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.title}>{title}</Text>
                        </View>
                    </View>
                    {/* Botón X removido - solo se puede cerrar con Cancelar o Confirmar */}
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.message}>{message}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.cancelButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelButtonText}>
                            {cancelText || t('dialog.cancel', 'Cancel')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        style={[
                            styles.confirmButton,
                            isLogoutDialog && styles.confirmButtonDanger,
                            { backgroundColor: isLogoutDialog ? '#EF4444' : colors.buttonBg },
                        ]}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.confirmButtonText, { color: colors.buttonText }]}>
                            {confirmText || t('dialog.confirm', 'Confirm')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    dialog: {
        width: '90%',
        maxWidth: 480,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        zIndex: 9999,
        ...(Platform.OS === 'web' ? {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        } : {}),
    } as any,
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
    },
    closeButton: {
        padding: 4,
        borderRadius: 0,
        ...(Platform.OS === 'web' ? {
            cursor: 'pointer',
        } : {}),
    } as any,
    content: {
        padding: 20,
    },
    message: {
        fontSize: 15,
        lineHeight: 24,
        color: '#475569',
        fontWeight: '400',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        minWidth: 120,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        ...(Platform.OS === 'web' ? {
            cursor: 'pointer',
        } : {}),
    } as any,
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        letterSpacing: 0.5,
    },
    confirmButton: {
        minWidth: 120,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        borderRadius: 0,
        ...(Platform.OS === 'web' ? {
            cursor: 'pointer',
        } : {}),
    } as any,
    confirmButtonDanger: {
        backgroundColor: '#EF4444',
    } as any,
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});
