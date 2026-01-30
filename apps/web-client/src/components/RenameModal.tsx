import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, TextInput } from 'react-native';
import { Text } from '@trusttax/ui';
import { Edit2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RenameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRename: (newName: string) => void;
    currentName: string;
    title: string;
}

export const RenameModal = ({
    isOpen,
    onClose,
    onRename,
    currentName,
    title,
}: RenameModalProps) => {
    const { t } = useTranslation();
    const [newName, setNewName] = useState(currentName);

    useEffect(() => {
        if (isOpen) {
            setNewName(currentName);
        }
    }, [isOpen, currentName]);

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

    const handleRename = () => {
        if (newName.trim()) {
            onRename(newName.trim());
            onClose();
        }
    };

    return (
        <>
            {/* Overlay */}
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
                    }}
                    onClick={onClose}
                />
            )}
            <View style={styles.dialog}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.iconContainer}>
                            <Edit2 size={24} color="#0F172A" />
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
                    <Text style={styles.label}>{t('documents.new_name', 'New Name')}</Text>
                    <TextInput
                        style={styles.input}
                        value={newName}
                        onChangeText={setNewName}
                        autoFocus
                        placeholder={t('documents.rename_placeholder', 'Enter document name...')}
                        onSubmitEditing={handleRename}
                    />
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.cancelButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelButtonText}>
                            {t('dialog.cancel', 'Cancel')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleRename}
                        style={[
                            styles.confirmButton,
                            { backgroundColor: !newName.trim() ? '#94A3B8' : '#0F172A' }
                        ]}
                        disabled={!newName.trim()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.confirmButtonText}>
                            {t('documents.rename_action', 'Rename')}
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
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
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
        backgroundColor: '#F8FAFC',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    closeButton: {
        padding: 4,
        borderRadius: 0,
    },
    content: {
        padding: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748B',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#0F172A',
        borderRadius: 0,
        backgroundColor: '#F8FAFC',
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})
    } as any,
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
    },
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
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});

export default RenameModal;
