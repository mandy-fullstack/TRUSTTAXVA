import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@trusttax/ui';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { TermsModal } from '../../components/TermsModal';
import { socket } from '../../services/socket';
import { WizardLayout } from '../../components/Wizard/WizardLayout';
import { PinGuard } from '../../components/PinGuard';

// Steps
import { StepPersonalDetails } from '../../components/profile/steps/StepPersonalDetails';
import { StepTaxId } from '../../components/profile/steps/StepTaxId';
import { StepLegalDocs } from '../../components/profile/steps/StepLegalDocs';
import { StepReviewTerms } from '../../components/profile/steps/StepReviewTerms';

import type { TaxIdType } from '../../components/profile/ProfileSSNOrITIN';

interface ProfileData {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    countryOfBirth?: string;
    primaryLanguage?: string;
    taxIdType: TaxIdType;
    ssn?: string;
    driverLicenseNumber?: string;
    driverLicenseStateCode?: string;
    driverLicenseStateName?: string;
    driverLicenseExpiration?: string;
    passportNumber?: string;
    passportCountryOfIssue?: string;
    passportExpiration?: string;
    acceptTerms?: boolean;
}

export const ProfilePage = () => {
    const { user, token, refreshUser, showAlert } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    // Wizard State
    const [currentStep, setCurrentStep] = useState(0);
    const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

    const initialSsnRef = useRef<string | null>(null);
    const lastDecryptedLicenseRef = useRef<{ number: string; stateCode: string; stateName: string; expirationDate: string } | null>(null);
    const lastDecryptedPassportRef = useRef<{ number: string; countryOfIssue: string; expirationDate: string } | null>(null);
    const [initialFormData, setInitialFormData] = useState<ProfileData | null>(null);

    const [formData, setFormData] = useState<ProfileData>({
        firstName: user?.firstName || '',
        middleName: user?.middleName || '',
        lastName: user?.lastName || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        countryOfBirth: user?.countryOfBirth || '',
        primaryLanguage: user?.primaryLanguage || i18n.language.split('-')[0] || 'en',
        taxIdType: (user as any)?.taxIdType === 'ITIN' ? 'ITIN' : 'SSN',
        ssn: '',
        driverLicenseNumber: '',
        driverLicenseStateCode: '',
        driverLicenseStateName: '',
        driverLicenseExpiration: '',
        passportNumber: '',
        passportCountryOfIssue: '',
        passportExpiration: '',
        acceptTerms: !!user?.termsAcceptedAt,
    });

    // Define Steps
    const steps = [
        { id: 'personal', title: t('profile.step_personal', 'Legal Identity') },
        { id: 'tax-id', title: t('profile.step_tax_id', 'Tax Identification') },
        { id: 'documents', title: t('profile.step_documents', 'Documents') },
        { id: 'review', title: t('profile.step_review', 'Review & Consent') },
    ];

    useEffect(() => {
        const loadUserData = async () => {
            if (token) {
                try {
                    const userData = await api.getMe() as any;

                    if (!userData?.isProfileComplete) {
                        navigate('/profile/complete');
                        return;
                    }

                    const next: ProfileData = {
                        firstName: (userData?.firstName || '').toString().toUpperCase(),
                        middleName: (userData?.middleName || '').toString().toUpperCase(),
                        lastName: (userData?.lastName || '').toString().toUpperCase(),
                        dateOfBirth: userData?.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
                        countryOfBirth: (userData?.countryOfBirth || '').toString().toUpperCase(),
                        primaryLanguage: userData?.primaryLanguage || i18n.language.split('-')[0] || 'en',
                        taxIdType: userData?.taxIdType === 'ITIN' ? 'ITIN' : 'SSN',
                        ssn: '',
                        driverLicenseNumber: '',
                        driverLicenseStateCode: '',
                        driverLicenseStateName: '',
                        driverLicenseExpiration: '',
                        passportNumber: '',
                        passportCountryOfIssue: '',
                        passportExpiration: '',
                        acceptTerms: !!userData?.termsAcceptedAt,
                    };
                    setFormData(next);
                    setInitialFormData({ ...next });
                    initialSsnRef.current = null;
                    lastDecryptedLicenseRef.current = null;
                    lastDecryptedPassportRef.current = null;

                    // Connect socket and listen for completion
                    if (!socket.connected) {
                        socket.auth = { token };
                        socket.connect();
                    }
                    socket.emit('joinRoom', `user_${userData.id}`);

                    const handleProfileCompleted = () => {
                        refreshUser();
                        navigate('/dashboard');
                    };

                    socket.on('profile_completed', handleProfileCompleted);

                    return () => {
                        socket.off('profile_completed', handleProfileCompleted);
                    };
                } catch (error) {
                    console.error('Failed to load user data:', error);
                }
            }
        };
        loadUserData();
    }, [token, i18n.language, navigate, refreshUser]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const loadDecryptedSSN = async (): Promise<string | null> => {
        try {
            const v = await api.getDecryptedSSN();
            initialSsnRef.current = v;
            return v;
        } catch (error) {
            console.error('Failed to load decrypted SSN:', error);
            return null;
        }
    };

    const loadDecryptedDriverLicense = async (): Promise<any> => {
        try {
            const d = await api.getDecryptedDriverLicense();
            lastDecryptedLicenseRef.current = d;
            return d;
        } catch (error) {
            console.error('Failed to load decrypted driver license:', error);
            return null;
        }
    };

    const loadDecryptedPassport = async (): Promise<any> => {
        try {
            const d = await api.getDecryptedPassport();
            lastDecryptedPassportRef.current = d;
            return d;
        } catch (error) {
            console.error('Failed to load decrypted passport:', error);
            return null;
        }
    };

    const validateStep = (stepIndex: number) => {
        const errors = new Set<string>();

        if (stepIndex === 0) { // Personal
            if (!formData.firstName?.trim()) errors.add('firstName');
            if (!formData.lastName?.trim()) errors.add('lastName');
            if (!formData.dateOfBirth) errors.add('dateOfBirth');
            if (!formData.countryOfBirth) errors.add('countryOfBirth');
            if (!formData.primaryLanguage) errors.add('primaryLanguage');
        } else if (stepIndex === 1) { // Tax ID
            if (!formData.ssn || !/^\d{3}-\d{2}-\d{4}$/.test(formData.ssn)) {
                errors.add('ssn');
            }
        } else if (stepIndex === 3) { // Review
            if (!formData.acceptTerms) errors.add('acceptTerms');
        }

        setValidationErrors(errors);
        return errors.size === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            showAlert({
                title: t('profile.validation_error', 'Validation Error'),
                message: t('profile.check_required', 'Please check all required fields before proceeding.'),
                variant: 'warning'
            });
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) {
            showAlert({
                title: t('profile.validation_error', 'Validation Error'),
                message: t('profile.accept_terms_required', 'You must accept the Terms and Conditions to submit.'),
                variant: 'warning'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const updatePayload: Record<string, unknown> = {};
            const init = initialFormData;

            // Always send basic required fields
            if (formData.firstName) (updatePayload as any).firstName = formData.firstName;
            if (formData.lastName) (updatePayload as any).lastName = formData.lastName;
            if (formData.dateOfBirth) (updatePayload as any).dateOfBirth = formData.dateOfBirth;
            if (formData.countryOfBirth) (updatePayload as any).countryOfBirth = formData.countryOfBirth;
            if (formData.primaryLanguage) (updatePayload as any).primaryLanguage = formData.primaryLanguage;

            // Optional fields only if changed
            const optionalKeys: (keyof ProfileData)[] = ['middleName'];
            for (const k of optionalKeys) {
                const a = String(formData[k] ?? '').trim();
                const b = String(init?.[k] ?? '').trim();
                if (a !== b) {
                    (updatePayload as any)[k] = formData[k];
                }
            }

            if (init && formData.taxIdType !== init.taxIdType) {
                updatePayload.taxIdType = formData.taxIdType;
            }

            if (formData.acceptTerms) {
                updatePayload.acceptTerms = true;
                updatePayload.termsVersion = '1.0';
            }

            // SSN
            const ssnVal = formData.ssn?.trim() ?? '';
            if (ssnVal.length > 0 && /^\d{3}-\d{2}-\d{4}$/.test(formData.ssn!)) {
                const orig = initialSsnRef.current;
                if (orig == null || formData.ssn !== orig) {
                    updatePayload.ssn = formData.ssn;
                }
            }

            // Driver/Passport Logic (Simpler merge)
            // ... [Logic kept same as previous component for brevity of thought trace, implemented in code] ...
            // Reusing the robust logic from previous implementation for license/passport detection

            // ... License ...
            const lastLic = lastDecryptedLicenseRef.current;
            const hasLicData = !!(formData.driverLicenseNumber?.trim() || formData.driverLicenseStateCode?.trim() || (formData.driverLicenseExpiration ?? '').trim());
            if (lastLic || hasLicData) {
                const merged = {
                    number: ((formData.driverLicenseNumber?.trim() || lastLic?.number) ?? '').trim(),
                    stateCode: ((formData.driverLicenseStateCode?.trim() || lastLic?.stateCode) ?? '').trim(),
                    stateName: ((formData.driverLicenseStateName?.trim() || lastLic?.stateName) ?? '').trim(),
                    expirationDate: ((formData.driverLicenseExpiration?.trim() || lastLic?.expirationDate) ?? '').trim(),
                };
                const changed = !lastLic || JSON.stringify(merged) !== JSON.stringify(lastLic);
                if (changed) {
                    updatePayload.driverLicenseNumber = merged.number || undefined;
                    updatePayload.driverLicenseStateCode = merged.stateCode || undefined;
                    updatePayload.driverLicenseStateName = merged.stateName || undefined;
                    updatePayload.driverLicenseExpiration = merged.expirationDate || undefined;
                }
            }

            // ... Passport ...
            const lastPass = lastDecryptedPassportRef.current;
            const hasPassData = !!(formData.passportNumber?.trim() || formData.passportCountryOfIssue?.trim() || (formData.passportExpiration ?? '').trim());
            if (lastPass || hasPassData) {
                const merged = {
                    number: ((formData.passportNumber?.trim() || lastPass?.number) ?? '').trim(),
                    countryOfIssue: ((formData.passportCountryOfIssue?.trim() || lastPass?.countryOfIssue) ?? '').trim(),
                    expirationDate: ((formData.passportExpiration?.trim() || lastPass?.expirationDate) ?? '').trim(),
                };
                const changed = !lastPass || JSON.stringify(merged) !== JSON.stringify(lastPass);
                if (changed) {
                    updatePayload.passportNumber = merged.number || undefined;
                    updatePayload.passportCountryOfIssue = merged.countryOfIssue || undefined;
                    updatePayload.passportExpiration = merged.expirationDate || undefined;
                }
            }

            await api.updateProfile(updatePayload as any);
            await refreshUser();

            showAlert({
                title: t('profile.success', 'Success'),
                message: t('profile.update_success_detail', 'Your profile has been saved. Thank you for completing your legal profile setup.'),
                variant: 'success',
                onConfirm: () => {
                    navigate('/dashboard');
                }
            });

        } catch (error: any) {
            showAlert({
                title: t('profile.error', 'Error'),
                message: error.message || t('profile.update_error', 'Failed to update profile'),
                variant: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <StepPersonalDetails
                        data={formData}
                        onChange={handleInputChange}
                        errors={validationErrors}
                        clearError={(field) => setValidationErrors(prev => { const n = new Set(prev); n.delete(field); return n; })}
                    />
                );
            case 1:
                return (
                    <StepTaxId
                        data={formData}
                        onChange={handleInputChange}
                        errors={validationErrors}
                        clearError={(field) => setValidationErrors(prev => { const n = new Set(prev); n.delete(field); return n; })}
                        onLoadDecryptedSSN={loadDecryptedSSN}
                        user={user}
                    />
                );
            case 2:
                return (
                    <StepLegalDocs
                        data={formData}
                        onChange={handleInputChange}
                        onLoadDecryptedDriverLicense={loadDecryptedDriverLicense}
                        onLoadDecryptedPassport={loadDecryptedPassport}
                        user={user}
                    />
                );
            case 3:
                return (
                    <StepReviewTerms
                        data={formData}
                        onChange={handleInputChange}
                        errors={validationErrors}
                        onShowTerms={() => setShowTermsModal(true)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <WizardLayout
                title={t('profile.legal_profile_setup', 'Legal Profile Setup')}
                currentStep={currentStep}
                totalSteps={steps.length}
                steps={steps}
            >
                {renderStepContent()}

                <View style={[styles.actions, currentStep === 0 && styles.actionsRight]}>
                    {currentStep > 0 && (
                        <Button
                            title={t('common.back', 'Back')}
                            variant="ghost"
                            onPress={handleBack}
                            style={{ flex: 0, minWidth: 120 }}
                        />
                    )}

                    {currentStep < steps.length - 1 ? (
                        <Button
                            title={t('common.next', 'Next')}
                            variant="primary"
                            onPress={handleNext}
                            style={{ flex: 0, minWidth: 160 }}
                        />
                    ) : (
                        <PinGuard onVerify={handleSubmit} title={t('security.pin_required', 'Enter PIN to Submit')} description={t('security.pin_verify_desc', 'Please enter your security PIN to confirm your profile changes.')}>
                            <Button
                                title={t('common.submit', 'Submit Profile')}
                                variant="primary"
                                onPress={() => { }} // PinGuard handles the click
                                loading={isSubmitting}
                                style={{ flex: 0, minWidth: 160 }}
                            />
                        </PinGuard>
                    )}
                </View>
            </WizardLayout>

            <TermsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onAccept={() => {
                    handleInputChange('acceptTerms', true);
                    setShowTermsModal(false);
                }}
            />
        </>
    );
};

const styles = StyleSheet.create({
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 16,
    },
    actionsRight: {
        justifyContent: 'flex-end',
    }
});
