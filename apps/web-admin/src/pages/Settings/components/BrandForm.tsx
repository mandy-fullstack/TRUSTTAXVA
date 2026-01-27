import { View, StyleSheet, TextInput, Image } from 'react-native';
import { H4, Text } from '@trusttax/ui';
import { Palette } from 'lucide-react';
import { ColorPickerInput } from '../../../components/ColorPickerInput';

interface BrandFormProps {
    data: any;
    themeOptions: any;
    onChange: (field: string, value: any) => void;
    onThemeChange: (field: string, value: string) => void;
}

export const BrandForm = ({ data, themeOptions, onChange, onThemeChange }: BrandFormProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Palette size={18} color="#64748B" />
                <H4>Branding & Theme</H4>
            </View>

            {/* Logos */}
            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.label}>Logo URL</Text>
                    <TextInput
                        style={styles.input}
                        value={data.logoUrl}
                        onChangeText={(t) => onChange('logoUrl', t)}
                        placeholder="https://..."
                    />
                    {data.logoUrl ? <Image source={{ uri: data.logoUrl }} style={styles.logoPreview} resizeMode="contain" /> : null}
                </View>
                <View style={styles.col}>
                    <Text style={styles.label}>Favicon URL</Text>
                    <TextInput
                        style={styles.input}
                        value={data.faviconUrl}
                        onChangeText={(t) => onChange('faviconUrl', t)}
                        placeholder="https://..."
                    />
                </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Core Colors</Text>
            <View style={styles.grid}>
                <View style={styles.gridItem}>
                    <ColorPickerInput label="Primary" color={data.primaryColor} onChange={(t) => onChange('primaryColor', t)} />
                </View>
                <View style={styles.gridItem}>
                    <ColorPickerInput label="Secondary" color={data.secondaryColor} onChange={(t) => onChange('secondaryColor', t)} />
                </View>
                <View style={styles.gridItem}>
                    <ColorPickerInput label="Accent" color={themeOptions.accent || '#F59E0B'} onChange={(t) => onThemeChange('accent', t)} />
                </View>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Interface Colors</Text>
            <View style={styles.grid}>
                <View style={styles.gridItem}>
                    <ColorPickerInput label="Background" color={themeOptions.background || '#FFFFFF'} onChange={(t) => onThemeChange('background', t)} />
                </View>
                <View style={styles.gridItem}>
                    <ColorPickerInput label="Surface" color={themeOptions.surface || '#F8FAFC'} onChange={(t) => onThemeChange('surface', t)} />
                </View>
                <View style={styles.gridItem}>
                    <ColorPickerInput label="Text Main" color={themeOptions.textMain || '#0F172A'} onChange={(t) => onThemeChange('textMain', t)} />
                </View>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Status Colors</Text>
            <View style={styles.grid}>
                <View style={styles.gridItem}>
                    <ColorPickerInput label="Success" color={themeOptions.success || '#10B981'} onChange={(t) => onThemeChange('success', t)} />
                </View>
                <View style={styles.gridItem}>
                    <ColorPickerInput label="Error" color={themeOptions.error || '#EF4444'} onChange={(t) => onThemeChange('error', t)} />
                </View>
                <View style={styles.gridItem}>
                    <ColorPickerInput label="Warning" color={themeOptions.warning || '#F59E0B'} onChange={(t) => onThemeChange('warning', t)} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: '#FFF', borderRadius: 0, borderWidth: 1, borderColor: '#E2E8F0', padding: 24 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 },

    row: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    col: { flex: 1 },

    label: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 4 },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 12 },

    input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 0, padding: 8, fontSize: 16, color: '#0F172A', backgroundColor: '#F8FAFC' },

    logoPreview: { width: '100%', height: 40, marginTop: 8, backgroundColor: '#F1F5F9', borderRadius: 0 },
    divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    gridItem: { width: '30%', minWidth: 140 },
});
