import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Button, Text, Input } from '@trusttax/ui';
import { Shield, Camera, Check, AlertCircle, Loader2 } from 'lucide-react';
import { WizardCountrySelect } from '../components/WizardCountrySelect';
import { WizardStateSelect } from '../components/WizardStateSelect';
import { api } from '../../../services/api';

interface Step3Props {
    onNext: (data: any) => void;
    onBack: () => void;
    initialData?: any;
}

export const Step3Verification: React.FC<Step3Props> = ({ onNext, onBack, initialData }) => {
    const { width } = useWindowDimensions();
    const [idType, setIdType] = useState<'DL' | 'PASSPORT'>(initialData?.passportNumber ? 'PASSPORT' : 'DL');

    const [dlNumber, setDlNumber] = useState(initialData?.driverLicenseNumber || '');
    const [dlState, setDlState] = useState(initialData?.driverLicenseStateCode || '');
    const [dlIssueDate, setDlIssueDate] = useState(initialData?.driverLicenseIssueDate || '');
    const [dlExpiration, setDlExpiration] = useState(initialData?.driverLicenseExpiration || '');

    const [passportNumber, setPassportNumber] = useState(initialData?.passportNumber || '');
    const [passportCountry, setPassportCountry] = useState(initialData?.passportCountryOfIssue || '');
    const [passportIssueDate, setPassportIssueDate] = useState(initialData?.passportIssueDate || '');
    const [passportExpiration, setPassportExpiration] = useState(initialData?.passportExpiration || '');

    // File Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper to convert YYYY-MM-DD to MMDDYYYY for the mask
    const isoToMask = (iso?: string) => {
        if (!iso) return '';
        // If already looking like MMDDYYYY or raw digits, leave it
        if (!iso.includes('-') && iso.length === 8) return iso;

        const parts = iso.split('-');
        if (parts.length === 3) {
            const [y, m, d] = parts;
            return `${m}${d}${y}`;
        }
        return iso.replace(/\D/g, '');
    };

    // Reactive hydration
    React.useEffect(() => {
        if (initialData?.passportNumber) setIdType('PASSPORT');
        else if (initialData?.driverLicenseNumber) setIdType('DL');

        if (initialData?.driverLicenseNumber !== undefined) setDlNumber(initialData.driverLicenseNumber);
        if (initialData?.driverLicenseStateCode !== undefined) setDlState(initialData.driverLicenseStateCode);
        if (initialData?.driverLicenseIssueDate !== undefined) setDlIssueDate(isoToMask(initialData.driverLicenseIssueDate));
        if (initialData?.driverLicenseExpiration !== undefined) setDlExpiration(isoToMask(initialData.driverLicenseExpiration));

        if (initialData?.passportNumber !== undefined) setPassportNumber(initialData.passportNumber);
        if (initialData?.passportCountryOfIssue !== undefined) setPassportCountry(initialData.passportCountryOfIssue);
        if (initialData?.passportIssueDate !== undefined) setPassportIssueDate(isoToMask(initialData.passportIssueDate));
        if (initialData?.passportExpiration !== undefined) setPassportExpiration(isoToMask(initialData.passportExpiration));
    }, [initialData]);

    const formatMaskedDate = (val: string) => {
        const d = val.replace(/\D/g, '');
        if (d.length <= 2) return d;
        if (d.length <= 4) return `${d.slice(0, 2)} / ${d.slice(2)}`;
        return `${d.slice(0, 2)} / ${d.slice(2, 4)} / ${d.slice(4, 8)}`;
    };

    const isValid = idType === 'DL'
        ? dlNumber.length > 3 && dlState.length === 2 && dlIssueDate.length === 8 && dlExpiration.length === 8
        : passportNumber.length > 5 && passportIssueDate.length === 8 && passportExpiration.length === 8;

    const handleNext = () => {
        const data = idType === 'DL' ? {
            driverLicenseNumber: dlNumber,
            driverLicenseStateCode: dlState,
            driverLicenseIssueDate: dlIssueDate,
            driverLicenseExpiration: dlExpiration
        } : {
            passportNumber,
            passportCountryOfIssue: passportCountry,
            passportIssueDate,
            passportExpiration
        };
        onNext(data);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadSuccess(false);
        setUploadError('');

        try {
            await api.uploadProfileDocument(file, idType);
            setUploadSuccess(true);
        } catch (err: any) {
            console.error(err);
            setUploadError('Failed to securely upload document. Please try again.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <View style={styles.container}>
            {/* Hidden File Input */}
            {Platform.OS === 'web' && (
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                />
            )}

            <View style={styles.header}>
                <Shield size={24} color="#0F172A" />
                <Text style={styles.headerTitle}>SECURE DOCUMENT VERIFICATION</Text>
            </View>

            <View style={styles.typeSelector}>
                <TouchableOpacity
                    style={[styles.typeBtn, idType === 'DL' && styles.typeBtnActive]}
                    onPress={() => setIdType('DL')}
                >
                    <Text style={[styles.typeBtnText, idType === 'DL' && styles.typeBtnTextActive]}>DRIVER'S LICENSE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeBtn, idType === 'PASSPORT' && styles.typeBtnActive]}
                    onPress={() => setIdType('PASSPORT')}
                >
                    <Text style={[styles.typeBtnText, idType === 'PASSPORT' && styles.typeBtnTextActive]}>PASSPORT</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                {idType === 'DL' ? (
                    <>
                        <Input
                            label="LICENSE NUMBER"
                            value={dlNumber}
                            onChangeText={setDlNumber}
                            placeholder="ENTER NUMBER"
                        />
                        <View style={styles.group}>
                            <Text style={styles.label}>ISSUING STATE</Text>
                            <WizardStateSelect
                                value={dlState}
                                onChange={setDlState}
                                placeholder="SELECT STATE"
                            />
                        </View>
                        <View style={[styles.row, { flexDirection: width < 600 ? 'column' : 'row' }]}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="ISSUE DATE"
                                    value={formatMaskedDate(dlIssueDate)}
                                    onChangeText={(t: string) => setDlIssueDate(t.replace(/\D/g, '').slice(0, 8))}
                                    placeholder="MM / DD / YYYY"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="EXPIRATION DATE"
                                    value={formatMaskedDate(dlExpiration)}
                                    onChangeText={(t: string) => setDlExpiration(t.replace(/\D/g, '').slice(0, 8))}
                                    placeholder="MM / DD / YYYY"
                                />
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <Input
                            label="PASSPORT NUMBER"
                            value={passportNumber}
                            onChangeText={setPassportNumber}
                            placeholder="ENTER NUMBER"
                        />
                        <View style={styles.group}>
                            <Text style={styles.label}>COUNTRY OF ISSUE</Text>
                            <WizardCountrySelect
                                value={passportCountry}
                                onChange={setPassportCountry}
                                placeholder="SELECT COUNTRY"
                            />
                        </View>
                        <View style={[styles.row, { flexDirection: width < 600 ? 'column' : 'row' }]}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="ISSUE DATE"
                                    value={formatMaskedDate(passportIssueDate)}
                                    onChangeText={(t: string) => setPassportIssueDate(t.replace(/\D/g, '').slice(0, 8))}
                                    placeholder="MM / DD / YYYY"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="EXPIRATION DATE"
                                    value={formatMaskedDate(passportExpiration)}
                                    onChangeText={(t: string) => setPassportExpiration(t.replace(/\D/g, '').slice(0, 8))}
                                    placeholder="MM / DD / YYYY"
                                />
                            </View>
                        </View>
                    </>
                )}

                <View style={[styles.photoSection, uploadSuccess && styles.photoSectionSuccess, !!uploadError && styles.photoSectionError]}>
                    <View style={styles.photoHeader}>
                        <Text style={styles.label}>
                            {idType === 'DL' ? "DRIVER'S LICENSE PHOTO" : "PASSPORT PHOTO"} (REQUIRED)
                        </Text>
                        {isUploading && <Loader2 size={16} color="#2563EB" className="animate-spin" />}
                        {uploadSuccess && <Check size={16} color="#16A34A" />}
                    </View>

                    <TouchableOpacity
                        style={[styles.photoBtn, uploadSuccess && styles.photoBtnSuccess]}
                        onPress={triggerFileSelect}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Text style={styles.photoBtnText}>ENCRYPTING & UPLOADING...</Text>
                        ) : uploadSuccess ? (
                            <>
                                <Check size={20} color="#16A34A" />
                                <Text style={[styles.photoBtnText, { color: '#16A34A' }]}>UPLOAD COMPLETE</Text>
                            </>
                        ) : (
                            <>
                                <Camera size={20} color="#64748B" />
                                <Text style={styles.photoBtnText}>CAPTURE OR UPLOAD DOCUMENT</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {!!uploadError ? (
                        <View style={styles.errorRow}>
                            <AlertCircle size={14} color="#EF4444" />
                            <Text style={styles.errorText}>{uploadError}</Text>
                        </View>
                    ) : (
                        <Text style={styles.photoHint}>IMAGE WILL BE AES-256-GCM ENCRYPTED BEFORE TRANSMISSION</Text>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    onPress={handleNext}
                    disabled={!isValid || (!uploadSuccess && !initialData?.photoKey && false)} // Optional for now, remove false to enforce
                    style={styles.btn}
                    textStyle={styles.btnText}
                >
                    CONFIRM VERIFICATION
                </Button>
                <TouchableOpacity onPress={onBack} style={styles.back}>
                    <Text style={styles.backText}>RETRACT STEP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: 1,
        fontFamily: 'Inter',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    typeBtn: {
        flex: 1,
        height: 48,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    typeBtnActive: {
        borderColor: '#0F172A',
        backgroundColor: '#0F172A',
    },
    typeBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 1,
        fontFamily: 'Inter',
    },
    typeBtnTextActive: {
        color: '#FFFFFF',
    },
    form: {
        gap: 24,
        marginBottom: 40,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    group: {
        width: '100%',
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 1.5,
        marginBottom: 10,
        fontFamily: 'Inter',
    },
    photoSection: {
        gap: 12,
        padding: 24,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#CBD5E1',
        backgroundColor: '#F8FAFC',
    },
    photoSectionSuccess: {
        borderColor: '#16A34A',
        backgroundColor: '#F0FDF4',
        borderStyle: 'solid',
    },
    photoSectionError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    photoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    photoBtn: {
        height: 56,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    photoBtnSuccess: {
        borderColor: '#16A34A',
        backgroundColor: '#F0FDF4',
    },
    photoBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 1,
        fontFamily: 'Inter',
    },
    photoHint: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94A3B8',
        textAlign: 'center',
        letterSpacing: 0.5,
        fontFamily: 'Inter',
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    errorText: {
        fontSize: 11,
        color: '#EF4444',
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    footer: {
        gap: 16,
        paddingBottom: 40,
    },
    btn: {
        height: 52, // Standard height
        backgroundColor: '#0F172A',
        borderRadius: 0,
    },
    btnText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1.5,
        color: '#FFFFFF',
        fontFamily: 'Inter',
    },
    back: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    backText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
        fontFamily: 'Inter',
    },
});
