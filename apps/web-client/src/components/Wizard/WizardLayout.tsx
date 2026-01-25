import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Layout } from '../Layout';
import { H3, Text, Card } from '@trusttax/ui';
import { Check, ChevronRight } from 'lucide-react';

interface WizardLayoutProps {
    title: string;
    currentStep: number;
    totalSteps: number;
    steps: Array<{ id: string; title: string }>;
    children: React.ReactNode;
}

export const WizardLayout = ({ title, currentStep, totalSteps, steps, children }: WizardLayoutProps) => {
    return (
        <Layout>
            <View style={styles.container}>
                {/* Sidebar / Progress */}
                <View style={styles.sidebar}>
                    <Card elevated style={styles.progressCard}>
                        <H3 style={styles.sidebarTitle}>{title}</H3>
                        <View style={styles.stepsList}>
                            {steps.map((step, index) => {
                                const isActive = index === currentStep;
                                const isCompleted = index < currentStep;

                                return (
                                    <View key={step.id} style={styles.stepItem}>
                                        <View style={[styles.stepIcon, isActive && styles.stepIconActive, isCompleted && styles.stepIconCompleted]}>
                                            {isCompleted ? (
                                                <Check size={14} color="#FFF" />
                                            ) : (
                                                <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>{index + 1}</Text>
                                            )}
                                        </View>
                                        <Text style={[styles.stepLabel, isActive && styles.stepLabelActive, isCompleted && styles.stepLabelCompleted]}>
                                            {step.title}
                                        </Text>
                                        {index < steps.length - 1 && (
                                            <View style={styles.connectorLine}>
                                                <View style={[styles.line, isCompleted && styles.lineCompleted]} />
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    <Card elevated style={styles.contentCard}>
                        {children}
                    </Card>
                </View>
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', gap: 32, paddingVertical: 40, flexWrap: 'wrap' },
    sidebar: { width: 300, minWidth: 280 },
    sidebarTitle: { marginBottom: 24, fontSize: 20 },
    progressCard: { padding: 24 },
    stepsList: { gap: 0 }, // Gap handled by connector margin
    stepItem: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, position: 'relative' },
    stepIcon: { width: 28, height: 28, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E2E8F0', zIndex: 2 },
    stepIconActive: { borderColor: 'var(--primary-color, #2563EB)', backgroundColor: '#FFF' } as any,
    stepIconCompleted: { backgroundColor: 'var(--primary-color, #2563EB)', borderColor: 'var(--primary-color, #2563EB)' } as any,
    stepNumber: { fontSize: 12, fontWeight: '600', color: '#64748B' },
    stepNumberActive: { color: 'var(--primary-color, #2563EB)' } as any,
    stepLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    stepLabelActive: { color: '#0F172A', fontWeight: '700' },
    stepLabelCompleted: { color: '#0F172A' },
    connectorLine: { position: 'absolute', top: 38, left: 13, bottom: -10, width: 2, alignItems: 'center', zIndex: 1 }, // Connecting to next item
    line: { width: 2, height: 20, backgroundColor: '#E2E8F0' },
    lineCompleted: { backgroundColor: 'var(--primary-color, #2563EB)' } as any,
    content: { flex: 1, minWidth: 340 },
    contentCard: { padding: 40, minHeight: 500 }
});
