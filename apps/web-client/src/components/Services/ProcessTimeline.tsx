import { View, StyleSheet } from 'react-native';
import { FileText, Shield, Users, CheckCircle, Award, type LucideIcon } from 'lucide-react';
import { Card, H2, H4, Text } from '@trusttax/ui';

export interface ProcessStep {
    title: string;
    description: string;
    icon?: LucideIcon;
    color?: string;
}

interface ProcessTimelineProps {
    steps?: Array<{ title: string; description: string; }>;
}

const defaultSteps: ProcessStep[] = [
    {
        title: 'Submit Your Information',
        description: 'Complete our secure online questionnaire with your details.',
        icon: FileText,
        color: '#2563EB'
    },
    {
        title: 'Document Upload',
        description: 'Upload required documents through our encrypted portal.',
        icon: Shield,
        color: '#10B981'
    },
    {
        title: 'Expert Review',
        description: 'Our certified professionals review your submission.',
        icon: Users,
        color: '#F59E0B'
    },
    {
        title: 'Quality Check',
        description: 'Double verification ensures accuracy and compliance.',
        icon: CheckCircle,
        color: '#8B5CF6'
    },
    {
        title: 'Delivery & Support',
        description: 'Receive your completed service with ongoing support.',
        icon: Award,
        color: '#EF4444'
    },
];

export const ProcessTimeline = ({ steps }: ProcessTimelineProps) => {
    const displaySteps = steps && steps.length > 0
        ? steps.map((s, i) => ({
            ...s,
            icon: defaultSteps[i % defaultSteps.length].icon,
            color: defaultSteps[i % defaultSteps.length].color
        }))
        : defaultSteps;

    return (
        <View style={styles.section}>
            <H2 style={styles.sectionTitle}>Our Professional Process</H2>
            <Text style={styles.sectionSubtitle}>We follow a proven {displaySteps.length}-step process to ensure quality and accuracy</Text>
            <View style={styles.processTimeline}>
                {displaySteps.map((step, i) => {
                    const IconComponent = step.icon || FileText;
                    return (
                        <View key={i} style={styles.processStep}>
                            <View style={styles.processLeft}>
                                <View style={[styles.processIcon, { backgroundColor: `${step.color || '#2563EB'}15` }]}>
                                    <IconComponent size={24} color={step.color || '#2563EB'} />
                                </View>
                                {i < displaySteps.length - 1 && <View style={styles.processLine} />}
                            </View>
                            <Card style={styles.processCard} elevated>
                                <View style={styles.processNumber}>
                                    <Text style={styles.processNumberText}>{i + 1}</Text>
                                </View>
                                <H4 style={styles.processTitle}>{step.title}</H4>
                                <Text style={styles.processDesc}>{step.description}</Text>
                            </Card>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: { marginBottom: 80 },
    sectionTitle: { marginBottom: 8 },
    sectionSubtitle: { fontSize: 16, color: '#64748B', marginBottom: 32 },
    processTimeline: { gap: 0 },
    processStep: { flexDirection: 'row', gap: 20, marginBottom: 0 },
    processLeft: { alignItems: 'center', width: 60 },
    processIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    processLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
    processCard: { flex: 1, marginBottom: 24, position: 'relative' },
    processNumber: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    processNumberText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
    processTitle: { marginBottom: 8 },
    processDesc: { color: '#64748B', lineHeight: 20 },
});
