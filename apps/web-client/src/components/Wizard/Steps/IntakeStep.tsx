import React from 'react';
import { View, StyleSheet, TextInput, Switch } from 'react-native';
import { H3, Text, Input, Button, Card } from '@trusttax/ui';
import type { ServiceStep } from '../../../types';

interface IntakeStepProps {
    step: ServiceStep;
    data: any;
    onChange: (data: any) => void;
}

export const IntakeStep = ({ step, data, onChange }: IntakeStepProps) => {
    const handleChange = (name: string, value: any) => {
        onChange({ ...data, [name]: value });
    };

    if (!step.formConfig || step.formConfig.length === 0) {
        return (
            <View>
                <H3>{step.title}</H3>
                <Text style={styles.desc}>{step.description || 'Please provide details for this step.'}</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Additional Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        numberOfLines={4}
                        placeholder="Enter any relevant information..."
                        placeholderTextColor="#94A3B8"
                        value={data.notes || ''}
                        onChangeText={(text) => handleChange('notes', text)}
                    />
                </View>
            </View>
        );
    }

    return (
        <View>
            <H3>{step.title}</H3>
            <Text style={styles.desc}>{step.description}</Text>

            <View style={styles.form}>
                {step.formConfig.map((field) => (
                    <View key={field.name} style={styles.field}>
                        <Text style={styles.label}>
                            {field.label} {field.required && <Text style={{ color: '#EF4444' }}>*</Text>}
                        </Text>

                        {field.type === 'boolean' ? (
                            <View style={styles.switchRow}>
                                <Text style={{ color: '#0F172A' }}>{field.label}?</Text>
                                <Switch
                                    value={!!data[field.name]}
                                    onValueChange={(val) => handleChange(field.name, val)}
                                    trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                                />
                            </View>
                        ) : (
                            <TextInput
                                style={styles.input}
                                placeholder={field.placeholder}
                                placeholderTextColor="#94A3B8"
                                value={data[field.name] || ''}
                                onChangeText={(text) => handleChange(field.name, text)}
                                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                            />
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    desc: { fontSize: 16, color: '#64748B', marginBottom: 24, lineHeight: 24 },
    form: { gap: 20 },
    field: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155' },
    input: { height: 48, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 16, fontSize: 16, color: '#0F172A', backgroundColor: '#FFF' },
    textArea: { height: 120, paddingTop: 12, textAlignVertical: 'top' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#F8FAFC' }
});
