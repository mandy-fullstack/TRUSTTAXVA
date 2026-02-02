import { useState, useEffect, useMemo } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  useWindowDimensions,
} from "react-native";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { WizardLayout } from "../../components/Wizard/WizardLayout";
import { useAuth } from "../../context/AuthContext";
import { IntakeStep } from "../../components/Wizard/Steps/IntakeStep";
import { DocumentsStep } from "../../components/Wizard/Steps/DocumentsStep";
import { ReviewStep } from "../../components/Wizard/Steps/ReviewStep";
import {
  TaxW2UploadStep,
  TaxW2ConfirmStep,
  TaxW2VerifyStep,
  TaxW2SummaryStep,
  TaxFilingStatusStep,
  TaxDependentsStep,
  TaxOtherIncomeStep,
  TaxDeductionsStep,
  TaxMissingDocsStep,
  TaxReviewStep,
  TaxAddressStep,
  TaxBankStep,
} from "../../components/Wizard/Steps/Tax";
import { Button } from "@trusttax/ui";
import { Shield } from "lucide-react";
import { api } from "../../services/api";
import type { Service } from "../../types";
import type { TaxIntakeData } from "../../types/taxIntake";
import { DEFAULT_TAX_INTAKE } from "../../types/taxIntake";

interface WizardStep {
  id: string;
  title: string;
  type?: string; // Optional because ServiceStep doesn't have it
  w2Index?: number;
  subStep?: "employer_employee" | "federal" | "state_local";
  // ServiceStep properties
  orderIndex?: number;
  description?: string | null;
  formConfig?: any[];
  formId?: string | null;
  form?: any;
}

function getTaxSteps(
  t: (key: string) => string,
  w2Uploads: any[] = [],
): WizardStep[] {
  const steps: WizardStep[] = [
    {
      id: "w2-upload",
      title: t("tax_wizard.w2_upload.title"),
      type: "TAX_W2_UPLOAD",
    },
  ];

  w2Uploads.forEach((w2, index) => {
    if (w2.manualReview) {
      // Step 2: Granular Verify (Only if manualReview is true)
      steps.push({
        id: `w2-${index}-employer`,
        title: `${t("tax_wizard.w2_verify.employer_info")} (${index + 1})`,
        type: "TAX_W2_VERIFY",
        w2Index: index,
        subStep: "employer_employee",
      });
      steps.push({
        id: `w2-${index}-federal`,
        title: `${t("tax_wizard.w2_verify.federal_info")} (${index + 1})`,
        type: "TAX_W2_VERIFY",
        w2Index: index,
        subStep: "federal",
      });
      steps.push({
        id: `w2-${index}-state`,
        title: `${t("tax_wizard.w2_verify.state_info")} (${index + 1})`,
        type: "TAX_W2_VERIFY",
        w2Index: index,
        subStep: "state_local",
      });
    } else {
      // Divide W-2 Summary into 3 granular steps
      steps.push({
        id: `w2-${index}-summary-employer`,
        title: `${t("tax_wizard.w2_summary.employer_employee")} (${index + 1})`,
        type: "TAX_W2_SUMMARY",
        w2Index: index,
        subStep: "employer_employee",
      });
      steps.push({
        id: `w2-${index}-summary-federal`,
        title: `${t("tax_wizard.w2_summary.federal_info")} (${index + 1})`,
        type: "TAX_W2_SUMMARY",
        w2Index: index,
        subStep: "federal",
      });
      steps.push({
        id: `w2-${index}-summary-state`,
        title: `${t("tax_wizard.w2_summary.state_info")} (${index + 1})`,
        type: "TAX_W2_SUMMARY",
        w2Index: index,
        subStep: "state_local",
      });
    }
  });

  steps.push(
    {
      id: "tax-address",
      title: t("tax_wizard.address.title"),
      type: "TAX_ADDRESS",
    },
    {
      id: "filing_status",
      title: t("tax_wizard.filing_status.title"),
      type: "TAX_FILING_STATUS",
    },
    {
      id: "dependents",
      title: t("tax_wizard.filing_status.dependents"),
      type: "TAX_DEPENDENTS",
    },
    {
      id: "other-income",
      title: t("tax_wizard.other_income.title"),
      type: "TAX_OTHER_INCOME",
    },
    {
      id: "deductions",
      title: t("tax_wizard.deductions.title"),
      type: "TAX_DEDUCTIONS",
    },
    { id: "tax-bank", title: t("tax_wizard.bank.title"), type: "TAX_BANK" },
    {
      id: "missing-docs",
      title: t("tax_wizard.missing_docs.title"),
      type: "TAX_MISSING_DOCS",
    },
    { id: "review", title: t("tax_wizard.review.title"), type: "TAX_REVIEW" },
  );

  return steps;
}

