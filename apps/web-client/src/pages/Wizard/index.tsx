import { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useParams, useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/Wizard/WizardLayout';
import { IntakeStep } from '../../components/Wizard/Steps/IntakeStep';
import { DocumentsStep } from '../../components/Wizard/Steps/DocumentsStep';
import { ReviewStep } from '../../components/Wizard/Steps/ReviewStep';
import { Button } from '@trusttax/ui';
import { api } from '../../services/api';
import type { Service } from '../../types';

export const WizardPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Wizard State
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<any>({});
    const [docData, setDocData] = useState<any>({});

    useEffect(() => {
        const fetchService = async () => {
            try {
                if (!id) return;
                const data = await api.getServiceById(id);
                setService(data);
            } catch (err) {
                Alert.alert('Error', 'Failed to load service');
                navigate('/services');
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id, navigate]);

    if (loading || !service) {
        return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color="#2563EB" /></View>;
    }

    // --- Step Logic ---
    // 1. Service defined steps (Intake)
    // 2. Document Step (if docTypes exist)
    // 3. Review Step

    const serviceSteps = service.steps || [];
    const hasDocs = service.docTypes && service.docTypes.length > 0;

    const wizardSteps = [
        ...serviceSteps,
        ...(hasDocs ? [{ id: 'docs', title: 'Upload Documents', type: 'DOCS' }] : []),
        { id: 'review', title: 'Review & Submit', type: 'REVIEW' }
    ];

    const currentStepDef = wizardSteps[currentStepIndex];
    const isServiceStep = currentStepIndex < serviceSteps.length;
    const isLastStep = currentStepIndex === wizardSteps.length - 1;

    // --- Handlers ---

    const handleNext = async () => {
        if (isLastStep) {
            await handleSubmit();
        } else {
            // Validation logic could go here
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        } else {
            navigate(`/services/${id}`);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                formData,
                docData // In real app, we'd only send file IDs or paths
            };

            await api.createOrder(service.id, payload);

            // Success
            Alert.alert('Success', 'Your order has been created!', [
                { text: 'Go to Dashboard', onPress: () => navigate('/dashboard') }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    // --- Renderer ---

    const renderStepContent = () => {
        if (isServiceStep) {
            return (
                <IntakeStep
                    step={currentStepDef as any}
                    data={formData}
                    onChange={setFormData} // Merges into global formData
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
                    serviceName={service.name}
                />
            );
        }

        return null;
    };

    return (
        <WizardLayout
            title={service.name}
            currentStep={currentStepIndex}
            totalSteps={wizardSteps.length}
            steps={wizardSteps.map(s => ({ id: s.id, title: s.title }))}
        >
            {renderStepContent()}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                <Button
                    title="Back"
                    variant="ghost"
                    onPress={handleBack}
                />

                <Button
                    title={isLastStep ? (submitting ? "Creating Order..." : "Submit Order") : "Next Step"}
                    variant="primary"
                    onPress={handleNext}
                    loading={submitting}
                />
            </View>
        </WizardLayout>
    );
};
