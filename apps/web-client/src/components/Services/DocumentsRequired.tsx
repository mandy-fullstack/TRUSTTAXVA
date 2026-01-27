import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
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

function getDefaultCategories(t: (key: string) => string): DocumentCategory[] {
    return [
        { title: t('services.documents.identification'), items: [t('services.documents.valid_passport'), t('services.documents.ssn_itin')] },
        { title: t('services.documents.income_documents'), items: [t('services.documents.w2_forms'), t('services.documents.1099_forms'), t('services.documents.business_income')] },
        { title: t('services.documents.deductions_credits'), items: [t('services.documents.mortgage_interest'), t('services.documents.educational_expenses'), t('services.documents.medical_expenses')] },
        { title: t('services.documents.previous_returns'), items: [t('services.documents.prior_returns'), t('services.documents.state_tax'), t('services.documents.amendment_forms')] },
    ];
}

export const DocumentsRequired = ({ categories, docTypes }: DocumentsRequiredProps) => {
    const { t } = useTranslation();
    let displayCategories = categories;

    if (!displayCategories && docTypes && docTypes.length > 0) {
        // Map raw docTypes (enums like TAX_FORM) to readable labels
        const labels: Record<string, string> = {
            'ID_CARD': t('services.documents.id_card'),
            'TAX_FORM': t('services.documents.tax_form'),
            'PROOF_OF_INCOME': t('services.documents.proof_of_income'),
            'PASSPORT': t('services.documents.passport'),
            'OTHER': t('services.documents.other')
        };

        displayCategories = [{
            title: t('services.documents.required_documentation'),
            items: docTypes.map(d => labels[d] || d.replace('_', ' '))
        }];
    }

    if (!displayCategories || displayCategories.length === 0) {
        displayCategories = getDefaultCategories(t);
    }

    return (
        <View style={styles.section}>
            <H2 style={styles.sectionTitle}>{t('services.documents.title')}</H2>
            <Text style={styles.sectionSubtitle}>{t('services.documents.subtitle')}</Text>
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
