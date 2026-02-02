import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Layout } from "../Layout";
import { H3, Text, Card, spacing } from "@trusttax/ui";

interface WizardLayoutProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  steps: Array<{ id: string; title: string }>;
  children: ReactNode;
}

export const WizardLayout = ({
  title,
  currentStep,
  totalSteps,
  steps,
  children,
}: WizardLayoutProps) => {
  const { t } = useTranslation();
  const progress = (currentStep + 1) / totalSteps;

  return (
    <Layout>
      <View style={styles.outerContainer}>
        {/* Top Progress Tracker */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <H3 style={styles.title}>{title}</H3>
              <Text style={styles.stepInfo}>
                {t("wizard.step_counter", {
                  current: currentStep + 1,
                  total: totalSteps,
                })}
              </Text>
            </View>
          </View>

          {/* Minimalist Progress Bar */}
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBar, { width: `${progress * 100}%` }]}
            />
          </View>

          {/* Step Labels (Hidden on small screens via CSS/Style logic if needed, but keeping it clean) */}
          <View style={styles.stepLabels}>
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <View key={step.id} style={styles.stepLabelItem}>
                  <View
                    style={[
                      styles.stepDot,
                      isActive && styles.stepDotActive,
                      isCompleted && styles.stepDotCompleted,
                    ]}
                  />
                  {isActive && (
                    <Text style={styles.activeStepText}>{step.title}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Centered Main Content */}
        <View style={styles.contentWrapper}>
          <Card elevated={false} style={styles.contentCard}>
            {children}
          </Card>
        </View>
      </View>
    </Layout>
  );
};

const s = spacing;
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    paddingVertical: s[12],
    alignItems: "center",
    width: "100%",
  },
  header: {
    width: "100%",
    maxWidth: 800,
    marginBottom: s[10],
    paddingHorizontal: s[4],
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: s[6],
  },
  title: { fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  stepInfo: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  progressContainer: {
    height: 4,
    backgroundColor: "#F1F5F9",
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "var(--primary-color, #2563EB)",
    position: "absolute",
    left: 0,
    top: 0,
  },

  stepLabels: {
    flexDirection: "row",
    gap: s[4],
    marginTop: s[4],
    alignItems: "center",
  },
  stepLabelItem: { flexDirection: "row", alignItems: "center", gap: s[2] },
  stepDot: { width: 8, height: 8, backgroundColor: "#E2E8F0" },
  stepDotActive: {
    backgroundColor: "var(--primary-color, #2563EB)",
    transform: [{ scale: 1.2 }],
  } as any,
  stepDotCompleted: { backgroundColor: "#94A3B8" },
  activeStepText: { fontSize: 12, fontWeight: "600", color: "#0F172A" },

  contentWrapper: { width: "100%", maxWidth: 800, paddingHorizontal: s[4] },
  contentCard: {
    paddingVertical: s[12],
    paddingHorizontal: s[2], // Reducing internal padding to allow step components to manage it
    backgroundColor: "transparent",
    borderWidth: 0,
  },
});
