import { View, StyleSheet, TextInput } from 'react-native';
import { H4, Text } from '@trusttax/ui';
import { Share2, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

interface SocialFormProps {
    links: any;
    onChange: (field: string, value: string) => void;
}

export const SocialForm = ({ links, onChange }: SocialFormProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Share2 size={18} color="#64748B" />
                <H4>Social Media</H4>
            </View>

            <View style={styles.group}>
                <View style={styles.iconLabel}><Facebook size={14} /><Text style={styles.label}>Facebook</Text></View>
                <TextInput style={styles.input} value={links.facebook} onChangeText={(t) => onChange('facebook', t)} placeholder="https://facebook.com/..." />
            </View>

            <View style={styles.group}>
                <View style={styles.iconLabel}><Instagram size={14} /><Text style={styles.label}>Instagram</Text></View>
                <TextInput style={styles.input} value={links.instagram} onChangeText={(t) => onChange('instagram', t)} placeholder="https://instagram.com/..." />
            </View>

            <View style={styles.group}>
                <View style={styles.iconLabel}><Linkedin size={14} /><Text style={styles.label}>LinkedIn</Text></View>
                <TextInput style={styles.input} value={links.linkedin} onChangeText={(t) => onChange('linkedin', t)} placeholder="https://linkedin.com/in/..." />
            </View>

            <View style={styles.group}>
                <View style={styles.iconLabel}><Twitter size={14} /><Text style={styles.label}>Twitter / X</Text></View>
                <TextInput style={styles.input} value={links.twitter} onChangeText={(t) => onChange('twitter', t)} placeholder="https://twitter.com/..." />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFF', borderRadius: 0, borderWidth: 1, borderColor: '#E2E8F0', padding: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 },
    group: { marginBottom: 16 },
    iconLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    label: { fontSize: 13, fontWeight: '600', color: '#475569' },
    input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 0, padding: 10, fontSize: 16, backgroundColor: '#F8FAFC', color: '#0F172A' },
});
