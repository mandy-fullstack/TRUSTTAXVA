import { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Card, H3, Text, Button } from '@trusttax/ui';
import { api } from '../../services/api';
import type { Service } from '../../types';
import { ServiceHero } from '../../components/Services/ServiceHero';
import { ReviewsList, type Review } from '../../components/Services/ReviewsList';
import { ProcessTimeline } from '../../components/Services/ProcessTimeline';
import { DocumentsRequired } from '../../components/Services/DocumentsRequired';
import { FAQSection } from '../../components/Services/FAQSection';

export const ServiceDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [service, setService] = useState<Service | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchServiceData = async () => {
            if (!id) return;
            console.log('Fetching unified service data for:', id);

            setIsLoading(true);
            setErrorMsg(null);
            try {
                const serviceData = await api.getServiceById(id);
                console.log('Full service data received:', serviceData);

                if (!serviceData) {
                    setErrorMsg(`Service with ID ${id} not found in database`);
                } else {
                    setService(serviceData);
                    // Use reviews from the service object if available
                    if (serviceData.reviews) {
                        setReviews(serviceData.reviews as Review[]);
                    }
                }
            } catch (error: any) {
                console.error('Critical service fetch failure:', error);
                setErrorMsg(error.message || 'Failed to connect to the server');
            } finally {
                setIsLoading(false);
            }
        };
        fetchServiceData();
    }, [id]);

    if (isLoading) {
        return (
            <Layout>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={{ marginTop: 12 }}>Loading details for {id}...</Text>
                </View>
            </Layout>
        );
    }

    if (errorMsg || !service) {
        return (
            <Layout>
                <View style={styles.center}>
                    <H3>Error Loading Service</H3>
                    <Text style={{ color: '#EF4444', marginTop: 8, textAlign: 'center' }}>
                        {errorMsg || 'Service not found'}
                    </Text>
                    <Text style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>ID: {id}</Text>
                    <Button title="Back to Catalog" onPress={() => navigate('/services')} style={{ marginTop: 24 }} />
                </View>
            </Layout>
        );
    }

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 5.0;

    const handleStartService = () => {
        if (!id) return;
        navigate(`/services/${id}/wizard`);
    };

    return (
        <Layout>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Back Button */}
                <Button
                    variant="ghost"
                    title="Back to Services"
                    icon={<ArrowLeft size={16} color="#64748B" />}
                    onPress={() => navigate('/services')}
                    style={styles.backBtn}
                />

                {/* Hero Section */}
                <ServiceHero
                    service={service}
                    avgRating={avgRating}
                    reviewCount={reviews.length}
                    onStartService={handleStartService}
                />

                {/* Process Timeline */}
                <ProcessTimeline
                    steps={service.steps?.map(s => ({
                        title: s.title,
                        description: s.description || '',
                    }))}
                />

                {/* Required Documents */}
                <DocumentsRequired
                    docTypes={service.docTypes?.map(d => d.docType)}
                />

                {/* Customer Reviews */}
                <ReviewsList reviews={reviews} avgRating={avgRating} />

                {/* FAQs */}
                <FAQSection />

                {/* CTA Footer */}
                <Card style={styles.ctaCard} elevated>
                    <View style={styles.ctaContent}>
                        <View>
                            <H3 style={{ color: '#FFFFFF' }}>Ready to get started?</H3>
                            <Text style={{ color: '#94A3B8', marginTop: 4 }}>Join hundreds of satisfied clients today.</Text>
                        </View>
                        <Button
                            title="Start Now"
                            variant="primary"
                            icon={<ChevronRight size={18} color="#0F172A" />}
                            iconPosition="right"
                            onPress={handleStartService}
                            style={styles.ctaBtn}
                        />
                    </View>
                </Card>
            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 400 },
    scrollContent: { paddingBottom: 60 },
    backBtn: { marginBottom: 32, alignSelf: 'flex-start' },
    ctaCard: { backgroundColor: 'var(--secondary-color, #0F172A)', borderRadius: 16 } as any,
    ctaContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
    ctaBtn: { minWidth: 180, backgroundColor: '#FFFFFF' }
});
