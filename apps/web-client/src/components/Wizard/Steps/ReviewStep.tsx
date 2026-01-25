import { View, StyleSheet, ScrollView } from 'react-native';
import { H3, Text, Card } from '@trusttax/ui';
import { CheckCircle2, FileText } from 'lucide-react';

interface ReviewStepProps {
    formData: any;
    docData: any;
    serviceName: string;
}

export const ReviewStep = ({ formData, docData, serviceName }: ReviewStepProps) => {
    return (
        <View>
            <H3>Review & Submit</H3>
            <Text style={styles.desc}>Please review the information below before creating your order.</Text>

            <ScrollView style={styles.reviewList}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Details</Text>
                    <Card padding="sm" style={styles.card}>
                        <Text style={styles.label}>Service Type</Text>
                        <Text style={styles.value}>{serviceName}</Text>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Intake Information</Text>
                    <Card padding="sm" style={styles.card}>
                        {Object.keys(formData).length > 0 ? (
                            Object.entries(formData).map(([key, val]) => (
                                <View key={key} style={styles.row}>
                                    <Text style={styles.label}>{key}</Text>
                                    <Text style={styles.value}>{String(val)}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.empty}>No information provided</Text>
                        )}
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documents</Text>
                    <Card padding="sm" style={styles.card}>
                        {Object.keys(docData).length > 0 ? (
                            Object.entries(docData).map(([key]: [string, unknown]) => (
                                <View key={key} style={styles.row}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <FileText size={16} color="#64748B" />
                                        <Text style={styles.label}>{key}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <CheckCircle2 size={14} color="#10B981" />
                                        <Text style={{ color: '#10B981', fontSize: 13 }}>Attached</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.empty}>No documents uploaded</Text>
                        )}
                    </Card>
                </View>

                <View style={styles.policies}>
                    <Text style={styles.policyText}>
                        By submitting this order, you agree to our Terms of Service. A TrustTax professional will review your data and create an invoice for the initial deposit.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    desc: { fontSize: 16, color: '#64748B', marginBottom: 24 },
    reviewList: {},
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
    card: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    label: { color: '#64748B', fontSize: 14, textTransform: 'capitalize' },
    value: { color: '#0F172A', fontWeight: '500', fontSize: 14 },
    empty: { fontStyle: 'italic', color: '#94A3B8' },
    policies: { padding: 16, backgroundColor: '#EFF6FF', borderRadius: 8, marginTop: 8 },
    policyText: { fontSize: 13, color: '#475569', textAlign: 'center', lineHeight: 20 }
});
