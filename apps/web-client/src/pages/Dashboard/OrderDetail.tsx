import { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Platform,
} from "react-native";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { H1, H4, Text, Card, Badge, Button } from "@trusttax/ui";
import {
    ArrowLeft,
    Clock,
    FileText,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    ExternalLink,
    ShieldCheck,
    Search,
    Filter,
} from "lucide-react";
import { Layout } from "../../components/Layout";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { DocumentCard } from "../../components/DocumentCard";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { useDocumentViewer } from "../../hooks/useDocumentViewer";

const ProgressStepper = ({
    steps,
    currentStepIndex,
}: {
    steps: any[];
    currentStepIndex: number;
}) => {
    return (
        <View style={styles.stepperContainer}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;
                return (
                    <View key={step.id} style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepCircle,
                                isCompleted && styles.stepCircleCompleted,
                                isActive && styles.stepCircleActive,
                            ]}
                        >
                            {isCompleted ? (
                                <CheckCircle size={16} color="#FFF" />
                            ) : (
                                <Text
                                    style={[
                                        styles.stepNumber,
                                        (isActive || isCompleted) && styles.textWhite,
                                    ]}
                                >
                                    {index + 1}
                                </Text>
                            )}
                        </View>
                        <Text
                            style={[styles.stepTitle, isActive && styles.stepTitleActive]}
                        >
                            {step.title}
                        </Text>
                        {index < steps.length - 1 && (
                            <View
                                style={[
                                    styles.stepLine,
                                    isCompleted && styles.stepLineCompleted,
                                ]}
                            />
                        )}
                    </View>
                );
            })}
        </View>
    );
};

const OTHER_MAP: Record<string, string> = {
    has1099NEC: "Formularios 1099-NEC (Trabajo Indev.)",
    has1099K: "Formularios 1099-K (Plataformas de Pago)",
    has1099G: "Formularios 1099-G (Desempleo)",
    has1099INTorDIV: "Intereses o Dividendos (1099-INT/DIV)",
    has1099R: "Distribuciones de Retiro (1099-R)",
    hasSSA1099: "Seguro Social (SSA-1099)",
    hasCrypto: "Criptomonedas / Activos Digitales",
    hasW2G: "Ganancias de Juego (W-2G)",
    has1099B: "Venta de Acciones/Propiedades (1099-B)",
    hasRental: "Ingresos por Renta",
};

const DED_MAP: Record<string, string> = {
    mortgageInterest: "Intereses Hipotecarios (1098)",
    tuition1098T: "Matrícula Universitaria (1098-T)",
    studentLoanInterest: "Intereses de Préstamo Estudiantil",
    iraContribution: "Contribuciones a IRA",
    hsa: "Cuenta de Ahorros de Salud (HSA)",
    charitable: "Donaciones Caritativas",
    medical: "Gastos Médicos Mayores",
    energy: "Mejoras de Energía en el Hogar",
};

const WIZARD_LABEL_MAP: Record<string, string> = {
    has1099NEC: "1099-NEC",
    has1099K: "1099-K",
    has1099G: "1099-G",
    has1099INTorDIV: "1099-INT / 1099-DIV",
    has1099R: "1099-R",
    hasSSA1099: "SSA-1099",
    hasCrypto: "Crypto statements",
    hasW2G: "W-2G",
    has1099B: "1099-B",
    hasRental: "Rental docs",
    mortgageInterest: "1098 (mortgage)",
    tuition1098T: "1098-T (tuition)",
    studentLoanInterest: "1098-E (student loan)",
    iraContribution: "IRA contribution confirmation",
    hsa: "1095 / 1099-SA (HSA)",
    charitable: "Charitable receipts",
    medical: "Medical expense docs",
    energy: "Energy improvement docs",
};

