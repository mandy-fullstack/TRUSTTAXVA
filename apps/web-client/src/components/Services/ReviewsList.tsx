import { View, StyleSheet } from 'react-native';
import { Star } from 'lucide-react';
import { Card, H1, H2, Text } from '@trusttax/ui';

export interface Review {
    id: string | number;
    author: string;
    rating: number;
    date: string;
    text: string;
}

interface ReviewsListProps {
    reviews: Review[];
    avgRating?: number;
}

export const ReviewsList = ({ reviews, avgRating }: ReviewsListProps) => {
    const calculatedAvg = avgRating || (reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 5.0);

    if (reviews.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <View style={styles.reviewHeader}>
                <View>
                    <H2 style={styles.sectionTitle}>Customer Reviews</H2>
                    <Text style={styles.sectionSubtitle}>See what our clients are saying</Text>
                </View>
                <View style={styles.ratingBig}>
                    <H1 style={{ marginBottom: 0 }}>{calculatedAvg.toFixed(1)}</H1>
                    <View style={styles.ratingStars}>
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                color={i < Math.floor(calculatedAvg) ? '#F59E0B' : '#E2E8F0'}
                                fill={i < Math.floor(calculatedAvg) ? '#F59E0B' : 'transparent'}
                            />
                        ))}
                    </View>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>{reviews.length} reviews</Text>
                </View>
            </View>
            <View style={styles.reviewsGrid}>
                {reviews.map((review) => (
                    <Card key={review.id} style={styles.reviewCard} elevated>
                        <View style={styles.reviewTop}>
                            <View style={styles.reviewAvatar}>
                                <Text style={styles.reviewAvatarText}>{review.author.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.reviewAuthor}>{review.author}</Text>
                                <View style={styles.reviewMeta}>
                                    <View style={styles.reviewStars}>
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} size={12} color="#F59E0B" fill="#F59E0B" />
                                        ))}
                                    </View>
                                    <Text style={styles.reviewDate}>
                                        {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.reviewText}>{review.text}</Text>
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
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 24 },
    ratingBig: { alignItems: 'center', gap: 8 },
    ratingStars: { flexDirection: 'row', gap: 4 },
    reviewsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
    reviewCard: { flex: 1, minWidth: 300 },
    reviewTop: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    reviewAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
    reviewAvatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    reviewAuthor: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
    reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    reviewStars: { flexDirection: 'row', gap: 2 },
    reviewDate: { fontSize: 12, color: '#94A3B8' },
    reviewText: { fontSize: 14, color: '#64748B', lineHeight: 22 },
});
