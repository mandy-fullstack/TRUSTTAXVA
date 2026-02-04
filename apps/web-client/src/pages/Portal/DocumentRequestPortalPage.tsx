import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { View, StyleSheet, TouchableOpacity, Platform, Animated } from "react-native";
import { Button, Text, Card } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import { Shield, CheckCircle, ArrowLeft, Upload, X, Lock } from "lucide-react";
import { LoadingSpinner } from "../../components/Common/LoadingSpinner";
import { ProgressBar } from "../../components/Common/ProgressBar";
import { SkeletonDocumentRow } from "../../components/Common/SkeletonLoader";

export function DocumentRequestPortalPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [error, setError] = useState("");

  // Animation for card fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const expiresLabel = useMemo(() => {
    if (!meta?.expiresAt) return "";
    try {
      return new Date(meta.expiresAt).toLocaleString();
    } catch {
      return String(meta.expiresAt);
    }
  }, [meta?.expiresAt]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!token) {
          throw new Error("Missing token");
        }
        setLoading(true);
        const data = await api.getPortalDocumentRequest(token);
        if (!cancelled) {
          setMeta(data);
          // Animate card entrance
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load portal");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, fadeAnim]);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Shield size={20} color="#0F172A" />
          <Text style={styles.brand}>TRUSTTAX</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigate("/")}
          style={styles.homeLink}
        >
          <Text style={styles.homeText}>{t("common.home", "Home")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim, width: '100%', maxWidth: 640 }}>
          <Card style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.title}>
                {t("portal.upload_title", "Secure Document Upload")}
              </Text>
              <Text style={styles.subtitle}>
                {t(
                  "portal.upload_subtitle",
                  "Please upload the requested documents below.",
                )}
              </Text>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <LoadingSpinner size={32} color="#0F172A" />
                <Text style={styles.loadingText}>
                  {t("common.loading", "Loading your requests...")}
                </Text>
                {/* Skeleton placeholders */}
                <View style={{ marginTop: 20, gap: 10 }}>
                  <SkeletonDocumentRow />
                  <SkeletonDocumentRow />
                </View>
              </View>
            ) : error ? (
              <View style={styles.errorBox}>
                <X size={22} color="#991B1B" />
                <Text style={styles.errorTitle}>
                  {t("common.error", "Error")}
                </Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : meta?.requests?.length === 0 ? (
              <View style={styles.successBox}>
                <CheckCircle size={28} color="#16A34A" />
                <Text style={styles.successTitle}>
                  {t("portal.all_complete", "All documents submitted")}
                </Text>
                <Text style={styles.successText}>
                  {t("portal.all_complete_msg", "Thank you. All requested documents have been received.")}
                </Text>
                <Button
                  title={t("portal.back_home", "Back to Home")}
                  variant="outline"
                  onPress={() => navigate("/")}
                  style={{ marginTop: 12 }}
                />
              </View>
            ) : (
              <>
                <View style={{ marginBottom: 20 }}>
                  <Text style={[styles.metaLabel, { marginBottom: 4 }]}>
                    {t("portal.order", "Order")} #{meta?.orderDisplayId || meta?.orderId}
                  </Text>
                  {expiresLabel && (
                    <Text style={styles.metaHint}>
                      {t("portal.expires", "Link expires")}: {expiresLabel}
                    </Text>
                  )}
                </View>

                {meta?.requests?.map((req: any, index: number) => (
                  <DocumentUploadRow
                    key={req.id}
                    request={req}
                    token={token!}
                    index={index}
                    onSuccess={() => {
                      // Refresh the list to remove the completed one
                      api.getPortalDocumentRequest(token!).then(setMeta);
                    }}
                  />
                ))}

                <View style={{ marginTop: 24, padding: 16, backgroundColor: '#F1F5F9', borderLeftWidth: 2, borderLeftColor: '#0F172A', flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                  <Lock size={14} color="#0F172A" style={{ marginTop: 2 }} />
                  <Text style={styles.uploadHint}>
                    {t(
                      "portal.security_note",
                      "Files are encrypted (AES-256) before storage and only accessible by authorized TrustTax professionals.",
                    )}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => navigate("/login")}
                  style={styles.altLink}
                >
                  <ArrowLeft size={16} color="#64748B" />
                  <Text style={styles.altText}>
                    {t(
                      "portal.alt_login",
                      "Prefer to log in? Go to Sign In",
                    )}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        </Animated.View>
      </View>
    </View>
  );
}

interface DocumentUploadRowProps {
  request: any;
  token: string;
  index: number;
  onSuccess: () => void;
}

function DocumentUploadRow({ request, token, index, onSuccess }: DocumentUploadRowProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const inputId = `file-${request.id}`;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, slideAnim, opacityAnim]);

  // Shake animation for errors
  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError("");
      setProgress(0);

      // Simulate progress (since we don't have real upload progress from API)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await api.uploadPortalDocumentRequest(token, file, request.id);

      clearInterval(progressInterval);
      setProgress(100);
      setCompleted(true);

      // Success animation
      Animated.spring(successAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      // Wait for animation then call onSuccess
      setTimeout(() => {
        onSuccess();
      }, 800);
    } catch (e: any) {
      setError(e.message || "Upload failed");
      setUploading(false);
      setProgress(0);
      triggerShake();
    }
  };

  if (completed) {
    return (
      <Animated.View
        style={[
          styles.requestRow,
          styles.successRow,
          {
            transform: [{ scale: successAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <CheckCircle size={20} color="#16A34A" />
        <Text style={styles.successRowText}>{request.documentName} uploaded</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.requestRow,
        error && styles.errorRow,
        {
          transform: [
            { translateY: slideAnim },
            { translateX: shakeAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.reqTitle}>{request.documentName}</Text>
        {request.message && <Text style={styles.reqMsg}>{request.message}</Text>}
        {uploading && (
          <View style={{ marginTop: 8 }}>
            <ProgressBar progress={progress} height={3} color="#0F172A" />
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}
        {error && <Text style={styles.rowError}>{error}</Text>}
      </View>

      <View>
        {Platform.OS === "web" ? (
          <>
            <input
              type="file"
              style={{ display: "none" }}
              id={inputId}
              accept="image/*,.pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
              disabled={uploading}
            />
            <TouchableOpacity
              style={[
                styles.uploadButton,
                uploading && styles.uploadButtonActive,
              ]}
              onPress={() => !uploading && document.getElementById(inputId)?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <LoadingSpinner size={16} color="#FFFFFF" />
              ) : (
                <Upload size={16} color="#FFFFFF" />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? "Uploading..." : "Upload"}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: {
    minHeight: "100vh" as any,
    backgroundColor: "#F8FAFC",
  },
  header: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#0F172A",
    textTransform: "uppercase",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  homeLink: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  homeText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#334155",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  container: {
    width: "100%",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHead: { marginBottom: 20, gap: 6 },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#64748B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: "#0F172A",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  metaHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  uploadHint: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  errorBox: {
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    padding: 20,
    borderRadius: 0,
    gap: 8,
    alignItems: 'center',
  },
  errorTitle: {
    color: "#991B1B",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    textAlign: 'center',
  },
  successBox: {
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    padding: 24,
    borderRadius: 0,
    gap: 10,
    alignItems: 'center',
  },
  successTitle: {
    color: "#166534",
    fontWeight: "600",
    fontSize: 18,
  },
  successText: {
    color: "#166534",
    fontSize: 14,
    textAlign: 'center',
  },
  altLink: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    padding: 10,
  },
  altText: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 16,
  },
  errorRow: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  successRow: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-start',
  },
  successRowText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#166534',
  },
  reqTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  reqMsg: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  progressText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  rowError: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 6,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderRadius: 0,
    minWidth: 100,
    justifyContent: 'center',
  },
  uploadButtonActive: {
    backgroundColor: '#475569',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
});
