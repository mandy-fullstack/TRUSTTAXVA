import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { H3, Text, Button, spacing, Spacer, Stack } from '@trusttax/ui';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import type { ServiceDocType } from '../../../types';

interface DocumentsStepProps {
    docTypes: ServiceDocType[];
    data: any; // { [docTypeId]: { fileName: string, status: 'uploaded' } }
    onChange: (data: any) => void;
}

export const DocumentsStep = ({ docTypes, data, onChange }: DocumentsStepProps) => {
    const handleUploadMock = (docType: string) => {
        // Mock upload — random only when user clicks, not during render
        // eslint-disable-next-line react-hooks/purity -- used in event handler only
        const fileName = `document_${Math.floor(Math.random() * 1000)}.pdf`;
        onChange({
            ...data,
            [docType]: { fileName, status: 'uploaded', date: new Date().toISOString() }
        });
    };

    const handleRemove = (docType: string) => {
        const newData = { ...data };
        delete newData[docType];
        onChange(newData);
    };

    return (
        <Stack gap="xl">
            <View>
                <H3>Required Documents</H3>
                <Spacer size="sm" />
                <Text style={styles.desc}>Please upload the following documents to proceed with your application. All files are securely encrypted.</Text>
            </View>
            <View style={styles.list}>
                {docTypes.map((doc) => {
                    const file = data[doc.docType];
                    return (
                        <View key={doc.id || doc.docType} style={styles.docItem}>
                            <View style={styles.docInfo}>
                                <View style={[styles.iconBox, file ? styles.iconBoxSuccess : styles.iconBoxPending]}>
                                    {file ? <CheckCircle size={20} color="#10B981" /> : <FileText size={20} color="#64748B" />}
                                </View>
                                <View>
                                    <Text style={styles.docTitle}>
                                        {doc.docType} {doc.isRequired && <Text style={{ color: '#EF4444' }}>*</Text>}
                                    </Text>
                                    {file ? (
                                        <Text style={styles.fileName}>{file.fileName}</Text>
                                    ) : (
                                        <Text style={styles.docStatus}>Pending upload</Text>
                                    )}
                                </View>
                            </View>

                            {file ? (
                                <TouchableOpacity onPress={() => handleRemove(doc.docType)} style={styles.removeBtn}>
                                    <X size={18} color="#94A3B8" />
                                </TouchableOpacity>
                            ) : (
                                <Button
                                    title="Upload"
                                    variant="outline"
                                    onPress={() => handleUploadMock(doc.docType)}
                                    style={styles.uploadBtn}
                                    icon={<Upload size={14} color="#2563EB" />}
                                />
                            )}
                        </View>
                    );
                })}
            </View>
        </Stack>
    );
};

const s = spacing;
const styles = StyleSheet.create({
    desc: { fontSize: 16, color: '#64748B', lineHeight: 24 },
    list: { gap: s[4] },
    docItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: s[4], borderRadius: 0, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
    docInfo: { flexDirection: 'row', alignItems: 'center', gap: s[4] },
    iconBox: { width: 40, height: 40, borderRadius: 0, alignItems: 'center', justifyContent: 'center' },
    iconBoxPending: { backgroundColor: '#F1F5F9' },
    iconBoxSuccess: { backgroundColor: '#ECFDF5' },
    docTitle: { fontWeight: '600', color: '#0F172A', fontSize: 14 },
    fileName: { color: '#10B981', fontSize: 12 },
    docStatus: { color: '#94A3B8', fontSize: 12 },
    uploadBtn: { height: 36, paddingHorizontal: s[4] },
    removeBtn: { padding: s[2] }
});
