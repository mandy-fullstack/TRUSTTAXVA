import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Button, Text, Card } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import { Shield, UploadCloud, CheckCircle, ArrowLeft } from "lucide-react";

export function DocumentRequestPortalPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

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
        if (!cancelled) setMeta(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load portal");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleUpload = async (file: File) => {
    if (!token) return;
    try {
      setUploading(true);
      setError("");
      await api.uploadPortalDocumentRequest(token, file);
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: any) => {
    const f = e?.target?.files?.[0];
    if (f) handleUpload(f);
  };

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
        <Card style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.title}>
              {t("portal.upload_title", "Secure Document Upload")}
            </Text>
            <Text style={styles.subtitle}>
              {t(
                "portal.upload_subtitle",
                "Upload the requested document using this private portal link.",
              )}
            </Text>
          </View>

          {loading ? (
            <Text style={styles.info}>
              {t("common.loading", "Loading...")}
            </Text>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>
                {t("common.error", "Error")}
              </Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : success ? (
            <View style={styles.successBox}>
              <CheckCircle size={22} color="#16A34A" />
              <Text style={styles.successTitle}>
                {t("portal.upload_success", "Upload complete")}
              </Text>
              <Text style={styles.successText}>
                {t(
                  "portal.upload_success_hint",
                  "Thank you. Your document was uploaded securely and attached to your order.",
                )}
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
              <View style={styles.metaBox}>
                <Text style={styles.metaLine}>
                  <Text style={styles.metaLabel}>
                    {t("portal.order", "Order")}:
                  </Text>{" "}
                  #{meta?.orderDisplayId || meta?.orderId}
                </Text>
                <Text style={styles.metaLine}>
                  <Text style={styles.metaLabel}>
                    {t("portal.document", "Document requested")}:
                  </Text>{" "}
                  {meta?.documentName}
                </Text>
                {meta?.message ? (
                  <Text style={styles.metaMessage}>{meta.message}</Text>
                ) : null}
                {expiresLabel ? (
                  <Text style={styles.metaHint}>
                    {t("portal.expires", "Link expires")}: {expiresLabel}
                  </Text>
                ) : null}
              </View>

              {Platform.OS === "web" ? (
                <View style={styles.uploadBox}>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    id="portal-file-input"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <Button
                    title={
                      uploading
                        ? t("portal.uploading", "Uploading...")
                        : t("portal.choose_file", "Choose File")
                    }
                    variant="outline"
                    onPress={() =>
                      document.getElementById("portal-file-input")?.click()
                    }
                    icon={<UploadCloud size={18} color="#2563EB" />}
                    disabled={uploading}
                  />
                  <Text style={styles.uploadHint}>
                    {t(
                      "portal.security_note",
                      "Files are encrypted (AES-256) before storage and only accessible by authorized TrustTax professionals.",
                    )}
                  </Text>
                </View>
              ) : (
                <Text style={styles.info}>
                  {t(
                    "portal.web_only",
                    "This secure upload portal is available on web.",
                  )}
                </Text>
              )}

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
      </View>
    </View>
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
    maxWidth: 640,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  cardHead: { marginBottom: 16, gap: 6 },
  title: {
    fontSize: 18,
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
  metaBox: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 0,
    gap: 6,
  },
  metaLine: {
    fontSize: 13,
    fontWeight: "400",
    color: "#0F172A",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  metaLabel: { color: "#64748B" },
  metaMessage: {
    marginTop: 6,
    fontSize: 13,
    color: "#334155",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  metaHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  uploadBox: { marginTop: 14, gap: 10 },
  uploadHint: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  info: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  errorBox: {
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 0,
    gap: 6,
  },
  errorTitle: { color: "#991B1B", fontWeight: "600" },
  errorText: { color: "#991B1B" },
  successBox: {
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    padding: 14,
    borderRadius: 0,
    gap: 6,
  },
  successTitle: { color: "#166534", fontWeight: "600" },
  successText: { color: "#166534" },
  altLink: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  altText: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
});

