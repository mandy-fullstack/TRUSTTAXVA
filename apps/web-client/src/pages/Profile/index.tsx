import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Text, H1, H3, Card, Button } from '@trusttax/ui';
import { Layout } from '../../components/Layout';
import { User, Shield, FileText, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { TermsModal } from '../../components/TermsModal';
import { CountrySelect } from '../../components/profile/CountrySelect';
import { PrimaryLanguageSelect } from '../../components/profile/PrimaryLanguageSelect';
import { ProfileSSNOrITIN, type TaxIdType } from '../../components/profile/ProfileSSNOrITIN';
import { ProfileDriverLicense } from '../../components/profile/ProfileDriverLicense';
import { ProfilePassport } from '../../components/profile/ProfilePassport';
import { WhyWeNeedThisSection } from '../../components/profile/WhyWeNeedThisSection';
import { DatePicker } from '../../components/profile/DatePicker';
import { RequiredLabel } from '../../components/profile/RequiredLabel';
import { EditableTextInput } from '../../components/profile/EditableTextInput';

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
    const { user, token, refreshUser } = useAuth();
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [initialFormData, setInitialFormData] = useState<ProfileData | null>(null);
    const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
    const scrollViewRef = useRef<ScrollView>(null);
    const initialSsnRef = useRef<string | null>(null);
    const lastDecryptedLicenseRef = useRef<{ number: string; stateCode: string; stateName: string; expirationDate: string } | null>(null);
    const lastDecryptedPassportRef = useRef<{ number: string; countryOfIssue: string; expirationDate: string } | null>(null);

    // Refs para los campos requeridos
    const firstNameRef = useRef<View>(null);
    const lastNameRef = useRef<View>(null);
    const dateOfBirthRef = useRef<View>(null);
    const countryOfBirthRef = useRef<View>(null);
    const primaryLanguageRef = useRef<View>(null);
    const ssnRef = useRef<View>(null);
    const termsRef = useRef<View>(null);
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

    useEffect(() => {
        const loadUserData = async () => {
            if (token) {
                try {
                    const userData = await api.getMe() as any;
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
                } catch (error) {
                    console.error('Failed to load user data:', error);
                }
            }
        };
        loadUserData();
    }, [token, i18n.language]);

    const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Cargar SSN descifrado al editar; guardar en ref para saber si hubo cambios
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

    const loadDecryptedDriverLicense = async (): Promise<{
        number: string;
        stateCode: string;
        stateName: string;
        expirationDate: string;
    } | null> => {
        try {
            const d = await api.getDecryptedDriverLicense();
            lastDecryptedLicenseRef.current = d;
            return d;
        } catch (error) {
            console.error('Failed to load decrypted driver license:', error);
            return null;
        }
    };

    const loadDecryptedPassport = async (): Promise<{
        number: string;
        countryOfIssue: string;
        expirationDate: string;
    } | null> => {
        try {
            const d = await api.getDecryptedPassport();
            lastDecryptedPassportRef.current = d;
            return d;
        } catch (error) {
            console.error('Failed to load decrypted passport:', error);
            return null;
        }
    };

    const isDirty = (() => {
        if (!initialFormData) return false;
        const keys: (keyof ProfileData)[] = [
            'firstName', 'middleName', 'lastName', 'dateOfBirth', 'countryOfBirth', 'primaryLanguage',
            'taxIdType', 'ssn', 'driverLicenseNumber', 'driverLicenseStateCode', 'driverLicenseStateName',
            'driverLicenseExpiration', 'passportNumber', 'passportCountryOfIssue', 'passportExpiration', 'acceptTerms',
        ];
        for (const k of keys) {
            const a = String(formData[k] ?? '');
            const b = String(initialFormData[k] ?? '');
            if (a !== b) return true;
        }
        return false;
    })();

    const handleAcceptTerms = () => {
        setFormData(prev => ({ ...prev, acceptTerms: true }));
        setShowTermsModal(false);
    };

    const scrollToField = (ref: React.RefObject<View>) => {
        if (ref.current && scrollViewRef.current) {
            // Usar measureInWindow para mejor compatibilidad con web
            ref.current.measureInWindow((_x, y, _width, _height) => {
                if (scrollViewRef.current) {
                    if (Platform.OS === 'web') {
                        (scrollViewRef.current as any).scrollTo({ y: Math.max(0, y - 150), animated: true });
                    } else {
                        ref.current?.measureLayout(
                            scrollViewRef.current as any,
                            (_layoutX, layoutY) => {
                                scrollViewRef.current?.scrollTo({ y: Math.max(0, layoutY - 100), animated: true });
                            },
                            () => {}
                        );
                    }
                }
            });
        }
    };

    const handleSubmit = async () => {
        const errors = new Set<string>();
        let firstErrorRef: React.RefObject<View> | null = null;

        // Validar campos requeridos
        if (!formData.firstName?.trim()) {
            errors.add('firstName');
            if (!firstErrorRef) firstErrorRef = firstNameRef;
        }

        if (!formData.lastName?.trim()) {
            errors.add('lastName');
            if (!firstErrorRef) firstErrorRef = lastNameRef;
        }

        if (!formData.dateOfBirth) {
            errors.add('dateOfBirth');
            if (!firstErrorRef) firstErrorRef = dateOfBirthRef;
        }

        if (!formData.countryOfBirth) {
            errors.add('countryOfBirth');
            if (!firstErrorRef) firstErrorRef = countryOfBirthRef;
        }

        if (!formData.primaryLanguage) {
            errors.add('primaryLanguage');
            if (!firstErrorRef) firstErrorRef = primaryLanguageRef;
        }

        if (!formData.ssn || !/^\d{3}-\d{2}-\d{4}$/.test(formData.ssn)) {
            errors.add('ssn');
            if (!firstErrorRef) firstErrorRef = ssnRef;
        }

        if (!formData.acceptTerms) {
            errors.add('acceptTerms');
            if (!firstErrorRef) firstErrorRef = termsRef;
        }

        // Si hay errores, mostrar visualmente y hacer scroll
        if (errors.size > 0) {
            setValidationErrors(errors);
            
            // Hacer scroll al primer campo con error
            if (firstErrorRef) {
                setTimeout(() => scrollToField(firstErrorRef!), 100);
            }

            // Mostrar alerta con los campos faltantes
            const errorMessages: string[] = [];
            if (errors.has('firstName')) errorMessages.push(t('profile.first_name', 'First Name'));
            if (errors.has('lastName')) errorMessages.push(t('profile.last_name', 'Last Name'));
            if (errors.has('dateOfBirth')) errorMessages.push(t('profile.date_of_birth', 'Date of Birth'));
            if (errors.has('countryOfBirth')) errorMessages.push(t('profile.country_of_birth', 'Country of Birth'));
            if (errors.has('primaryLanguage')) errorMessages.push(t('profile.primary_language', 'Primary Language'));
            if (errors.has('ssn')) errorMessages.push(t('profile.tax_id', 'SSN or ITIN'));
            if (errors.has('acceptTerms')) errorMessages.push(t('profile.terms', 'Terms and Conditions'));

            Alert.alert(
                t('profile.validation_error', 'Validation Error'),
                t('profile.required_fields_message', 'Please complete the following required fields:') + '\n\n• ' + errorMessages.join('\n• ')
            );
            return;
        }

        // Limpiar errores de validación
        setValidationErrors(new Set());

        setIsLoading(true);
        try {
            const updatePayload: Record<string, unknown> = {};
            const init = initialFormData;

            // Solo incluir campos básicos si cambiaron
            const basicKeys: (keyof ProfileData)[] = ['firstName', 'middleName', 'lastName', 'dateOfBirth', 'countryOfBirth', 'primaryLanguage'];
            for (const k of basicKeys) {
                const a = String(formData[k] ?? '').trim();
                const b = String(init?.[k] ?? '').trim();
                if (a !== b) {
                    (updatePayload as any)[k] = formData[k];
                }
            }

            if (init && formData.taxIdType !== init.taxIdType) {
                updatePayload.taxIdType = formData.taxIdType;
            }

            if (formData.acceptTerms && formData.acceptTerms !== init?.acceptTerms) {
                updatePayload.acceptTerms = true;
                updatePayload.termsVersion = '1.0';
            }

            // SSN: solo si hay valor y cambió respecto al cargado al editar
            const ssnVal = formData.ssn?.trim() ?? '';
            if (ssnVal.length > 0 && /^\d{3}-\d{2}-\d{4}$/.test(formData.ssn!)) {
                const orig = initialSsnRef.current;
                if (orig == null || formData.ssn !== orig) {
                    updatePayload.ssn = formData.ssn;
                }
            }

            // Licencia: solo si se editó y hay cambios. Enviar objeto completo (merge formData + lastDecrypted).
            const lastLic = lastDecryptedLicenseRef.current;
            const hasLicData = !!(
                formData.driverLicenseNumber?.trim() ||
                formData.driverLicenseStateCode?.trim() ||
                (formData.driverLicenseExpiration ?? '').trim()
            );
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

            // Passport: igual que licencia
            const lastPass = lastDecryptedPassportRef.current;
            const hasPassData = !!(
                formData.passportNumber?.trim() ||
                formData.passportCountryOfIssue?.trim() ||
                (formData.passportExpiration ?? '').trim()
            );
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
            
            // Actualizar el contexto de autenticación para obtener los nuevos valores enmascarados
            await refreshUser();
            
            // Recargar datos del usuario y limpiar sensibles
            let nextForm: ProfileData;
            try {
                const userData = await api.getMe() as any;
                nextForm = {
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
            } catch (err) {
                console.error('Failed to reload user data:', err);
                nextForm = {
                    ...formData,
                    ssn: '',
                    driverLicenseNumber: '',
                    driverLicenseStateCode: '',
                    driverLicenseStateName: '',
                    driverLicenseExpiration: '',
                    passportNumber: '',
                    passportCountryOfIssue: '',
                    passportExpiration: '',
                };
            }
            setFormData(nextForm);
            setInitialFormData({ ...nextForm });
            initialSsnRef.current = null;
            lastDecryptedLicenseRef.current = null;
            lastDecryptedPassportRef.current = null;

            Alert.alert(
                t('profile.success', 'Success'),
                t('profile.update_success_detail', 'Your profile has been saved successfully. Personal information, SSN/ITIN, terms acceptance, and any driver\'s license or passport data you provided have been updated and stored securely.'),
                [
                    {
                        text: t('common.ok', 'OK'),
                        onPress: () => {
                            if (typeof window !== 'undefined') window.location.reload();
                        },
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert(
                t('profile.error', 'Error'),
                error.message || t('profile.update_error', 'Failed to update profile')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const profileComplete = user?.profileComplete;

    return (
        <>
            <Layout>
                <ScrollView ref={scrollViewRef} style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <H1>{t('profile.title', 'Profile')}</H1>
                    <Text style={styles.subtitle}>
                        {t('profile.subtitle', 'Complete your profile to access all services')}
                    </Text>
                    {!profileComplete && (
                        <View style={styles.incompleteBanner}>
                            <Shield size={16} color="#F59E0B" />
                            <Text style={styles.incompleteText}>
                                {t('profile.incomplete_warning', 'Your profile is incomplete. Please complete all required fields.')}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.sections}>
                    {/* Personal Information */}
                    <Card style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconBox}>
                                <User size={20} color="#2563EB" />
                            </View>
                            <H3>{t('profile.personal_info', 'Personal Information')}</H3>
                        </View>

                        <View style={styles.formRow}>
                            <View ref={firstNameRef} style={styles.formGroup}>
                                <RequiredLabel required>
                                    {t('profile.first_name', 'First Name')}
                                </RequiredLabel>
                                <EditableTextInput
                                    value={formData.firstName || ''}
                                    onChange={(value) => {
                                        handleInputChange('firstName', value);
                                        if (validationErrors.has('firstName')) {
                                            setValidationErrors(prev => {
                                                const next = new Set(prev);
                                                next.delete('firstName');
                                                return next;
                                            });
                                        }
                                    }}
                                    placeholder={t('profile.first_name_placeholder', 'Enter first name')}
                                    isSaved={initialFormData?.firstName === formData.firstName && !!formData.firstName}
                                    hasError={validationErrors.has('firstName')}
                                    autoUppercase
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    {t('profile.middle_name', 'Middle Name')}
                                </Text>
                                <EditableTextInput
                                    value={formData.middleName || ''}
                                    onChange={(value) => handleInputChange('middleName', value)}
                                    placeholder={t('profile.middle_name_placeholder', 'Enter middle name (optional)')}
                                    isSaved={initialFormData?.middleName === formData.middleName && !!formData.middleName}
                                    autoUppercase
                                />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View ref={lastNameRef} style={[styles.formGroup, styles.fullWidth]}>
                                <RequiredLabel required>
                                    {t('profile.last_name', 'Last Name')}
                                </RequiredLabel>
                                <EditableTextInput
                                    value={formData.lastName || ''}
                                    onChange={(value) => {
                                        handleInputChange('lastName', value);
                                        if (validationErrors.has('lastName')) {
                                            setValidationErrors(prev => {
                                                const next = new Set(prev);
                                                next.delete('lastName');
                                                return next;
                                            });
                                        }
                                    }}
                                    placeholder={t('profile.last_name_placeholder', 'Enter last name')}
                                    isSaved={initialFormData?.lastName === formData.lastName && !!formData.lastName}
                                    hasError={validationErrors.has('lastName')}
                                    autoUppercase
                                />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View ref={dateOfBirthRef} style={[styles.formGroup, styles.fullWidth]}>
                                <DatePicker
                                    label={t('profile.date_of_birth', 'Date of Birth')}
                                    value={formData.dateOfBirth || ''}
                                    onChange={(value: string) => {
                                        handleInputChange('dateOfBirth', value);
                                        if (validationErrors.has('dateOfBirth')) {
                                            setValidationErrors(prev => {
                                                const next = new Set(prev);
                                                next.delete('dateOfBirth');
                                                return next;
                                            });
                                        }
                                    }}
                                    placeholder="YYYY-MM-DD"
                                    required
                                    maxDate={new Date().toISOString().split('T')[0]} // No fechas futuras
                                    hasError={validationErrors.has('dateOfBirth')}
                                />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View ref={countryOfBirthRef} style={[styles.formGroup, { flex: 1, minWidth: 200 }]}>
                                <CountrySelect
                                    label={t('profile.country_of_birth', 'Country of Birth')}
                                    required
                                    value={formData.countryOfBirth || ''}
                                    onChange={(code) => {
                                        handleInputChange('countryOfBirth', (code || '').toUpperCase());
                                        if (validationErrors.has('countryOfBirth')) {
                                            setValidationErrors(prev => {
                                                const next = new Set(prev);
                                                next.delete('countryOfBirth');
                                                return next;
                                            });
                                        }
                                    }}
                                    placeholder={t('profile.select_country', 'Select country')}
                                    hasError={validationErrors.has('countryOfBirth')}
                                />
                            </View>
                            <View ref={primaryLanguageRef} style={[styles.formGroup, { flex: 1, minWidth: 200 }]}>
                                <PrimaryLanguageSelect
                                    label={t('profile.primary_language', 'Primary Language')}
                                    required
                                    value={formData.primaryLanguage || 'en'}
                                    onChange={(code) => {
                                        handleInputChange('primaryLanguage', code);
                                        if (validationErrors.has('primaryLanguage')) {
                                            setValidationErrors(prev => {
                                                const next = new Set(prev);
                                                next.delete('primaryLanguage');
                                                return next;
                                            });
                                        }
                                    }}
                                    hasError={validationErrors.has('primaryLanguage')}
                                />
                            </View>
                        </View>
                    </Card>

                    {/* SSN / ITIN */}
                    <Card style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconBox}>
                                <Lock size={20} color="#2563EB" />
                            </View>
                            <H3>{t('profile.tax_id', 'SSN or ITIN')}</H3>
                        </View>
                        <Text style={styles.securityNote}>
                            {t('profile.encryption_note', 'All sensitive information is encrypted using AES-256-GCM encryption before storage.')}
                        </Text>
                        <View ref={ssnRef}>
                            <ProfileSSNOrITIN
                                taxIdType={formData.taxIdType}
                                value={formData.ssn || ''}
                                onChangeType={(t) => handleInputChange('taxIdType', t)}
                                onChangeValue={(v) => {
                                    handleInputChange('ssn', v);
                                    if (validationErrors.has('ssn')) {
                                        setValidationErrors(prev => {
                                            const next = new Set(prev);
                                            next.delete('ssn');
                                            return next;
                                        });
                                    }
                                }}
                                ssnMasked={user?.ssnMasked}
                                onLoadDecrypted={loadDecryptedSSN}
                                hasError={validationErrors.has('ssn')}
                            />
                        </View>
                    </Card>

                    {/* Driver's License */}
                    <Card style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconBox}>
                                <Lock size={20} color="#2563EB" />
                            </View>
                            <H3>{t('profile.driver_license', 'Driver\'s License')}</H3>
                        </View>
                        <ProfileDriverLicense
                            number={formData.driverLicenseNumber || ''}
                            stateCode={formData.driverLicenseStateCode || ''}
                            stateName={formData.driverLicenseStateName || ''}
                            expirationDate={formData.driverLicenseExpiration || ''}
                            onNumberChange={(v) => handleInputChange('driverLicenseNumber', (v || '').toUpperCase())}
                            onStateChange={(code, name) => {
                                setFormData(prev => ({
                                    ...prev,
                                    driverLicenseStateCode: (code || '').toUpperCase(),
                                    driverLicenseStateName: (name || '').toUpperCase(),
                                }));
                            }}
                            onExpirationChange={(v) => handleInputChange('driverLicenseExpiration', (v || '').toUpperCase())}
                            driverLicenseMasked={(user as any)?.driverLicenseMasked}
                            onLoadDecrypted={loadDecryptedDriverLicense}
                        />
                    </Card>

                    {/* Passport */}
                    <Card style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconBox}>
                                <Lock size={20} color="#2563EB" />
                            </View>
                            <H3>{t('profile.passport', 'Passport')}</H3>
                        </View>
                        <ProfilePassport
                            number={formData.passportNumber || ''}
                            countryOfIssue={formData.passportCountryOfIssue || ''}
                            expirationDate={formData.passportExpiration || ''}
                            onNumberChange={(v) => handleInputChange('passportNumber', (v || '').toUpperCase())}
                            onCountryChange={(code) => handleInputChange('passportCountryOfIssue', (code || '').toUpperCase())}
                            onExpirationChange={(v) => handleInputChange('passportExpiration', (v || '').toUpperCase())}
                            passportMasked={user?.passportMasked}
                            onLoadDecrypted={loadDecryptedPassport}
                        />
                    </Card>

                    {/* Terms and Conditions */}
                    <Card style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconBox}>
                                <FileText size={20} color="#2563EB" />
                            </View>
                            <H3>{t('profile.terms_conditions', 'Terms and Conditions')}</H3>
                        </View>

                        <View ref={termsRef}>
                            <TouchableOpacity
                                style={[
                                    styles.termsCheckbox,
                                    validationErrors.has('acceptTerms') && styles.termsCheckboxError
                                ]}
                                onPress={() => setShowTermsModal(true)}
                                activeOpacity={0.7}
                            >
                            <View style={[styles.checkbox, formData.acceptTerms && styles.checkboxChecked]}>
                                {formData.acceptTerms && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </View>
                            <View style={styles.termsText}>
                                <Text style={styles.termsLabel}>
                                    {t('profile.accept_terms', 'I accept the Terms and Conditions')}
                                    <Text style={styles.requiredAsterisk}> *</Text>
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowTermsModal(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.termsLink}>
                                        {t('profile.read_terms', 'Read Terms')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                        </View>

                        <Text style={styles.termsNote}>
                            {t('profile.terms_note', 'By accepting, you acknowledge that your SSN/ITIN, driver\'s license, and passport data will be encrypted and protected according to our security standards.')}
                        </Text>
                    </Card>

                    <WhyWeNeedThisSection />

                    {/* Submit Button - solo cuando hay cambios; deshabilitado hasta aceptar términos */}
                    {isDirty && (
                        <View style={styles.actions}>
                            <Button
                                title={t('profile.save', 'Save')}
                                onPress={handleSubmit}
                                loading={isLoading}
                                variant="primary"
                                style={[styles.saveButton, !formData.acceptTerms && styles.saveButtonDisabled]}
                                disabled={!formData.acceptTerms}
                            />
                            {!formData.acceptTerms && (
                                <Text style={styles.saveHint}>
                                    {t('profile.save_disabled_terms', 'Accept the Terms and Conditions to save.')}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
            </Layout>
            {/* TermsModal fuera del Layout para mejor posicionamiento como modal flotante */}
            <TermsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onAccept={handleAcceptTerms}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        maxWidth: 900,
        width: '100%',
        marginHorizontal: 'auto',
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 8,
    },
    incompleteBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        padding: 12,
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 0,
    },
    incompleteText: {
        fontSize: 14,
        color: '#92400E',
        fontWeight: '500',
        flex: 1,
    },
    sections: {
        gap: 24,
    },
    card: {
        padding: 24,
        borderRadius: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    iconBox: {
        width: 40,
        height: 40,
        backgroundColor: '#EFF6FF',
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    formRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    formGroup: {
        flex: 1,
        minWidth: 200,
    },
    fullWidth: {
        flex: 1,
        minWidth: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 48,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        ...(Platform.OS === 'web' ? {
            fontSize: 16,
        } : {}),
    } as any,
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
        height: '100%',
    } as any,
    hint: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
    },
    securityNote: {
        fontSize: 13,
        color: '#10B981',
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        borderRadius: 0,
    },
    termsCheckbox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    termsCheckboxError: {
        borderWidth: 1.5,
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 4,
        gap: 12,
        marginBottom: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    termsText: {
        flex: 1,
    },
    termsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 4,
    },
    termsLink: {
        fontSize: 14,
        color: '#2563EB',
        textDecorationLine: 'underline',
        fontWeight: '500',
    },
    termsNote: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
        marginTop: 8,
    },
    actions: {
        marginTop: 8,
    },
    saveButton: {
        minWidth: 200,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveHint: {
        marginTop: 8,
        fontSize: 13,
        color: '#64748B',
    },
    requiredAsterisk: {
        color: '#DC2626',
        marginLeft: 2,
    },
});
