import { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { ShoppingBag, ChevronRight, Clock, ShieldCheck, Briefcase, Scale, Search } from 'lucide-react';
import { Card, H1, H3, H4, Subtitle, Text, Button, Badge, Input } from '@trusttax/ui';
import { api } from '../../services/api';
import type { Service } from '../../types';
import { useTranslation } from 'react-i18next';

export const ServicesPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<'ALL' | 'TAX' | 'LEGAL' | 'BUSINESS'>('ALL');
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

    const categories = [
        { id: 'ALL', label: t('services.all', 'All Services'), icon: ShoppingBag },
        { id: 'TAX', label: t('services.tax_prep', 'Tax Prep'), icon: ShieldCheck },
        { id: 'LEGAL', label: t('services.immigration', 'Immigration'), icon: Scale },
        { id: 'BUSINESS', label: t('services.business', 'Business'), icon: Briefcase },
    ];

    if (isLoading) {
        return (
            <Layout>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={{ marginTop: 16, color: '#64748B' }}>{t('common.loading', 'Loading our professional offerings...')}</Text>
                </View>
            </Layout>
        );
    }

    return (
        <Layout>
            <View style={styles.hero}>
                <View style={styles.heroContent}>
                    <View style={{ flex: 1, minWidth: 300 }}>
                        <H1>{t('services.title', 'Professional Services')}</H1>
                        <Subtitle>{t('services.subtitle', 'Select a specialized service to start your process today.')}</Subtitle>
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

            {/* Categories Tabs */}
            <View style={styles.tabContainer}>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.tab, activeCategory === cat.id && styles.tabActive]}
                        onPress={() => setActiveCategory(cat.id as any)}
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
                            {/* Discount Banner - Top of Card */}
                            {service.originalPrice && Number(service.originalPrice) > 0 && Number(service.originalPrice) > Number(service.price) && (
                                <View style={styles.discountBanner}>
                                    <Text style={styles.discountBannerText}>
                                        SAVE ${Math.round(Number(service.originalPrice) - Number(service.price))} • {Math.round((1 - Number(service.price) / Number(service.originalPrice)) * 100)}% OFF
                                    </Text>
                                </View>
                            )}

                            <View style={styles.cardInfo}>
                                <View style={styles.categoryBadgeRow}>
                                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                        <Badge label={service.category} variant="primary" />
                                    </View>
                                    <View style={styles.durationRow}>
                                        <Clock size={14} color="#64748B" />
                                        <Text style={styles.durationText}>{t('common.days_estimated', '2-4 Days')}</Text>
                                    </View>
                                </View>
                                <H3 style={styles.serviceTitle}>{service.name}</H3>
                                <Text style={styles.serviceDesc} numberOfLines={2}>
                                    {service.description}
                                </Text>

                                <View style={styles.priceRow}>
                                    <View>
                                        <Text style={styles.priceLabel}>{t('common.starting_at', 'Starting at')}</Text>
                                        <View style={styles.priceContainer}>
                                            {service.originalPrice && Number(service.originalPrice) > 0 && Number(service.originalPrice) > Number(service.price) && (
                                                <Text style={styles.originalPrice}>${Number(service.originalPrice).toFixed(0)}</Text>
                                            )}
                                            <H3 style={styles.priceValue}>${service.price ? Number(service.price).toFixed(0) : '0'}</H3>
                                        </View>
                                        {service.originalPrice && Number(service.originalPrice) > 0 && Number(service.originalPrice) > Number(service.price) && (
                                            <View style={styles.savingsIndicator}>
                                                <Text style={styles.savingsAmount}>
                                                    You save ${Math.round(Number(service.originalPrice) - Number(service.price))}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Button
                                        title={t('common.get_started', 'Get Started')}
                                        variant="primary"
                                        icon={<ChevronRight size={18} color="#FFFFFF" />}
                                        iconPosition="right"
                                        onPress={() => navigate(`/services/${service.id}`)}
                                        style={styles.startBtn}
                                    />
                                </View>
                            </View>
                        </Card>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Search size={48} color="#E2E8F0" />
                        <H4 style={{ marginTop: 16 }}>{t('common.no_services_found', 'No services found')}</H4>
                        <Text style={{ color: '#64748B' }}>{t('common.try_adjusting', 'Try adjusting your search or category filters.')}</Text>
                    </View>
                )}
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 400 },
    hero: { marginBottom: 24 },
    heroContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' },
    searchWrapper: { width: '100%', maxWidth: 400, marginTop: 0 },
    searchInput: { backgroundColor: '#FFFFFF', marginBottom: 0 },
    tabContainer: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
    tabActive: { backgroundColor: 'var(--secondary-color, #0F172A)', borderColor: 'var(--secondary-color, #0F172A)' } as any,
    tabText: { fontWeight: '600', color: '#64748B', fontSize: 14 },
    tabTextActive: { color: '#FFFFFF' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
    serviceCard: { width: '100%', maxWidth: 380, overflow: 'hidden' },
    cardInfo: { padding: 24, gap: 12 },
    categoryBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    durationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    durationText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    serviceTitle: { fontSize: 20, color: 'var(--secondary-color, #1E293B)' } as any,
    serviceDesc: { fontSize: 14, color: '#64748B', lineHeight: 20 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    priceLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
    priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    originalPrice: {
        fontSize: 18,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
        fontWeight: '500',
        marginRight: 8
    },
    priceValue: { color: 'var(--secondary-color, #0F172A)', marginBottom: 0 } as any,
    startBtn: { minWidth: 140, height: 44 },
    discountBanner: {
        backgroundColor: '#10B981',
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    discountBannerText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    savingsIndicator: {
        marginTop: 6,
        paddingVertical: 4,
        paddingHorizontal: 0,
    },
    savingsAmount: {
        color: '#10B981',
        fontSize: 13,
        fontWeight: '700',
    },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 80, backgroundColor: '#FFFFFF', width: '100%' }
});
