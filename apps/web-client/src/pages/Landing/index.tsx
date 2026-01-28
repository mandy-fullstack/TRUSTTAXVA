import { View, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { Text, H1, H2, H3, H4, Button } from '@trusttax/ui';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PublicLayout } from '../../components/PublicLayout';
import { AuthorizedIRSBadge } from '../../components/AuthorizedIRSBadge';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Award, Briefcase, FileText, UserCheck, TrendingUp } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { Testimonials } from '../../components/Testimonials';
import { useTranslation } from 'react-i18next';
import { PageMeta } from '../../components/PageMeta';

export const LandingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { profile } = useCompany();
    const { width } = useWindowDimensions();
    const isMobile = width <= 1024;
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, isLoading, navigate]);

    return (
        <PublicLayout>
            <PageMeta
                title={`${t('landing.hero_title', 'Professional Tax & Immigration Services')} | TrustTax`}
                description={t('landing.hero_subtitle', 'Expert guidance for your tax returns, business formation, and immigration paperwork. Fast, secure, and reliable service.')}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={[styles.hero, isMobile && { paddingVertical: 64 }]}>
                    <View style={styles.heroContent}>
                        <H1 style={[styles.heroTitle, isMobile && { fontSize: 36, lineHeight: 44 }]}>{t('landing.hero_title', 'Professional Tax & Immigration Services You Can Trust')}</H1>
                        <Text style={[styles.heroSubtitle, isMobile && { fontSize: 16, lineHeight: 28, marginBottom: 32 }]}>
                            {profile?.description || t('landing.hero_subtitle', 'Expert guidance for your tax returns, business formation, and immigration paperwork. Fast, secure, and reliable service.')}
                        </Text>

                        <View style={styles.heroButtons}>
                            <Button
                                title={t('common.get_started_today', 'Get Started Today')}
                                variant="primary"
                                icon={<ArrowRight size={20} color="#FFF" />}
                                iconPosition="right"
                                onPress={() => navigate('/register')}
                                style={[isMobile && { width: '100%', maxWidth: 300 }, styles.heroBtn]}
                            />
                            <Button
                                title={t('common.view_services', 'View Services')}
                                variant="outline"
                                onPress={() => navigate('/services')}
                                style={[isMobile && { width: '100%', maxWidth: 300 }, styles.heroBtn]}
                            />
                        </View>

                        <View style={styles.irsBadgeContainer}>
                            <AuthorizedIRSBadge />
                        </View>
                    </View>
                </View>

                {/* Features Section */}
                <View style={styles.sectionLight}>
                    <View style={styles.container}>
                        <View style={styles.sectionHeader}>
                            <H2 style={styles.sectionTitle}>{t('landing.why_choose', 'Why Choose TrustTax?')}</H2>
                            <Text style={styles.sectionSubtitle}>{t('landing.why_choose_subtitle', 'We combine professional expertise with modern technology to deliver the best results.')}</Text>
                        </View>
                        <View style={styles.featuresGrid}>
                            <View style={[styles.featureCard, isMobile && { alignItems: 'center' }]}>
                                <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}><TrendingUp size={24} color="#2563EB" /></View>
                                <H3 style={[styles.featureTitle, isMobile && { textAlign: 'center' }]}>{t('landing.refund_guarantee', 'Max Refund Guarantee')}</H3>
                                <Text style={[styles.featureText, isMobile && { textAlign: 'center' }]}>{t('landing.refund_guarantee_text', 'We carefully review every deduction and credit to ensure you get the maximum refund possible.')}</Text>
                            </View>
                            <View style={[styles.featureCard, isMobile && { alignItems: 'center' }]}>
                                <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}><Shield size={24} color="#059669" /></View>
                                <H3 style={[styles.featureTitle, isMobile && { textAlign: 'center' }]}>{t('landing.audit_protection', 'Audit Protection')}</H3>
                                <Text style={[styles.featureText, isMobile && { textAlign: 'center' }]}>{t('landing.audit_protection_text', 'Rest easy knowing that our certified enrolled agents represent you in case of any IRS inquiries.')}</Text>
                            </View>
                            <View style={[styles.featureCard, isMobile && { alignItems: 'center' }]}>
                                <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}><Award size={24} color="#EA580C" /></View>
                                <H3 style={[styles.featureTitle, isMobile && { textAlign: 'center' }]}>{t('landing.certified_experts', 'Certified Experts')}</H3>
                                <Text style={[styles.featureText, isMobile && { textAlign: 'center' }]}>{t('landing.certified_experts_text', 'All returns are prepared and reviewed by certified tax professionals and immigration specialists.')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* How It Works Section */}
                <View style={styles.sectionWhite}>
                    <View style={styles.container}>
                        <View style={styles.sectionHeader}>
                            <H2 style={styles.sectionTitle}>{t('landing.how_it_works', 'How It Works')}</H2>
                            <Text style={styles.sectionSubtitle}>{t('landing.how_it_works_subtitle', 'Simple, transparent, and completely digital.')}</Text>
                        </View>
                        <View style={[styles.processRow, isMobile && { flexDirection: 'column', alignItems: 'center' }]}>
                            <View style={[styles.processStep, isMobile && { alignItems: 'center' }]}>
                                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                                <H3 style={[styles.stepTitle, isMobile && { textAlign: 'center' }]}>{t('landing.step1_title', 'Upload Documents')}</H3>
                                <Text style={[styles.stepText, isMobile && { textAlign: 'center' }]}>{t('landing.step1_desc', 'Take photos of your W-2s and other forms using our secure mobile app.')}</Text>
                            </View>
                            {!isMobile && <View style={styles.processConnector} />}
                            <View style={[styles.processStep, isMobile && { alignItems: 'center' }]}>
                                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                                <H3 style={[styles.stepTitle, isMobile && { textAlign: 'center' }]}>{t('landing.step2_title', 'Expert Review')}</H3>
                                <Text style={[styles.stepText, isMobile && { textAlign: 'center' }]}>{t('landing.step2_desc', 'Our professionals prepare your return and contact you for any missing details.')}</Text>
                            </View>
                            {!isMobile && <View style={styles.processConnector} />}
                            <View style={[styles.processStep, isMobile && { alignItems: 'center' }]}>
                                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                                <H3 style={[styles.stepTitle, isMobile && { textAlign: 'center' }]}>{t('landing.step3_title', 'Approve & File')}</H3>
                                <Text style={[styles.stepText, isMobile && { textAlign: 'center' }]}>{t('landing.step3_desc', 'Review your return, sign electronically, and we file it instantly with the IRS.')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Services Preview */}
                <View style={styles.sectionLight}>
                    <View style={styles.container}>
                        <View style={styles.sectionHeader}>
                            <H2 style={styles.sectionTitle}>{t('landing.core_services', 'Our Core Services')}</H2>
                            <Text style={styles.sectionSubtitle}>{t('landing.core_services_subtitle', 'Comprehensive financial and legal solutions.')}</Text>
                        </View>
                        <View style={styles.grid}>
                            <TouchableOpacity onPress={() => navigate('/services')} style={[styles.card, isMobile && { alignItems: 'center' }]}>
                                <View style={styles.cardIconBox}><Briefcase size={28} color="#2563EB" /></View>
                                <H4 style={[styles.cardTitle, isMobile && { textAlign: 'center' }]}>{t('landing.tax_prep', 'Tax Preparation')}</H4>
                                <Text style={[styles.cardDesc, isMobile && { textAlign: 'center' }]}>{t('landing.tax_prep_desc', 'Personal and business tax returns filed accurately and on time.')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigate('/services')} style={[styles.card, isMobile && { alignItems: 'center' }]}>
                                <View style={[styles.cardIconBox, { backgroundColor: '#ECFDF5' }]}><FileText size={28} color="#059669" /></View>
                                <H4 style={[styles.cardTitle, isMobile && { textAlign: 'center' }]}>{t('landing.immigration', 'Immigration')}</H4>
                                <Text style={[styles.cardDesc, isMobile && { textAlign: 'center' }]}>{t('landing.immigration_desc', 'Assistance with citizenship, green cards, and work permits.')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigate('/services')} style={[styles.card, isMobile && { alignItems: 'center' }]}>
                                <View style={[styles.cardIconBox, { backgroundColor: '#FFF7ED' }]}><UserCheck size={28} color="#EA580C" /></View>
                                <H4 style={[styles.cardTitle, isMobile && { textAlign: 'center' }]}>{t('landing.consulting', 'Consulting')}</H4>
                                <Text style={[styles.cardDesc, isMobile && { textAlign: 'center' }]}>{t('landing.consulting_desc', 'Strategic advice for your growing business and financial future.')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Button
                                title={t('common.view_all_services', 'View All Services')}
                                variant="outline"
                                onPress={() => navigate('/services')}
                                style={isMobile && { width: '100%', maxWidth: 300 }}
                            />
                        </View>
                    </View>
                </View>

                {/* Testimonials */}
                <Testimonials />

                {/* CTA Section */}
                <View style={styles.ctaSection}>
                    <View style={styles.ctaInner}>
                        <H2 style={[styles.ctaTitle, isMobile && { fontSize: 28 }]}>{t('landing.ready_to_start', 'Ready to get started?')}</H2>
                        <Text style={[styles.ctaText, isMobile && { fontSize: 16 }]}>{t('landing.ready_to_start_subtitle', 'Join the satisfied clients who trust TrustTax with their financial future.')}</Text>
                        <Button
                            title={t('common.create_free_account', 'Create Free Account')}
                            variant="primary"
                            onPress={() => navigate('/register')}
                            style={[{ backgroundColor: '#FFF' }, isMobile && { width: '100%', maxWidth: 300 }]}
                            textStyle={{ color: '#0F172A' }}
                        />
                    </View>
                </View>
            </ScrollView>
        </PublicLayout>
    );
};

