import { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../components/PublicLayout';
import { ShoppingBag, ChevronRight, Clock, ShieldCheck, Briefcase, Scale, CheckCircle2, Search } from 'lucide-react';
import { Card, H1, H2, H3, Text, Button, Badge, Input } from '@trusttax/ui';
import { api } from '../../services/api';
import type { Service } from '../../types';
import { useTranslation } from 'react-i18next';
import { PageMeta } from '../../components/PageMeta';
import type { ViewStyle, TextStyle } from 'react-native';

type CategoryId = 'ALL' | 'TAX' | 'LEGAL' | 'BUSINESS';

function parsePrice(v: unknown): number {
    if (v == null) return 0;
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
}
function hasDiscount(s: Service): boolean {
    const orig = parsePrice(s.originalPrice);
    const pr = parsePrice(s.price);
    return orig > 0 && orig > pr;
}
function discountAmount(s: Service): number {
    return Math.round(parsePrice(s.originalPrice) - parsePrice(s.price));
}
function discountPercent(s: Service): number {
    const o = parsePrice(s.originalPrice);
    const p = parsePrice(s.price);
    return o > 0 ? Math.round((1 - p / o) * 100) : 0;
}

export const PublicServicesPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<CategoryId>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await api.getServices();
                setServices(data);
            } catch (error) {
                console.error('Failed to fetch services:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    const filteredServices = services.filter(service => {
        const matchesCategory = activeCategory === 'ALL' || service.category === activeCategory;
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories: Array<{ id: CategoryId; label: string; icon: typeof ShoppingBag }> = [
        { id: 'ALL', label: t('services.all', 'All Services'), icon: ShoppingBag },
        { id: 'TAX', label: t('services.tax_prep', 'Tax Prep'), icon: ShieldCheck },
        { id: 'LEGAL', label: t('services.immigration', 'Immigration'), icon: Scale },
        { id: 'BUSINESS', label: t('services.business', 'Business'), icon: Briefcase },
    ];

    if (isLoading) {
        return (
            <PublicLayout>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={{ marginTop: 16, color: '#64748B' }}>{t('common.loading', 'Loading services...')}</Text>
                </View>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <PageMeta
                title={`${t('services.title', 'Professional Services')} | TrustTax`}
                description={t('services.subtitle', 'Choose from our range of expert financial and legal services designed to help you succeed.')}
            />
            <View style={styles.hero}>
                <View style={styles.heroContent}>
                    <View style={{ flex: 1, minWidth: 300 }}>
                        <H1 style={styles.heroTitle}>{t('services.title', 'Professional Services')}</H1>
                        <Text style={styles.heroSubtitle}>
                            {t('services.subtitle', 'Choose from our range of expert financial and legal services designed to help you succeed.')}
                        </Text>
                    </View>
                    <View style={styles.searchWrapper}>
                        <Input
                            placeholder={t('common.search_placeholder', 'Search services...')}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            icon={<Search size={18} color="#94A3B8" />}
                            style={styles.searchInput}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.contentContainer}>
                {/* Categories Tabs */}
                <View style={styles.tabContainer}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.tab, activeCategory === cat.id && styles.tabActive]}
                            onPress={() => setActiveCategory(cat.id)}
                        >
                            <cat.icon size={18} color={activeCategory === cat.id ? '#FFFFFF' : '#64748B'} />
                            <Text style={[styles.tabText, activeCategory === cat.id && styles.tabTextActive]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Services Grid */}
                <View style={styles.grid}>
                    {filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                            <Card key={service.id} style={styles.serviceCard} elevated padding="none">
                                {hasDiscount(service) && (
                                    <View style={styles.discountBanner}>
                                        <Text style={styles.discountBannerText}>
                                            {t('common.save', 'SAVE')} ${discountAmount(service)} • {discountPercent(service)}% {t('common.off', 'OFF')}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.cardInfo}>
                                    <View style={styles.categoryBadgeRow}>
                                        <View style={styles.badgesRow}>
                                            <Badge label={service.category} variant="primary" />
                                            {hasDiscount(service) && (
                                                <Badge label={`${discountPercent(service)}% ${t('common.off', 'OFF')}`} variant="success" />
                                            )}
                                        </View>
                                        <View style={styles.durationRow}>
                                            <Clock size={14} color="#64748B" />
                                            <Text style={styles.durationText}>{t('common.days_estimated', '2-4 Days estimated')}</Text>
                                        </View>
                                    </View>

                                    <H3 style={styles.serviceTitle}>{service.name}</H3>
                                    <Text style={styles.serviceDesc} numberOfLines={3}>
                                        {service.description}
                                    </Text>

                                    <View style={styles.featuresList}>
                                        <View style={styles.featureItem}>
                                            <CheckCircle2 size={14} color="#10B981" />
                                            <Text style={styles.featureText}>Expert Review</Text>
                                        </View>
                                        <View style={styles.featureItem}>
                                            <CheckCircle2 size={14} color="#10B981" />
                                            <Text style={styles.featureText}>Secure Upload</Text>
                                        </View>
                                    </View>

                                    <View style={styles.priceRow}>
                                        <View>
                                            <Text style={styles.priceLabel}>{t('common.starting_at', 'Starting at')}</Text>
                                            <View style={styles.priceContainer}>
                                                {hasDiscount(service) && (
                                                    <Text style={styles.originalPrice}>${parsePrice(service.originalPrice).toFixed(0)}</Text>
                                                )}
                                                <H3 style={styles.priceValue}>${parsePrice(service.price).toFixed(0)}</H3>
                                            </View>
                                            {hasDiscount(service) && (
                                                <Text style={styles.savingsAmount}>
                                                    {t('common.you_save', 'You save')} ${discountAmount(service)}
                                                </Text>
                                            )}
                                        </View>
                                        <Button
                                            title={t('common.get_started', 'Get Started')}
                                            variant="primary"
                                            icon={<ChevronRight size={18} color="#FFFFFF" />}
                                            iconPosition="right"
                                            onPress={() => navigate(`/login?redirect=/services/${service.id}`)}
                                            style={styles.startBtn}
                                        />
                                    </View>
                                </View>
                            </Card>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Search size={48} color="#E2E8F0" />
                            <H3 style={{ marginTop: 16, color: '#0F172A' }}>{t('common.no_services_found', 'No services found')}</H3>
                            <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 8 }}>
                                {t('common.try_adjusting', 'Try adjusting your search or category filters.')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* FAQ or Trust Section */}
                <View style={styles.trustSection}>
                    <H2 style={styles.trustTitle}>Why Choose TrustTax?</H2>
                    <View style={styles.trustGrid}>
                        <View style={styles.trustItem}>
                            <View style={styles.iconBox}><ShieldCheck size={28} color="#2563EB" /></View>
                            <H3 style={styles.trustItemTitle}>Secure & Confidential</H3>
                            <Text style={styles.trustItemText}>Bank-level encryption for all your documents and personal data.</Text>
                        </View>
                        <View style={styles.trustItem}>
                            <View style={styles.iconBox}><Briefcase size={28} color="#2563EB" /></View>
                            <H3 style={styles.trustItemTitle}>Certified Professionals</H3>
                            <Text style={styles.trustItemText}>Work with authorized CPAs and immigration experts.</Text>
                        </View>
                        <View style={styles.trustItem}>
                            <View style={styles.iconBox}><Clock size={28} color="#2563EB" /></View>
                            <H3 style={styles.trustItemTitle}>Fast Turnaround</H3>
                            <Text style={styles.trustItemText}>Get your filings done quickly without sacrificing accuracy.</Text>
                        </View>
                    </View>
                </View>
            </View>
        </PublicLayout>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 400 },
    hero: { backgroundColor: '#0F172A', paddingVertical: 48, paddingHorizontal: 24 },
    heroContent: { maxWidth: 1200, marginHorizontal: 'auto', width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' },
    heroTitle: { color: '#FFFFFF', fontSize: 36, fontWeight: '700', marginBottom: 12, letterSpacing: -1 } as TextStyle,
    heroSubtitle: { color: '#94A3B8', fontSize: 18, maxWidth: 600, lineHeight: 28, fontWeight: '300' },

    searchWrapper: { width: '100%', maxWidth: 400 },
    searchInput: { backgroundColor: '#1E293B', borderColor: '#334155', marginBottom: 0 },

    contentContainer: { paddingBottom: 48 },

    tabContainer: { flexDirection: 'row', gap: 12, marginTop: 32, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 24 },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
    tabActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' } as ViewStyle,
    tabText: { fontWeight: '600', color: '#64748B', fontSize: 15 },
    tabTextActive: { color: '#FFFFFF' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingHorizontal: 24, maxWidth: 1280, marginHorizontal: 'auto', width: '100%' },
    serviceCard: { flex: 1, minWidth: 280, maxWidth: 380, overflow: 'hidden', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' } as any,
    discountBanner: { backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
    discountBannerText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    cardInfo: { padding: 32, gap: 16 },
    categoryBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 },
    badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
    durationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    durationText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    serviceTitle: { fontSize: 22, color: '#1E293B', fontWeight: '600', letterSpacing: -0.5 } as TextStyle,
    serviceDesc: { fontSize: 15, color: '#64748B', lineHeight: 24, fontWeight: '300' },

    featuresList: { marginTop: 12, gap: 8 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    featureText: { fontSize: 13, color: '#475569', fontWeight: '500' },

    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    priceLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
    priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    originalPrice: { fontSize: 18, color: '#94A3B8', textDecorationLine: 'line-through', fontWeight: '500' },
    priceValue: { color: '#0F172A', fontSize: 24, fontWeight: '600', marginBottom: 0 } as TextStyle,
    savingsAmount: { marginTop: 4, color: '#10B981', fontSize: 13, fontWeight: '700' },
    startBtn: { paddingHorizontal: 24, height: 48, backgroundColor: '#0F172A' },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 80, backgroundColor: '#F8FAFC', width: '100%', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },

    trustSection: { marginTop: 64, paddingHorizontal: 24, maxWidth: 1200, marginHorizontal: 'auto', width: '100%' },
    trustTitle: { textAlign: 'center', fontSize: 32, color: '#0F172A', marginBottom: 40, fontWeight: '700', letterSpacing: -0.8 } as TextStyle,
    trustGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 40, justifyContent: 'center' },
    trustItem: { flex: 1, minWidth: 240, alignItems: 'center', textAlign: 'center' } as ViewStyle,
    iconBox: { width: 64, height: 64, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 24 } as ViewStyle,
    trustItemTitle: { fontSize: 20, fontWeight: '600', color: '#0F172A', marginBottom: 12 } as TextStyle,
    trustItemText: { fontSize: 16, color: '#64748B', lineHeight: 24, fontWeight: '300' }
});
