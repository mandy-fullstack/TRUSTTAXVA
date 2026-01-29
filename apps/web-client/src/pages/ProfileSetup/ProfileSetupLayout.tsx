import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ProfileSetupLayoutProps {
    children: React.ReactNode;
    currentStep: number;
    totalSteps: number;
    title: string;
    description?: string;
    onBack?: () => void;
    showBack?: boolean;
}

export const ProfileSetupLayout: React.FC<ProfileSetupLayoutProps> = ({
    children,
    currentStep,
    totalSteps,
    title,
    description,
}) => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Immersive Header - Minimalist */}
                <View style={styles.header}>
                    <Text style={styles.brand}>TRUSTTAX</Text>
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                            {t('wizard.step_count', { current: currentStep, total: totalSteps })}
                        </Text>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${(currentStep / totalSteps) * 100}%` }
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* Main Mission Frame */}
                <ScrollView
                    style={styles.contentScroll}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.missionFrame}>
                        <View style={styles.titleSection}>
                            <Text style={styles.missionTitle}>{title}</Text>
                            {description && <Text style={styles.missionDescription}>{description}</Text>}
                        </View>

                        <View style={styles.formContainer}>
                            {children}
                        </View>
                    </View>
                </ScrollView>

                {/* Subtle Modern Footer Decor */}
                <View style={styles.footerDecor}>
                    <Text style={styles.decorText}>AES-256 SECURED ENVIRONMENT</Text>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    brand: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0F172A',
        letterSpacing: 3,
    },
    progressContainer: {
        alignItems: 'flex-end',
        width: 120,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748B',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    progressBarBg: {
        width: '100%',
        height: 3,
        backgroundColor: '#F1F5F9',
        borderRadius: 0,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#0F172A',
        borderRadius: 0,
    },
    contentScroll: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    missionFrame: {
        width: '100%',
        maxWidth: 540,
        paddingHorizontal: 24,
    },
    titleSection: {
        marginBottom: 60,
        alignItems: 'center',
    },
    missionTitle: {
        fontSize: 42,
        fontWeight: '900',
        color: '#0F172A',
        textAlign: 'center',
        lineHeight: 52,
        letterSpacing: -1,
        marginBottom: 20,
    },
    missionDescription: {
        fontSize: 18,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 28,
        fontWeight: '500',
    },
    formContainer: {
        width: '100%',
    },
    footerDecor: {
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    decorText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 2,
    },
});
