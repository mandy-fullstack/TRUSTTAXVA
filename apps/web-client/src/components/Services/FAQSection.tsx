import { View, StyleSheet } from 'react-native';
import { MessageCircle } from 'lucide-react';
import { Card, H2, H4, Text } from '@trusttax/ui';

export interface FAQ {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    faqs?: FAQ[];
}

const defaultFaqs: FAQ[] = [
    { question: 'How long does the process take?', answer: 'Typically 2-4 business days from submission of all required documents.' },
    { question: 'What if I need to make changes?', answer: 'You can request revisions at any time during the review process.' },
    { question: 'Is my information secure?', answer: 'Yes, we use bank-level encryption and comply with all privacy regulations.' },
    { question: 'Do you offer guarantees?', answer: 'Yes, we provide accuracy guarantees and will support any IRS correspondence.' },
];

export const FAQSection = ({ faqs = defaultFaqs }: FAQSectionProps) => {
    return (
        <View style={styles.section}>
            <H2 style={styles.sectionTitle}>Frequently Asked Questions</H2>
            <View style={styles.faqList}>
                {faqs.map((faq, i) => (
                    <Card key={i} style={styles.faqCard}>
                        <View style={styles.faqQuestion}>
                            <MessageCircle size={18} color="#2563EB" />
                            <H4 style={{ flex: 1, marginBottom: 0 }}>{faq.question}</H4>
                        </View>
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
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