function isTaxService(s: Service): boolean {
  return (
    s.category === "TAX" ||
    (s.name ?? "").toLowerCase().includes("personal tax")
  );
}

function getServiceName(s: Service | null): string {
  if (!s) return "";
  return s.name || "";
}

/*
Wizard de Impuestos de Alta Precisión
- ✅ **Subdivisión 100% Granular**: El proceso de subida de W-2 ahora se divide automáticamente en sub-pasos por cada documento (Identidad, Federal, Estatal).
- ✅ **Extracción de IA Corregida**: Se han alineado los nombres de los campos de la IA (EIN, Dirección del Taxpayer) con el frontend para asegurar que se rellenen correctamente.
- ✅ **Responsividad de Grado Superior**: Todos los formularios e inputs ahora se adaptan dinámicamente a cualquier tamaño de pantalla, con un layout de rejilla flexible que se apila en dispositivos móviles.
- ✅ **Diseño "No Corners" (100% Sharp)**: Consistencia total con bordes rectos de 90 grados en cada botón, input y tarjeta, transmitiendo una imagen de solidez y seguridad bancaria.

![Demostración del Wizard Responsivo y sin Esquinas](file:///Users/mandy/.gemini/antigravity/brain/6286daa9-e070-4d74-bf20-8207fc2cf3f6/tax_wizard_responsive_no_corners_1769959627640.webp)
*/
export const WizardPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [docData, setDocData] = useState<any>({});
  const [taxTermsAccepted, setTaxTermsAccepted] = useState(false);
  const [draftOrderId, setDraftOrderId] = useState<string | null>(null);
  const [isCheckingDraft, setIsCheckingDraft] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initial Draft Check
  useEffect(() => {
    const checkDraft = async () => {
      // Only if we have service ID and user is logged in (implicit by useAuth/page protection)
      if (!id || !service) {
        setIsCheckingDraft(false);
        return;
      }

      try {
        const orders = await api.getOrders();
        // Find latest DRAFT order for this service
        const draft = orders.find(
          (o) => o.serviceId === id && o.status === "DRAFT",
        );

        if (draft) {
          setDraftOrderId(draft.id);
          // Always decrypt form data when loading for editing in the wizard
          const fullOrder = await api.getOrderById(draft.id, true); // decryptForReview = true
          const progress = fullOrder.progress;
          if (progress && progress.length > 0) {
            // Filter only progress items with data property
            const progressItems = progress.filter(
              (p: any) => p.data !== undefined,
            );
            if (progressItems.length > 0) {
              // Get latest progress
              const latest = progressItems[progressItems.length - 1];
              if (latest.data) {
                if (latest.data.formData) setFormData(latest.data.formData);
                if (latest.data.docData) setDocData(latest.data.docData);
              }
            }
          }
        }
      } catch (e) {
        console.warn("Failed to check drafts", e);
      } finally {
        setIsCheckingDraft(false);
      }
    };

    if (service) {
      checkDraft();
    }
  }, [service, id]);

  // Autosave Effect
  useEffect(() => {
    const saveDraft = async () => {
      if (!service || !formData || Object.keys(formData).length === 0) return;
      if (isCheckingDraft) return; // Prevent autosave during initialization

      setSaving(true);
      try {
        if (draftOrderId) {
          // Update existing draft
          await api.updateOrder(draftOrderId, { formData, docData });
        } else {
          // Create new draft
          const newOrder = await api.createOrder(
            service.id,
            { formData, docData },
            "DRAFT",
          );
          setDraftOrderId(newOrder.id);
        }
        setLastSaved(new Date());
      } catch (e) {
        console.error("Autosave failed", e);
      } finally {
        setSaving(false);
      }
    };

    // Debounce 2 seconds
    const timeout = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timeout);
  }, [formData, docData, service, draftOrderId]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        if (!id) return;
        const data = await api.getServiceById(id);
        setService(data);
      } catch (e) {
        console.error("Failed to load service", e);
        showAlert({
          title: t("wizard.error_title"),
          message: t("wizard.error_load_service"),
          variant: "error",
          onConfirm: () => navigate("/services"),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id, navigate, showAlert, t]);

  const useTaxFlow = service ? isTaxService(service) : false;

  useEffect(() => {
    if (useTaxFlow && Object.keys(formData).length === 0) {
      setFormData({ ...DEFAULT_TAX_INTAKE });
    }
  }, [useTaxFlow, formData]);

  // Calculate wizard steps - must be before early return
  const wizardSteps = useMemo(() => {
    if (!service) return [];
    const serviceSteps = service.steps || [];
    const hasDocs = service.docTypes && service.docTypes.length > 0;

    return useTaxFlow
      ? getTaxSteps(t, formData.w2Uploads)
      : [
          ...(serviceSteps as WizardStep[]),
          ...((hasDocs
            ? [
                {
                  id: "docs",
                  title: t("wizard.upload_documents"),
                  type: "DOCS",
                },
              ]
            : []) as WizardStep[]),
          {
            id: "review",
            title: t("wizard.review_submit"),
            type: "REVIEW",
          } as WizardStep,
        ];
  }, [service, useTaxFlow, formData.w2Uploads, t]);

  const currentStepDef = wizardSteps[currentStepIndex];
  const isServiceStep =
    !useTaxFlow && service && currentStepIndex < (service.steps?.length || 0);
  const isLastStep =
    wizardSteps.length > 0 && currentStepIndex === wizardSteps.length - 1;
  const isTaxReview = useTaxFlow && currentStepDef?.type === "TAX_REVIEW";

  // Note: Form data is already decrypted when loading the draft initially (line 170)
  // This ensures all form fields are displayed in readable format throughout the entire wizard
  // This useEffect serves as a backup to reload decrypted data if needed when entering review step
  useEffect(() => {
    if (isTaxReview && draftOrderId) {
      const loadDecryptedData = async () => {
        try {
          const order = await api.getOrderById(draftOrderId, true); // decryptForReview = true
          if (order?.progress && order.progress.length > 0) {
            const progressItems = order.progress.filter(
              (p: any) => p.data !== undefined,
            );
            if (progressItems.length > 0) {
              const latestProgress = progressItems[progressItems.length - 1];
              if (latestProgress.data?.formData) {
                setFormData(latestProgress.data.formData);
              }
              if (latestProgress.data?.docData) {
                setDocData(latestProgress.data.docData);
              }
            }
          }
        } catch (error) {
          console.error("Failed to load decrypted data for review", error);
        }
      };
      loadDecryptedData();
    }
  }, [isTaxReview, draftOrderId]);

  const canProceed = useMemo(() => {
    if (!isTaxReview) return true;
    return taxTermsAccepted;
  }, [isTaxReview, taxTermsAccepted]);

  if (loading || !service) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const handleNext = async () => {
    if (isLastStep && !canProceed) return;

    if (useTaxFlow) {
      const currentStep = wizardSteps[currentStepIndex];
      if (currentStep?.type === "TAX_W2_VERIFY") {
        const w2 = (formData as TaxIntakeData).w2Uploads?.[
          currentStep.w2Index!
        ];
        if (w2?.detected) {
          const d = w2.detected;
          if (currentStep.subStep === "employer_employee") {
            // Validate SSN
            if (
              !d.taxpayerSsnMasked ||
              d.taxpayerSsnMasked.includes("X") ||
              d.taxpayerSsnMasked.length < 9
            ) {
              return showAlert({
                title: t("tax_wizard.w2_verify.validation_error"),
                message: t("tax_wizard.w2_verify.ssn_incomplete_msg"),
                variant: "error",
              });
            }
            // Enforce Double Confirmation
            if (d.taxpayerSsnMasked !== d.taxpayerSsnConfirm) {
              return showAlert({
                title: t("tax_wizard.w2_verify.validation_error"),
                message: t("tax_wizard.w2_verify.ssn_mismatch"),
                variant: "error",
              });
            }
            if (!d.employerEin || d.employerEin.length < 9) {
              return showAlert({
                title: t("tax_wizard.w2_verify.validation_error"),
                message: t("tax_wizard.w2_verify.ein_incomplete_msg"),
                variant: "error",
              });
            }
          }
        }
      }
    }

    if (isLastStep) {
      await handleSubmit();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      navigate(`/services/${id}`);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: any = {
        formData,
        docData,
      };
      if (useTaxFlow) {
        const tax = formData as TaxIntakeData;
        const needsInfo: string[] = [...(tax.needsInfo ?? [])];
        (tax.dependents ?? []).forEach((d: any) => {
          if (d.noSsnYet && (d.legalName || d.dateOfBirth)) {
            needsInfo.push(
              t("wizard.dependent_ssn_missing", {
                name: d.legalName || t("tax_wizard.review.unnamed"),
              }),
            );
          }
        });
        payload.formData = { ...tax, needsInfo };
      }

      if (draftOrderId) {
        // If we have a draft, we update it to SUBMITTED
        // IMPORTANTE: Incluir docData para vincular documentos correctamente
        await api.updateOrder(draftOrderId, {
          status: "SUBMITTED",
          formData: payload.formData,
          docData: payload.docData, // Asegurar que docData se pase
        });
      } else {
        await api.createOrder(service.id, payload);
      }

      showAlert({
        title: t("wizard.success_title"),
        message: t("wizard.success_message"),
        variant: "success",
        onConfirm: () => navigate("/dashboard"),
      });
    } catch (err: any) {
      showAlert({
        title: t("wizard.error_title"),
        message: err?.message || t("wizard.error_create_order"),
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateTaxData = (patch: Partial<TaxIntakeData>) => {
    setFormData((prev: TaxIntakeData) => ({ ...prev, ...patch }));
  };

  const handleEditStep = (stepId: string) => {
    const index = wizardSteps.findIndex((s) => s.id === stepId);
    if (index !== -1) {
      setCurrentStepIndex(index);
    }
  };

  const renderStepContent = () => {
    if (useTaxFlow && currentStepDef) {
      const { type, w2Index, subStep } = currentStepDef;
      const taxData = (formData ?? {}) as TaxIntakeData;
      switch (type) {
        case "TAX_W2_UPLOAD":
          return <TaxW2UploadStep data={taxData} onChange={updateTaxData} />;
        case "TAX_W2_SUMMARY":
          return (
            <TaxW2SummaryStep
              data={taxData}
              onChange={updateTaxData}
              w2Index={w2Index!}
              subStep={
                subStep as "employer_employee" | "federal" | "state_local"
              }
              onNext={handleNext}
            />
          );
        case "TAX_W2_VERIFY":
          return (
            <TaxW2VerifyStep
              data={taxData}
              onChange={updateTaxData}
              w2Index={w2Index!}
              subStep={
                subStep as "employer_employee" | "federal" | "state_local"
              }
            />
          );
        case "TAX_W2_CONFIRM":
          return <TaxW2ConfirmStep data={taxData} onChange={updateTaxData} />;
        case "TAX_ADDRESS":
          return <TaxAddressStep data={taxData} onChange={updateTaxData} />;
        case "TAX_FILING_STATUS":
          return (
            <TaxFilingStatusStep data={taxData} onChange={updateTaxData} />
          );
        case "TAX_DEPENDENTS":
          return <TaxDependentsStep data={taxData} onChange={updateTaxData} />;
        case "TAX_OTHER_INCOME":
          return (
            <TaxOtherIncomeStep
              data={taxData}
              onChange={updateTaxData}
              docData={docData ?? {}}
              onDocChange={setDocData}
            />
          );
        case "TAX_DEDUCTIONS":
          return (
            <TaxDeductionsStep
              data={taxData}
              onChange={updateTaxData}
              docData={docData ?? {}}
              onDocChange={setDocData}
            />
          );
        case "TAX_BANK":
          return <TaxBankStep data={taxData} onChange={updateTaxData} />;
        case "TAX_MISSING_DOCS":
          return (
            <TaxMissingDocsStep
              data={taxData}
              docData={docData ?? {}}
              onDocChange={setDocData}
            />
          );
        case "TAX_REVIEW":
          return (
            <TaxReviewStep
              data={taxData}
              docData={docData ?? {}}
              serviceName={getServiceName(service)}
              termsAccepted={taxTermsAccepted}
              onAcceptTerms={setTaxTermsAccepted}
              onEditStep={handleEditStep}
            />
          );
        default:
          return null;
      }
    }

    if (isServiceStep && currentStepDef) {
      return (
        <IntakeStep
          step={currentStepDef as any}
          data={formData}
          onChange={(v) => setFormData((p: any) => ({ ...p, ...v }))}
        />
      );
    }

    if (currentStepDef?.type === "DOCS") {
      return (
        <DocumentsStep
          docTypes={service.docTypes || []}
          data={docData}
          onChange={setDocData}
        />
      );
    }

    if (currentStepDef?.type === "REVIEW") {
      return (
        <ReviewStep
          formData={formData}
          docData={docData}
          serviceName={getServiceName(service)}
        />
      );
    }

    return null;
  };

  return (
    <WizardLayout
      title={getServiceName(service)}
      currentStep={currentStepIndex}
      totalSteps={wizardSteps.length}
      steps={wizardSteps.map((s) => ({ id: s.id, title: s.title }))}
    >
      {renderStepContent()}

      <View style={[styles.footer, isMobile && styles.mobileFooter]}>
        {/* Autosave Status Indicator */}
        <View style={{ position: "absolute", top: 10, right: 20 }}>
          <Text style={{ fontSize: 10, color: "#94A3B8" }}>
            {saving
              ? t("wizard.saving")
              : lastSaved
                ? `${t("wizard.saved")} ${lastSaved.toLocaleTimeString()}`
                : ""}
          </Text>
        </View>

        <View
          style={[styles.footerButtons, isMobile && styles.mobileFooterButtons]}
        >
          <Button
            title={t("wizard.back")}
            variant="ghost"
            onPress={handleBack}
            style={[styles.backBtn, isMobile && styles.mobileFullBtn]}
          />

          <Button
            title={
              isLastStep
                ? submitting
                  ? t("wizard.creating_order")
                  : t("wizard.submit_order")
                : t("wizard.next_step")
            }
            variant="primary"
            onPress={handleNext}
            loading={submitting}
            disabled={isLastStep && !canProceed}
            style={[styles.nextBtn, isMobile && styles.mobileFullBtn]}
          />
        </View>

        {isLastStep && (
          <View style={styles.secureBadge}>
            <Shield size={16} color="#64748B" />
            <Text style={styles.secureText}>{t("wizard.secure_note")}</Text>
          </View>
        )}
      </View>
    </WizardLayout>
  );
};

const styles = StyleSheet.create({
  footer: {
    marginTop: 60,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    alignItems: "center",
    gap: 20,
  },
  mobileFooter: {
    marginTop: 40,
    paddingTop: 24,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    width: "100%",
  },
  mobileFooterButtons: {
    flexDirection: "column-reverse",
    gap: 12,
  },
  backBtn: { flex: 1, maxWidth: 180, height: 56 },
  nextBtn: { flex: 1, maxWidth: 280, height: 56 },
  mobileFullBtn: { maxWidth: "100%", flex: 0 },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    opacity: 0.8,
  },
  secureText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
});
