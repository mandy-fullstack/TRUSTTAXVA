import { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { PublicLayout } from "../../components/PublicLayout";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Card, H3, Text, Button } from "@trusttax/ui";
import { api } from "../../services/api";
import type { Service } from "../../types";
import { ServiceHero } from "../../components/Services/ServiceHero";
import {
  ReviewsList,
  type Review,
} from "../../components/Services/ReviewsList";
import { ProcessTimeline } from "../../components/Services/ProcessTimeline";
import { DocumentsRequired } from "../../components/Services/DocumentsRequired";
import { FAQSection } from "../../components/Services/FAQSection";
import { useTranslation } from "react-i18next";
import { PageMeta } from "../../components/PageMeta";
import { useAuth } from "../../context/AuthContext";

// Define props interface
interface ServiceDetailPageProps {
  variant?: "public" | "dashboard";
}

export const ServiceDetailPage = ({
  variant = "public",
}: ServiceDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Context-dependent navigation helpers
  const goBack = () => {
    if (variant === "dashboard") {
      navigate("/dashboard/services");
    } else {
      navigate("/services");
    }
  };

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!id) return;

      setIsLoading(true);
      setErrorMsg(null);
      try {
        const serviceData = await api.getServiceById(id);

        if (!serviceData) {
          setErrorMsg(
            t("services.error.not_found", {
              id,
              defaultValue: `Service with ID ${id} not found`,
            }),
          );
        } else {
          setService(serviceData);
          if (serviceData.reviews) {
            setReviews(serviceData.reviews as Review[]);
          }
        }
      } catch (error: any) {
        console.error("Service fetch failure:", error);
        setErrorMsg(
          error.message ||
            t("common.error_connection", "Failed to connect to the server"),
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchServiceData();
  }, [id, t]);

  // Helper to wrap content with selected layout
  const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    if (variant === "dashboard") {
      const { Layout } = require("../../components/Layout");
      return <Layout>{children}</Layout>;
    }
    return <PublicLayout>{children}</PublicLayout>;
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 12, color: "#64748B" }}>
            {t("common.loading_details", "Loading service details...")}
          </Text>
        </View>
      </PageWrapper>
    );
  }

  if (errorMsg || !service) {
    return (
      <PageWrapper>
        <View style={styles.center}>
          <H3>{t("common.error_loading", "Error Loading Service")}</H3>
          <Text style={{ color: "#EF4444", marginTop: 8, textAlign: "center" }}>
            {errorMsg ||
              t("services.error.not_found_generic", "Service not found")}
          </Text>
          <Button
            title={t("common.back_to_catalog", "Back to Catalog")}
            onPress={goBack}
            style={{ marginTop: 24 }}
          />
        </View>
      </PageWrapper>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 5.0;

  const handleStartService = () => {
    if (!id) return;

    if (isAuthenticated) {
      navigate(`/services/${id}/wizard`);
    } else {
      navigate("/login", { state: { from: location } });
    }
  };

  return (
    <PageWrapper>
      <PageMeta
        title={`${service.name} | TrustTax`}
        description={service.description}
      />
      <View style={styles.container}>
        {/* Back Button */}
        <Button
          variant="ghost"
          title={
            variant === "dashboard"
              ? t("common.back_to_services", "Back to Services")
              : t("common.back_to_services", "Back to Services")
          }
          icon={<ArrowLeft size={16} color="#64748B" />}
          onPress={goBack}
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
          steps={service.steps?.map((s) => ({
            title: s.title,
            description: s.description || "",
          }))}
        />

        {/* Required Documents */}
        <DocumentsRequired docTypes={service.docTypes?.map((d) => d.docType)} />

        {/* Customer Reviews */}
        {reviews.length > 0 && (
          <ReviewsList reviews={reviews} avgRating={avgRating} />
        )}

        {/* FAQs */}
        <FAQSection />

        {/* CTA Footer */}
        <Card style={styles.ctaCard} elevated>
          <View style={styles.ctaContent}>
            <View style={{ flex: 1, minWidth: 260 }}>
              <H3 style={{ color: "#FFFFFF" }}>
                {t("services.cta.title", "Ready to get started?")}
              </H3>
              <Text style={{ color: "#94A3B8", marginTop: 4 }}>
                {t(
                  "services.cta.subtitle",
                  "Join hundreds of satisfied clients today.",
                )}
              </Text>
            </View>
            <Button
              title={t("common.start_now", "Start Now")}
              variant="primary"
              icon={<ChevronRight size={18} color="#0F172A" />}
              iconPosition="right"
              onPress={handleStartService}
              style={styles.ctaBtn}
            />
          </View>
        </Card>
      </View>
    </PageWrapper>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  container: {
    paddingHorizontal: 24,
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
    paddingBottom: 80,
    paddingTop: 20,
  },
  backBtn: { marginBottom: 32, alignSelf: "flex-start" },
  ctaCard: { backgroundColor: "#0F172A", borderRadius: 0, padding: 40 } as any,
  ctaContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  ctaBtn: { minWidth: 180, backgroundColor: "#FFFFFF" },
});