export const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { showAlert } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [respondingId, setRespondingId] = useState<string | null>(null);
    const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(
        null,
    );

    // Document Viewer State
    const { previewUrl, previewMimeType, closePreview } = useDocumentViewer();
    const [previewDocumentTitle] = useState<string>("");
    const [documentFilter, setDocumentFilter] = useState<
        "all" | "identity" | "tax" | "other"
    >("all");
    const [documentSearch, setDocumentSearch] = useState("");

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        if (!id) return;
        try {
            setLoading(true);
            // IMPORTANTE: Desencriptar toda la información para que el usuario pueda ver sus datos
            // El parámetro decryptForReview=true hace que el backend descifre todos los campos sensibles
            const data = await api.getOrderById(id, true);
            setOrder(data);
        } catch (error) {
            console.error("Failed to fetch order details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (
        approvalId: string,
        status: "APPROVED" | "REJECTED",
    ) => {
        try {
            setRespondingId(approvalId);
            await api.respondToApproval(approvalId, status);
            await fetchOrder();
        } catch (error) {
            console.error("Failed to respond to approval:", error);
            showAlert({
                title: t("order.error_title", "Error de proceso"),
                message: t(
                    "order.approval_error_msg",
                    "No se pudo procesar tu respuesta en este momento.",
                ),
                variant: "error",
            });
        } finally {
            setRespondingId(null);
        }
    };

    const parseRequestDescription = (desc: any): { message?: string; docType?: string } => {
        if (!desc || typeof desc !== "string") return {};
        try {
            const parsed = JSON.parse(desc);
            if (parsed && typeof parsed === "object") return parsed;
            return {};
        } catch {
            return { message: String(desc) };
        }
    };

    const handleUploadRequestedDocument = async (
        approval: any,
        file: File,
    ) => {
        if (!order?.id) return;
        try {
            setUploadingRequestId(approval.id);
            const meta = parseRequestDescription(approval.description);
            const docType = meta.docType || "OTHER";

            const uploaded = await api.uploadDocument(
                file,
                approval.title || file.name,
                docType,
                { orderId: order.id },
            );

            await api.completeDocumentRequest(approval.id, uploaded.id);
            await fetchOrder();
            showAlert({
                title: t("common.success", "Éxito"),
                message: t(
                    "order.doc_request_uploaded",
                    "Documento subido correctamente. Gracias.",
                ),
                variant: "success",
            });
        } catch (error: any) {
            console.error("Failed to upload requested document:", error);
            showAlert({
                title: t("order.error_title", "Error de proceso"),
                message:
                    error?.message ||
                    t(
                        "order.doc_request_upload_error",
                        "No se pudo subir el documento. Intenta nuevamente.",
                    ),
                variant: "error",
            });
        } finally {
            setUploadingRequestId(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Order not found.</Text>
            </View>
        );
    }

    const serviceSteps = order.service?.steps || [];
    const currentStepIndex = order.progress?.length || 0;

    return (
        <Layout>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
            >
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigate("/dashboard")}
                >
                    <ArrowLeft size={20} color="#2563EB" />
                    <Text style={styles.backText}>{t("common.back", "Back")}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <View>
                        <H1>{order.service?.name}</H1>
                        <View style={styles.headerSub}>
                            <Text style={styles.orderId}>
                                {order.displayId || `ID: ${order.id}`}
                            </Text>
                            <View style={styles.dot} />
                            <Text style={styles.orderDate}>
                                {new Date(order.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <Badge label={order.status} variant="primary" />
                </View>

                {/* Stepper Section */}
                <Card style={styles.stepperCard}>
                    <H4 style={styles.sectionTitle}>
                        {t("orders.progress", "Progreso de tu Solicitud")}
                    </H4>
                    <ProgressStepper
                        steps={serviceSteps}
                        currentStepIndex={currentStepIndex}
                    />
                </Card>

                <View style={styles.grid}>
                    <View style={styles.mainColumn}>
                        {/* Approvals + Document Requests */}
                        {(() => {
                            const pending = (order.approvals || []).filter(
                                (a: any) => a.status === "PENDING",
                            );
                            const docRequests = pending.filter(
                                (a: any) => a.type === "DOCUMENT_REQUEST",
                            );
                            const approvals = pending.filter(
                                (a: any) => a.type !== "DOCUMENT_REQUEST",
                            );

                            return (
                                <>
                                    {docRequests.length > 0 && (
                                        <Card style={styles.actionCard}>
                                            <View style={styles.cardHeader}>
                                                <FileText size={20} color="#B45309" />
                                                <Text style={[styles.label, { color: "#92400E" }]}>
                                                    {t(
                                                        "orders.document_requests_title",
                                                        "Documentos solicitados",
                                                    )}
                                                </Text>
                                            </View>
                                            <Text style={styles.actionHint}>
                                                {t(
                                                    "orders.document_requests_hint",
                                                    "Sube los documentos solicitados para continuar. Se adjuntarán de forma segura a tu orden.",
                                                )}
                                            </Text>

                                            {docRequests.map((req: any) => {
                                                const meta = parseRequestDescription(req.description);
                                                const message = meta.message || "";
                                                const docType = meta.docType || "OTHER";
                                                const inputId = `reqdoc-${req.id}`;

                                                return (
                                                    <View key={req.id} style={styles.actionItem}>
                                                        <Text style={styles.approvalTitle}>
                                                            {req.title}
                                                        </Text>
                                                        {message ? (
                                                            <Text style={styles.approvalDesc}>
                                                                {message}
                                                            </Text>
                                                        ) : null}
                                                        <Text style={styles.approvalMeta}>
                                                            {t("orders.document_type", "Tipo")}: {docType}
                                                        </Text>

                                                        {Platform.OS === "web" ? (
                                                            <>
                                                                {/* Hidden input for web upload */}
                                                                <input
                                                                    id={inputId}
                                                                    type="file"
                                                                    style={styles.hiddenFileInput as any}
                                                                    accept="image/*,.pdf"
                                                                    aria-label={t(
                                                                        "orders.upload_document",
                                                                        "Subir documento",
                                                                    )}
                                                                    title={t(
                                                                        "orders.upload_document",
                                                                        "Subir documento",
                                                                    )}
                                                                    onChange={(e: any) => {
                                                                        const file: File | undefined =
                                                                            e?.target?.files?.[0];
                                                                        if (!file) return;
                                                                        void handleUploadRequestedDocument(
                                                                            req,
                                                                            file,
                                                                        );
                                                                        // reset so same file can be re-selected
                                                                        e.target.value = "";
                                                                    }}
                                                                />
                                                                <Button
                                                                    title={
                                                                        uploadingRequestId === req.id
                                                                            ? t(
                                                                                  "orders.uploading",
                                                                                  "Subiendo...",
                                                                              )
                                                                            : t(
                                                                                  "orders.upload_document",
                                                                                  "Subir documento",
                                                                              )
                                                                    }
                                                                    onPress={() => {
                                                                        const el = document.getElementById(
                                                                            inputId,
                                                                        ) as HTMLInputElement | null;
                                                                        el?.click();
                                                                    }}
                                                                    loading={uploadingRequestId === req.id}
                                                                    style={styles.actionBtn}
                                                                />
                                                            </>
                                                        ) : (
                                                            <Text style={styles.noData}>
                                                                {t(
                                                                    "orders.upload_web_only",
                                                                    "Subida de archivos disponible en web.",
                                                                )}
                                                            </Text>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </Card>
                                    )}

                                    {approvals.length > 0 && (
                                        <Card style={styles.actionCard}>
                                            <View style={styles.cardHeader}>
                                                <AlertCircle size={20} color="#B45309" />
                                                <Text style={[styles.label, { color: "#92400E" }]}>
                                                    {t(
                                                        "orders.pending_approvals_title",
                                                        "Acción requerida: aprobaciones pendientes",
                                                    )}
                                                </Text>
                                            </View>
                                            {approvals.map((approval: any) => (
                                                <View key={approval.id} style={styles.actionItem}>
                                                    <Text style={styles.approvalTitle}>
                                                        {approval.title}
                                                    </Text>
                                                    <Text style={styles.approvalDesc}>
                                                        {approval.description}
                                                    </Text>
                                                    <View style={styles.approvalActions}>
                                                        <Button
                                                            title={t("orders.approve", "Aprobar")}
                                                            onPress={() =>
                                                                handleApproval(
                                                                    approval.id,
                                                                    "APPROVED",
                                                                )
                                                            }
                                                            loading={respondingId === approval.id}
                                                            style={styles.actionBtn}
                                                        />
                                                        <Button
                                                            title={t("orders.reject", "Rechazar")}
                                                            variant="outline"
                                                            onPress={() =>
                                                                handleApproval(
                                                                    approval.id,
                                                                    "REJECTED",
                                                                )
                                                            }
                                                            loading={respondingId === approval.id}
                                                            style={styles.actionBtn}
                                                        />
                                                    </View>
                                                </View>
                                            ))}
                                        </Card>
                                    )}
                                </>
                            );
                        })()}

                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Clock size={20} color="#64748B" />
                                <Text style={styles.label}>
                                    {t("order.timeline", "Historial de Actualizaciones")}
                                </Text>
                            </View>
                            <View style={styles.timeline}>
                                {order.timeline?.length > 0 ? (
                                    order.timeline.map((t: any, idx: number) => (
                                        <View key={t.id} style={styles.timelineItem}>
                                            <View style={styles.timelinePoint} />
                                            {idx < order.timeline.length - 1 && (
                                                <View style={styles.timelineLine} />
                                            )}
                                            <View style={styles.timelineContent}>
                                                <Text style={styles.timelineTitle}>{t.title}</Text>
                                                <Text style={styles.timelineDesc}>{t.description}</Text>
                                                <Text style={styles.timelineDate}>
                                                    {new Date(t.createdAt).toLocaleString()}
                                                </Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noData}>
                                        {t("order.no_updates", "No hay actualizaciones aún.")}
                                    </Text>
                                )}
                            </View>
                        </Card>

                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <FileText size={20} color="#64748B" />
                                <Text style={styles.label}>
                                    {t("order.submission_details", "Resumen de Datos Enviados")}
                                </Text>
                            </View>
                            {/* Render Latest Tax Summary if it exists */}
                            {(() => {
                                const latestTaxStep = [...(order.progress || [])]
                                    .filter(
                                        (s: any) =>
                                            s.data?.formData &&
                                            (s.data.formData.taxYear || s.data.formData.filingStatus),
                                    )
                                    .sort(
                                        (a: any, b: any) =>
                                            new Date(b.completedAt).getTime() -
                                            new Date(a.completedAt).getTime(),
                                    )[0];

                                if (!latestTaxStep) return null;

                                const taxData = latestTaxStep.data.formData;
                                const docMappings = latestTaxStep.data?.docData || {};
                                const renderContextualDoc = (labelOrProp: string) => {
                                    const wizardLabel =
                                        WIZARD_LABEL_MAP[labelOrProp] || labelOrProp;
                                    const key = wizardLabel
                                        .replace(/\s*\/\s*/g, "_")
                                        .replace(/\s+/g, "_");
                                    const docInfo =
                                        docMappings[key] ||
                                        docMappings[wizardLabel] ||
                                        docMappings[labelOrProp];
                                    if (!docInfo?.id) return null;

                                    // Find the actual document from order.documents
                                    const actualDoc = order.documents?.find(
                                        (d: any) => d.id === docInfo.id,
                                    );

                                    if (!actualDoc) {
                                        // Fallback: show simple link if document not found in order
                                        return (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    window.open(
                                                        `/documents/${docInfo.id}/content`,
                                                        "_blank",
                                                    )
                                                }
                                                style={styles.inlineDocLink}
                                            >
                                                <ExternalLink size={12} color="#2563EB" />
                                                <Text style={styles.inlineDocLinkText}>Ver Doc</Text>
                                            </TouchableOpacity>
                                        );
                                    }

                                    // Use DocumentCard for professional display with preview always enabled
                                    return (
                                        <View style={styles.contextualDocCard}>
                                            <DocumentCard
                                                document={{
                                                    id: actualDoc.id,
                                                    title:
                                                        actualDoc.title || docInfo.fileName || "Documento",
                                                    type: actualDoc.type || "OTHER",
                                                    size: actualDoc.size,
                                                    mimeType: actualDoc.mimeType,
                                                    uploadedAt: actualDoc.uploadedAt || new Date(),
                                                    url: actualDoc.url,
                                                }}
                                                showActions={true}
                                                variant="compact"
                                            />
                                        </View>
                                    );
                                };

                                const idDocs =
                                    order.documents?.filter((d: any) =>
                                        ["ID_FRONT", "ID_BACK", "PASSPORT", "SSN_CARD"].includes(
                                            d.type?.toUpperCase(),
                                        ),
                                    ) || [];

                                return (
                                    <View style={styles.taxDataSection}>
                                        <>
                                            {/* 1. Identity & Status */}
                                            <View style={styles.taxSectionGroup}>
                                                <View style={styles.taxHeader}>
                                                    <Text style={styles.taxTitle}>
                                                        Resumen de Declaración - Año {taxData.taxYear}
                                                    </Text>
                                                    <Badge
                                                        label={taxData.filingStatus}
                                                        variant="primary"
                                                    />
                                                </View>

                                                {idDocs.length > 0 && (
                                                    <View
                                                        style={[
                                                            styles.taxSectionGroup,
                                                            { borderBottomWidth: 0, marginBottom: 12 },
                                                        ]}
                                                    >
                                                        <View
                                                            style={{
                                                                flexDirection: "row",
                                                                alignItems: "center",
                                                                gap: 8,
                                                                marginBottom: 12,
                                                            }}
                                                        >
                                                            <ShieldCheck size={18} color="#059669" />
                                                            <Text style={styles.subSectionTitle}>
                                                                Identificación y Verificación
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={{
                                                                flexDirection: "row",
                                                                gap: 12,
                                                                flexWrap: "wrap",
                                                            }}
                                                        >
                                                            {idDocs.map((doc: any, di: number) => (
                                                                <TouchableOpacity
                                                                    key={di}
                                                                    onPress={() =>
                                                                        window.open(
                                                                            doc.url || `/documents/${doc.id}/content`,
                                                                            "_blank",
                                                                        )
                                                                    }
                                                                    style={styles.idDocBadge}
                                                                >
                                                                    <FileText size={14} color="#059669" />
                                                                    <Text style={styles.idDocText}>
                                                                        {doc.type?.replace("_", " ") || doc.title}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                    </View>
                                                )}

                                                <View style={styles.infoGrid}>
                                                    <View style={styles.infoRow}>
                                                        <Text style={styles.infoLabel}>Nombre Fiscal:</Text>
                                                        <Text style={styles.infoValue}>
                                                            {taxData.taxpayerName ||
                                                                taxData.w2Uploads?.[0]?.detected
                                                                    ?.taxpayerName ||
                                                                "N/A"}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.infoRow}>
                                                        <Text style={styles.infoLabel}>
                                                            SSN Identificado:
                                                        </Text>
                                                        <Text style={styles.infoValue}>
                                                            {taxData.taxpayerSsnMasked ||
                                                                taxData.w2Uploads?.[0]?.detected
                                                                    ?.taxpayerSsnMasked ||
                                                                "N/A"}
                                                        </Text>
                                                    </View>
                                                    {taxData.spouseInfo &&
                                                        (taxData.filingWithSpouse === "yes" ||
                                                            taxData.filingStatus ===
                                                            "Married Filing Jointly") && (
                                                            <>
                                                                <View style={styles.infoRow}>
                                                                    <Text style={styles.infoLabel}>Cónyuge:</Text>
                                                                    <Text style={styles.infoValue}>
                                                                        {taxData.spouseInfo.firstName}{" "}
                                                                        {taxData.spouseInfo.middleName
                                                                            ? `${taxData.spouseInfo.middleName} `
                                                                            : ""}
                                                                        {taxData.spouseInfo.lastName}
                                                                    </Text>
                                                                </View>
                                                                <View style={styles.infoRow}>
                                                                    <Text style={styles.infoLabel}>
                                                                        SSN Cónyuge:
                                                                    </Text>
                                                                    <Text style={styles.infoValue}>
                                                                        {taxData.spouseInfo.ssn || "N/A"}
                                                                    </Text>
                                                                </View>
                                                                <View style={styles.infoRow}>
                                                                    <Text style={styles.infoLabel}>
                                                                        F. Nacimiento Cónyuge:
                                                                    </Text>
                                                                    <Text style={styles.infoValue}>
                                                                        {taxData.spouseInfo.dateOfBirth || "N/A"}
                                                                    </Text>
                                                                </View>
                                                            </>
                                                        )}
                                                    <View style={styles.infoRow}>
                                                        <Text style={styles.infoLabel}>
                                                            Cabeza de Familia (HOH):
                                                        </Text>
                                                        <Text style={styles.infoValue}>
                                                            {taxData.headOfHousehold ? "Sí" : "No"}
                                                        </Text>
                                                    </View>
                                                    {taxData.headOfHousehold && (
                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>
                                                                Pagó {">"}50% Gastos Hogar:
                                                            </Text>
                                                            <Text style={styles.infoValue}>
                                                                {taxData.paidOver50PercentHousehold
                                                                    ? "Sí"
                                                                    : "No"}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <View style={styles.infoRow}>
                                                        <Text style={styles.infoLabel}>
                                                            Claimable as Dependent:
                                                        </Text>
                                                        <Text style={styles.infoValue}>
                                                            {taxData.claimableAsDependent || "No"}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* 2. Mailing Address */}
                                            {taxData.mailingAddress && (
                                                <View style={styles.taxSectionGroup}>
                                                    <Text style={styles.subSectionTitle}>
                                                        Dirección de Correo
                                                    </Text>
                                                    <View style={styles.infoBox}>
                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>Calle:</Text>
                                                            <Text style={styles.infoValue}>
                                                                {taxData.mailingAddress.street || "N/A"}
                                                            </Text>
                                                        </View>
                                                        {taxData.mailingAddress.apartment && (
                                                            <View style={styles.infoRow}>
                                                                <Text style={styles.infoLabel}>
                                                                    Apartamento/Unidad:
                                                                </Text>
                                                                <Text style={styles.infoValue}>
                                                                    {taxData.mailingAddress.apartment}
                                                                </Text>
                                                            </View>
                                                        )}
                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>Ciudad:</Text>
                                                            <Text style={styles.infoValue}>
                                                                {taxData.mailingAddress.city || "N/A"}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>Estado:</Text>
                                                            <Text style={styles.infoValue}>
                                                                {taxData.mailingAddress.state || "N/A"}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>
                                                                Código Postal:
                                                            </Text>
                                                            <Text style={styles.infoValue}>
                                                                {taxData.mailingAddress.zipCode || "N/A"}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}

                                            {/* 3. W-2 Forms */}
                                            {taxData.w2Uploads && taxData.w2Uploads.length > 0 && (
                                                <View style={styles.taxSectionGroup}>
                                                    <Text style={styles.subSectionTitle}>
                                                        Formularios W-2 ({taxData.w2Uploads.length})
                                                    </Text>
                                                    {taxData.w2Uploads.map((w2: any, wIdx: number) => {
                                                        const d = w2.detected;

                                                        // Estrategia mejorada de búsqueda de documento vinculado
                                                        let matchingDoc = null;

                                                        // 1. Buscar por ID directo
                                                        if (w2.id) {
                                                            matchingDoc = order.documents?.find(
                                                                (doc: any) => doc.id === w2.id,
                                                            );
                                                        }

                                                        // 2. Buscar por fileName (exacto o parcial)
                                                        if (!matchingDoc && w2.fileName) {
                                                            const fileNameClean = w2.fileName
                                                                .replace(/\.(pdf|jpg|jpeg|png)$/i, "")
                                                                .replace(/\.enc$/i, "");
                                                            matchingDoc = order.documents?.find(
                                                                (doc: any) => {
                                                                    const docFileName =
                                                                        doc.fileName || doc.title || "";
                                                                    const docTitle = doc.title || "";
                                                                    const docFileNameClean = docFileName
                                                                        .replace(/\.(pdf|jpg|jpeg|png)$/i, "")
                                                                        .replace(/\.enc$/i, "");
                                                                    const docTitleClean = docTitle
                                                                        .replace(/\.(pdf|jpg|jpeg|png)$/i, "")
                                                                        .replace(/\.enc$/i, "");

                                                                    return (
                                                                        docFileName === w2.fileName ||
                                                                        docTitle === w2.fileName ||
                                                                        docFileNameClean === fileNameClean ||
                                                                        docTitleClean === fileNameClean ||
                                                                        docFileName.includes(w2.fileName) ||
                                                                        docTitle.includes(w2.fileName)
                                                                    );
                                                                },
                                                            );
                                                        }

                                                        // 3. Buscar por tipo W2 y fecha similar (última opción)
                                                        if (!matchingDoc && order.documents) {
                                                            const w2Docs = order.documents.filter(
                                                                (doc: any) => {
                                                                    const docType = (
                                                                        doc.type || ""
                                                                    ).toUpperCase();
                                                                    return (
                                                                        docType === "W2" ||
                                                                        docType === "W-2" ||
                                                                        doc.title?.toUpperCase().includes("W-2") ||
                                                                        doc.title?.toUpperCase().includes("W2")
                                                                    );
                                                                },
                                                            );

                                                            if (w2Docs.length === 1 && wIdx === 0) {
                                                                matchingDoc = w2Docs[0];
                                                            } else if (
                                                                w2Docs.length > 0 &&
                                                                wIdx < w2Docs.length
                                                            ) {
                                                                matchingDoc = w2Docs[wIdx];
                                                            }
                                                        }

                                                        if (!d) return null;
                                                        return (
                                                            <View key={wIdx} style={styles.w2CardExpanded}>
                                                                <View style={styles.w2CardHeader}>
                                                                    <View style={styles.w2CardHeaderLeft}>
                                                                        <Text style={styles.w2Employer}>
                                                                            {d.employerName ||
                                                                                d.employer ||
                                                                                "Empleador"}
                                                                        </Text>
                                                                        <Text style={styles.w2Ein}>
                                                                            EIN: {d.employerEin || "N/A"}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={styles.w2CardHeaderRight}>
                                                                        {matchingDoc ? (
                                                                            <TouchableOpacity
                                                                                onPress={() =>
                                                                                    window.open(
                                                                                        matchingDoc.url ||
                                                                                        `/documents/${matchingDoc.id}/content`,
                                                                                        "_blank",
                                                                                    )
                                                                                }
                                                                                style={styles.docLinkSml}
                                                                            >
                                                                                <FileText size={14} color="#2563EB" />
                                                                                <Text style={styles.docLinkTextSml}>
                                                                                    Ver Original
                                                                                </Text>
                                                                            </TouchableOpacity>
                                                                        ) : (
                                                                            <View style={styles.w2DocNotLinked}>
                                                                                <View
                                                                                    style={styles.w2DocNotLinkedContent}
                                                                                >
                                                                                    <AlertCircle
                                                                                        size={16}
                                                                                        color="#F59E0B"
                                                                                    />
                                                                                    <View
                                                                                        style={styles.w2DocNotLinkedText}
                                                                                    >
                                                                                        <Text
                                                                                            style={styles.w2DocNotLinkedTitle}
                                                                                        >
                                                                                            Documento no vinculado
                                                                                        </Text>
                                                                                        <Text
                                                                                            style={
                                                                                                styles.w2DocNotLinkedSubtitle
                                                                                            }
                                                                                        >
                                                                                            Buscar en la lista de documentos
                                                                                        </Text>
                                                                                    </View>
                                                                                </View>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                </View>

                                                                <View style={styles.w2Grid}>
                                                                    <View style={styles.w2Item}>
                                                                        <Text style={styles.w2Label}>
                                                                            Salarios (Box 1):
                                                                        </Text>
                                                                        <Text style={styles.w2ValueLarge}>
                                                                            ${d.wages?.toLocaleString() || "0.00"}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={styles.w2Item}>
                                                                        <Text style={styles.w2Label}>
                                                                            Fed Withheld (Box 2):
                                                                        </Text>
                                                                        <Text style={styles.w2ValueLarge}>
                                                                            $
                                                                            {d.federalWithholding?.toLocaleString() ||
                                                                                "0.00"}
                                                                        </Text>
                                                                    </View>
                                                                </View>

                                                                <View
                                                                    style={[styles.w2Grid, { marginTop: 12 }]}
                                                                >
                                                                    <View style={styles.w2Item}>
                                                                        <Text style={styles.w2Label}>
                                                                            SS Wages (Box 3):
                                                                        </Text>
                                                                        <Text style={styles.w2Value}>
                                                                            $
                                                                            {d.socialSecurityWages?.toLocaleString() ||
                                                                                "0.00"}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={styles.w2Item}>
                                                                        <Text style={styles.w2Label}>
                                                                            SS Tax (Box 4):
                                                                        </Text>
                                                                        <Text style={styles.w2Value}>
                                                                            $
                                                                            {d.socialSecurityWithheld?.toLocaleString() ||
                                                                                "0.00"}
                                                                        </Text>
                                                                    </View>
                                                                </View>

                                                                <View
                                                                    style={[styles.w2Grid, { marginTop: 12 }]}
                                                                >
                                                                    <View style={styles.w2Item}>
                                                                        <Text style={styles.w2Label}>
                                                                            Med Wages (Box 5):
                                                                        </Text>
                                                                        <Text style={styles.w2Value}>
                                                                            $
                                                                            {d.medicareWages?.toLocaleString() ||
                                                                                "0.00"}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={styles.w2Item}>
                                                                        <Text style={styles.w2Label}>
                                                                            Med Tax (Box 6):
                                                                        </Text>
                                                                        <Text style={styles.w2Value}>
                                                                            $
                                                                            {d.medicareWithheld?.toLocaleString() ||
                                                                                "0.00"}
                                                                        </Text>
                                                                    </View>
                                                                </View>

                                                                {(d.box12Codes?.length > 0 ||
                                                                    d.statutoryEmployee ||
                                                                    d.retirementPlan ||
                                                                    d.thirdPartySickPay) && (
                                                                        <View style={styles.w2Box12}>
                                                                            {d.box12Codes?.length > 0 && (
                                                                                <View style={{ marginBottom: 8 }}>
                                                                                    <Text style={styles.w2SectionLabel}>
                                                                                        Box 12
                                                                                    </Text>
                                                                                    <View
                                                                                        style={{
                                                                                            flexDirection: "row",
                                                                                            gap: 8,
                                                                                            flexWrap: "wrap",
                                                                                        }}
                                                                                    >
                                                                                        {d.box12Codes.map(
                                                                                            (c: any, ci: number) => (
                                                                                                <Text
                                                                                                    key={ci}
                                                                                                    style={styles.badgeTextSmall}
                                                                                                >
                                                                                                    {c.code}: $
                                                                                                    {c.amount?.toLocaleString()}
                                                                                                </Text>
                                                                                            ),
                                                                                        )}
                                                                                    </View>
                                                                                </View>
                                                                            )}
                                                                            <View
                                                                                style={{
                                                                                    flexDirection: "row",
                                                                                    gap: 8,
                                                                                    flexWrap: "wrap",
                                                                                }}
                                                                            >
                                                                                {d.statutoryEmployee && (
                                                                                    <Badge
                                                                                        label="Statutory"
                                                                                        variant="outline"
                                                                                    />
                                                                                )}
                                                                                {d.retirementPlan && (
                                                                                    <Badge
                                                                                        label="Retirement Plan"
                                                                                        variant="outline"
                                                                                    />
                                                                                )}
                                                                                {d.thirdPartySickPay && (
                                                                                    <Badge
                                                                                        label="3rd Party Sick Pay"
                                                                                        variant="outline"
                                                                                    />
                                                                                )}
                                                                            </View>
                                                                        </View>
                                                                    )}

                                                                <View
                                                                    style={[
                                                                        styles.w2Grid,
                                                                        {
                                                                            marginTop: 12,
                                                                            paddingTop: 12,
                                                                            borderTopWidth: 1,
                                                                            borderTopColor: "#F1F5F9",
                                                                        },
                                                                    ]}
                                                                >
                                                                    <View style={styles.w2Item}>
                                                                        <Text style={styles.w2Label}>
                                                                            State Tax (Box 17):
                                                                        </Text>
                                                                        <Text style={styles.w2Value}>
                                                                            $
                                                                            {d.stateWithholding?.toLocaleString() ||
                                                                                "0.00"}{" "}
                                                                            ({d.stateCode || d.state || "N/A"})
                                                                        </Text>
                                                                    </View>
                                                                    {d.localTax > 0 && (
                                                                        <View style={styles.w2Item}>
                                                                            <Text style={styles.w2Label}>
                                                                                Local Tax (Box 19):
                                                                            </Text>
                                                                            <Text style={styles.w2Value}>
                                                                                ${d.localTax?.toLocaleString()} (
                                                                                {d.localityName || "N/A"})
                                                                            </Text>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            )}

                                            {/* 4. Other Income & Deductions */}
                                            {(Object.values(taxData.otherIncome || {}).some(
                                                Boolean,
                                            ) ||
                                                Object.values(taxData.deductions || {}).some(
                                                    Boolean,
                                                )) && (
                                                    <View style={styles.taxSectionGroup}>
                                                        <View style={styles.incomeDeductionsContainer}>
                                                            <View style={styles.incomeDeductionsColumn}>
                                                                <Text style={styles.subSectionTitle}>
                                                                    Otros Ingresos
                                                                </Text>
                                                                {Object.entries(taxData.otherIncome || {})
                                                                    .filter(([_, v]) => v)
                                                                    .map(([k]) => (
                                                                        <View
                                                                            key={k}
                                                                            style={styles.incomeDeductionItem}
                                                                        >
                                                                            <View style={styles.itemHeader}>
                                                                                <Text style={styles.itemBullet}>•</Text>
                                                                                <Text style={styles.itemText}>
                                                                                    {OTHER_MAP[k] || k}
                                                                                </Text>
                                                                            </View>
                                                                            <View style={styles.itemDocument}>
                                                                                {renderContextualDoc(k)}
                                                                            </View>
                                                                        </View>
                                                                    ))}
                                                            </View>
                                                            <View style={styles.incomeDeductionsColumn}>
                                                                <Text style={styles.subSectionTitle}>
                                                                    Deducciones
                                                                </Text>
                                                                {Object.entries(taxData.deductions || {})
                                                                    .filter(([_, v]) => v)
                                                                    .map(([k]) => (
                                                                        <View
                                                                            key={k}
                                                                            style={styles.incomeDeductionItem}
                                                                        >
                                                                            <View style={styles.itemHeader}>
                                                                                <Text style={styles.itemBullet}>•</Text>
                                                                                <Text style={styles.itemText}>
                                                                                    {DED_MAP[k] || k}
                                                                                </Text>
                                                                            </View>
                                                                            <View style={styles.itemDocument}>
                                                                                {renderContextualDoc(k)}
                                                                            </View>
                                                                        </View>
                                                                    ))}
                                                            </View>
                                                        </View>
                                                    </View>
                                                )}

                                            {/* 5. Dependents */}
                                            {taxData.dependents && taxData.dependents.length > 0 && (
                                                <View style={styles.taxSectionGroup}>
                                                    <Text style={styles.subSectionTitle}>
                                                        Dependientes ({taxData.dependents.length})
                                                    </Text>
                                                    <View style={{ gap: 16 }}>
                                                        {taxData.dependents.map(
                                                            (dep: any, dIdx: number) => (
                                                                <View key={dIdx} style={styles.dependentCard}>
                                                                    <View style={styles.dependentHeader}>
                                                                        <Text style={styles.dependentCardTitle}>
                                                                            Dependiente #{dIdx + 1}
                                                                        </Text>
                                                                        <Badge
                                                                            label={dep.relationship || "Dependent"}
                                                                            variant="outline"
                                                                        />
                                                                    </View>

                                                                    {/* Información Personal */}
                                                                    <View style={styles.dependentSection}>
                                                                        <Text style={styles.dependentSectionTitle}>
                                                                            Información Personal
                                                                        </Text>
                                                                        <View style={styles.dependentInfoGrid}>
                                                                            <View style={styles.dependentInfoRow}>
                                                                                <Text style={styles.dependentInfoLabel}>
                                                                                    Primer Nombre:
                                                                                </Text>
                                                                                <Text style={styles.dependentInfoValue}>
                                                                                    {dep.firstName || "N/A"}
                                                                                </Text>
                                                                            </View>
                                                                            {dep.middleName && (
                                                                                <View style={styles.dependentInfoRow}>
                                                                                    <Text
                                                                                        style={styles.dependentInfoLabel}
                                                                                    >
                                                                                        Segundo Nombre:
                                                                                    </Text>
                                                                                    <Text
                                                                                        style={styles.dependentInfoValue}
                                                                                    >
                                                                                        {dep.middleName}
                                                                                    </Text>
                                                                                </View>
                                                                            )}
                                                                            <View style={styles.dependentInfoRow}>
                                                                                <Text style={styles.dependentInfoLabel}>
                                                                                    Apellido:
                                                                                </Text>
                                                                                <Text style={styles.dependentInfoValue}>
                                                                                    {dep.lastName || "N/A"}
                                                                                </Text>
                                                                            </View>
                                                                            <View style={styles.dependentInfoRow}>
                                                                                <Text style={styles.dependentInfoLabel}>
                                                                                    Fecha de Nacimiento:
                                                                                </Text>
                                                                                <Text style={styles.dependentInfoValue}>
                                                                                    {dep.dateOfBirth || "N/A"}
                                                                                </Text>
                                                                            </View>
                                                                            <View style={styles.dependentInfoRow}>
                                                                                <Text style={styles.dependentInfoLabel}>
                                                                                    SSN/ITIN:
                                                                                </Text>
                                                                                <Text style={styles.dependentInfoValue}>
                                                                                    {dep.ssnOrItin ||
                                                                                        (dep.noSsnYet
                                                                                            ? "Pendiente"
                                                                                            : "N/A")}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    </View>

                                                                    {/* Información de Calificación */}
                                                                    <View style={styles.dependentSection}>
                                                                        <Text style={styles.dependentSectionTitle}>
                                                                            Calificación como Dependiente
                                                                        </Text>
                                                                        <View style={styles.dependentInfoGrid}>
                                                                            <View style={styles.dependentInfoRow}>
                                                                                <Text style={styles.dependentInfoLabel}>
                                                                                    Meses Viviendo con Usted:
                                                                                </Text>
                                                                                <Text style={styles.dependentInfoValue}>
                                                                                    {dep.monthsLivedWithYou || 0} meses
                                                                                </Text>
                                                                            </View>
                                                                            <View style={styles.dependentInfoRow}>
                                                                                <Text style={styles.dependentInfoLabel}>
                                                                                    Estudiante de Tiempo Completo:
                                                                                </Text>
                                                                                <Text style={styles.dependentInfoValue}>
                                                                                    {dep.fullTimeStudent ? "Sí" : "No"}
                                                                                </Text>
                                                                            </View>
                                                                            <View style={styles.dependentInfoRow}>
                                                                                <Text style={styles.dependentInfoLabel}>
                                                                                    Discapacidad Permanente:
                                                                                </Text>
                                                                                <Text style={styles.dependentInfoValue}>
                                                                                    {dep.permanentDisability
                                                                                        ? "Sí"
                                                                                        : "No"}
                                                                                </Text>
                                                                            </View>
                                                                            {dep.someoneElseCanClaim && (
                                                                                <View style={styles.dependentInfoRow}>
                                                                                    <Text
                                                                                        style={styles.dependentInfoLabel}
                                                                                    >
                                                                                        Otro Puede Reclamar:
                                                                                    </Text>
                                                                                    <Text
                                                                                        style={styles.dependentInfoValue}
                                                                                    >
                                                                                        {dep.someoneElseCanClaim === "yes"
                                                                                            ? "Sí"
                                                                                            : dep.someoneElseCanClaim === "no"
                                                                                                ? "No"
                                                                                                : "Desconocido"}
                                                                                    </Text>
                                                                                </View>
                                                                            )}
                                                                        </View>
                                                                    </View>

                                                                    {/* Información de Cuidado Infantil */}
                                                                    {dep.childcare && (
                                                                        <View style={styles.dependentSection}>
                                                                            <Text
                                                                                style={styles.dependentSectionTitle}
                                                                            >
                                                                                Cuidado Infantil
                                                                            </Text>
                                                                            <View style={styles.dependentInfoGrid}>
                                                                                {dep.childcareProvider && (
                                                                                    <View style={styles.dependentInfoRow}>
                                                                                        <Text
                                                                                            style={styles.dependentInfoLabel}
                                                                                        >
                                                                                            Proveedor:
                                                                                        </Text>
                                                                                        <Text
                                                                                            style={styles.dependentInfoValue}
                                                                                        >
                                                                                            {dep.childcareProvider}
                                                                                        </Text>
                                                                                    </View>
                                                                                )}
                                                                                {dep.childcareEin && (
                                                                                    <View style={styles.dependentInfoRow}>
                                                                                        <Text
                                                                                            style={styles.dependentInfoLabel}
                                                                                        >
                                                                                            EIN del Proveedor:
                                                                                        </Text>
                                                                                        <Text
                                                                                            style={styles.dependentInfoValue}
                                                                                        >
                                                                                            {dep.childcareEin}
                                                                                        </Text>
                                                                                    </View>
                                                                                )}
                                                                                {dep.childcareAddress && (
                                                                                    <View style={styles.dependentInfoRow}>
                                                                                        <Text
                                                                                            style={styles.dependentInfoLabel}
                                                                                        >
                                                                                            Dirección del Proveedor:
                                                                                        </Text>
                                                                                        <Text
                                                                                            style={styles.dependentInfoValue}
                                                                                        >
                                                                                            {dep.childcareAddress}
                                                                                        </Text>
                                                                                    </View>
                                                                                )}
                                                                                {dep.childcareAmount && (
                                                                                    <View style={styles.dependentInfoRow}>
                                                                                        <Text
                                                                                            style={styles.dependentInfoLabel}
                                                                                        >
                                                                                            Monto Anual:
                                                                                        </Text>
                                                                                        <Text
                                                                                            style={styles.dependentInfoValue}
                                                                                        >
                                                                                            $
                                                                                            {dep.childcareAmount.toLocaleString()}
                                                                                        </Text>
                                                                                    </View>
                                                                                )}
                                                                            </View>
                                                                            {renderContextualDoc(
                                                                                `Childcare provider info for ${dep.firstName} ${dep.lastName}`,
                                                                            )}
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            ),
                                                        )}
                                                    </View>
                                                </View>
                                            )}

                                            {/* 6. Bank Info */}
                                            {taxData.bankInfo && taxData.bankInfo.bankName && (
                                                <View style={styles.taxSectionGroup}>
                                                    <Text style={styles.subSectionTitle}>
                                                        Información Bancaria
                                                    </Text>
                                                    <View style={styles.bankBox}>
                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>Banco:</Text>
                                                            <Text style={styles.infoValue}>
                                                                {taxData.bankInfo.bankName}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>Cuenta:</Text>
                                                            <Text style={styles.infoValue}>
                                                                {taxData.bankInfo.accountType === "checking"
                                                                    ? "Corriente"
                                                                    : "Ahorros"}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>
                                                                Número de Cuenta:
                                                            </Text>
                                                            <Text style={styles.infoValue}>
                                                                ***{taxData.bankInfo.accountNumber?.slice(-4)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}
                                            {/* 7. Verification & Missing Info */}
                                            {(taxData.needsInfo?.length > 0 ||
                                                taxData.missingDocs?.length > 0 ||
                                                taxData.w2CorrectionNote) && (
                                                    <View style={styles.taxSectionGroup}>
                                                        <Text style={styles.subSectionTitle}>
                                                            Observaciones y Pendientes
                                                        </Text>
                                                        {taxData.w2ConfirmCorrect === false && (
                                                            <View
                                                                style={[
                                                                    styles.clientNoteBox,
                                                                    {
                                                                        backgroundColor: "#FFF7ED",
                                                                        borderLeftColor: "#F97316",
                                                                    },
                                                                ]}
                                                            >
                                                                <Text
                                                                    style={[
                                                                        styles.clientNoteLabel,
                                                                        { color: "#9A3412" },
                                                                    ]}
                                                                >
                                                                    W-2 marcado como incorrecto:
                                                                </Text>
                                                                <Text
                                                                    style={[
                                                                        styles.clientNoteText,
                                                                        { color: "#9A3412" },
                                                                    ]}
                                                                >
                                                                    {taxData.w2CorrectionNote ||
                                                                        "Sin nota de corrección."}
                                                                </Text>
                                                            </View>
                                                        )}
                                                        {taxData.needsInfo?.length > 0 && (
                                                            <View style={{ marginTop: 12 }}>
                                                                <Text style={styles.infoLabel}>
                                                                    Información requerida:
                                                                </Text>
                                                                {taxData.needsInfo.map(
                                                                    (n: string, ni: number) => (
                                                                        <Text key={ni} style={styles.itemText}>
                                                                            • {n}
                                                                        </Text>
                                                                    ),
                                                                )}
                                                            </View>
                                                        )}
                                                        {taxData.missingDocs?.length > 0 && (
                                                            <View style={{ marginTop: 12 }}>
                                                                <Text style={styles.infoLabel}>
                                                                    Documentos faltantes:
                                                                </Text>
                                                                {taxData.missingDocs.map(
                                                                    (m: string, mi: number) => (
                                                                        <Text key={mi} style={styles.itemText}>
                                                                            • {m}
                                                                        </Text>
                                                                    ),
                                                                )}
                                                            </View>
                                                        )}
                                                    </View>
                                                )}
                                        </>
                                    </View>
                                );
                            })()}

                            {/* Render Other Progress Steps (Non-Tax or strictly separate steps) */}
                            {order.progress?.length > 0
                                ? order.progress.map((step: any, idx: number) => {
                                    const taxData = step.data?.formData;
                                    const isTax =
                                        taxData && (taxData.taxYear || taxData.filingStatus);

                                    // Skip steps that were already summarized in the professional tax section
                                    if (isTax) return null;

                                    return (
                                        <View key={idx} style={styles.stepSection}>
                                            <Text style={styles.stepTitle}>
                                                Paso {step.stepIndex + 1}
                                            </Text>
                                            <View style={styles.dataGrid}>
                                                {step.data &&
                                                    Object.entries(step.data).map(
                                                        ([key, val]: [string, any]) => {
                                                            const displayVal =
                                                                typeof val === "object"
                                                                    ? JSON.stringify(val)
                                                                    : String(val);
                                                            return (
                                                                <View key={key} style={styles.dataItem}>
                                                                    <Text style={styles.dataKey}>{key}:</Text>
                                                                    <Text style={styles.dataValue}>
                                                                        {displayVal}
                                                                    </Text>
                                                                </View>
                                                            );
                                                        },
                                                    )}
                                            </View>
                                        </View>
                                    );
                                })
                                : !order.progress?.some(
                                    (s: any) => s.data?.formData?.taxYear,
                                ) && (
                                    <Text style={styles.noData}>
                                        Aún no has completado formularios para esta orden.
                                    </Text>
                                )}
                            {/* Professional Documents Section */}
                            {order.documents &&
                                order.documents.length > 0 &&
                                (() => {
                                    const categories = {
                                        identity: [] as any[],
                                        tax: [] as any[],
                                        other: [] as any[],
                                    };

                                    // Filter documents based on search
                                    let filteredDocs = order.documents;

                                    if (documentSearch) {
                                        filteredDocs = filteredDocs.filter(
                                            (doc: any) =>
                                                doc.title
                                                    ?.toLowerCase()
                                                    .includes(documentSearch.toLowerCase()) ||
                                                doc.type
                                                    ?.toLowerCase()
                                                    .includes(documentSearch.toLowerCase()),
                                        );
                                    }

                                    // Categorize filtered documents
                                    filteredDocs.forEach((doc: any) => {
                                        const type = (doc.type || "").toUpperCase();
                                        if (
                                            [
                                                "ID_FRONT",
                                                "ID_BACK",
                                                "SSN_CARD",
                                                "PASSPORT",
                                                "DRIVER_LICENSE",
                                            ].includes(type)
                                        ) {
                                            categories.identity.push(doc);
                                        } else if (
                                            ["W2", "1099", "K1", "TAX_RETURN"].includes(type) ||
                                            doc.title?.includes("W-2") ||
                                            doc.title?.includes("1099")
                                        ) {
                                            categories.tax.push(doc);
                                        } else {
                                            categories.other.push(doc);
                                        }
                                    });

                                    // Apply category filter
                                    let docsToShow = [];
                                    if (documentFilter === "identity")
                                        docsToShow = categories.identity;
                                    else if (documentFilter === "tax")
                                        docsToShow = categories.tax;
                                    else if (documentFilter === "other")
                                        docsToShow = categories.other;
                                    else docsToShow = filteredDocs;

                                    return (
                                        <View style={styles.documentsSection}>
                                            <View style={styles.documentsHeader}>
                                                <View>
                                                    <H4 style={styles.sectionTitle}>
                                                        Documentos de tu Solicitud
                                                    </H4>
                                                    <Text style={styles.sectionSubtitle}>
                                                        {docsToShow.length} de {order.documents.length}{" "}
                                                        documentos
                                                        {documentFilter !== "all" && ` (${documentFilter})`}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Search and Filter Controls */}
                                            <View style={styles.documentsControls}>
                                                <View style={styles.searchContainer}>
                                                    <Search
                                                        size={16}
                                                        color="#64748B"
                                                        style={{ flexShrink: 0 }}
                                                    />
                                                    <TextInput
                                                        style={styles.searchInput}
                                                        placeholder="Buscar documentos..."
                                                        value={documentSearch}
                                                        onChangeText={setDocumentSearch}
                                                        placeholderTextColor="#94A3B8"
                                                    />
                                                </View>
                                                <View style={styles.filterContainer}>
                                                    <Filter
                                                        size={16}
                                                        color="#64748B"
                                                        style={{ flexShrink: 0 }}
                                                    />
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.filterButton,
                                                            documentFilter === "all" &&
                                                            styles.filterButtonActive,
                                                        ]}
                                                        onPress={() => setDocumentFilter("all")}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.filterButtonText,
                                                                documentFilter === "all" &&
                                                                styles.filterButtonTextActive,
                                                            ]}
                                                            numberOfLines={1}
                                                        >
                                                            Todos
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.filterButton,
                                                            documentFilter === "identity" &&
                                                            styles.filterButtonActive,
                                                        ]}
                                                        onPress={() => setDocumentFilter("identity")}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.filterButtonText,
                                                                documentFilter === "identity" &&
                                                                styles.filterButtonTextActive,
                                                            ]}
                                                            numberOfLines={1}
                                                        >
                                                            Identidad ({categories.identity.length})
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.filterButton,
                                                            documentFilter === "tax" &&
                                                            styles.filterButtonActive,
                                                        ]}
                                                        onPress={() => setDocumentFilter("tax")}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.filterButtonText,
                                                                documentFilter === "tax" &&
                                                                styles.filterButtonTextActive,
                                                            ]}
                                                            numberOfLines={1}
                                                        >
                                                            Fiscales ({categories.tax.length})
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.filterButton,
                                                            documentFilter === "other" &&
                                                            styles.filterButtonActive,
                                                        ]}
                                                        onPress={() => setDocumentFilter("other")}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.filterButtonText,
                                                                documentFilter === "other" &&
                                                                styles.filterButtonTextActive,
                                                            ]}
                                                            numberOfLines={1}
                                                        >
                                                            Otros ({categories.other.length})
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* Documents List */}
                                            {docsToShow.length === 0 ? (
                                                <View style={styles.noDocumentsContainer}>
                                                    <FileText size={48} color="#CBD5E1" />
                                                    <Text style={styles.noDocumentsText}>
                                                        {documentSearch
                                                            ? "No se encontraron documentos con esa búsqueda"
                                                            : "No hay documentos en esta categoría"}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View style={styles.documentsList}>
                                                    {docsToShow.map((doc: any) => (
                                                        <DocumentCard
                                                            key={doc.id}
                                                            document={{
                                                                id: doc.id,
                                                                title: doc.title || "Documento sin título",
                                                                type: doc.type || "OTHER",
                                                                size: doc.size,
                                                                mimeType: doc.mimeType,
                                                                uploadedAt: doc.uploadedAt || doc.createdAt,
                                                                url: doc.url,
                                                            }}
                                                            showActions={true}
                                                        />
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    );
                                })()}
                        </Card>
                    </View>

                    <View style={styles.sideColumn}>
                        <Card style={[styles.card, { backgroundColor: "#F8FAFC" }]}>
                            <Text style={styles.label}>
                                {t("order.summary", "Resumen de Orden")}
                            </Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>
                                    {t("order.status", "Estado")}
                                </Text>
                                <Badge label={order.status} variant="primary" />
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>
                                    {t("order.total", "Costo Total")}
                                </Text>
                                <Text style={styles.infoValue}>
                                    ${Number(order.total || 0).toFixed(2)}
                                </Text>
                            </View>
                            {order.status === "DRAFT" && (
                                <>
                                    <Button
                                        title={t("dashboard.resume", "Resume Application")}
                                        variant="primary"
                                        style={{ marginTop: 16 }}
                                        onPress={() =>
                                            navigate(`/services/${order.service.id}/wizard`)
                                        }
                                    />
                                    <Button
                                        title={t("common.delete", "Delete Draft")}
                                        variant="ghost"
                                        style={{ marginTop: 8 }}
                                        textStyle={{ color: "#EF4444" }}
                                        onPress={async () => {
                                            if (
                                                confirm(
                                                    t(
                                                        "dashboard.delete_confirm",
                                                        "Are you sure you want to delete this draft?",
                                                    ),
                                                )
                                            ) {
                                                try {
                                                    await api.deleteOrder(order.id);
                                                    navigate("/dashboard");
                                                } catch (err) {
                                                    console.error("Failed to delete draft", err);
                                                }
                                            }
                                        }}
                                    />
                                </>
                            )}
                        </Card>

                        <Card style={[styles.card, { marginTop: 20 }]}>
                            <View style={styles.cardHeader}>
                                <MessageSquare size={18} color="#64748B" />
                                <Text style={styles.label}>Soporte</Text>
                            </View>
                            <Text style={styles.supportText}>
                                ¿Tienes dudas sobre tu solicitud? Contacta a nuestro equipo de
                                preparadores profesionales.
                            </Text>
                            <Button
                                title="Enviar Mensaje"
                                variant="outline"
                                onPress={() =>
                                    navigate("/dashboard/chat", {
                                        state: {
                                            orderId: order.id,
                                            displayId: order.displayId || order.id,
                                        },
                                    })
                                }
                                style={{ marginTop: 12 }}
                            />
                        </Card>
                    </View>
                </View>
            </ScrollView>

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                visible={!!previewUrl}
                previewUrl={previewUrl}
                mimeType={previewMimeType}
                documentTitle={previewDocumentTitle}
                onClose={closePreview}
                onDownload={async () => {
                    if (previewUrl && previewDocumentTitle) {
                        const link = document.createElement("a");
                        link.href = previewUrl;
                        link.download = previewDocumentTitle;
                        link.click();
                    }
                }}
                onViewExternal={async () => {
                    if (previewUrl) {
                        window.open(previewUrl, "_blank");
                    }
                }}
            />
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    content: {
        padding: 24,
        paddingBottom: 60,
        maxWidth: 1200,
        alignSelf: "center",
        width: "100%",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
    },
    backBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 24,
    },
    backText: { color: "#2563EB", fontWeight: "600" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 32,
    },
    headerSub: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 4,
    },
    orderId: { color: "#64748B", fontFamily: "monospace", fontSize: 13 },
    orderDate: { color: "#64748B", fontSize: 13 },
    dot: { width: 4, height: 4, borderRadius: 0, backgroundColor: "#CBD5E1" },

    stepperCard: {
        padding: 24,
        marginBottom: 24,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    sectionTitle: { marginBottom: 24, color: "#0F172A" },
    stepperContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        position: "relative",
    },
    stepItem: { flex: 1, alignItems: "center", gap: 8, position: "relative" },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 0,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#E2E8F0",
        zIndex: 1,
    },
    stepCircleActive: { backgroundColor: "#FFFFFF", borderColor: "#2563EB" },
    stepCircleCompleted: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
    stepNumber: { fontSize: 13, fontWeight: "700", color: "#64748B" },
    stepTitle: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748B",
        textAlign: "center",
    },
    stepTitleActive: { color: "#2563EB" },
    stepLine: {
        position: "absolute",
        height: 2,
        backgroundColor: "#F1F5F9",
        top: 15,
        left: "60%",
        width: "80%",
        zIndex: 0,
    },
    stepLineCompleted: { backgroundColor: "#2563EB" },
    textWhite: { color: "#FFF" },

    grid: { flexDirection: "row", gap: 24, flexWrap: "wrap" },
    mainColumn: { flex: 2, minWidth: 350, gap: 24 },
    sideColumn: { flex: 1, minWidth: 300, gap: 24 },
    card: {
        padding: 24,
        borderRadius: 0,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
    },
    label: { fontSize: 14, fontWeight: "700", color: "#334155" },

    approvalCard: {
        padding: 24,
        marginBottom: 24,
        backgroundColor: "#FFF1F2",
        borderColor: "#FECDD3",
        borderLeftWidth: 4,
        borderLeftColor: "#E11D48",
    },
    actionCard: {
        padding: 24,
        marginBottom: 24,
        backgroundColor: "#FFFBEB",
        borderColor: "#FDE68A",
        borderLeftWidth: 4,
        borderLeftColor: "#B45309",
    },
    actionHint: {
        marginTop: -8,
        marginBottom: 8,
        fontSize: 13,
        lineHeight: 20,
        color: "#92400E",
        fontWeight: "400",
    },
    approvalItem: {
        marginTop: 16,
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#FECDD3",
    },
    actionItem: {
        marginTop: 16,
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#FDE68A",
    },
    approvalTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 4,
    },
    approvalDesc: { fontSize: 14, color: "#475569", marginBottom: 16 },
    approvalMeta: { fontSize: 12, color: "#64748B", marginTop: 8, marginBottom: 12 },
    approvalActions: { flexDirection: "row", gap: 12 },
    actionBtn: { flex: 1 },
    hiddenFileInput: { display: "none" } as any,

    infoBox: {
        padding: 16,
        backgroundColor: "#F8FAFC",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    infoLabel: { fontSize: 14, color: "#64748B" },
    infoValue: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
    stepSection: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: "#F8FAFC",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    dataGrid: { gap: 8 },
    dataItem: { flexDirection: "row", gap: 8 },
    dataKey: { fontSize: 13, color: "#94A3B8", width: 120 },
    dataValue: { fontSize: 13, color: "#1E293B", fontWeight: "500", flex: 1 },
    noData: { color: "#94A3B8", fontSize: 14, fontStyle: "italic" },
    supportText: { fontSize: 13, color: "#64748B", lineHeight: 20 },

    timeline: { paddingLeft: 8, marginTop: 10 },
    timelineItem: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 24,
        minHeight: 60,
    },
    timelinePoint: {
        width: 12,
        height: 12,
        borderRadius: 0,
        backgroundColor: "#3B82F6",
        marginTop: 4,
        zIndex: 1,
    },
    timelineLine: {
        position: "absolute",
        left: 5,
        top: 16,
        width: 2,
        height: "100%",
        backgroundColor: "#E2E8F0",
    },
    timelineContent: { flex: 1 },
    timelineTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
    timelineDesc: { fontSize: 14, color: "#64748B", marginTop: 4 },
    timelineDate: { fontSize: 12, color: "#94A3B8", marginTop: 6 },

    // Tax Data Styles
    taxDataSection: {
        marginTop: 16,
        padding: 20,
        backgroundColor: "#F8FAFC",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    taxHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: "#2563EB",
    },
    taxTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
    dataSubSection: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#475569",
        marginBottom: 12,
    },

    addressBox: {
        padding: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 0,
        borderLeftWidth: 3,
        borderLeftColor: "#2563EB",
    },
    addressText: { fontSize: 14, color: "#1E293B", lineHeight: 22 },

    infoGrid: { gap: 8 },
    bankBox: {
        padding: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        gap: 8,
    },

    w2Card: {
        padding: 16,
        marginBottom: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#D1D5DB",
    },
    w2Employer: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 12,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        letterSpacing: -0.3,
        lineHeight: 22,
    },
    w2Grid: { gap: 12 },
    w2Item: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    w2Label: { fontSize: 13, color: "#64748B" },
    w2Value: { fontSize: 14, fontWeight: "600", color: "#0F172A" },

    docLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    docLinkText: { fontSize: 13, fontWeight: "600", color: "#2563EB" },

    dependentCard: {
        padding: 20,
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    dependentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: "#E2E8F0",
    },
    dependentCardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    dependentSection: {
        marginBottom: 20,
    },
    dependentSectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 12,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        letterSpacing: 0.3,
    },
    dependentInfoGrid: {
        gap: 12,
    },
    dependentInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    dependentInfoLabel: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
        width: "45%",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    dependentInfoValue: {
        fontSize: 13,
        color: "#0F172A",
        fontWeight: "600",
        flex: 1,
        textAlign: "right",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    dependentName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 8,
    },

    // Organized Docs Styles
    allDocsSection: {
        marginTop: 32,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        paddingTop: 24,
    },
    allDocsSectionTitle: { marginBottom: 20, color: "#0F172A" },
    docGroup: { marginBottom: 24 },
    docGroupHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    docGroupTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    docListItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 8,
    },
    docListInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    docListDetails: { flex: 1 },
    docListTitle: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
    docListMeta: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
    viewLink: { fontSize: 13, fontWeight: "700", color: "#2563EB" },

    // Additional Tax Section Styles
    taxSectionGroup: {
        marginBottom: 32,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    w2CardExpanded: {
        padding: 16,
        backgroundColor: "#FFF",
        borderWidth: 2,
        borderColor: "#2563EB",
        borderRadius: 0,
        marginBottom: 16,
        width: "100%",
    },
    w2CardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    w2CardHeaderLeft: {
        flex: 1,
        minWidth: 250,
    },
    w2CardHeaderRight: {
        flex: 1,
        minWidth: 250,
        alignItems: "flex-end",
    },
    w2DocNotLinked: {
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        borderRadius: 0,
        padding: 12,
        width: "100%",
        maxWidth: 400,
    },
    w2DocNotLinkedContent: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    w2DocNotLinkedText: {
        flex: 1,
    },
    w2DocNotLinkedTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#92400E",
        marginBottom: 4,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        letterSpacing: -0.1,
        lineHeight: 20,
    },
    w2DocNotLinkedSubtitle: {
        fontSize: 12,
        color: "#A16207",
        lineHeight: 16,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    w2Ein: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
        fontFamily: "monospace",
        letterSpacing: 0.5,
        lineHeight: 16,
    },
    docLinkSml: { flexDirection: "row", alignItems: "center", gap: 6 },
    docLinkTextSml: { fontSize: 12, fontWeight: "600", color: "#2563EB" },
    w2ValueLarge: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
    w2Box12: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    w2SectionLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#64748B",
        marginBottom: 8,
        textTransform: "uppercase",
    },
    badgeTextSmall: {
        fontSize: 10,
        color: "#475569",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 0,
        fontWeight: "500",
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    incomeDeductionItem: {
        marginBottom: 16,
        paddingBottom: 16,
        paddingRight: 0,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        width: "100%",
        alignSelf: "stretch",
    },
    itemHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    itemBullet: { color: "#2563EB", fontWeight: "800", fontSize: 16 },
    itemText: {
        fontSize: 14,
        color: "#1E293B",
        fontWeight: "600",
        flex: 1,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    itemDocument: {
        marginLeft: 24,
        flex: 1,
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
    },
    clientNoteBox: {
        padding: 12,
        marginTop: 12,
        backgroundColor: "#F0F9FF",
        borderLeftWidth: 4,
        borderLeftColor: "#0EA5E9",
    },
    clientNoteLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0369A1",
        marginBottom: 4,
    },
    clientNoteText: { fontSize: 13, color: "#0C4A6E", lineHeight: 18 },

    inlineDocLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginLeft: 8,
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    inlineDocLinkText: { fontSize: 10, fontWeight: "700", color: "#2563EB" },
    incomeDeductionsContainer: {
        flexDirection: "row",
        gap: 24,
        flexWrap: "wrap",
    },
    incomeDeductionsColumn: {
        flex: 1,
        minWidth: 280,
        alignSelf: "stretch",
    },
    contextualDocWrapper: {
        marginTop: 8,
        width: "100%",
    },
    contextualDocCard: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        width: "100%",
        alignSelf: "stretch",
    },

    idDocBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#A7F3D0",
        borderRadius: 0,
    },
    idDocText: { fontSize: 12, fontWeight: "600", color: "#065F46" },

    // Professional Documents Section Styles
    documentsSection: {
        marginTop: 24,
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 0,
        width: "100%",
        maxWidth: "100%",
    },
    documentsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 4,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        lineHeight: 18,
    },
    documentsControls: { marginBottom: 20, gap: 12, width: "100%" },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 0,
        width: "100%",
        minWidth: 0,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#0F172A",
        padding: 0,
        minWidth: 0,
    },
    filterContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        width: "100%",
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 0,
        minWidth: 80,
    },
    filterButtonActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
    filterButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        letterSpacing: 0.3,
    },
    filterButtonTextActive: {
        color: "#FFFFFF",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    documentsList: { gap: 12, width: "100%" },
    noDocumentsContainer: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    noDocumentsText: {
        fontSize: 14,
        color: "#94A3B8",
        textAlign: "center",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        lineHeight: 20,
    },
});
