import { View, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Text } from '@trusttax/ui';
import { AlertTriangle, X } from 'lucide-react';

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
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning',
}: ConfirmDialogProps) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const variantColors = {
        danger: { icon: '#EF4444', bg: '#FEF2F2', border: '#FECACA', buttonBg: '#EF4444', buttonText: '#FFFFFF' },
        warning: { icon: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', buttonBg: '#F59E0B', buttonText: '#FFFFFF' },
        info: { icon: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', buttonBg: '#2563EB', buttonText: '#FFFFFF' },
    };

    const colors = variantColors[variant];

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    {/* Header */}
                    <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
                        <View style={styles.headerContent}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
                                <AlertTriangle size={24} color={colors.icon} />
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.title}>{title}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={20} color="#64748B" />
                        </TouchableOpacity>
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
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={[styles.confirmButton, { backgroundColor: colors.buttonBg }]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.confirmButtonText, { color: colors.buttonText }]}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dialog: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        } : {}),
    } as any,
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
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
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});
