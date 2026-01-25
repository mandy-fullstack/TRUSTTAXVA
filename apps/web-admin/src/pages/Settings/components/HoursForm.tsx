import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { H4, Text } from '@trusttax/ui';
import { Clock, Plus, Trash2 } from 'lucide-react';

interface HourEntry {
    id: string;
    label: string; // e.g. "Weekdays"
    value: string; // e.g. "9:00 AM - 5:00 PM"
}

interface HoursFormProps {
    hours: HourEntry[];
    onChange: (hours: HourEntry[]) => void;
}

export const HoursForm = ({ hours, onChange }: HoursFormProps) => {

    const addEntry = () => {
        const newEntry: HourEntry = {
            id: Date.now().toString(),
            label: '',
            value: ''
        };
        onChange([...hours, newEntry]);
    };

    const removeEntry = (id: string) => {
        onChange(hours.filter(h => h.id !== id));
    };

    const updateEntry = (id: string, field: 'label' | 'value', text: string) => {
        onChange(hours.map(h => h.id === id ? { ...h, [field]: text } : h));
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Clock size={18} color="#64748B" />
                <H4>Business Hours</H4>
            </View>
            <Text style={styles.helperText}>Add as many time slots as needed (e.g. "Weekdays", "Holidays").</Text>

            <View style={styles.list}>
                {hours.map((entry) => (
                    <View key={entry.id} style={styles.row}>
                        <View style={styles.fieldCol}>
                            <Text style={styles.label}>Label (e.g. Mon-Fri)</Text>
                            <TextInput
                                style={styles.input}
                                value={entry.label}
                                onChangeText={(t) => updateEntry(entry.id, 'label', t)}
                                placeholder="Day(s)"
                            />
                        </View>
                        <View style={styles.fieldCol}>
                            <Text style={styles.label}>Hours</Text>
                            <TextInput
                                style={styles.input}
                                value={entry.value}
                                onChangeText={(t) => updateEntry(entry.id, 'value', t)}
                                placeholder="9:00 AM - 5:00 PM"
                            />
                        </View>
                        <TouchableOpacity onPress={() => removeEntry(entry.id)} style={styles.deleteBtn}>
                            <Trash2 size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={addEntry}>
                <Plus size={16} color="#2563EB" />
                <Text style={styles.addBtnText}>Add Time Slot</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 },
    helperText: { fontSize: 13, color: '#64748B', marginBottom: 16 },

    list: { gap: 12, marginBottom: 16 },
    row: { flexDirection: 'row', gap: 12, alignItems: 'flex-end', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    fieldCol: { flex: 1 },

    label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
    input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 8, fontSize: 14, backgroundColor: '#FFF', color: '#0F172A' },

    deleteBtn: { padding: 10, backgroundColor: '#FEF2F2', borderRadius: 6, borderWidth: 1, borderColor: '#FECACA' },

    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#EFF6FF', borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' },
    addBtnText: { fontSize: 14, fontWeight: '600', color: '#2563EB' }
});
