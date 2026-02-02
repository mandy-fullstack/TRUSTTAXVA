import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { H2, H4, Text } from "@trusttax/ui";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  FileText,
  CreditCard,
  Shield,
  Briefcase,
  Receipt,
  Eye,
  EyeOff,
  Clock,
  Bell,
  CheckCircle,
  RefreshCw,
  Folder,
  Download,
  Trash2,
  Edit2, // Added for rename
  Upload, // Added for upload
  X, // Added for modal
  // Eye, // Removed duplicate
} from "lucide-react";
import { api } from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { FileIcon } from "../../components/FileIcon";
import { RenameModal } from "../../components/RenameModal";
import { API_BASE_URL } from "../../config/api";
// import { ConfirmDialog } from '../../components/ConfirmDialog'; // Removed unused

const MOBILE_BREAKPOINT = 768;

function formatDate(val: string | Date | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function formatDateTime(val: string | Date | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function orDash(val: string | number | boolean | null | undefined): string {
  if (val == null || val === "") return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return String(val);
}

function fullName(
  first: string | null | undefined,
  middle: string | null | undefined,
  last: string | null | undefined,
  fallback: string | null | undefined,
): string {
  const parts = [first, middle, last].filter(Boolean) as string[];
  if (parts.length) return parts.join(" ");
  return fallback || "—";
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sensitiveData, setSensitiveData] = useState<{
    ssn: string | null;
    driverLicense: {
      number: string;
      stateCode: string;
      stateName: string;
      expirationDate: string;
    } | null;
    passport: {
      number: string;
      countryOfIssue: string;
      expirationDate: string;
    } | null;
  } | null>(null);
  const [sensitiveLoading, setSensitiveLoading] = useState(false);
  const [sensitiveError, setSensitiveError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [pushError, setPushError] = useState("");
  // Documents
  const [documents, setDocuments] = useState<any[]>([]);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("OTHER");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setSensitiveData(null);
    setSensitiveError("");
    setSecondsLeft(0);
    setDocuments([]);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setError("");

        // Parallel fetch
        const [clientData, docsData] = await Promise.all([
          api.getClientDetails(id),
          api.getUserDocuments(id).catch(() => []), // Don't fail whole page if docs fail
        ]);

        if (!cancelled) {
          setClient(clientData);
          setDocuments(docsData);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load client");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDownload = async (doc: any) => {
    try {
      setProcessingId(doc.id);
      const res = await fetch(
        `${API_BASE_URL}/documents/admin/download/${doc.id}`,
        {
          headers: {
            Authorization: `Bearer ${api.getToken ? api.getToken() : ""}`,
          },
        },
      );
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.title || "document";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert("Failed to download document");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePreview = async (doc: any) => {
    try {
      setProcessingId(doc.id);
      const res = await fetch(
        `${API_BASE_URL}/documents/admin/download/${doc.id}?disposition=inline`,
        {
          headers: {
            Authorization: `Bearer ${api.getToken ? api.getToken() : ""}`,
          },
        },
      );
      if (!res.ok) throw new Error("Preview failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Revoke after delay
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (e) {
      alert("Failed to preview document");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRenameClick = (doc: any) => {
    setSelectedDoc(doc);
    setRenameModalOpen(true);
  };

  const confirmRename = async (newTitle: string) => {
    if (!selectedDoc) return;
    try {
      setProcessingId(selectedDoc.id);
      await api.adminRenameDocument(selectedDoc.id, newTitle);

      // Update local state
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === selectedDoc.id ? { ...d, title: newTitle } : d,
        ),
      );

      setRenameModalOpen(false);
      setSelectedDoc(null);
    } catch (e) {
      console.error(e);
      alert("Failed to rename document");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${doc.title || "this document"}"?`,
      )
    )
      return;
    try {
      setProcessingId(doc.id);
      await api.adminDeleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (e) {
      alert("Failed to delete document");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUploadClick = () => {
    setUploadFile(null);
    setUploadType("OTHER");
    setUploadModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !id) return;
    try {
      setIsUploading(true);
      await api.adminUploadDocument(
        id,
        uploadFile,
        uploadFile.name,
        uploadType,
      );

      // Refresh documents
      const docsData = await api.getUserDocuments(id);
      setDocuments(docsData);

      setUploadModalOpen(false);
      setUploadFile(null);
      alert("Document uploaded and client notified.");
    } catch (e: any) {
      alert(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (sensitiveData) setSensitiveData(null);
      return;
    }
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const loadSensitive = async () => {
    if (!id || sensitiveLoading) return;
    setSensitiveLoading(true);
    setSensitiveError("");
    try {
      const data = await api.getClientSensitive(id);
      setSensitiveData(data);
      setSecondsLeft(30);
    } catch (e: any) {
      setSensitiveError(e?.message || "Failed to load sensitive data");
    } finally {
      setSensitiveLoading(false);
    }
  };

  const hideSensitive = () => {
    setSecondsLeft(0);
    setSensitiveData(null);
  };

  const refreshClient = async () => {
    if (!id || loading) return;
    try {
      setLoading(true);
      const data = await api.getClientDetails(id);
      setClient(data);
      setPushStatus("idle");
    } catch (e: any) {
      setError(e?.message || "Failed to refresh client data");
    } finally {
      setLoading(false);
    }
  };

  const handleTestPush = async () => {
    if (!id || pushLoading) return;
    setPushLoading(true);
    setPushStatus("idle");
    setPushError("");
    try {
      await api.sendTestPush(id);
      setPushStatus("success");
      setTimeout(() => setPushStatus("idle"), 5000);
    } catch (e: any) {
      setPushStatus("error");
      setPushError(e?.message || "Failed to send test notification");
    } finally {
      setPushLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      </Layout>
    );
  }

  if (error || !client) {
    return (
      <Layout>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || "Client not found"}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigate("/clients")}
            activeOpacity={0.7}
          >
            <ArrowLeft size={18} color="#2563EB" />
            <Text style={styles.backText}>Back to Clients</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  const name = fullName(
    client.firstName,
    client.middleName,
    client.lastName,
    client.name,
  );

  return (
    <Layout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          isMobile && styles.containerMobile,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigate("/clients")}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#64748B" />
            <Text style={styles.backText}>Back to Clients</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshClient}
            activeOpacity={0.7}
          >
            <RefreshCw size={18} color="#64748B" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View style={styles.avatar}>
            <User size={32} color="#64748B" />
          </View>
          <View style={styles.headerText}>
            <H2 style={isMobile ? styles.titleMobile : undefined}>{name}</H2>
            <View style={styles.headerMeta}>
              <Mail size={16} color="#94A3B8" />
              <Text style={styles.email}>{client.email}</Text>
            </View>
            <View style={styles.headerMeta}>
              <Calendar size={16} color="#94A3B8" />
              <Text style={styles.meta}>
                Joined {formatDate(client.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.grid, isMobile && styles.gridMobile]}>
          {/* Account */}
          <View style={[styles.section, !isMobile && styles.sectionHalf]}>
            <View style={styles.sectionTitleRow}>
              <Mail size={18} color="#334155" />
              <H4 style={styles.sectionTitle}>Account</H4>
            </View>
            <View style={styles.card}>
              <Row label="Email" value={client.email} />
              <Row label="Display name" value={orDash(client.name)} />
              <Row label="Created" value={formatDateTime(client.createdAt)} />
              <Row label="Updated" value={formatDateTime(client.updatedAt)} />
            </View>
          </View>

          {/* Personal */}
          <View style={[styles.section, !isMobile && styles.sectionHalf]}>
            <View style={styles.sectionTitleRow}>
              <User size={18} color="#334155" />
              <H4 style={styles.sectionTitle}>Personal information</H4>
            </View>
            <View style={styles.card}>
              <Row label="First name" value={orDash(client.firstName)} />
              <Row label="Middle name" value={orDash(client.middleName)} />
              <Row label="Last name" value={orDash(client.lastName)} />
              <Row
                label="Date of birth"
                value={formatDate(client.dateOfBirth)}
              />
              <Row
                label="Country of birth"
                value={orDash(client.countryOfBirth)}
              />
              <Row
                label="Primary language"
                value={orDash(client.primaryLanguage)}
              />
            </View>
          </View>

          {/* Tax ID & sensitive: masked by default; full data on "Load" with 30s auto-hide */}
          <View style={[styles.section, !isMobile && styles.sectionHalf]}>
            <View style={styles.sectionTitleRow}>
              <CreditCard size={18} color="#334155" />
              <H4 style={styles.sectionTitle}>Tax ID & identification</H4>
            </View>
            <View style={styles.card}>
              <Row label="Tax ID type" value={orDash(client.taxIdType)} />
              {sensitiveData ? (
                <>
                  <Row
                    label="SSN/ITIN (full)"
                    value={sensitiveData.ssn || "—"}
                  />
                  <Row
                    label="Driver license"
                    value={
                      sensitiveData.driverLicense
                        ? `${sensitiveData.driverLicense.number} • ${sensitiveData.driverLicense.stateCode} ${sensitiveData.driverLicense.stateName} • Exp ${sensitiveData.driverLicense.expirationDate}`
                        : "—"
                    }
                  />
                  <Row
                    label="Passport"
                    value={
                      sensitiveData.passport
                        ? `${sensitiveData.passport.number} • ${sensitiveData.passport.countryOfIssue} • Exp ${sensitiveData.passport.expirationDate}`
                        : "—"
                    }
                  />

                  {/* Documents Folder View */}
                  <View style={styles.docsSection}>
                    <H4 style={styles.docsTitle}>Documents Repository</H4>
                    <View style={styles.folder}>
                      <View style={styles.folderHeader}>
                        <Folder size={16} color="#64748B" />
                        <Text style={styles.folderName}>Client Documents</Text>
                      </View>

                      {/* Driver License Folder */}
                      {sensitiveData.driverLicense &&
                        (sensitiveData.driverLicense as any).photoKey && (
                          <View style={styles.subFolder}>
                            <View style={styles.folderHeader}>
                              <Folder size={14} color="#64748B" />
                              <Text style={styles.subFolderName}>
                                Driver License
                              </Text>
                            </View>
                            <View style={styles.fileItem}>
                              <FileText size={14} color="#0F172A" />
                              <Text style={styles.fileName}>
                                {(
                                  (sensitiveData.driverLicense as any)
                                    .photoKey || ""
                                )
                                  .split("/")
                                  .pop()}
                              </Text>
                            </View>
                          </View>
                        )}

                      {/* Passport Folder */}
                      {sensitiveData.passport &&
                        (sensitiveData.passport as any).photoKey && (
                          <View style={styles.subFolder}>
                            <View style={styles.folderHeader}>
                              <Folder size={14} color="#64748B" />
                              <Text style={styles.subFolderName}>Passport</Text>
                            </View>
                            <View style={styles.fileItem}>
                              <FileText size={14} color="#0F172A" />
                              <Text style={styles.fileName}>
                                {(
                                  (sensitiveData.passport as any).photoKey || ""
                                )
                                  .split("/")
                                  .pop()}
                              </Text>
                            </View>
                          </View>
                        )}

                      {!(sensitiveData.driverLicense as any)?.photoKey &&
                        !(sensitiveData.passport as any)?.photoKey && (
                          <Text style={styles.noDocs}>
                            No digital documents found.
                          </Text>
                        )}
                    </View>
                  </View>

                  <View style={styles.sensitiveActions}>
                    {secondsLeft > 0 && (
                      <View style={styles.countdown}>
                        <Clock size={16} color="#F59E0B" />
                        <Text style={styles.countdownText}>
                          Hiding in {secondsLeft}s
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.hideNowButton}
                      onPress={hideSensitive}
                      activeOpacity={0.7}
                    >
                      <EyeOff size={16} color="#64748B" />
                      <Text style={styles.hideNowText}>Hide now</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Row
                    label="SSN/ITIN last 4"
                    value={client.ssnLast4 ? `****${client.ssnLast4}` : "—"}
                  />
                  <Row
                    label="Driver license last 4"
                    value={orDash(client.driverLicenseLast4)}
                  />
                  <Row
                    label="Passport last 4"
                    value={orDash(client.passportLast4)}
                  />
                  {sensitiveError ? (
                    <Text style={styles.sensitiveError}>{sensitiveError}</Text>
                  ) : null}
                  <TouchableOpacity
                    style={[
                      styles.revealButton,
                      sensitiveLoading && styles.revealButtonDisabled,
                    ]}
                    onPress={loadSensitive}
                    disabled={sensitiveLoading}
                    activeOpacity={0.7}
                  >
                    {sensitiveLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Eye size={18} color="#FFF" />
                        <Text style={styles.revealButtonText}>
                          Load full data (30s)
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Terms */}
          <View style={[styles.section, !isMobile && styles.sectionHalf]}>
            <View style={styles.sectionTitleRow}>
              <Shield size={18} color="#334155" />
              <H4 style={styles.sectionTitle}>Terms & profile</H4>
            </View>
            <View style={styles.card}>
              <Row
                label="Terms accepted"
                value={
                  client.termsAcceptedAt
                    ? formatDateTime(client.termsAcceptedAt)
                    : "—"
                }
              />
              <Row label="Terms version" value={orDash(client.termsVersion)} />
              <Row
                label="Profile completed"
                value={client.isProfileComplete ? "Yes" : "No"}
              />
              <Row
                label="Completed at"
                value={formatDateTime(client.profileCompletedAt)}
              />
            </View>
          </View>

          {/* Notifications */}
          <View style={[styles.section, !isMobile && styles.sectionHalf]}>
            <View style={styles.sectionTitleRow}>
              <Bell size={18} color="#334155" />
              <H4 style={styles.sectionTitle}>Push Notifications</H4>
            </View>
            <View style={styles.card}>
              <View style={styles.statusRow}>
                <Text style={styles.rowLabel}>Push Registration Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: client.fcmToken ? "#ECFDF5" : "#FEF2F2",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: client.fcmToken
                          ? "#10B981"
                          : "#EF4444",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: client.fcmToken ? "#065F46" : "#991B1B" },
                    ]}
                  >
                    {client.fcmToken ? "Registered" : "Not Registered"}
                  </Text>
                </View>
              </View>

              <Text style={styles.notifHint}>
                {client.fcmToken
                  ? "The user has enabled notifications and can receive push alerts on their device."
                  : "This user has not granted permission or registered a device yet."}
              </Text>

              <TouchableOpacity
                style={[
                  styles.testPushButton,
                  !client.fcmToken && styles.testPushButtonDisabled,
                  pushStatus === "success" && styles.testPushButtonSuccess,
                ]}
                onPress={handleTestPush}
                disabled={!client.fcmToken || pushLoading}
                activeOpacity={0.7}
              >
                {pushLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : pushStatus === "success" ? (
                  <>
                    <CheckCircle size={18} color="#FFF" />
                    <Text style={styles.testPushButtonText}>
                      Notification Sent!
                    </Text>
                  </>
                ) : (
                  <>
                    <Bell
                      size={18}
                      color={client.fcmToken ? "#FFF" : "#94A3B8"}
                    />
                    <Text
                      style={[
                        styles.testPushButtonText,
                        !client.fcmToken && { color: "#94A3B8" },
                      ]}
                    >
                      Send Test Notification
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {pushStatus === "error" && (
                <Text style={styles.pushError}>{pushError}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Orders */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Briefcase size={18} color="#334155" />
            <H4 style={styles.sectionTitle}>
              Orders ({client.orders?.length ?? 0})
            </H4>
          </View>
          {client.orders?.length ? (
            <View style={styles.tableWrap}>
              <View
                style={[
                  styles.tableHeader,
                  isMobile && styles.tableHeaderMobile,
                ]}
              >
                {!isMobile && (
                  <Text style={[styles.th, styles.colService]}>Service</Text>
                )}
                <Text style={[styles.th, styles.colStatus]}>Status</Text>
                <Text style={[styles.th, styles.colDate]}>Date</Text>
                {!isMobile && (
                  <Text style={[styles.th, styles.colAction]}>Action</Text>
                )}
              </View>
              {(client.orders as any[]).map((o: any) => (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.tableRow, isMobile && styles.tableRowMobile]}
                  onPress={() => navigate(`/orders/${o.id}`)}
                  activeOpacity={0.7}
                >
                  {!isMobile && (
                    <View style={styles.colService}>
                      <Text style={styles.serviceName}>
                        {o.service?.name ?? "—"}
                      </Text>
                      <Text style={styles.serviceCat}>
                        {o.service?.category}
                      </Text>
                    </View>
                  )}
                  <View style={styles.colStatus}>
                    <Text
                      style={[
                        styles.badge,
                        { backgroundColor: "#E2E8F0", color: "#475569" },
                      ]}
                    >
                      {o.status}
                    </Text>
                  </View>
                  <Text style={styles.colDate}>{formatDate(o.createdAt)}</Text>
                  {!isMobile && (
                    <TouchableOpacity
                      onPress={() => navigate(`/orders/${o.id}`)}
                      style={styles.link}
                    >
                      <FileText size={14} color="#2563EB" />
                      <Text style={styles.linkText}>View</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No orders yet.</Text>
            </View>
          )}
        </View>

        {/* Documents Manager */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Folder size={18} color="#334155" />
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <H4 style={styles.sectionTitle}>
                Documents & Files ({documents.length})
              </H4>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handleUploadClick}
              >
                <Upload size={14} color="#FFF" />
                <Text style={styles.uploadBtnText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.card}>
            {documents.length === 0 ? (
              <Text style={styles.emptyText}>No documents uploaded yet.</Text>
            ) : (
              <View style={styles.docsGrid}>
                {["IDENTITY", "TAX", "LEGAL", "OTHER"].map((groupKey) => {
                  const groupDocs = documents.filter((d) => {
                    const t = (d.type || "OTHER").toUpperCase();
                    if (groupKey === "IDENTITY")
                      return (
                        t.includes("LICENSE") ||
                        t.includes("PASSPORT") ||
                        t === "SSN"
                      );
                    if (groupKey === "TAX") return t.includes("TAX");
                    if (groupKey === "LEGAL")
                      return t.includes("AGREEMENT") || t.includes("FORM");
                    return (
                      !t.includes("LICENSE") &&
                      !t.includes("PASSPORT") &&
                      t !== "SSN" &&
                      !t.includes("TAX") &&
                      !t.includes("AGREEMENT") &&
                      !t.includes("FORM")
                    );
                  });

                  if (groupDocs.length === 0) return null;

                  const groupTitle =
                    groupKey === "IDENTITY"
                      ? "Identity Documents"
                      : groupKey === "TAX"
                        ? "Tax Returns & Filings"
                        : groupKey === "LEGAL"
                          ? "Legal & Agreements"
                          : "General & Uploads";

                  return (
                    <View key={groupKey} style={styles.docGroup}>
                      <View style={styles.docGroupHeader}>
                        <Folder size={16} color="#475569" />
                        <Text style={styles.docGroupTitle}>{groupTitle}</Text>
                        <View style={styles.docCountBadge}>
                          <Text style={styles.docCountText}>
                            {groupDocs.length}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.docGrid}>
                        {groupDocs.map((doc) => (
                          <View key={doc.id} style={styles.fileCard}>
                            <View style={styles.fileCardHeader}>
                              <FileIcon
                                fileName={doc.title}
                                mimeType={doc.mimeType || ""}
                                size={20}
                              />
                              <View style={styles.fileActions}>
                                <TouchableOpacity
                                  style={styles.actionIcon}
                                  onPress={() => handlePreview(doc)}
                                  disabled={!!processingId}
                                >
                                  <Eye size={16} color="#64748B" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.actionIcon}
                                  onPress={() => handleDownload(doc)}
                                  disabled={!!processingId}
                                >
                                  <Download size={16} color="#64748B" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.actionIcon}
                                  onPress={() => handleRenameClick(doc)}
                                  disabled={!!processingId}
                                >
                                  <Edit2 size={16} color="#64748B" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[
                                    styles.actionIcon,
                                    styles.deleteAction,
                                  ]}
                                  onPress={() => handleDeleteDocument(doc)}
                                  disabled={!!processingId}
                                >
                                  <Trash2 size={16} color="#EF4444" />
                                </TouchableOpacity>
                              </View>
                            </View>

                            <View style={styles.fileMain}>
                              <Text
                                style={styles.fileCardName}
                                numberOfLines={2}
                              >
                                {doc.title ||
                                  doc.s3Key?.split("/").pop() ||
                                  "Untitled"}
                              </Text>
                              <Text style={styles.fileMetaText}>
                                {formatDate(doc.uploadedAt)} •{" "}
                                {(doc.size / 1024).toFixed(0)} KB
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Upload Modal */}
        {uploadModalOpen && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Upload Document</Text>
                <TouchableOpacity onPress={() => setUploadModalOpen(false)}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Select File</Text>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    style={styles.fileInput}
                  />
                </View>

                {uploadFile && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Document Type</Text>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                      style={styles.selectInput}
                    >
                      <option value="OTHER">Other / General</option>
                      <option value="TAX_RETURN">Tax Return</option>
                      <option value="LEGAL">Legal Document</option>
                      <option value="INVOICE">Invoice</option>
                    </select>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!uploadFile || isUploading) && styles.disabledButton,
                  ]}
                  onPress={handleUploadSubmit}
                  disabled={!uploadFile || isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      Upload & Notify
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <RenameModal
          isOpen={renameModalOpen}
          onClose={() => {
            setRenameModalOpen(false);
            setSelectedDoc(null);
          }}
          onRename={confirmRename}
          currentName={selectedDoc?.title || ""}
          title="Rename Document"
        />

        {/* Invoices */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Receipt size={18} color="#334155" />
            <H4 style={styles.sectionTitle}>
              Invoices ({client.invoices?.length ?? 0})
            </H4>
          </View>
          {client.invoices?.length ? (
            <View style={styles.tableWrap}>
              <View
                style={[
                  styles.tableHeader,
                  isMobile && styles.tableHeaderMobile,
                ]}
              >
                <Text style={[styles.th, styles.colAmount]}>Amount</Text>
                <Text style={[styles.th, styles.colStatus]}>Status</Text>
                <Text style={[styles.th, styles.colDate]}>Due</Text>
                <Text style={[styles.th, styles.colDate]}>Paid</Text>
              </View>
              {(client.invoices as any[]).map((inv: any) => (
                <View
                  key={inv.id}
                  style={[styles.tableRow, isMobile && styles.tableRowMobile]}
                >
                  <Text style={styles.amount}>
                    ${Number(inv.amount || 0).toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.badge,
                      { backgroundColor: "#E2E8F0", color: "#475569" },
                    ]}
                  >
                    {inv.status}
                  </Text>
                  <Text style={styles.colDate}>{formatDate(inv.dueDate)}</Text>
                  <Text style={styles.colDate}>{formatDate(inv.paidAt)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No invoices yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Layout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, width: "100%" },
  mainContainer: { flex: 1, height: "100%", flexDirection: "column" },
  headerContainer: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFF",
  },
  container: {
    padding: 32,
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    paddingBottom: 48,
  },
  containerMobile: { padding: 16, paddingTop: 24 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  errorText: { color: "#EF4444", fontSize: 15, marginBottom: 16 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  backText: { color: "#64748B", fontSize: 14, fontWeight: "500" },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 32,
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  refreshText: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 0, // Already 0, but keeping it explicit
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, minWidth: 0 },
  titleMobile: { fontSize: 22 },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  email: { fontSize: 15, color: "#475569" },
  meta: { fontSize: 14, color: "#94A3B8" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 24, marginBottom: 32 },
  gridMobile: { flexDirection: "column", gap: 20 },
  section: { width: "100%", marginBottom: 24 },
  sectionHalf: { width: "calc(50% - 12px)" as any, maxWidth: 480 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { marginBottom: 0, color: "#334155" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
  },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  rowContent: { flex: 1, minWidth: 0 },
  rowLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  rowValue: { fontSize: 15, color: "#0F172A" },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 0,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },
  statusDot: { width: 6, height: 6, borderRadius: 0 },

  sensitiveActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    flexWrap: "wrap",
  },
  countdown: { flexDirection: "row", alignItems: "center", gap: 6 },
  countdownText: { fontSize: 14, color: "#F59E0B", fontWeight: "600" },
  hideNowButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 0,
  },
  hideNowText: { fontSize: 13, color: "#64748B", fontWeight: "500" },

  // New Styles
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0F172A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 0,
  },
  uploadBtnText: { color: "#FFF", fontSize: 13, fontWeight: "500" },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    height: "100%",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#FFF",
    borderRadius: 0,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#0F172A" },
  modalBody: { gap: 16 },
  formGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: "500", color: "#64748B" },
  fileInput: { fontSize: 14, color: "#0F172A" },
  selectInput: {
    width: "100%",
    padding: 8,
    fontSize: 14,
    borderRadius: 0,
    borderColor: "#E2E8F0",
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    alignItems: "center",
    borderRadius: 0,
    marginTop: 8,
  },
  primaryButtonText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  disabledButton: { opacity: 0.5 },

  sensitiveError: {
    fontSize: 13,
    color: "#EF4444",
    marginTop: 8,
    marginBottom: 8,
  },
  revealButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0F172A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    borderRadius: 0,
  },
  revealButtonDisabled: { opacity: 0.7 },
  revealButtonText: { fontSize: 14, fontWeight: "600", color: "#FFF" },

  tableWrap: {
    backgroundColor: "#FFF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableHeaderMobile: { flexWrap: "wrap" },
  th: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableRowMobile: { flexWrap: "wrap", gap: 8 },
  colService: { flex: 2 },
  colStatus: { flex: 1 },
  colDate: { flex: 1, fontSize: 13, color: "#64748B" },
  colAmount: { flex: 1 },
  colAction: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  serviceCat: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  badge: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    alignSelf: "flex-start",
  },
  amount: { flex: 1, fontSize: 14, fontWeight: "600", color: "#10B981" },
  link: { flexDirection: "row", alignItems: "center", gap: 6 },
  linkText: { fontSize: 13, fontWeight: "600", color: "#2563EB" },
  empty: {
    padding: 24,
    backgroundColor: "#F8FAFC",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyText: { color: "#94A3B8", fontSize: 14 },
  notifHint: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 8,
    marginBottom: 16,
    fontStyle: "italic",
  },
  testPushButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0F172A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 0,
  },
  testPushButtonDisabled: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  testPushButtonSuccess: { backgroundColor: "#10B981" },
  testPushButtonText: { fontSize: 14, fontWeight: "600", color: "#FFF" },
  pushError: {
    fontSize: 13,
    color: "#EF4444",
    marginTop: 12,
    textAlign: "center",
  },

  docsSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  docsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  folder: { marginLeft: 0 },
  folderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  folderName: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  subFolder: {
    marginLeft: 24,
    marginBottom: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
    paddingLeft: 12,
  },
  subFolderName: { fontSize: 13, fontWeight: "600", color: "#475569" },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 24,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 0,
    alignSelf: "flex-start",
  },
  fileName: { fontSize: 13, color: "#1E293B", fontFamily: "monospace" },
  noDocs: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
    marginLeft: 8,
  },

  tabsContainer: { marginTop: 12 },
  tabsScroll: { flexDirection: "row", gap: 24 },
  tabItem: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: { borderBottomColor: "#2563EB" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#64748B" },
  tabTextActive: { color: "#2563EB", fontWeight: "600" },

  docsGrid: { gap: 24 },
  docGroup: {},
  docGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  docGroupTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  docCountBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
  },
  docCountText: { fontSize: 11, fontWeight: "700", color: "#64748B" },

  docGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  fileCard: {
    width: 200,
    flexGrow: 1,
    maxWidth: 240,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 0,
    flexDirection: "column",
  },
  fileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  fileMain: { flex: 1 },
  fileCardName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    lineHeight: 18,
  },
  fileMetaText: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
  fileActions: { flexDirection: "row", gap: 4 },
  actionIcon: {
    padding: 6,
    borderRadius: 0,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAction: { backgroundColor: "#FEF2F2" },
  docName: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  docMeta: { fontSize: 11, color: "#64748B", marginTop: 2 },
  docActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  docBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
});
