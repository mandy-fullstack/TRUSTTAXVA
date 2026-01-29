import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, H3, Text } from '@trusttax/ui';
import { FileText, CheckCircle2 } from 'lucide-react';

interface StepReviewTermsProps {
    data: any;
    onChange: (field: string, value: any) => void;
    errors: Set<string>;
    onShowTerms: () => void;
}

export const StepReviewTerms = ({ data, errors, onShowTerms }: StepReviewTermsProps) => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            {/* Summary Review */}
            <View style={styles.summaryContainer}>
                <H3 style={styles.summaryTitle}>{t('profile.review_summary', 'Profile Summary')}</H3>
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>{t('profile.full_name', 'Legal Name')}</Text>
                        <Text style={styles.summaryValue}>
                            {[data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ')}
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>{t('profile.date_of_birth', 'Date of Birth')}</Text>
                        <Text style={styles.summaryValue}>{data.dateOfBirth}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>{t('profile.tax_id_type', 'Tax ID Type')}</Text>
                        <Text style={styles.summaryValue}>{data.taxIdType}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>{t('profile.primary_language', 'Language')}</Text>
                        <Text style={styles.summaryValue}>{data.primaryLanguage?.toUpperCase()}</Text>
                    </View>
                </View>
            </View>

            {/* Terms and Conditions */}
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                        <FileText size={20} color="#2563EB" />
                    </View>
                    <H3>{t('profile.terms_conditions', 'Terms and Conditions')}</H3>
                </View>

                <View>
                    <TouchableOpacity
                        style={[
                            styles.termsCheckbox,
                            errors.has('acceptTerms') && styles.termsCheckboxError
                        ]}
                        onPress={onShowTerms}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, data.acceptTerms && styles.checkboxChecked]}>
                            {data.acceptTerms && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>
                        <View style={styles.termsText}>
                            <Text style={styles.termsLabel}>
                                {t('profile.accept_terms', 'I accept the Terms and Conditions')}
                                <Text style={styles.requiredAsterisk}> *</Text>
                            </Text>
                            <TouchableOpacity
                                onPress={onShowTerms}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.termsLink}>
                                    {t('profile.read_terms', 'Read Terms')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.termsNote}>
                    {t('profile.terms_note', 'By accepting, you acknowledge that your SSN/ITIN, driver\'s license, and passport data will be encrypted and protected according to our security standards.')}
                </Text>

                {data.acceptTerms && (
                    <View style={styles.acceptedBadge}>
                        <CheckCircle2 size={16} color="#15803D" />
                        <Text style={styles.acceptedText}>
                            {t('profile.terms_accepted', 'Terms Accepted')}
                        </Text>
                    </View>
                )}
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 24,
    },
    summaryContainer: {
        marginBottom: 8,
    },
    summaryTitle: {
        fontSize: 16,
        marginBottom: 16,
        color: '#1E293B',
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    summaryItem: {
        width: '45%',
        minWidth: 150,
    },
    summaryLabel: {
        fontSize: 11,
        color: '#64748B',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0F172A',
    },
    card: {
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    termsCheckbox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    termsCheckboxError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    checkmark: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    termsText: {
        flex: 1,
    },
    termsLabel: {
        fontSize: 14,
        color: '#1E293B',
        marginBottom: 4,
    },
    requiredAsterisk: {
        color: '#EF4444',
    },
    termsLink: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '500',
    },
    termsNote: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 16,
        lineHeight: 18,
    },
    acceptedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        padding: 8,
        backgroundColor: '#F0FDF4',
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    acceptedText: {
        fontSize: 12,
        color: '#166534',
        fontWeight: '500',
    },
});
