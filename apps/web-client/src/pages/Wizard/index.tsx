import { useState, useEffect, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WizardLayout } from '../../components/Wizard/WizardLayout';
import { useAuth } from '../../context/AuthContext';
import { IntakeStep } from '../../components/Wizard/Steps/IntakeStep';
import { DocumentsStep } from '../../components/Wizard/Steps/DocumentsStep';
import { ReviewStep } from '../../components/Wizard/Steps/ReviewStep';
import {
    TaxW2UploadStep,
    TaxW2ConfirmStep,
    TaxFilingStatusDependentsStep,
    TaxOtherIncomeStep,
    TaxDeductionsStep,
    TaxMissingDocsStep,
    TaxReviewStep,
} from '../../components/Wizard/Steps/Tax';
import { Button } from '@trusttax/ui';
import { api } from '../../services/api';
import type { Service } from '../../types';
import type { TaxIntakeData } from '../../types/taxIntake';
import { DEFAULT_TAX_INTAKE } from '../../types/taxIntake';

function getTaxSteps(t: (key: string) => string) {
    return [
        { id: 'w2-upload', title: t('tax_wizard.w2_upload.title'), type: 'TAX_W2_UPLOAD' },
        { id: 'w2-confirm', title: t('tax_wizard.w2_confirm.title'), type: 'TAX_W2_CONFIRM' },
        { id: 'filing-dependents', title: t('tax_wizard.filing_status.title'), type: 'TAX_FILING_DEPENDENTS' },
        { id: 'other-income', title: t('tax_wizard.other_income.title'), type: 'TAX_OTHER_INCOME' },
        { id: 'deductions', title: t('tax_wizard.deductions.title'), type: 'TAX_DEDUCTIONS' },
        { id: 'missing-docs', title: t('tax_wizard.missing_docs.title'), type: 'TAX_MISSING_DOCS' },
        { id: 'review', title: t('tax_wizard.review.title'), type: 'TAX_REVIEW' },
    ];
}

function isTaxService(s: Service): boolean {
    return s.category === 'TAX' || (s.name ?? '').toLowerCase().includes('personal tax');
}

function getServiceName(s: Service | null): string {
    if (!s) return '';
    return s.name || '';
}

export const WizardPage = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showAlert } = useAuth();

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [docData, setDocData] = useState<any>({});
    const [taxTermsAccepted, setTaxTermsAccepted] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            try {
                if (!id) return;
                const data = await api.getServiceById(id);
                setService(data);
            } catch (e) {
                console.error('Failed to load service', e);
                showAlert({
                    title: t('wizard.error_title'),
                    message: t('wizard.error_load_service'),
                    variant: 'error',
                    onConfirm: () => navigate('/services'),
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
            ? getTaxSteps(t)
            : [
                ...serviceSteps,
                ...(hasDocs ? [{ id: 'docs', title: t('wizard.upload_documents'), type: 'DOCS' }] : []),
                { id: 'review', title: t('wizard.review_submit'), type: 'REVIEW' },
            ];
    }, [service, useTaxFlow]);

    const currentStepDef = wizardSteps[currentStepIndex] as { id: string; title: string; type?: string } | undefined;
    const isServiceStep = !useTaxFlow && service && currentStepIndex < (service.steps?.length || 0);
    const isLastStep = wizardSteps.length > 0 && currentStepIndex === wizardSteps.length - 1;
    const isTaxReview = useTaxFlow && currentStepDef && (currentStepDef as any).type === 'TAX_REVIEW';

    const canProceed = useMemo(() => {
        if (!isTaxReview) return true;
        return taxTermsAccepted;
    }, [isTaxReview, taxTermsAccepted]);

    if (loading || !service) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    const handleNext = async () => {
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
                        needsInfo.push(t('wizard.dependent_ssn_missing', { name: d.legalName || t('tax_wizard.review.unnamed') }));
                    }
                });
                payload.formData = { ...tax, needsInfo };
            }

            await api.createOrder(service.id, payload);

            showAlert({
                title: t('wizard.success_title'),
                message: t('wizard.success_message'),
                variant: 'success',
                onConfirm: () => navigate('/dashboard'),
            });
        } catch (err: any) {
            showAlert({
                title: t('wizard.error_title'),
                message: err?.message || t('wizard.error_create_order'),
                variant: 'error',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const updateTaxData = (patch: Partial<TaxIntakeData>) => {
        setFormData((prev: TaxIntakeData) => ({ ...prev, ...patch }));
    };

    const renderStepContent = () => {
        if (useTaxFlow) {
            const type = (currentStepDef as any).type;
            const taxData = (formData ?? {}) as TaxIntakeData;
            switch (type) {
                case 'TAX_W2_UPLOAD':
                    return <TaxW2UploadStep data={taxData} onChange={updateTaxData} />;
                case 'TAX_W2_CONFIRM':
                    return <TaxW2ConfirmStep data={taxData} onChange={updateTaxData} />;
                case 'TAX_FILING_DEPENDENTS':
                    return <TaxFilingStatusDependentsStep data={taxData} onChange={updateTaxData} />;
                case 'TAX_OTHER_INCOME':
                    return <TaxOtherIncomeStep data={taxData} onChange={updateTaxData} />;
                case 'TAX_DEDUCTIONS':
                    return <TaxDeductionsStep data={taxData} onChange={updateTaxData} />;
                case 'TAX_MISSING_DOCS':
                    return (
                        <TaxMissingDocsStep
                            data={taxData}
                            docData={docData ?? {}}
                            onDocChange={setDocData}
                        />
                    );
                case 'TAX_REVIEW':
                    return (
                        <TaxReviewStep
                            data={taxData}
                            docData={docData ?? {}}
                            serviceName={getServiceName(service)}
                            termsAccepted={taxTermsAccepted}
                            onAcceptTerms={setTaxTermsAccepted}
                        />
                    );
                default:
                    return null;
            }
        }

        if (isServiceStep) {
            return (
                <IntakeStep
                    step={currentStepDef as any}
                    data={formData}
                    onChange={(v) => setFormData((p: any) => ({ ...p, ...v }))}
                />
            );
        }

        if ((currentStepDef as any).type === 'DOCS') {
            return (
                <DocumentsStep
                    docTypes={service.docTypes || []}
                    data={docData}
                    onChange={setDocData}
                />
            );
        }

        if ((currentStepDef as any).type === 'REVIEW') {
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

            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginTop: 40,
                    paddingTop: 24,
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    title={t('wizard.back')}
                    variant="ghost"
                    onPress={handleBack}
                    style={{ flex: 0, minWidth: 120 }}
                />

                <Button
                    title={
                        isLastStep
                            ? submitting
                                ? t('wizard.creating_order')
                                : t('wizard.submit_order')
                            : t('wizard.next_step')
                    }
                    variant="primary"
                    onPress={handleNext}
                    loading={submitting}
                    disabled={isLastStep && !canProceed}
                    style={{ flex: 0, minWidth: 160 }}
                />
            </View>
        </WizardLayout>
    );
};
