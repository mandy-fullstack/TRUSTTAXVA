import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Button, Text, Input } from '@trusttax/ui';
import { Shield, Camera, Check, AlertCircle, Loader2 } from 'lucide-react';
import { WizardStateSelect } from '../components/WizardStateSelect';
import { api } from '../../../services/api';

interface Step3DLProps {
    onNext: (data: any) => void;
    onBack: () => void;
    initialData?: any;
}

export const Step3DriverLicense: React.FC<Step3DLProps> = ({ onNext, onBack, initialData }) => {
    const [dlNumber, setDlNumber] = useState(initialData?.driverLicenseNumber || '');
    const [dlState, setDlState] = useState(initialData?.driverLicenseStateCode || '');
    const [dlIssueDate, setDlIssueDate] = useState(initialData?.driverLicenseIssueDate || '');
    const [dlExpiration, setDlExpiration] = useState(initialData?.driverLicenseExpiration || '');
    const [error, setError] = useState('');

    // Lazy load DL data
    React.useEffect(() => {
        const fetchDL = async () => {
            if (dlNumber) return; // Already has data (maybe from initialData)

            try {
                const driverLicense = await api.getDecryptedDriverLicense();
                if (driverLicense) {
                    setDlNumber(driverLicense.number || '');
                    setDlState(driverLicense.stateCode || '');
                    setDlIssueDate(driverLicense.issueDate || '');
                    setDlExpiration(driverLicense.expirationDate || '');
                }
            } catch (error) {
                console.log('Lazy load DL failed', error);
            }
        };
        fetchDL();
    }, []);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Date Mask Helpers
    const formatMaskedDate = (val: string) => {
        const d = val.replace(/\D/g, '');
        if (d.length <= 2) return d;
        if (d.length <= 4) return `${d.slice(0, 2)} / ${d.slice(2)}`;
        return `${d.slice(0, 2)} / ${d.slice(2, 4)} / ${d.slice(4, 8)}`;
    };


    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadSuccess(false);
        setUploadError('');

        try {
            await api.uploadProfileDocument(file, 'DL');
            setUploadSuccess(true);
        } catch (err: any) {
            console.error(err);
            setUploadError('Failed to upload document.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleNext = () => {
        if (!dlNumber || !dlState || !dlIssueDate || !dlExpiration) {
            setError('ALL FIELDS ARE REQUIRED');
            return;
        }
        setError('');
        onNext({
            driverLicenseNumber: dlNumber,
            driverLicenseStateCode: dlState,
            // stateName is handled by the selector logic ideally, but we pass code for now
            driverLicenseIssueDate: dlIssueDate,
            driverLicenseExpiration: dlExpiration,
        });
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.headerTitle}>DRIVER'S LICENSE DETAILS</Text>
            </View>

            <View style={styles.form}>
                <Input
                    label="LICENSE NUMBER"
                    value={dlNumber}
                    onChangeText={(t: string) => {
                        setDlNumber(t.toUpperCase());
                        setError('');
                    }}
                    placeholder="ENTER NUMBER"
                    style={error && !dlNumber ? { borderColor: '#EF4444' } : undefined}
                />

                <View style={[styles.group, { zIndex: 100 }]}>
                    <Text style={styles.label}>ISSUING STATE</Text>
                    <WizardStateSelect
                        value={dlState}
                        onChange={(val) => {
                            setDlState(val);
                            setError('');
                        }}
                        placeholder="SELECT STATE"
                    />
                    {!!error && !dlState && <Text style={{ color: '#EF4444', fontSize: 10, marginTop: 4, fontFamily: 'Inter' }}>REQUIRED</Text>}
                </View>

                <View style={[styles.row, { zIndex: 0 }]}>
                    <View style={{ flex: 1 }}>
                        <Input
                            label="ISSUED DATE"
                            value={formatMaskedDate(dlIssueDate)}
                            onChangeText={(t: string) => {
                                setDlIssueDate(t.replace(/\D/g, '').slice(0, 8));
                                setError('');
                            }}
                            placeholder="MM / DD / YYYY"
                            style={error && !dlIssueDate ? { borderColor: '#EF4444' } : undefined}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Input
                            label="EXPIRATION DATE"
                            value={formatMaskedDate(dlExpiration)}
                            onChangeText={(t: string) => {
                                setDlExpiration(t.replace(/\D/g, '').slice(0, 8));
                                setError('');
                            }}
                            placeholder="MM / DD / YYYY"
                            style={error && !dlExpiration ? { borderColor: '#EF4444' } : undefined}
                        />
                    </View>
                </View>

                <View style={[styles.photoSection, uploadSuccess && styles.photoSectionSuccess, !!uploadError && styles.photoSectionError]}>
                    <View style={styles.photoHeader}>
                        <Text style={styles.label}>DOCUMENT PHOTO (REQUIRED)</Text>
                        {isUploading && <Loader2 size={16} color="#2563EB" className="animate-spin" />}
                        {uploadSuccess && <Check size={16} color="#16A34A" />}
                    </View>

                    <TouchableOpacity
                        style={[styles.photoBtn, uploadSuccess && styles.photoBtnSuccess]}
                        onPress={() => {
                            if (uploadError) setUploadError('');
                            triggerFileSelect();
                        }}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Text style={styles.photoBtnText}>ENCRYPTING...</Text>
                        ) : uploadSuccess ? (
                            <>
                                <Check size={20} color="#16A34A" />
                                <Text style={[styles.photoBtnText, { color: '#16A34A' }]}>UPLOAD COMPLETE</Text>
                            </>
                        ) : (
                            <>
                                <Camera size={20} color="#64748B" />
                                <Text style={styles.photoBtnText}>CAPTURE PHOTO</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {!!uploadError && (
                        <View style={styles.errorRow}>
                            <AlertCircle size={14} color="#EF4444" />
                            <Text style={styles.errorText}>{uploadError}</Text>
                        </View>
                    )}
                </View>
            </View>

            {error ? <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 16, fontFamily: 'Inter', fontSize: 12, fontWeight: '600' }}>{error}</Text> : null}

            <View style={styles.footer}>
                <Button
                    onPress={handleNext}
                    style={styles.btn}
                    textStyle={styles.btnText}
                >
                    CONFIRM & PROCEED
                </Button>
                <TouchableOpacity onPress={onBack} style={styles.back}>
                    <Text style={styles.backText}>RETRACT STEP</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { width: '100%' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    headerTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', letterSpacing: 1, fontFamily: 'Inter' },
    form: { gap: 24, marginBottom: 40 },
    row: { flexDirection: 'row', gap: 16 },
    group: { width: '100%' },
    label: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 1.5, marginBottom: 10, fontFamily: 'Inter' },
    photoSection: { gap: 12, padding: 24, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
    photoSectionSuccess: { borderColor: '#16A34A', backgroundColor: '#F0FDF4', borderStyle: 'solid' },
    photoSectionError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
    photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    photoBtn: { height: 56, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    photoBtnSuccess: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
    photoBtnText: { fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 1, fontFamily: 'Inter' },
    errorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    errorText: { fontSize: 11, color: '#EF4444', fontWeight: '600', fontFamily: 'Inter' },
    footer: { gap: 16, paddingBottom: 40 },
    btn: { height: 52, backgroundColor: '#0F172A', borderRadius: 0 },
    btnText: { fontSize: 14, fontWeight: '700', letterSpacing: 1.5, color: '#FFFFFF', fontFamily: 'Inter' },
    back: { alignItems: 'center', paddingVertical: 8 },
    backText: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, fontFamily: 'Inter' },
});
