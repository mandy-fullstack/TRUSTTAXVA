import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions, Animated, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, H2 } from '@trusttax/ui';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { getServiceName } from '../utils/serviceI18n';

export const Testimonials = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const { width } = useWindowDimensions();
    const isMobile = width <= 1024;

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<any>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await api.getTopReviews();
                const fallbackReviews = [
                    { id: '1', author: 'Sarah J.', rating: 5, text: 'TrustTax made filing my taxes so easy. I just uploaded my docs and they handled everything. Got my refund faster than ever!', service: { name: 'Tax Preparation' } },
                    { id: '2', author: 'Michael R.', rating: 5, text: 'Professional, knowledgeable, and responsive. They helped me with my business formation and saved me a lot of headache.', service: { name: 'Business Consulting' } },
                    { id: '3', author: 'Elena G.', rating: 5, text: 'Very happy with the immigration assistance. They were very clear about the process and kept me updated at every step.', service: { name: 'Immigration Services' } }
                ];
                setReviews(data.length > 0 ? data : fallbackReviews);
            } catch (error) {
                console.error('Failed to fetch reviews', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const transitionTo = (nextIndex: number) => {
        // Exit animation
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -20, duration: 300, useNativeDriver: true })
        ]).start(() => {
            setActiveIndex(nextIndex);
            slideAnim.setValue(20);
            // Entry animation
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true })
            ]).start();
        });
    };

    const nextReview = () => {
        const nextIdx = (activeIndex + 1) % reviews.length;
        transitionTo(nextIdx);
    };

    const prevReview = () => {
        const prevIdx = (activeIndex - 1 + reviews.length) % reviews.length;
        transitionTo(prevIdx);
    };

    useEffect(() => {
        if (reviews.length > 0) {
            timerRef.current = setInterval(nextReview, 5000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [reviews.length, activeIndex]);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (reviews.length === 0) return null;

    const currentReview = reviews[activeIndex];

    return (
        <View style={styles.section}>
            <View style={styles.container}>
                <View style={styles.sectionHeader}>
                    <H2 style={styles.sectionTitle}>What Our Clients Say</H2>
                    <View style={styles.titleUnderline} />
                </View>

                <View style={styles.carouselWrapper}>
                    {!isMobile && (
                        <TouchableOpacity onPress={prevReview} style={styles.navButton} activeOpacity={0.7}>
                            <ChevronLeft size={24} color="#64748B" />
                        </TouchableOpacity>
                    )}

                    <View style={styles.displayArea}>
                        <Animated.View style={[
                            styles.testimonialCard,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateX: slideAnim }]
                            }
                        ]}>
                            <View style={styles.quoteIconBox}>
                                <Quote size={48} color="#2563EB" fill="#2563EB" opacity={0.05} />
                            </View>

                            <View style={styles.starsRow}>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        fill={i < currentReview.rating ? "#F59E0B" : "transparent"}
                                        color={i < currentReview.rating ? "#F59E0B" : "#CBD5E1"}
                                    />
                                ))}
                            </View>

                            <Text style={styles.testimonialText}>"{currentReview.text}"</Text>

                            <View style={styles.authorSection}>
                                <View>
                                    <Text style={styles.authorName}>{currentReview.author}</Text>
                                    {currentReview.service && (
                                        <Text style={styles.serviceTag}>{getServiceName(currentReview.service)}</Text>
                                    )}
                                </View>
                            </View>
                        </Animated.View>
                    </View>

                    {!isMobile && (
                        <TouchableOpacity onPress={nextReview} style={styles.navButton} activeOpacity={0.7}>
                            <ChevronRight size={24} color="#64748B" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {reviews.map((_, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => transitionTo(i)}
                            style={[
                                styles.dot,
                                i === activeIndex && { backgroundColor: '#2563EB', width: 24 }
                            ]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 72, // Reduced from 100
    },
    container: {
        maxWidth: 760, // Reduced from 900
        width: '100%',
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
    },
    loaderContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionHeader: {
        marginBottom: 32, // Reduced from 48
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 28, // Reduced from 36
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    titleUnderline: {
        width: 40,
        height: 3,
        backgroundColor: '#2563EB',
    },
    carouselWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    displayArea: {
        flex: 1,
        height: 240, // Reduced from 340
        justifyContent: 'center',
    },
    testimonialCard: {
        backgroundColor: '#F8FAFC',
        padding: 32, // Reduced from 48
        height: '100%',
        justifyContent: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            web: {
                boxShadow: '0 10px 25px -10px rgba(0, 0, 0, 0.05)',
            }
        })
    },
    navButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quoteIconBox: {
        position: 'absolute',
        top: 24,
        right: 32,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 16,
    },
    testimonialText: {
        fontSize: 16, // Reduced from 22
        color: '#334155',
        lineHeight: 26,
        fontStyle: 'italic',
        marginBottom: 20,
        fontWeight: '400',
    },
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 16,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 2,
    },
    serviceTag: {
        fontSize: 11,
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 24,
    },
    dot: {
        width: 6,
        height: 6,
        backgroundColor: '#E2E8F0',
    }
});
