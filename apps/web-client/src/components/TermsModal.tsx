import { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, H2 } from '@trusttax/ui';
import { X, Shield, Lock, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
}

export const TermsModal = ({ isOpen, onClose, onAccept }: TermsModalProps) => {
    const { t } = useTranslation();

    // Prevenir scroll del body cuando está abierto
    useEffect(() => {
        if (!isOpen || Platform.OS !== 'web') return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    // Cerrar con Escape key
    useEffect(() => {
        if (!isOpen || Platform.OS !== 'web') return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const renderContent = () => (
        <>
            <div style={{ marginBottom: 24 }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: 12,
                }}>
                    <Shield size={20} color="#2563EB" />
                    <h3 style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#0F172A',
                        margin: 0,
                    }}>
                        {t('terms.data_protection', 'Data Protection & Encryption')}
                    </h3>
                </div>
                <p style={{
                    fontSize: 14,
                    lineHeight: '22px',
                    color: '#475569',
                    margin: 0,
                }}>
                    {t('terms.data_protection_text', 'Your sensitive personal information, including Social Security Number (SSN), driver\'s license number, and passport number, is protected using industry-standard AES-256-GCM encryption. This means your data is encrypted before being stored in our secure database and can only be decrypted by authorized personnel when necessary for tax preparation services.')}
                </p>
            </div>

            <div style={{ marginBottom: 24 }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: 12,
                }}>
                    <Lock size={20} color="#2563EB" />
                    <h3 style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#0F172A',
                        margin: 0,
                    }}>
                        {t('terms.security_measures', 'Security Measures')}
                    </h3>
                </div>
                <p style={{
                    fontSize: 14,
                    lineHeight: '22px',
                    color: '#475569',
                    margin: 0,
                }}>
                    {t('terms.security_measures_text', 'We implement multiple layers of security to protect your information: encryption at rest, secure transmission (HTTPS), access controls, and regular security audits. Your SSN is never displayed in full - only the last 4 digits are shown for verification purposes.')}
                </p>
            </div>

            <div style={{ marginBottom: 24 }}>
                <h3 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: '0 0 8px 0',
                }}>
                    {t('terms.data_usage', 'How We Use Your Information')}
                </h3>
                <p style={{
                    fontSize: 14,
                    lineHeight: '22px',
                    color: '#475569',
                    margin: 0,
                }}>
                    {t('terms.data_usage_text', 'Your personal information is used solely for the purpose of providing tax preparation and immigration services. We do not sell, rent, or share your information with third parties except as required by law or with your explicit consent.')}
                </p>
            </div>

            <div style={{ marginBottom: 24 }}>
                <h3 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    margin: '0 0 8px 0',
                }}>
                    {t('terms.your_rights', 'Your Rights')}
                </h3>
                <p style={{
                    fontSize: 14,
                    lineHeight: '22px',
                    color: '#475569',
                    margin: 0,
                }}>
                    {t('terms.your_rights_text', 'You have the right to access, update, or delete your personal information at any time. You can request a copy of your data or withdraw your consent by contacting our support team.')}
                </p>
            </div>

            <div style={{
                backgroundColor: '#FEF3C7',
                border: '1px solid #FDE68A',
                padding: 16,
                marginTop: 8,
                borderRadius: 0,
            }}>
                <p style={{
                    fontSize: 14,
                    lineHeight: '20px',
                    color: '#92400E',
                    fontWeight: 500,
                    margin: 0,
                }}>
                    {t('terms.important_note', 'By accepting these terms, you acknowledge that you have read and understood our data protection practices and consent to the secure storage and processing of your sensitive information for tax preparation purposes.')}
                </p>
            </div>
        </>
    );

    if (Platform.OS === 'web') {
        return (
            <>
                {/* Overlay - clickeable para cerrar */}
                <div
                    onClick={handleOverlayClick}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9998,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Modal como div nativo para mejor posicionamiento */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '90%',
                            maxWidth: 600,
                            maxHeight: '90vh',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 0,
                            border: '1px solid #E2E8F0',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px',
                            borderBottom: '1px solid #E2E8F0',
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '12px',
                                flex: 1,
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: '#EFF6FF',
                                    borderRadius: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #E2E8F0',
                                }}>
                                    <FileText size={24} color="#2563EB" />
                                </div>
                                <h2 style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: '#0F172A',
                                    margin: 0,
                                }}>
                                    {t('terms.title', 'Terms and Conditions')}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '4px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X size={20} color="#64748B" />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            maxHeight: 'calc(90vh - 200px)',
                            padding: '20px',
                        }}>
                            {renderContent()}
                        </div>

                        {/* Actions */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '12px',
                            padding: '20px',
                            borderTop: '1px solid #F1F5F9',
                            justifyContent: 'flex-end',
                        }}>
                            <button
                                onClick={onClose}
                                style={{
                                    minWidth: 120,
                                    height: 44,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 24px',
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 0,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#475569',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                {t('terms.decline', 'Decline')}
                            </button>
                            <button
                                onClick={onAccept}
                                style={{
                                    minWidth: 160,
                                    height: 44,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 32px',
                                    backgroundColor: '#2563EB',
                                    borderRadius: 0,
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#FFFFFF',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                {t('terms.accept', 'Accept Terms')}
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Versión React Native para móvil
    return (
        <>
            <View style={styles.modal}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.iconBox}>
                            <FileText size={24} color="#2563EB" />
                        </View>
                        <H2 style={styles.title}>
                            {t('terms.title', 'Terms and Conditions')}
                        </H2>
                    </View>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                        activeOpacity={0.7}
                    >
                        <X size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Shield size={20} color="#2563EB" />
                            <Text style={styles.sectionTitle}>
                                {t('terms.data_protection', 'Data Protection & Encryption')}
                            </Text>
                        </View>
                        <Text style={styles.text}>
                            {t('terms.data_protection_text', 'Your sensitive personal information, including Social Security Number (SSN), driver\'s license number, and passport number, is protected using industry-standard AES-256-GCM encryption. This means your data is encrypted before being stored in our secure database and can only be decrypted by authorized personnel when necessary for tax preparation services.')}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Lock size={20} color="#2563EB" />
                            <Text style={styles.sectionTitle}>
                                {t('terms.security_measures', 'Security Measures')}
                            </Text>
                        </View>
                        <Text style={styles.text}>
                            {t('terms.security_measures_text', 'We implement multiple layers of security to protect your information: encryption at rest, secure transmission (HTTPS), access controls, and regular security audits. Your SSN is never displayed in full - only the last 4 digits are shown for verification purposes.')}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('terms.data_usage', 'How We Use Your Information')}
                        </Text>
                        <Text style={styles.text}>
                            {t('terms.data_usage_text', 'Your personal information is used solely for the purpose of providing tax preparation and immigration services. We do not sell, rent, or share your information with third parties except as required by law or with your explicit consent.')}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t('terms.your_rights', 'Your Rights')}
                        </Text>
                        <Text style={styles.text}>
                            {t('terms.your_rights_text', 'You have the right to access, update, or delete your personal information at any time. You can request a copy of your data or withdraw your consent by contacting our support team.')}
                        </Text>
                    </View>

                    <View style={styles.importantBox}>
                        <Text style={styles.importantText}>
                            {t('terms.important_note', 'By accepting these terms, you acknowledge that you have read and understood our data protection practices and consent to the secure storage and processing of your sensitive information for tax preparation purposes.')}
                        </Text>
                    </View>
                </ScrollView>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.cancelButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelButtonText}>
                            {t('terms.decline', 'Decline')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onAccept}
                        style={styles.acceptButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.acceptButtonText}>
                            {t('terms.accept', 'Accept Terms')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    modal: {
        width: '90%',
        maxWidth: 600,
        maxHeight: '90vh',
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        zIndex: 9999,
        ...(Platform.OS === 'web' ? {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto',
        } : {}),
    } as any,
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
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
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
    },
    closeButton: {
        padding: 4,
        borderRadius: 0,
        ...(Platform.OS === 'web' ? {
            cursor: 'pointer',
        } : {}),
    } as any,
    scrollContent: {
        flex: 1,
        ...(Platform.OS === 'web' ? {
            maxHeight: 'calc(90vh - 200px)',
        } : {}),
    } as any,
    scrollInner: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        lineHeight: 22,
        color: '#475569',
    },
    importantBox: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        padding: 16,
        marginTop: 8,
        borderRadius: 0,
    },
    importantText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#92400E',
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        minWidth: 120,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        ...(Platform.OS === 'web' ? {
            cursor: 'pointer',
        } : {}),
    } as any,
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        letterSpacing: 0.5,
    },
    acceptButton: {
        minWidth: 160,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        backgroundColor: '#2563EB',
        borderRadius: 0,
        ...(Platform.OS === 'web' ? {
            cursor: 'pointer',
        } : {}),
    } as any,
    acceptButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});
