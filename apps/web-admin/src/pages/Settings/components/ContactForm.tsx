import { View, StyleSheet, TextInput } from 'react-native';
import { H4, Text } from '@trusttax/ui';
import { Phone, Mail, MapPin, Globe } from 'lucide-react';

interface ContactFormProps {
    data: any;
    onChange: (field: string, value: string) => void;
}

export const ContactForm = ({ data, onChange }: ContactFormProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Phone size={18} color="#64748B" />
                <H4>Contact Information</H4>
            </View>

            <View style={styles.group}>
                <View style={styles.iconLabel}><Mail size={14} /><Text style={styles.label}>Email Address</Text></View>
                <TextInput style={styles.input} value={data.email} onChangeText={(t) => onChange('email', t)} />
            </View>

            <View style={styles.group}>
                <View style={styles.iconLabel}><Phone size={14} /><Text style={styles.label}>Phone Number</Text></View>
                <TextInput style={styles.input} value={data.phone} onChangeText={(t) => onChange('phone', t)} />
            </View>

            <View style={styles.group}>
                <View style={styles.iconLabel}><MapPin size={14} /><Text style={styles.label}>Physical Address</Text></View>
                <TextInput style={styles.input} value={data.address} onChangeText={(t) => onChange('address', t)} />
            </View>

            <View style={styles.group}>
                <View style={styles.iconLabel}><Globe size={14} /><Text style={styles.label}>Website URL</Text></View>
                <TextInput style={styles.input} value={data.website} onChangeText={(t) => onChange('website', t)} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 },
    group: { marginBottom: 16 },
    iconLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    label: { fontSize: 13, fontWeight: '600', color: '#475569' },
    input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 10, fontSize: 16, backgroundColor: '#F8FAFC', color: '#0F172A' },
});
