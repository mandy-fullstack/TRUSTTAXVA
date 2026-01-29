import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text } from '@trusttax/ui';
import { TrustTaxLogo } from '../../components/TrustTaxLogo';

interface CompleteProfileLayoutProps {
    children: React.ReactNode;
    currentStep: number;
    totalSteps: number;
    title: string;
    subtitle?: string;
}

export const CompleteProfileLayout: React.FC<CompleteProfileLayoutProps> = ({
    children,
    currentStep,
    totalSteps,
    title,
    subtitle,
}) => {
    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Elite Immersive Header - Synchronized with Main App */}
                <View style={styles.topBar}>
                    <View style={styles.brandGroup}>
                        <TrustTaxLogo size={24} bgColor="#0F172A" color="#FFFFFF" />
                        <Text style={styles.brandText}>TrustTax</Text>
                    </View>

                    <View style={styles.rightGroup}>
                        <View style={styles.progressSection}>
                            <Text style={styles.progressLabel}>STAGE {currentStep} OF {totalSteps}</Text>
                            <View style={styles.track}>
                                <View
                                    style={[
                                        styles.fill,
                                        { width: `${(currentStep / totalSteps) * 100}%` }
                                    ]}
                                />
                            </View>
                        </View>

                        {/* Language Selector */}
                        <View style={styles.langSelector}>
                            <Text style={styles.langText}>EN</Text>
                        </View>
                    </View>
                </View>

                {/* Immersion Frame */}
                <ScrollView
                    style={styles.main}
                    contentContainerStyle={styles.mainContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.frame}>
                        <View style={styles.frameHeader}>
                            <Text style={styles.frameTitle}>{title}</Text>
                            {subtitle && <Text style={styles.frameSubtitle}>{subtitle}</Text>}
                        </View>

                        <View style={styles.formArea}>
                            {children}
                        </View>
                    </View>
                </ScrollView>

                {/* Footer Signature */}
                <View style={styles.bottomBar}>
                    <Text style={styles.lockText}>PROPRIETARY ENCRYPTION ACTIVE // SECURE SESSION</Text>
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
    topBar: {
        height: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1.5,
        borderBottomColor: '#F1F5F9',
    },
    brandGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    brandText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.5,
        fontFamily: 'Inter',
    },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    rightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    langSelector: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 0,
    },
    langText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: 1,
        fontFamily: 'Inter',
    },
    progressLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
        fontFamily: 'Inter',
    },
    track: {
        width: 120,
        height: 4,
        backgroundColor: '#F1F5F9',
        borderRadius: 0,
    },
    fill: {
        height: '100%',
        backgroundColor: '#0F172A',
        borderRadius: 0,
    },
    main: {
        flex: 1,
    },
    mainContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    frame: {
        width: '100%',
        maxWidth: 520,
        paddingHorizontal: 32,
    },
    frameHeader: {
        marginBottom: 48,
    },
    frameTitle: {
        fontSize: 38,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
        lineHeight: 48,
        letterSpacing: -1,
        marginBottom: 12,
        fontFamily: 'Inter',
    },
    frameSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    formArea: {
        width: '100%',
    },
    bottomBar: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1.5,
        borderTopColor: '#F8FAFC',
    },
    lockText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#CBD5E1',
        letterSpacing: 2,
        fontFamily: 'Inter',
    },
});
