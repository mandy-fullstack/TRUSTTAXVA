import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { DollarSign, Clock, Calendar, Shield, Award, Star } from "lucide-react";
import { Card, H1, Subtitle, Text, Button, Badge } from "@trusttax/ui";
import { getServiceName, getServiceDescription } from "../../utils/serviceI18n";
import type { Service } from "../../types";

interface ServiceHeroProps {
  service: Service;
  avgRating?: number;
  reviewCount?: number;
  onStartService: () => void;
}

export const ServiceHero = ({
  service,
  avgRating = 5.0,
  reviewCount = 0,
  onStartService,
}: ServiceHeroProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.hero}>
      <View style={styles.heroContent}>
        <Badge label={service.category} variant="primary" />
        <H1 style={styles.serviceTitle}>{getServiceName(service)}</H1>
        <Subtitle>{getServiceDescription(service)}</Subtitle>

        {service.originalPrice &&
          Number(service.originalPrice) > 0 &&
          Number(service.originalPrice) > Number(service.price) && (
            <View style={styles.promoBadge}>
              <Badge
                label={t("services.hero.save_today", {
                  amount: (
                    Number(service.originalPrice) - Number(service.price)
                  ).toFixed(0),
                  defaultValue: `SAVE $${(Number(service.originalPrice) - Number(service.price)).toFixed(0)} TODAY`,
                })}
                variant="success"
              />
            </View>
          )}

        {/* Rating Summary */}
        {reviewCount > 0 && (
          <View style={styles.ratingSummary}>
            <View style={styles.ratingStars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  color={i < Math.floor(avgRating) ? "#F59E0B" : "#E2E8F0"}
                  fill={i < Math.floor(avgRating) ? "#F59E0B" : "transparent"}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {t("services.hero.rating_reviews", {
                rating: avgRating.toFixed(1),
                count: reviewCount,
                defaultValue: `${avgRating.toFixed(1)} (${reviewCount} reviews)`,
              })}
            </Text>
          </View>
        )}

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          <View style={styles.trustBadge}>
            <Shield size={16} color="#10B981" />
            <Text style={styles.trustText}>
              {t("services.hero.secure_confidential", "Secure & Confidential")}
            </Text>
          </View>
          <View style={styles.trustBadge}>
            <Award size={16} color="#2563EB" />
            <Text style={styles.trustText}>
              {t(
                "services.hero.certified_professionals",
                "Certified Professionals",
              )}
            </Text>
          </View>
        </View>
      </View>

      <Card style={styles.priceCard} elevated>
        <View style={styles.priceHeader}>
          <DollarSign size={20} color="#10B981" />
          <Text style={styles.priceLabel}>
            {t("services.hero.service_fee", "Service Fee")}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          {service.originalPrice &&
            Number(service.originalPrice) > 0 &&
            Number(service.originalPrice) > Number(service.price) && (
              <Text style={styles.originalPrice}>
                ${Number(service.originalPrice).toFixed(0)}
              </Text>
            )}
          <H1 style={styles.priceValueDetail}>
            ${service.price ? Number(service.price).toFixed(0) : "0"}
          </H1>
        </View>
        <View style={styles.durationRow}>
          <Clock size={16} color="#64748B" />
          <Text style={styles.durationText}>
            {t("services.hero.business_days", "2-4 business days")}
          </Text>
        </View>
        <View style={styles.durationRow}>
          <Calendar size={16} color="#64748B" />
          <Text style={styles.durationText}>
            {t("services.hero.available_year_round", "Available year-round")}
          </Text>
        </View>
        <Button
          title={t("services.hero.start_service", "Start This Service")}
          variant="primary"
          onPress={onStartService}
          style={{ marginTop: 20 }}
        />
        <Text style={styles.guarantee}>
          {t(
            "services.hero.satisfaction_guaranteed",
            "100% Satisfaction Guaranteed",
          )}
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  hero: { flexDirection: "row", gap: 40, marginBottom: 80, flexWrap: "wrap" },
  heroContent: { flex: 1, minWidth: 300, gap: 16 },
  serviceTitle: { marginTop: 8 },
  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  ratingStars: { flexDirection: "row", gap: 4 },
  ratingText: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  trustBadges: { flexDirection: "row", gap: 16, marginTop: 8 },
  trustBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  trustText: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  priceCard: { width: 320, padding: 32 },
  priceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 12,
  },
  originalPrice: {
    fontSize: 20,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    fontWeight: "400",
  },
  priceValueDetail: {
    color: "var(--secondary-color, #0F172A)",
    fontSize: 40,
    fontWeight: "800",
  } as any,
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  durationText: { fontSize: 14, color: "#64748B" },
  guarantee: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  promoBadge: { marginTop: 4 },
});
