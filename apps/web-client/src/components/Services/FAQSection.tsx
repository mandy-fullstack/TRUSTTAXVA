import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { Card, H2, H4, Text } from '@trusttax/ui';

export interface FAQ {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    faqs?: FAQ[];
}

function getDefaultFaqs(t: (key: string) => string): FAQ[] {
    return [
        { question: t('services.faq.process_time_q'), answer: t('services.faq.process_time_a') },
        { question: t('services.faq.changes_q'), answer: t('services.faq.changes_a') },
        { question: t('services.faq.security_q'), answer: t('services.faq.security_a') },
        { question: t('services.faq.guarantees_q'), answer: t('services.faq.guarantees_a') },
    ];
}

export const FAQSection = ({ faqs }: FAQSectionProps) => {
    const { t } = useTranslation();
    const displayFaqs = (faqs || getDefaultFaqs(t)) || [];

    if (!Array.isArray(displayFaqs) || displayFaqs.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <H2 style={styles.sectionTitle}>{t('services.faq.title', 'Frequently Asked Questions')}</H2>
            <View style={styles.faqList}>
                {displayFaqs.map((faq, i) => (
                    <Card key={i} style={styles.faqCard}>
                        <View style={styles.faqQuestion}>
                            <MessageCircle size={18} color="#2563EB" />
                            <H4 style={{ flex: 1, marginBottom: 0 }}>{faq?.question || 'Question'}</H4>
                        </View>
                        <Text style={styles.faqAnswer}>{faq?.answer || 'Answer coming soon.'}</Text>
                    </Card>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: { marginBottom: 80 },
    sectionTitle: { marginBottom: 32 },
    faqList: { gap: 16 },
    faqCard: { padding: 20 },
    faqQuestion: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    faqAnswer: { fontSize: 14, color: '#64748B', lineHeight: 22, paddingLeft: 30 },
});
