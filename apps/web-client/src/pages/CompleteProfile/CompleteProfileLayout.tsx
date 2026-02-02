import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { Text } from "@trusttax/ui";
import { TrustTaxLogo } from "../../components/TrustTaxLogo";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompleteProfileLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

export const CompleteProfileLayout: React.FC<CompleteProfileLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
}) => {
  const { width } = useWindowDimensions();
  const navigate = useNavigate();
  const isMobile = width < 768;
  const isNarrow = width < 480;
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Elite Immersive Header - Synchronized with Main App */}
        <View style={[styles.topBar, isNarrow && { paddingHorizontal: 20 }]}>
          <View style={styles.leftGroup}>
            <TouchableOpacity
              onPress={() => navigate("/dashboard/profile")}
              style={styles.exitButton}
              activeOpacity={0.7}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
            <View style={styles.brandGroup}>
              <TrustTaxLogo
                size={isNarrow ? 20 : 24}
                bgColor="#0F172A"
                color="#FFFFFF"
              />
              <Text style={[styles.brandText, isNarrow && { fontSize: 16 }]}>
                TrustTax
              </Text>
            </View>
          </View>

          <View style={styles.rightGroup}>
            <View style={styles.progressSection}>
              {!isNarrow && (
                <Text style={styles.progressLabel}>
                  STAGE {currentStep} OF {totalSteps}
                </Text>
              )}
              <View style={[styles.track, isNarrow && { width: 60 }]}>
                <View
                  style={[
                    styles.fill,
                    { width: `${(currentStep / totalSteps) * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* Language Selector */}
            <View
              style={[
                styles.langSelector,
                isNarrow && { paddingVertical: 4, paddingHorizontal: 8 },
              ]}
            >
              <Text style={[styles.langText, isNarrow && { fontSize: 10 }]}>
                EN
              </Text>
            </View>
          </View>
        </View>

        {/* Immersion Frame */}
        <ScrollView
          style={styles.main}
          contentContainerStyle={[
            styles.mainContent,
            {
              justifyContent: isMobile ? "flex-start" : "center",
              paddingVertical: isMobile ? 32 : 60,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.frame}>
            <View
              style={[styles.frameHeader, isMobile && { marginBottom: 32 }]}
            >
              <Text
                style={[
                  styles.frameTitle,
                  {
                    fontSize: isNarrow ? 24 : isMobile ? 28 : 38,
                    lineHeight: isNarrow ? 30 : isMobile ? 34 : 48,
                  },
                ]}
              >
                {title}
              </Text>
              {subtitle && <Text style={styles.frameSubtitle}>{subtitle}</Text>}
            </View>

            <View style={styles.formArea}>{children}</View>
          </View>
        </ScrollView>

        {/* Footer Signature */}
        <View style={styles.bottomBar}>
          <Text style={styles.lockText}>
            PROPRIETARY ENCRYPTION ACTIVE // SECURE SESSION
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  brandText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
    fontFamily: "Inter",
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
  },
  langSelector: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 0,
  },
  langText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 1,
    fontFamily: "Inter",
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1,
    fontFamily: "Inter",
  },
  track: {
    width: 120,
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 0,
  },
  main: {
    flex: 1,
  },
  mainContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  frame: {
    width: "100%",
    maxWidth: 520,
    paddingHorizontal: 32,
  },
  frameHeader: {
    marginBottom: 48,
  },
  frameTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    lineHeight: 40,
    letterSpacing: -1,
    marginBottom: 8,
    fontFamily: "Inter",
  },
  frameSubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
    fontFamily: "Inter",
  },
  formArea: {
    width: "100%",
  },
  bottomBar: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1.5,
    borderTopColor: "#F8FAFC",
  },
  lockText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#CBD5E1",
    letterSpacing: 2,
    fontFamily: "Inter",
  },
});
