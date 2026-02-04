import { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Alert,
} from "react-native";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { api } from "../../services/api";
import { H1, Text } from "@trusttax/ui";
import {
    ArrowLeft,
    User,
    FileText,
    Clock,
    Save,
    AlertCircle,
    Download,
    ShieldCheck,
    Search,
    Filter,
} from "lucide-react";
import { DocumentCard } from "../../components/DocumentCard";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { useDocumentViewer } from "../../hooks/useDocumentViewer";

// Custom local components for web-admin consistency
const Card = ({ children, style }: any) => (
    <View style={[styles.card, style]}>{children}</View>
);
const Badge = ({ label, style }: any) => (
    <View style={[styles.badgeBase, style]}>
        <Text style={styles.badgeText}>{label}</Text>
    </View>
);
const Button = ({
    title,
    onPress,
    loading,
    Icon,
    style,
    variant = "primary",
}: any) => (
    <TouchableOpacity
        style={[
            styles.buttonBase,
            variant === "outline" && styles.buttonOutline,
            style,
        ]}
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.7}
    >
        {Icon && (
            <Icon size={18} color={variant === "outline" ? "#0F172A" : "#FFF"} />
        )}
        <Text
            style={[
                styles.buttonText,
                variant === "outline" && styles.buttonTextOutline,
            ]}
        >
            {title}
        </Text>
    </TouchableOpacity>
);

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
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [newUpdate, setNewUpdate] = useState({ title: "", description: "" });
    const [postingUpdate, setPostingUpdate] = useState(false);

    // New Approval State
    const [newApproval, setNewApproval] = useState({
        type: "DOCUMENT",
        title: "",
        description: "",
    });
    const [postingApproval, setPostingApproval] = useState(false);

    // New: Document Request State (sends email to client)
    const [docRequest, setDocRequest] = useState({
        documentName: "",
        message: "",
        docType: "OTHER",
    });
    const [requestingDoc, setRequestingDoc] = useState(false);

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
            const data = await api.getOrderDetails(id);
            setOrder(data);
            setStatus(data.status);
            setNotes(data.notes || "");
        } catch (error) {
            console.error("Failed to fetch order details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!id) return;
        try {
            setUpdating(true);
            await api.updateOrderStatus(id, status, notes);
            await fetchOrder();
        } catch (error) {
            console.error("Failed to update order:", error);
        } finally {
            setUpdating(false);
        }
    };

    const handleAddUpdate = async () => {
        if (!id || !newUpdate.title.trim()) return;
        try {
            setPostingUpdate(true);
            await api.addOrderTimelineEntry(
                id,
                newUpdate.title,
                newUpdate.description,
            );
            setNewUpdate({ title: "", description: "" });
            await fetchOrder();
        } catch (error) {
            console.error("Failed to add update:", error);
        } finally {
            setPostingUpdate(false);
        }
    };

    const handleCreateApproval = async () => {
        if (!id || !newApproval.title.trim()) return;
        try {
            setPostingApproval(true);
            await api.createOrderApproval(id, newApproval);
            setNewApproval({ type: "DOCUMENT", title: "", description: "" });
            await fetchOrder();
            Alert.alert("Éxito", "Solicitud de aprobación enviada al cliente.");
        } catch (error) {
            console.error("Failed to create approval:", error);
        } finally {
            setPostingApproval(false);
        }
    };

    const handleRequestDocument = async () => {
        if (!id || !docRequest.documentName.trim()) return;
        try {
            setRequestingDoc(true);
            await api.requestOrderDocument(id, {
                documentName: docRequest.documentName.trim(),
                message: docRequest.message.trim() || undefined,
                docType: docRequest.docType || "OTHER",
            });
            setDocRequest({ documentName: "", message: "", docType: "OTHER" });
            await fetchOrder();
            Alert.alert("Éxito", "Solicitud de documento enviada al cliente (email + dashboard).");
        } catch (error) {
            console.error("Failed to request document:", error);
            Alert.alert("Error", "No se pudo solicitar el documento. Intenta nuevamente.");
        } finally {
            setRequestingDoc(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            // Lazy-load PDF renderer only when needed (large dependency)
            const [{ pdf }, { TaxReportPDF }] = await Promise.all([
                import("@react-pdf/renderer"),
                import("../../components/TaxReportPDF"),
            ]);

            const blob = await pdf(<TaxReportPDF order={order} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `TrustTax_${order.displayId || order.id}_${new Date().toISOString().split("T")[0]}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating PDF:", error);
            Alert.alert("Error", "No se pudo generar el PDF. Intenta nuevamente.");
        }
    };

    if (loading) {
        return (
            <Layout>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0F172A" />
                </View>
            </Layout>
        );
    }

    if (!order) {
        return (
            <Layout>
                <View style={styles.loadingContainer}>
                    <Text>Order not found.</Text>
                </View>
            </Layout>
        );
    }

    // Filter progress to show only the latest entry per stepIndex (removes autosave clutter)
    const latestProgressMap = (order.progress || []).reduce(
        (acc: any, curr: any) => {
            if (
                !acc[curr.stepIndex] ||
                new Date(curr.completedAt) > new Date(acc[curr.stepIndex].completedAt)
            ) {
                acc[curr.stepIndex] = curr;
            }
            return acc;
        },
        {},
    );
    const sortedProgress = Object.values(latestProgressMap).sort(
        (a: any, b: any) => a.stepIndex - b.stepIndex,
    );

    return (
        <Layout>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
            >
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigate("/orders")}
                >
                    <ArrowLeft size={20} color="#2563EB" />
                    <Text style={styles.backText}>Back to Orders</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <View>
                        <H1>{order.service?.name}</H1>
                        <Text style={styles.orderId}>
                            {order.displayId || `ID: ${order.id}`}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.pdfButton}
                            onPress={handleDownloadPDF}
                        >
                            <Download size={18} color="#FFF" />
                            <Text style={styles.pdfButtonText}>Descargar PDF</Text>
                        </TouchableOpacity>
                        <Badge label={order.status} />
                    </View>
                </View>

                <View style={styles.grid}>
                    <View style={styles.mainColumn}>
                        {/* Approvals Management */}
                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <AlertCircle size={20} color="#64748B" />
                                <Text style={styles.label}>Solicitudes de Aprobación</Text>
                            </View>

                            {order.approvals?.length > 0 ? (
                                <View style={styles.approvalList}>
                                    {order.approvals.map((approval: any) => (
                                        <View key={approval.id} style={styles.approvalItem}>
                                            <View style={styles.approvalHeader}>
                                                <Text style={styles.approvalTitle}>
                                                    {approval.title}
                                                </Text>
                                                <View
                                                    style={[
                                                        styles.statusDot,
                                                        approval.status === "APPROVED"
                                                            ? styles.dotGreen
                                                            : approval.status === "REJECTED"
                                                                ? styles.dotRed
                                                                : styles.dotYellow,
                                                    ]}
                                                />
                                                <Text style={styles.approvalStatusText}>
                                                    {approval.status}
                                                </Text>
                                            </View>
                                            <Text style={styles.approvalDesc}>
                                                {approval.description}
                                            </Text>
                                            {approval.clientNote && (
                                                <View style={styles.clientNoteBox}>
                                                    <Text style={styles.clientNoteLabel}>
                                                        Respuesta del cliente:
                                                    </Text>
                                                    <Text style={styles.clientNoteText}>
                                                        {approval.clientNote}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noData}>
                                    No hay solicitudes de aprobación pendientes.
                                </Text>
                            )}

                            <View style={styles.newUpdateForm}>
                                <Text style={[styles.label, { marginTop: 16 }]}>
                                    Nueva Solicitud de Aprobación
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Título (ej: Revisión de Cotización Final)"
                                    value={newApproval.title}
                                    onChangeText={(t) =>
                                        setNewApproval({ ...newApproval, title: t })
                                    }
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        { height: 60, textAlignVertical: "top" },
                                    ]}
                                    placeholder="Instrucciones para el cliente..."
                                    multiline
                                    value={newApproval.description}
                                    onChangeText={(t) =>
                                        setNewApproval({ ...newApproval, description: t })
                                    }
                                />
                                <Button
                                    title={postingApproval ? "Enviando..." : "Pedir Aprobación"}
                                    onPress={handleCreateApproval}
                                    loading={postingApproval}
                                    style={{ marginTop: 8 }}
                                />
                            </View>

                            <View style={styles.newUpdateForm}>
                                <Text style={[styles.label, { marginTop: 24 }]}>
                                    Solicitar Documento al Cliente (Email + Upload Cifrado)
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder='Nombre del documento (ej: "1098-T", "ID del cónyuge", "License")'
                                    value={docRequest.documentName}
                                    onChangeText={(t) =>
                                        setDocRequest({ ...docRequest, documentName: t })
                                    }
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        { height: 70, textAlignVertical: "top" },
                                    ]}
                                    placeholder="Mensaje / instrucciones para el cliente (opcional)..."
                                    multiline
                                    value={docRequest.message}
                                    onChangeText={(t) =>
                                        setDocRequest({ ...docRequest, message: t })
                                    }
                                />
                                <View style={styles.selectWrap}>
                                    <select
                                        value={docRequest.docType}
                                        onChange={(e) =>
                                            setDocRequest({
                                                ...docRequest,
                                                docType: e.target.value,
                                            })
                                        }
                                        style={styles.select as any}
                                    >
                                        <option value="OTHER">OTHER</option>
                                        <option value="DRIVER_LICENSE">DRIVER_LICENSE</option>
                                        <option value="ID_CARD">ID_CARD</option>
                                        <option value="PASSPORT">PASSPORT</option>
                                        <option value="TAX_FORM">TAX_FORM</option>
                                        <option value="PROOF_OF_INCOME">PROOF_OF_INCOME</option>
                                        <option value="SSN_CARD">SSN_CARD</option>
                                        <option value="W2_FORM">W2_FORM</option>
                                        <option value="PAYSTUB">PAYSTUB</option>
                                        <option value="LEGAL_DOCUMENT">LEGAL_DOCUMENT</option>
                                    </select>
                                </View>
                                <Button
                                    title={requestingDoc ? "Enviando..." : "Solicitar Documento"}
                                    onPress={handleRequestDocument}
                                    loading={requestingDoc}
                                    style={{ marginTop: 8 }}
                                />
                            </View>
                        </Card>

                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <User size={20} color="#64748B" />
                                <Text style={styles.label}>
                                    Información Completa del Contribuyente (Taxpayer)
                                </Text>
                            </View>

                            {/* Basic Info */}
                            <View style={styles.taxpayerSection}>
                                <Text style={styles.taxpayerSectionTitle}>
                                    Datos Personales
                                </Text>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Nombre Completo:</Text>
                                    <Text style={styles.infoValue}>
                                        {order.user?.firstName || ""} {order.user?.middleName || ""}{" "}
                                        {order.user?.lastName || order.user?.name || "Unknown"}
                                    </Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Email:</Text>
                                    <Text style={styles.infoValue}>{order.user?.email}</Text>
                                </View>
                                {order.user?.phone && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Teléfono:</Text>
                                        <Text style={styles.infoValue}>{order.user.phone}</Text>
                                    </View>
                                )}
                                {order.user?.dateOfBirth && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Fecha de Nacimiento:</Text>
                                        <Text style={styles.infoValue}>
                                            {new Date(order.user.dateOfBirth).toLocaleDateString()}
                                        </Text>
                                    </View>
                                )}
                                {order.user?.ssnLast4 && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>SSN (Últimos 4):</Text>
                                        <Text style={styles.infoValue}>
                                            ***-**-{order.user.ssnLast4}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Birth & Location Info */}
                            {(order.user?.countryOfBirth || order.user?.stateOfBirth) && (
                                <View style={styles.taxpayerSection}>
                                    <Text style={styles.taxpayerSectionTitle}>
                                        Información de Nacimiento
                                    </Text>
                                    {order.user?.countryOfBirth && (
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>País de Nacimiento:</Text>
                                            <Text style={styles.infoValue}>
                                                {order.user.countryOfBirth}
                                            </Text>
                                        </View>
                                    )}
                                    {order.user?.stateOfBirth && (
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>
                                                Estado de Nacimiento:
                                            </Text>
                                            <Text style={styles.infoValue}>
                                                {order.user.stateOfBirth}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Employment & Status */}
                            {(order.user?.occupation || order.user?.maritalStatus) && (
                                <View style={styles.taxpayerSection}>
                                    <Text style={styles.taxpayerSectionTitle}>
                                        Estado Civil y Empleo
                                    </Text>
                                    {order.user?.maritalStatus && (
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Estado Civil:</Text>
                                            <Text style={styles.infoValue}>
                                                {order.user.maritalStatus}
                                            </Text>
                                        </View>
                                    )}
                                    {order.user?.occupation && (
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Ocupación:</Text>
                                            <Text style={styles.infoValue}>
                                                {order.user.occupation}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Order Info */}
                            <View style={styles.taxpayerSection}>
                                <Text style={styles.taxpayerSectionTitle}>
                                    Información de la Orden
                                </Text>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Fecha de Orden:</Text>
                                    <Text style={styles.infoValue}>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>ID de Orden:</Text>
                                    <Text style={styles.infoValue}>
                                        {order.orderNumber || order.id}
                                    </Text>
                                </View>
                            </View>
                        </Card>

                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <FileText size={20} color="#64748B" />
                                <Text style={styles.label}>Detalles Enviados</Text>
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

                                    const matchingDoc = order.documents?.find(
                                        (d: any) => d.id === docInfo.id,
                                    );
                                    if (!matchingDoc) return null;

                                    return (
                                        <View style={styles.contextualDocCard}>
                                            <DocumentCard
                                                document={{
                                                    id: matchingDoc.id,
                                                    title:
                                                        matchingDoc.title || docInfo.title || "Documento",
                                                    type: matchingDoc.type || "OTHER",
                                                    size: matchingDoc.size,
                                                    mimeType: matchingDoc.mimeType,
                                                    uploadedAt:
                                                        matchingDoc.uploadedAt || matchingDoc.createdAt,
                                                }}
                                                variant="compact"
                                                showActions={true}
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
                                                    <Badge label={taxData.filingStatus} />
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
                                                                <DocumentCard
                                                                    key={di}
                                                                    document={{
                                                                        id: doc.id,
                                                                        title:
                                                                            doc.title ||
                                                                            doc.type?.replace("_", " ") ||
                                                                            "Documento",
                                                                        type: doc.type || "OTHER",
                                                                        size: doc.size,
                                                                        mimeType: doc.mimeType,
                                                                        uploadedAt: doc.uploadedAt || doc.createdAt,
                                                                    }}
                                                                    variant="compact"
                                                                    showActions={true}
                                                                />
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
                                                                    <Text style={styles.infoLabel}>
                                                                        Primer Nombre:
                                                                    </Text>
                                                                    <Text style={styles.infoValue}>
                                                                        {taxData.spouseInfo.firstName || "N/A"}
                                                                    </Text>
                                                                </View>
                                                                {taxData.spouseInfo.middleName && (
                                                                    <View style={styles.infoRow}>
                                                                        <Text style={styles.infoLabel}>
                                                                            Segundo Nombre:
                                                                        </Text>
                                                                        <Text style={styles.infoValue}>
                                                                            {taxData.spouseInfo.middleName}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                                <View style={styles.infoRow}>
                                                                    <Text style={styles.infoLabel}>
                                                                        Apellido:
                                                                    </Text>
                                                                    <Text style={styles.infoValue}>
                                                                        {taxData.spouseInfo.lastName || "N/A"}
                                                                    </Text>
                                                                </View>
                                                                <View style={styles.infoRow}>
                                                                    <Text style={styles.infoLabel}>
                                                                        SSN/ITIN:
                                                                    </Text>
                                                                    <Text style={styles.infoValue}>
                                                                        {taxData.spouseInfo.ssn || "N/A"}
                                                                    </Text>
                                                                </View>
                                                                <View style={styles.infoRow}>
                                                                    <Text style={styles.infoLabel}>
                                                                        Fecha de Nacimiento:
                                                                    </Text>
                                                                    <Text style={styles.infoValue}>
                                                                        {taxData.spouseInfo.dateOfBirth || "N/A"}
                                                                    </Text>
                                                                </View>
                                                                {taxData.spouseInfo.occupation && (
                                                                    <View style={styles.infoRow}>
                                                                        <Text style={styles.infoLabel}>
                                                                            Ocupación:
                                                                        </Text>
                                                                        <Text style={styles.infoValue}>
                                                                            {taxData.spouseInfo.occupation}
                                                                        </Text>
                                                                    </View>
                                                                )}
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
                                                            Puede ser reclamado como dependiente:
                                                        </Text>
                                                        <Text style={styles.infoValue}>
                                                            {taxData.claimableAsDependent ||
                                                                "No especificado"}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* 2. Mailing Address */}
                                            {taxData.mailingAddress && (
                                                <View style={styles.taxSectionGroup}>
                                                    <Text style={styles.subSectionTitle}>
                                                        Dirección de Correo (Mailing Address)
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
                                                        Formularios W-2 Identificados (
                                                        {taxData.w2Uploads.length})
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
                                                            // Buscar documentos de tipo W2 que no estén ya vinculados a otro W2
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

                                                            // Si solo hay un documento W2 y coincide con el índice, usarlo
                                                            if (w2Docs.length === 1 && wIdx === 0) {
                                                                matchingDoc = w2Docs[0];
                                                            } else if (
                                                                w2Docs.length > 0 &&
                                                                wIdx < w2Docs.length
                                                            ) {
                                                                // Usar el documento en la misma posición
                                                                matchingDoc = w2Docs[wIdx];
                                                            }
                                                        }

                                                        // Log de depuración (solo en desarrollo)
                                                        if (
                                                            !matchingDoc &&
                                                            import.meta.env.MODE === "development"
                                                        ) {
                                                            console.log(
                                                                "[OrderDetail] W-2 sin documento vinculado:",
                                                                {
                                                                    w2Index: wIdx,
                                                                    w2Id: w2.id,
                                                                    w2FileName: w2.fileName,
                                                                    employerName: d?.employerName || d?.employer,
                                                                    availableDocs:
                                                                        order.documents?.map((doc: any) => ({
                                                                            id: doc.id,
                                                                            title: doc.title,
                                                                            type: doc.type,
                                                                            fileName: doc.fileName,
                                                                        })) || [],
                                                                },
                                                            );
                                                        }

                                                        if (!d) return null;
                                                        return (
                                                            <View key={wIdx} style={styles.w2CardExpanded}>
                                                                <View style={styles.w2CardHeader}>
                                                                    <View style={styles.w2CardHeaderLeft}>
                                                                        <Text style={styles.w2Employer}>
                                                                            {d.employerName ||
                                                                                d.employer ||
                                                                                "Empleador Desconocido"}
                                                                        </Text>
                                                                        <Text style={styles.w2Ein}>
                                                                            EIN: {d.employerEin || "No detectado"}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={styles.w2CardHeaderRight}>
                                                                        {matchingDoc ? (
                                                                            <DocumentCard
                                                                                document={{
                                                                                    id: matchingDoc.id,
                                                                                    title:
                                                                                        matchingDoc.title || "W-2 Original",
                                                                                    type: matchingDoc.type || "W2",
                                                                                    size: matchingDoc.size,
                                                                                    mimeType: matchingDoc.mimeType,
                                                                                    uploadedAt:
                                                                                        matchingDoc.uploadedAt ||
                                                                                        matchingDoc.createdAt,
                                                                                }}
                                                                                variant="compact"
                                                                                showActions={true}
                                                                            />
                                                                        ) : (
                                                                            <View style={styles.w2DocNotLinked}>
                                                                                <View
                                                                                    style={styles.w2DocNotLinkedContent}
                                                                                >
                                                                                    <AlertCircle
                                                                                        size={18}
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
                                                                                            {w2.id
                                                                                                ? `ID: ${w2.id}`
                                                                                                : w2.fileName
                                                                                                    ? `Archivo: ${w2.fileName}`
                                                                                                    : "Buscar en la lista de documentos"}
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
                                                                            Retención Federal (Box 2):
                                                                        </Text>
                                                                        <Text style={styles.w2ValueLarge}>
                                                                            $
                                                                            {d.federalWithholding?.toLocaleString() ||
                                                                                "0.00"}
                                                                        </Text>
                                                                    </View>
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
                                                                    <View style={styles.w2Item}>
                                                                        <Text style={styles.w2Label}>
                                                                            Medicare Wages (Box 5):
                                                                        </Text>
                                                                        <Text style={styles.w2Value}>
                                                                            $
                                                                            {d.medicareWages?.toLocaleString() ||
                                                                                "0.00"}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={styles.w2Item}>
                                                                        <Text style={styles.w2Label}>
                                                                            Medicare Tax (Box 6):
                                                                        </Text>
                                                                        <Text style={styles.w2Value}>
                                                                            $
                                                                            {d.medicareWithheld?.toLocaleString() ||
                                                                                "0.00"}
                                                                        </Text>
                                                                    </View>
                                                                </View>

                                                                {/* Box 12 & Flags */}
                                                                <View style={styles.w2Footer}>
                                                                    {d.box12Codes && d.box12Codes.length > 0 && (
                                                                        <View style={{ marginBottom: 12 }}>
                                                                            <Text style={styles.w2SectionLabel}>
                                                                                Box 12 Codes
                                                                            </Text>
                                                                            <View
                                                                                style={{
                                                                                    flexDirection: "row",
                                                                                    gap: 12,
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
                                                                        style={{ flexDirection: "row", gap: 16 }}
                                                                    >
                                                                        {d.statutoryEmployee && (
                                                                            <Badge
                                                                                label="Statutory Employee"
                                                                                style={{ backgroundColor: "#6366F1" }}
                                                                            />
                                                                        )}
                                                                        {d.retirementPlan && (
                                                                            <Badge
                                                                                label="Retirement Plan"
                                                                                style={{ backgroundColor: "#10B981" }}
                                                                            />
                                                                        )}
                                                                        {d.thirdPartySickPay && (
                                                                            <Badge
                                                                                label="3rd Party Sick Pay"
                                                                                style={{ backgroundColor: "#F59E0B" }}
                                                                            />
                                                                        )}
                                                                    </View>
                                                                </View>

                                                                <View
                                                                    style={[styles.w2Grid, { marginTop: 16 }]}
                                                                >
                                                                    <View style={styles.w2Item}>
                                                                        <Text style={styles.w2Label}>
                                                                            Retención Estatal (Box 17):
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
                                                                                Retención Local (Box 19):
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
                                                        <View style={{ flexDirection: "row", gap: 24 }}>
                                                            <View style={{ flex: 1 }}>
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
                                                                {!Object.values(taxData.otherIncome || {}).some(
                                                                    Boolean,
                                                                ) && <Text style={styles.noData}>Ninguno</Text>}
                                                            </View>
                                                            <View style={{ flex: 1 }}>
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
                                                                {!Object.values(taxData.deductions || {}).some(
                                                                    Boolean,
                                                                ) && <Text style={styles.noData}>Ninguna</Text>}
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
                                                                            style={{ backgroundColor: "#64748B" }}
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
                                                        Información Bancaria (Depósito/Débito)
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
                                                            <Text style={styles.infoLabel}>Ruta:</Text>
                                                            <Text style={styles.infoValue}>
                                                                {taxData.bankInfo.routingNumber}
                                                            </Text>
                                                        </View>
                                                        <View style={styles.infoRow}>
                                                            <Text style={styles.infoLabel}>
                                                                Número de Cuenta:
                                                            </Text>
                                                            <Text style={styles.infoValue}>
                                                                {taxData.bankInfo.accountNumber}
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
                                                                    W-2 marcado como incorrecto por el usuario:
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
                            {sortedProgress.length > 0
                                ? sortedProgress.map((step: any, idx: number) => {
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
                                                            // If val is an object, show a summary or specific fields to avoid [object Object]
                                                            const displayVal =
                                                                typeof val === "object"
                                                                    ? JSON.stringify(val, null, 2)
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
                                        Aún no se han enviado formularios.
                                    </Text>
                                )}

                            {/* Organized Documents Section */}
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
                                                    <Text style={styles.subSectionTitle}>
                                                        Documentos Adjuntos
                                                    </Text>
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

                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Clock size={20} color="#64748B" />
                                <Text style={styles.label}>Línea de Tiempo (Cliente)</Text>
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
                                        Aún no hay hitos registrados.
                                    </Text>
                                )}
                            </View>

                            <View style={styles.newUpdateForm}>
                                <Text style={[styles.label, { marginTop: 16 }]}>
                                    Nueva actualización para el cliente
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Título (ej: Documentos recibidos)"
                                    value={newUpdate.title}
                                    onChangeText={(t) => setNewUpdate({ ...newUpdate, title: t })}
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        { height: 80, textAlignVertical: "top" },
                                    ]}
                                    placeholder="Descripción corta..."
                                    multiline
                                    value={newUpdate.description}
                                    onChangeText={(t) =>
                                        setNewUpdate({ ...newUpdate, description: t })
                                    }
                                />
                                <Button
                                    title={postingUpdate ? "Publicando..." : "Añadir Hito"}
                                    onPress={handleAddUpdate}
                                    loading={postingUpdate}
                                    style={{ marginTop: 8 }}
                                />
                            </View>
                        </Card>
                    </View>

                    <View style={styles.sideColumn}>
                        <Card style={[styles.card, { backgroundColor: "#F8FAFC" }]}>
                            <View style={styles.cardHeader}>
                                <Save size={20} color="#64748B" />
                                <Text style={styles.label}>Status Maestro</Text>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Estado Actual</Text>
                                <View style={styles.statusGrid}>
                                    {["SUBMITTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(
                                        (s) => (
                                            <TouchableOpacity
                                                key={s}
                                                style={[
                                                    styles.statusBadge,
                                                    status === s && styles.statusBadgeActive,
                                                ]}
                                                onPress={() => setStatus(s)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.statusBadgeText,
                                                        status === s && styles.statusBadgeTextActive,
                                                    ]}
                                                >
                                                    {s}
                                                </Text>
                                            </TouchableOpacity>
                                        ),
                                    )}
                                </View>
                            </View>

                            <Button
                                title={updating ? "Guardando..." : "Cambiar Estado"}
                                Icon={Save}
                                onPress={handleUpdate}
                                loading={updating}
                                style={styles.fullWidthBtn}
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
    container: { flex: 1, backgroundColor: "#F8FAFC" },
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
        padding: 100,
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
    orderId: { color: "#64748B", marginTop: 4, fontFamily: "monospace" },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
    pdfButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#2563EB",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 0,
    },
    pdfButtonText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
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
    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 8 },
    statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    statusBadge: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
    },
    statusBadgeActive: {
        backgroundColor: "#0F172A",
        borderColor: "#0F172A",
    },
    statusBadgeText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
    statusBadgeTextActive: { color: "#FFFFFF" },
    fullWidthBtn: { width: "100%", marginTop: 8 },

    approvalList: { gap: 12, marginBottom: 20 },
    approvalItem: {
        padding: 16,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    approvalHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    approvalTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A", flex: 1 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    dotYellow: { backgroundColor: "#EAB308" },
    dotGreen: { backgroundColor: "#22C55E" },
    dotRed: { backgroundColor: "#EF4444" },
    approvalStatusText: { fontSize: 11, fontWeight: "700", color: "#64748B" },
    approvalDesc: { fontSize: 13, color: "#475569" },
    clientNoteBox: {
        marginTop: 12,
        padding: 8,
        backgroundColor: "#EFF6FF",
        borderLeftWidth: 3,
        borderLeftColor: "#3B82F6",
    },
    clientNoteLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#1E40AF",
        marginBottom: 2,
    },
    clientNoteText: { fontSize: 12, color: "#1E40AF", fontStyle: "italic" },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
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
    stepTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#475569",
        marginBottom: 12,
    },
    dataGrid: { gap: 8 },
    dataItem: { flexDirection: "row", gap: 8 },
    dataKey: { fontSize: 13, color: "#94A3B8", width: 120 },
    dataValue: { fontSize: 13, color: "#1E293B", fontWeight: "500", flex: 1 },
    noData: { color: "#94A3B8", fontSize: 14, fontStyle: "italic" },
    badgeBase: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#0F172A",
        borderRadius: 0,
    },
    badgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
    buttonBase: {
        padding: 12,
        backgroundColor: "#0F172A",
        borderRadius: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    buttonOutline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#0F172A",
    },
    buttonText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
    buttonTextOutline: { color: "#0F172A" },

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

    newUpdateForm: {
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingTop: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        padding: 12,
        borderRadius: 0,
        backgroundColor: "#F8FAFC",
        marginBottom: 12,
        fontSize: 14,
        color: "#0F172A",
    },
    selectWrap: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 0,
        overflow: "hidden",
        backgroundColor: "#F8FAFC",
        marginBottom: 12,
    },
    select: {
        width: "100%",
        padding: 12,
        borderWidth: 0,
        outline: "none",
        fontSize: 14,
        color: "#0F172A",
        backgroundColor: "transparent",
    } as any,

    // Tax Data Styles
    taxDataSection: { marginTop: 16, marginBottom: 16 },
    taxHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: "#2563EB",
    },
    taxTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
    dataSubSection: { marginBottom: 20 },
    subSectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 12,
    },
    infoBox: {
        padding: 16,
        backgroundColor: "#F8FAFC",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    addressBox: {
        padding: 16,
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#BFDBFE",
        borderRadius: 0,
    },
    addressText: { fontSize: 14, color: "#1E40AF", lineHeight: 22 },
    bankBox: {
        padding: 16,
        backgroundColor: "#F0FDF4",
        borderWidth: 1,
        borderColor: "#BBF7D0",
        borderRadius: 0,
    },
    infoGrid: { gap: 12 },
    w2Card: {
        padding: 16,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 0,
        marginBottom: 12,
    },
    w2Employer: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 4,
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        letterSpacing: -0.3,
        lineHeight: 22,
    },
    w2Ein: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 12,
        fontFamily: "monospace",
        letterSpacing: 0.5,
        lineHeight: 18,
    },
    w2Grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
    w2Item: { flex: 1, minWidth: "45%" },
    w2Label: { fontSize: 13, color: "#64748B", marginBottom: 4 },
    w2Value: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
    docLinkBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#BFDBFE",
        borderRadius: 0,
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
        fontSize: 15,
        fontWeight: "700",
        color: "#92400E",
        marginBottom: 8,
    },

    // All Documents Section
    allDocsSection: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 2,
        borderTopColor: "#E2E8F0",
    },
    allDocsSectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 16,
    },
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
        fontSize: 13,
        fontWeight: "700",
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    docListItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 0,
        marginBottom: 8,
    },
    docListInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    docListDetails: { flex: 1 },
    docListTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
        marginBottom: 2,
    },
    docListMeta: { fontSize: 12, color: "#64748B" },
    docViewBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#2563EB",
        borderRadius: 0,
    },
    docViewBtnText: { fontSize: 13, fontWeight: "600", color: "#FFF" },

    // Taxpayer Section
    taxpayerSection: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    taxpayerSectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#475569",
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    // W-2 Expanded Card Styles
    w2CardExpanded: {
        padding: 20,
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
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 2,
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
    w2Address: { fontSize: 12, color: "#64748B", marginTop: 4 },
    w2ViewDocBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "#2563EB",
        borderRadius: 0,
    },
    w2ViewDocBtnDisabled: { backgroundColor: "#94A3B8" },
    w2ViewDocText: { fontSize: 14, fontWeight: "700", color: "#FFF" },
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
    w2FederalSection: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    w2StateSection: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    w2SectionLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#64748B",
        marginBottom: 12,
        letterSpacing: 1,
    },
    w2ValueLarge: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
    w2Footer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    w2FileName: { fontSize: 12, color: "#94A3B8", fontStyle: "italic" },

    // Additional Styles for Professional Order Detail
    taxSectionGroup: {
        marginBottom: 32,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
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
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
        flexWrap: "wrap",
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
        alignSelf: "stretch",
    },
    contextualDocCard: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        width: "100%",
        alignSelf: "stretch",
    },
    dependentSub: { fontSize: 12, color: "#64748B" },
    badgeTextSmall: {
        fontSize: 11,
        color: "#475569",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontWeight: "500",
    },

    inlineDocLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginLeft: 8,
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    inlineDocLinkText: { fontSize: 10, fontWeight: "700", color: "#2563EB" },

    idDocBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#A7F3D0",
        borderRadius: 4,
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
