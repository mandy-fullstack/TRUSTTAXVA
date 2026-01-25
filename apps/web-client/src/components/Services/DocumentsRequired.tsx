import { View, StyleSheet } from 'react-native';
import { FileText, CheckCircle } from 'lucide-react';
import { Card, H2, H4, Text } from '@trusttax/ui';

export interface DocumentCategory {
    title: string;
    items: string[];
}

interface DocumentsRequiredProps {
    categories?: DocumentCategory[];
    docTypes?: string[];
}

const defaultCategories: DocumentCategory[] = [
    { title: 'Identification', items: ['Valid Passport or Government ID', 'Social Security Number or ITIN'] },
    { title: 'Income Documents', items: ['W-2 Forms from all employers', '1099 Forms (if applicable)', 'Business income statements'] },
    { title: 'Deductions & Credits', items: ['Mortgage interest statements', 'Educational expenses', 'Medical expenses receipts'] },
    { title: 'Previous Returns', items: ['Prior year tax returns', 'State tax documents', 'Amendment forms (if any)'] },
];

export const DocumentsRequired = ({ categories, docTypes }: DocumentsRequiredProps) => {
    let displayCategories = categories;

    if (!displayCategories && docTypes && docTypes.length > 0) {
        // Map raw docTypes (enums like TAX_FORM) to readable labels
        const labels: Record<string, string> = {
            'ID_CARD': 'Valid Passport or ID Card',
            'TAX_FORM': 'W-2 or 1099 Forms',
            'PROOF_OF_INCOME': 'Proof of Income / Bank Statements',
            'PASSPORT': 'Current Passport',
            'OTHER': 'Supporting Documentation'
        };

        displayCategories = [{
            title: 'Required Documentation',
            items: docTypes.map(d => labels[d] || d.replace('_', ' '))
        }];
    }

    if (!displayCategories || displayCategories.length === 0) {
        displayCategories = defaultCategories;
    }

    return (
        <View style={styles.section}>
            <H2 style={styles.sectionTitle}>Required Documents</H2>
            <Text style={styles.sectionSubtitle}>Please prepare the following documents before starting</Text>
            <View style={styles.twoColGrid}>
                {displayCategories.map((group, i) => (
                    <Card key={i} style={styles.docCard} elevated>
                        <View style={styles.docHeader}>
                            <FileText size={20} color="#2563EB" />
                            <H4 style={{ marginBottom: 0 }}>{group.title}</H4>
                        </View>
                        <View style={styles.docList}>
                            {group.items.map((item, j) => (
                                <View key={j} style={styles.docItem}>
                                    <CheckCircle size={16} color="#10B981" />
                                    <Text style={styles.docItemText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </Card>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: { marginBottom: 80 },
    sectionTitle: { marginBottom: 8 },
    sectionSubtitle: { fontSize: 16, color: '#64748B', marginBottom: 32 },
    twoColGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
    docCard: { flex: 1, minWidth: 280 },
    docHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    docList: { gap: 12 },
    docItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    docItemText: { flex: 1, fontSize: 14, color: '#1E293B', lineHeight: 20 },
});
