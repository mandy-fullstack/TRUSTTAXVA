import { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Text, Button } from '@trusttax/ui';
import { X, Edit2 } from 'lucide-react';

interface RenameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRename: (newName: string) => void;
    currentName: string;
    title?: string;
}

export const RenameModal = ({ isOpen, onClose, onRename, currentName, title }: RenameModalProps) => {
    const [name, setName] = useState(currentName);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(currentName);
            setLoading(false);
        }
    }, [isOpen, currentName]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await onRename(name);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <View style={styles.iconBox}>
                                <Edit2 size={20} color="#2563EB" />
                            </View>
                            <Text style={styles.title}>{title || 'Rename Document'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.body}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Document name"
                            autoFocus
                            onSubmitEditing={handleSubmit}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Button
                            variant="outline"
                            title="Cancel"
                            onPress={onClose}
                            style={styles.cancelBtn}
                        />
                        <Button
                            title={loading ? 'Saving...' : 'Save'}
                            onPress={handleSubmit}
                            disabled={loading || !name.trim()}
                            style={styles.saveBtn}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    content: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
        paddingBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 0,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    closeBtn: {
        padding: 4,
    },
    body: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 0,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#0F172A',
        backgroundColor: '#F8FAFC',
        outlineStyle: 'none' as any,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        padding: 24,
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    cancelBtn: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        width: Platform.OS === 'web' ? 'auto' : undefined,
    },
    saveBtn: {
        backgroundColor: '#0F172A',
        width: Platform.OS === 'web' ? 'auto' : undefined,
    },
});
