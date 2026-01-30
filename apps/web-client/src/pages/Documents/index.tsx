import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, useWindowDimensions, TextInput } from 'react-native';
import { Layout } from '../../components/Layout';
import { Text, Button } from '@trusttax/ui';
import { Folder, FileText, CloudUpload, ChevronRight, ArrowLeft, Download, Image as ImageIcon, File, User, Shield, Search, Info, Clock, Hash, Trash2, Edit2, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { PageMeta } from '../../components/PageMeta';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { RenameModal } from '../../components/RenameModal';

export const DocumentsPage = () => {
    const { t } = useTranslation();
    const [currentGroup, setCurrentGroup] = useState<string | null>(null);
    const [allDocuments, setAllDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    useEffect(() => {
        fetchAllDocuments();
    }, []);

    const fetchAllDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            const docs = await api.getDocuments({});
            setAllDocuments(docs);
        } catch (err) {
            console.error('Failed to fetch documents', err);
            setError(t('documents.load_error', 'Failed to load documents'));
        } finally {
            setLoading(false);
        }
    };

    const getGroupDocs = (group: string) => {
        return allDocuments.filter(doc => {
            const type = (doc.type || 'OTHER').toUpperCase();
            if (group === 'IDENTITY') {
                return type.includes('LICENSE') ||
                    type.includes('PASSPORT') ||
                    type === 'SSN' ||
                    type.includes('ID') ||
                    type === 'DRIVER_LICENSE';
            }
            if (group === 'TAX') return type.includes('TAX') || type.includes('W2') || type.includes('PAYSTUB');
            if (group === 'LEGAL') return type.includes('AGREEMENT') || type.includes('FORM');
            return !type.includes('LICENSE') && !type.includes('PASSPORT') && type !== 'SSN' && !type.includes('ID') &&
                !type.includes('TAX') && !type.includes('W2') && !type.includes('PAYSTUB') &&
                !type.includes('AGREEMENT') && !type.includes('FORM') && type !== 'DRIVER_LICENSE';
        });
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentGroup) return;

        setUploading(true);
        try {
            let defaultType = 'OTHER';
            if (currentGroup === 'IDENTITY') defaultType = 'ID_CARD';
            if (currentGroup === 'TAX') defaultType = 'TAX_FORM';
            if (currentGroup === 'LEGAL') defaultType = 'LEGAL_DOCUMENT';

            await api.uploadDocument(file, file.name, defaultType);
            fetchAllDocuments();
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
            if (doc.url) {
                const fullUrl = doc.url.startsWith('http') ? doc.url : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${doc.url}`;
                window.open(fullUrl, '_blank');
            }
        } catch (err) {
            console.error('Download failed', err);
            alert(t('documents.download_error', 'Failed to download document'));
        }
    };

    const handleDeleteClick = (doc: any) => {
        setSelectedDoc(doc);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedDoc) return;
        const { id } = selectedDoc;

        try {
            setProcessingId(id);
            await api.deleteDocument(id);
            fetchAllDocuments();
        } catch (err) {
            console.error('Delete failed', err);
            alert(t('documents.delete_error', 'Failed to delete document'));
        } finally {
            setProcessingId(null);
            setDeleteModalOpen(false);
            setSelectedDoc(null);
        }
    };

    const handleRenameClick = (doc: any) => {
        setSelectedDoc(doc);
        setRenameModalOpen(true);
    };

    const confirmRename = async (newTitle: string) => {
        if (!selectedDoc) return;
        const { id } = selectedDoc;

        try {
            setProcessingId(id);
            await api.renameDocument(id, newTitle);
            fetchAllDocuments();
        } catch (err) {
            console.error('Rename failed', err);
            alert(t('documents.rename_error', 'Failed to rename document'));
        } finally {
            setProcessingId(null);
            setRenameModalOpen(false);
            setSelectedDoc(null);
        }
    };

    const handlePreview = (doc: any) => {
        if (doc.url) {
            const fullUrl = doc.url.startsWith('http') ? doc.url : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${doc.url}`;
            window.open(fullUrl, '_blank');
        }
    };

    const getNumColumns = () => {
        if (width < 640) return 1;
        return 2;
    };

    const numColumns = getNumColumns();
    const gap = isMobile ? 12 : 24;
    const cardWidth = Platform.OS === 'web'
        ? `calc(${100 / numColumns}% - ${(gap * (numColumns - 1)) / numColumns}px)`
        : `${100 / numColumns}%`;

    const FOLDERS = [
        { id: 'IDENTITY', label: t('documents.folders.identity', 'Identity Documents'), subtitle: 'Passport, ID, SSN', icon: <User size={isMobile ? 24 : 32} color="#0F172A" /> },
        { id: 'TAX', label: t('documents.folders.tax', 'Tax Returns & Filings'), subtitle: 'W-2, 1099, Returns', icon: <FileText size={isMobile ? 24 : 32} color="#0F172A" /> },
        { id: 'LEGAL', label: t('documents.folders.legal', 'Legal & Agreements'), subtitle: 'Contracts, Forms', icon: <Shield size={isMobile ? 24 : 32} color="#0F172A" /> },
        { id: 'OTHER', label: t('documents.folders.general', 'General & Uploads'), subtitle: 'Receipts, Other', icon: <Folder size={isMobile ? 24 : 32} color="#0F172A" /> },
    ];

    const getFileIcon = (mimeType: string, filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (mimeType.includes('pdf') || ext === 'pdf') return <FileText size={24} color="#EF4444" />;
        if (mimeType.includes('image') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return <ImageIcon size={24} color="#3B82F6" />;
        if (['doc', 'docx'].includes(ext || '') || mimeType.includes('word')) return <FileText size={24} color="#2563EB" />;
        if (['xls', 'xlsx'].includes(ext || '') || mimeType.includes('excel')) return <FileText size={24} color="#10B981" />;
        return <File size={24} color="#64748B" />;
    };

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={[styles.searchWrapper, isSearchFocused && styles.searchWrapperFocused]}>
                <Search size={20} color={isSearchFocused ? '#0F172A' : '#94A3B8'} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('documents.search_placeholder', 'Search documents, types, or dates...')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
            </View>

            {isSearchFocused && searchQuery.length === 0 && (
                <View style={styles.recommendationPanel}>
                    <Text style={styles.recommendationTitle}>RECENTLY ACCESSED</Text>
                    {allDocuments.slice(0, 3).map((doc) => (
                        <TouchableOpacity key={doc.id} style={styles.recItem} onPress={() => {
                            setSearchQuery(doc.title);
                            setIsSearchFocused(false);
                        }}>
                            <Clock size={14} color="#94A3B8" />
                            <Text style={styles.recText}>{doc.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    const renderFolders = () => (
        <View>
            {renderSearchBar()}
            <View style={[styles.grid, { gap }]}>
                {FOLDERS.map((folder) => {
                    const docs = getGroupDocs(folder.id);
                    return (
                        <TouchableOpacity
                            key={folder.id}
                            activeOpacity={0.7}
                            style={[styles.folderCard, { width: cardWidth as any }]}
                            onPress={() => setCurrentGroup(folder.id)}
                        >
                            <View style={styles.folderIconContainer}>{folder.icon}</View>
                            <View style={styles.folderContent}>
                                <Text style={styles.folderTitle}>{folder.label}</Text>
                                <Text style={styles.folderSubtitle}>{docs.length} {t('documents.files', 'files')}</Text>
                            </View>
                            <ChevronRight size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderFiles = () => {
        const groupDocs = getGroupDocs(currentGroup!);
        const folderInfo = FOLDERS.find(f => f.id === currentGroup);
        const folderSize = groupDocs.reduce((acc, doc) => acc + (doc.size || 0), 0);

        return (
            <View>
                <View style={styles.folderDetailsHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setCurrentGroup(null)}>
                        <ArrowLeft size={18} color="#0F172A" />
                        <Text style={styles.backText}>{t('common.back', 'Folders')}</Text>
                    </TouchableOpacity>

                    <View style={styles.folderStats}>
                        <View style={[styles.statItem, isMobile && { display: 'none' }]}>
                            <Hash size={16} color="#64748B" />
                            <Text style={styles.statText}>{groupDocs.length} Documents</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Info size={16} color="#64748B" />
                            <Text style={styles.statText}>{(folderSize / 1024 / 1024).toFixed(2)} MB Total</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.folderHero, isMobile && { padding: 20, flexDirection: 'column', alignItems: 'flex-start', gap: 16 }]}>
                    <View>
                        <Text style={[styles.folderHeroTitle, isMobile && { fontSize: 20 }]}>{folderInfo?.label}</Text>
                        <Text style={styles.folderHeroSubtitle}>{folderInfo?.subtitle}</Text>
                    </View>
                    <Button
                        title={uploading ? t('common.uploading', 'Uploading...') : t('common.upload', 'Add New')}
                        icon={<CloudUpload size={18} color="#0F172A" />}
                        onPress={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={[styles.uploadBtnHero, isMobile && { width: '100%' }]}
                        textStyle={{ color: '#0F172A' }}
                        size={isMobile ? 'sm' : 'md'}
                    />
                </View>

                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />

                {groupDocs.length === 0 ? (
                    <TouchableOpacity style={styles.emptyStateContainer} onPress={() => fileInputRef.current?.click()}>
                        <CloudUpload size={48} color="#CBD5E1" />
                        <Text style={styles.emptyStateTitle}>No documents here yet</Text>
                        <Text style={styles.emptyStateSubtitle}>Click to upload your first {folderInfo?.label.toLowerCase()}</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.fileList}>
                        {groupDocs.map((doc) => (
                            <View key={doc.id} style={styles.fileCard}>
                                <View style={[styles.fileIconBox, isMobile && { width: 40, height: 40 }]}>
                                    {getFileIcon(doc.mimeType || '', doc.title || '')}
                                </View>
                                <View style={styles.fileMain}>
                                    <Text style={[styles.fileCardName, isMobile && { fontSize: 13 }]} numberOfLines={1}>{doc.title}</Text>
                                    <View style={styles.fileMeta}>
                                        <Text style={styles.fileMetaText}>
                                            {new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()}
                                        </Text>
                                        <View style={styles.metaDivider} />
                                        <Text style={styles.fileMetaText}>{(doc.size / 1024).toFixed(0)} KB</Text>
                                        {!isMobile && (
                                            <>
                                                <View style={styles.metaDivider} />
                                                <Text style={[styles.fileTag, { backgroundColor: '#F0F9FF', color: '#0369A1' }]}>
                                                    {doc.type?.replace(/_/g, ' ') || 'OTHER'}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.fileActions}>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handlePreview(doc)} disabled={!!processingId}>
                                        <Eye size={20} color={processingId ? "#94A3B8" : "#0F172A"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDownload(doc)} disabled={!!processingId}>
                                        <Download size={20} color={processingId ? "#94A3B8" : "#0F172A"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleRenameClick(doc)} disabled={!!processingId}>
                                        {processingId === doc.id ? <ActivityIndicator size="small" color="#0F172A" /> : <Edit2 size={18} color="#0F172A" />}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteClick(doc)} disabled={!!processingId}>
                                        {processingId === doc.id ? <ActivityIndicator size="small" color="#EF4444" /> : <Trash2 size={20} color="#EF4444" />}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const renderSearchResults = () => {
        const filtered = allDocuments.filter(doc =>
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.type && doc.type.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return (
            <View>
                {renderSearchBar()}
                <View style={styles.searchHeader}>
                    <Text style={styles.searchResultCount}>
                        Found {filtered.length} results for "{searchQuery}"
                    </Text>
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={styles.cancelSearch}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.fileList}>
                    {filtered.map((doc) => (
                        <View key={doc.id} style={styles.fileCard}>
                            <View style={styles.fileIconBox}>{getFileIcon(doc.mimeType || '', doc.title || '')}</View>
                            <View style={styles.fileMain}>
                                <Text style={styles.fileCardName}>{doc.title}</Text>
                                <Text style={styles.fileMetaText}>{new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()} • {(doc.size / 1024).toFixed(0)} KB</Text>
                            </View>
                            <View style={styles.fileActions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => handlePreview(doc)} disabled={!!processingId}>
                                    <Eye size={20} color={processingId ? "#94A3B8" : "#0F172A"} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDownload(doc)} disabled={!!processingId}>
                                    <Download size={20} color={processingId ? "#94A3B8" : "#0F172A"} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => handleRenameClick(doc)} disabled={!!processingId}>
                                    {processingId === doc.id ? <ActivityIndicator size="small" color="#0F172A" /> : <Edit2 size={18} color="#0F172A" />}
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteClick(doc)} disabled={!!processingId}>
                                    {processingId === doc.id ? <ActivityIndicator size="small" color="#EF4444" /> : <Trash2 size={20} color="#EF4444" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <Layout>
            <PageMeta title={`${t('header.documents', 'Documents')} | TrustTax`} description="Manage your documents securely" />
            <View style={[styles.container, isMobile && { padding: 16 }]}>
                <View style={styles.mainHeader}>
                    <View>
                        <Text variant="h2" style={[styles.pageTitle, isMobile && { fontSize: 24 }]}>{t('header.documents', 'Vault')}</Text>
                        <Text style={styles.pageSubtitle}>Secured document management with end-to-end encryption</Text>
                    </View>
                    {!isMobile && (
                        <View style={styles.vaultStats}>
                            <Shield size={20} color="#10B981" />
                            <Text style={styles.vaultStatsText}>ENCRYPTED STORE</Text>
                        </View>
                    )}
                </View>

                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                    {loading ? (
                        <View style={styles.centerBox}><ActivityIndicator size="large" color="#0F172A" /></View>
                    ) : searchQuery ? renderSearchResults() : currentGroup ? renderFiles() : renderFolders()}
                </ScrollView>
            </View>

            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setSelectedDoc(null); }}
                onConfirm={confirmDelete}
                title={t('documents.delete_confirm_title', 'Delete Document')}
                message={t('documents.delete_confirm_msg', `Are you sure you want to delete "${selectedDoc?.title || ''}"? This action cannot be undone.`)}
                confirmText={t('common.delete', 'Delete')}
                variant="danger"
            />

            <RenameModal
                isOpen={renameModalOpen}
                onClose={() => { setRenameModalOpen(false); setSelectedDoc(null); }}
                onRename={confirmRename}
                currentName={selectedDoc?.title || ''}
                title={t('documents.rename_title', 'Rename Document')}
            />
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { padding: 40, flex: 1, maxWidth: 1100, alignSelf: 'center', width: '100%' },
    mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 },
    pageTitle: { color: '#0F172A', fontWeight: '800', letterSpacing: -0.5 },
    pageSubtitle: { color: '#64748B', fontSize: 13, marginTop: 4 },
    vaultStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    vaultStatsText: { color: '#065F46', fontWeight: '700', fontSize: 11, letterSpacing: 1 },

    searchContainer: { marginBottom: 32, zIndex: 10 },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, height: 52, borderRadius: 0 },
    searchWrapperFocused: { borderColor: '#0F172A' },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, fontSize: 16, color: '#0F172A', outlineStyle: 'none' } as any,
    recommendationPanel: { position: 'absolute', top: 54, left: 0, right: 0, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#0F172A', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, zIndex: 100 },
    recommendationTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 12, letterSpacing: 1 },
    recItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
    recText: { fontSize: 14, color: '#475569', fontWeight: '500' },

    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    folderCard: { backgroundColor: '#FFFFFF', padding: 24, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', height: 90, borderRadius: 0 },
    folderIconContainer: { width: 44, height: 44, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    folderContent: { flex: 1 },
    folderTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
    folderSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '600' },

    folderDetailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    backText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
    folderStats: { flexDirection: 'row', gap: 20 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { fontSize: 12, color: '#64748B', fontWeight: '700' },

    folderHero: { backgroundColor: '#0F172A', padding: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    folderHeroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
    folderHeroSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
    uploadBtnHero: { backgroundColor: '#FFFFFF' },

    emptyStateContainer: { alignItems: 'center', justifyContent: 'center', padding: 60, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
    emptyStateTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 16 },
    emptyStateSubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 4 },

    fileList: { gap: 4 },
    fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    fileIconBox: { width: 48, height: 48, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    fileMain: { flex: 1 },
    fileCardName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
    fileMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10 },
    fileMetaText: { fontSize: 11, color: '#64748B', fontWeight: '700' },
    metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' },
    fileTag: { fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2 },
    fileActions: { flexDirection: 'row', gap: 1 },
    actionBtn: { padding: 12, backgroundColor: '#F8FAFC' },
    deleteBtn: { backgroundColor: '#FEF2F2' },

    searchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    searchResultCount: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
    cancelSearch: { fontSize: 13, fontWeight: '700', color: '#EB4444' },

    centerBox: { padding: 100, alignItems: 'center' },
    errorBox: { backgroundColor: '#FFF1F2', padding: 16, marginBottom: 32, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
    errorText: { color: '#B91C1C', fontWeight: '600' }
});

export default DocumentsPage;
