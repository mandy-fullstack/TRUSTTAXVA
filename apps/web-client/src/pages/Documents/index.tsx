import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Layout } from '../../components/Layout';
import { Text, Button } from '@trusttax/ui';
import { Folder, FileText, CloudUpload, ChevronRight, ArrowLeft, Download, Image as ImageIcon, File } from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { PageMeta } from '../../components/PageMeta';

// Enum matches backend DocType keys but values are for display
// We can use translation keys later
const DOC_TYPES: Record<string, string> = {
    PASSPORT: 'Passport',
    ID_CARD: 'ID Card',
    DRIVER_LICENSE: 'Driver\'s License',
    TAX_FORM: 'Tax Form',
    PROOF_OF_INCOME: 'Proof of Income',
    SSN_CARD: 'SSN Card',
    W2_FORM: 'W-2 Form',
    PAYSTUB: 'Paystub',
    TAX_RETURN: 'Tax Return',
    LEGAL_DOCUMENT: 'Legal Document',
    MEDICAL_RECORD: 'Medical Record',
    RECEIPT: 'Receipt',
    OTHER: 'Other'
};

export const DocumentsPage = () => {
    const { t } = useTranslation();
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    // Helper for file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentFolder) {
            fetchDocuments(currentFolder);
        }
    }, [currentFolder]);

    const fetchDocuments = async (type: string) => {
        setLoading(true);
        setError(null);
        try {
            const docs = await api.getDocuments({ type });
            setDocuments(docs);
        } catch (err) {
            console.error('Failed to fetch documents', err);
            setError(t('documents.load_error', 'Failed to load documents'));
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentFolder) return;

        setUploading(true);
        try {
            await api.uploadDocument(file, file.name, currentFolder);
            // Refresh 
            fetchDocuments(currentFolder);
        } catch (err) {
            console.error('Upload failed', err);
            setError(t('documents.upload_error', 'Failed to upload document'));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDownload = async (doc: any) => {
        try {
            // Secure download: Fetch with auth headers, then open blob
            if (doc.url) {
                // doc.url is like /api/documents/ID/content
                // We need to request this via our api service to attach the token
                // Note: api.request returns JSON by default usually, so we might need a blob helper
                // or raw fetch.

                // Using raw fetch here for simplicity with existing token helper if imported, 
                // or better: add download method to api.ts?
                // Let's try adding a helper method to DocumentsPage or use api.ts

                const token = localStorage.getItem('token') || document.cookie.match(/token=([^;]+)/)?.[1]; // rudimentary token get, ideally use api getToken()
                // Actually, let used api.downloadFile if it existed.

                // Let's assume we can add download method to api.ts or do it inline here:

                // We can't easily import getToken() here if it's not exported from api.ts (it is usually internal).
                // Use api.requestBlob if available?

                // Better approach: Add downloadDocument to api.ts that returns Blob
                const blob = await api.downloadDocument(doc.id);
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');

                // Clean up after a delay
                setTimeout(() => window.URL.revokeObjectURL(url), 60000);
            }
        } catch (err) {
            console.error('Download failed', err);
            alert(t('documents.download_error', 'Failed to download document'));
        }
    };

    const { width } = useWindowDimensions();

    // Responsive grid calculations
    // Mobile (< 768px): 1 column
    // Tablet (768px - 1024px): 2 columns
    // Desktop (> 1024px): 3 columns, or 4 for very large screens
    const getNumColumns = () => {
        if (width < 768) return 1;
        if (width < 1024) return 2;
        return 3;
    };

    const numColumns = getNumColumns();
    const gap = 24;
    // Calculate card width: (total width - (gaps)) / columns
    const cardWidth = Platform.OS === 'web'
        ? `calc(${100 / numColumns}% - ${(gap * (numColumns - 1)) / numColumns}px)`
        : `${100 / numColumns}%`;

    const renderFolders = () => (
        <View style={styles.grid}>
            {Object.entries(DOC_TYPES).map(([key, label]) => (
                <TouchableOpacity
                    key={key}
                    style={[styles.folderCard, { width: cardWidth as any }]}
                    onPress={() => setCurrentFolder(key)}
                >
                    <View style={styles.folderIconContainer}>
                        <Folder size={32} color="#0F172A" strokeWidth={1.5} />
                    </View>
                    <View style={styles.folderContent}>
                        <Text style={styles.folderTitle}>{label}</Text>
                        <Text style={styles.folderSubtitle}>{t('documents.click_to_view', 'View details')}</Text>
                    </View>
                    <View style={styles.arrowIcon}>
                        <ChevronRight size={16} color="#94A3B8" />
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const getFileIcon = (mimeType: string, filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();

        if (mimeType.includes('pdf') || ext === 'pdf') {
            return <FileText size={24} color="#EF4444" />; // Red for PDF
        }
        if (mimeType.includes('image') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
            return <ImageIcon size={24} color="#3B82F6" />; // Blue for Images
        }
        if (['doc', 'docx'].includes(ext || '') || mimeType.includes('word')) {
            return <FileText size={24} color="#2563EB" />; // Dark Blue for Word
        }
        if (['xls', 'xlsx'].includes(ext || '') || mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return <FileText size={24} color="#10B981" />; // Green for Excel
        }

        return <File size={24} color="#64748B" />; // Default Slate
    };

    const renderFiles = () => (
        <View>
            <View style={styles.actionBar}>
                <Button
                    variant="outline"
                    onPress={() => setCurrentFolder(null)}
                    icon={<ArrowLeft size={16} />}
                    title={t('common.back', 'Back')}
                    size="sm"
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ color: '#64748B' }}>{DOC_TYPES[currentFolder!]}</Text>
                    <Button
                        title={uploading ? t('common.uploading', 'Uploading...') : t('documents.upload_new', 'Upload New')}
                        icon={<CloudUpload size={16} />}
                        onPress={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    />
                </View>
            </View>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : documents.length === 0 ? (
                <View style={styles.emptyState}>
                    <FileText size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>{t('documents.no_files', 'No documents found in this folder')}</Text>
                </View>
            ) : (
                <View style={styles.fileList}>
                    {documents.map((doc) => (
                        <View key={doc.id} style={styles.fileItem}>
                            <View style={styles.fileIcon}>
                                {getFileIcon(doc.mimeType || '', doc.title || '')}
                            </View>
                            <View style={styles.fileDetails}>
                                <Text style={styles.fileName} numberOfLines={1}>{doc.title}</Text>
                                <Text style={styles.fileDate}>
                                    {new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleDownload(doc)}
                                style={styles.downloadButton}
                            >
                                <Download size={20} color="#3B82F6" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <Layout>
            <PageMeta
                title={`${t('header.documents', 'Documents')} | TrustTax`}
                description={t('documents.subtitle', 'Manage your documents')}
            />

            <View style={styles.container}>
                <View style={styles.header}>
                    <Text variant="h2">{t('header.documents', 'My Documents')}</Text>
                    <Text style={styles.subtitle}>
                        {t('documents.description', 'Access and manage your tax documents securely')}
                    </Text>
                </View>

                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <ScrollView showsVerticalScrollIndicator={false}>
                    {currentFolder ? renderFiles() : renderFolders()}
                </ScrollView>
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flex: 1,
        maxWidth: 1600, // Limit max width for ultra-wide screens
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 24,
    },
    subtitle: {
        color: '#64748B',
        marginTop: 8,
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    folderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 0, // Sharp corners
        padding: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 16,
        // Subtle hover effects handled via style changes if needed (React Native Web supports hover via Pressable in newer versions or CSS)
        // Clean, flat professional border
        shadowColor: 'transparent',
        height: 100,
    },
    folderIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#F8FAFC',
        borderRadius: 0, // Sharp square
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    folderContent: {
        flex: 1,
    },
    folderTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A', // Slate 900
        letterSpacing: -0.01,
    },
    folderSubtitle: {
        fontSize: 13,
        color: '#64748B', // Slate 500
        marginTop: 2,
    },
    arrowIcon: {
        opacity: 0.5,
    },
    actionBar: { // ... existing styles
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    centerBox: {
        padding: 48,
        alignItems: 'center',
    },
    emptyState: {
        padding: 64,
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 0, // No corners
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        gap: 16,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 16,
    },
    fileList: {
        gap: 12,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 0, // No corners
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    fileIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 0, // No corners
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: 4,
    },
    fileDate: {
        fontSize: 13,
        color: '#94A3B8',
    },
    downloadButton: {
        padding: 8,
        backgroundColor: '#EFF6FF',
        borderRadius: 0, // No corners
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 0, // No corners
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    errorText: {
        color: '#B91C1C',
    }
});

export default DocumentsPage;