const styles = StyleSheet.create({
    container: { maxWidth: 1200, width: '100%', marginHorizontal: 'auto', paddingHorizontal: 24 },

    hero: { paddingVertical: 96, paddingHorizontal: 24, backgroundColor: '#FFF', alignItems: 'center' },
    heroContent: { maxWidth: 860, alignItems: 'center', textAlign: 'center' },
    heroTitle: { fontSize: 56, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 24, lineHeight: 64, letterSpacing: -1.5 } as any,
    heroSubtitle: { fontSize: 20, color: '#64748B', textAlign: 'center', marginBottom: 48, lineHeight: 32, maxWidth: 680 },
    heroButtons: { flexDirection: 'row', gap: 16, marginBottom: 48, flexWrap: 'wrap', justifyContent: 'center' },
    heroBtn: { height: 44, borderRadius: 0 },

    irsBadgeContainer: { marginBottom: 56 },

    sectionWhite: { backgroundColor: '#FFFFFF', paddingVertical: 80 },
    sectionLight: { backgroundColor: '#F9FAFB', paddingVertical: 80 },
    sectionHeader: { marginBottom: 56, alignItems: 'center' },
    sectionTitle: { fontSize: 32, fontWeight: '700', color: '#0F172A', marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 } as any,
    sectionSubtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', maxWidth: 600, lineHeight: 26, fontWeight: '300' },

    featuresGrid: { flexDirection: 'row', gap: 24, flexWrap: 'wrap', justifyContent: 'center' },
    featureCard: { flex: 1, minWidth: 280, padding: 32, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
    featureTitle: { fontSize: 18, fontWeight: '600', color: '#0F172A', marginBottom: 12, marginTop: 20, letterSpacing: -0.5 } as any,
    featureText: { fontSize: 15, color: '#64748B', lineHeight: 24, fontWeight: '300' },

    iconBox: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },

    processRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40 },
    processStep: { flex: 1, minWidth: 260, alignItems: 'center', paddingHorizontal: 16 },
    processConnector: { width: 48, height: 1.5, backgroundColor: '#E2E8F0', marginTop: 32, opacity: 0.5 } as any,
    stepNumber: { width: 56, height: 56, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    stepNumberText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
    stepTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 16, letterSpacing: -0.5 } as any,
    stepText: { fontSize: 15, color: '#64748B', lineHeight: 26, fontWeight: '300' },

    grid: { flexDirection: 'row', gap: 24, flexWrap: 'wrap', justifyContent: 'center' },
    card: {
        flex: 1,
        minWidth: 280,
        padding: 32,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...(Platform.OS === 'web'
            ? { boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }
            : { shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }
        ),
    } as any,
    cardIconBox: { width: 48, height: 48, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#0F172A', marginBottom: 12, letterSpacing: -0.5 } as any,
    cardDesc: { fontSize: 15, color: '#64748B', lineHeight: 24, fontWeight: '300' },

    ctaSection: { backgroundColor: '#0F172A', paddingVertical: 80, paddingHorizontal: 24 },
    ctaInner: { maxWidth: 1200, marginHorizontal: 'auto', alignItems: 'center', textAlign: 'center' },
    ctaTitle: { color: '#FFF', fontSize: 36, fontWeight: '700', marginBottom: 16, letterSpacing: -0.5 },
    ctaText: { color: '#94A3B8', fontSize: 18, marginBottom: 40, maxWidth: 600, textAlign: 'center', lineHeight: 28, fontWeight: '300' }
});
