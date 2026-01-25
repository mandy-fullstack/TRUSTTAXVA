import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { HexColorPicker } from 'react-colorful';
import { Text } from '@trusttax/ui';

interface ColorPickerInputProps {
    label: string;
    color: string;
    onChange: (color: string) => void;
}

export const ColorPickerInput = ({ label, color, onChange }: ColorPickerInputProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const safeColor = color || '#000000';

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.inputWrapper}>
                <TouchableOpacity onPress={() => setIsOpen(true)} style={[styles.preview, { backgroundColor: safeColor }]} />
                <TextInput
                    style={styles.input}
                    value={color}
                    onChangeText={onChange}
                    placeholder="#000000"
                />
            </View>

            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
                    {/* Stop propagation on picker click */}
                    <Pressable style={styles.popover} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.popoverTitle}>Select {label}</Text>
                        <View style={styles.pickerContainer}>
                            <HexColorPicker color={safeColor} onChange={onChange} />
                        </View>
                        <View style={styles.hexDisplay}>
                            <Text style={styles.hexText}>{safeColor.toUpperCase()}</Text>
                        </View>
                        <TouchableOpacity style={styles.doneButton} onPress={() => setIsOpen(false)}>
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 16, width: '100%', minWidth: 140 },
    label: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6 },

    inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    preview: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    input: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, fontSize: 13, color: '#0F172A', backgroundColor: '#F8FAFC' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    popover: { backgroundColor: '#FFF', padding: 24, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
    popoverTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
    pickerContainer: { width: 200, height: 200, marginBottom: 16 },
    hexDisplay: { marginBottom: 16, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: '#F1F5F9', borderRadius: 4 },
    hexText: { fontWeight: '700', color: '#475569', fontSize: 14 },

    doneButton: { backgroundColor: '#0F172A', paddingVertical: 10, paddingHorizontal: 32, borderRadius: 8 },
    doneText: { color: '#FFF', fontWeight: '600' }
});
