import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, H1, H2 } from '@trusttax/ui';
import { PublicLayout } from '../../components/PublicLayout';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export const ContactPage = () => {
    const { profile } = useCompany();

    return (
        <PublicLayout>
            <View style={styles.header}>
                <H1 style={styles.title}>Contact Us</H1>
                <Text style={styles.subtitle}>Have questions? We're here to help.</Text>
            </View>

            <View style={styles.container}>
                <View style={styles.grid}>
                    <View style={styles.infoCol}>
                        <H2 style={styles.colTitle}>Get in Touch</H2>
                        <Text style={styles.desc}>Fill out the form or reach us directly at the contact points below.</Text>

                        <View style={styles.contactItem}>
                            <View style={styles.iconBox}><Phone size={20} color="var(--primary-color)" /></View>
                            <View>
                                <Text style={styles.contactLabel}>Phone</Text>
                                <Text style={styles.contactValue}>{profile?.phone || '(555) 123-4567'}</Text>
                            </View>
                        </View>

                        <View style={styles.contactItem}>
                            <View style={styles.iconBox}><Mail size={20} color="var(--primary-color)" /></View>
                            <View>
                                <Text style={styles.contactLabel}>Email</Text>
                                <Text style={styles.contactValue}>{profile?.email || 'contact@trusttax.com'}</Text>
                            </View>
                        </View>

                        <View style={styles.contactItem}>
                            <View style={styles.iconBox}><MapPin size={20} color="var(--primary-color)" /></View>
                            <View>
                                <Text style={styles.contactLabel}>Office</Text>
                                <Text style={styles.contactValue}>{profile?.address || '123 Business Ave, VA 22030'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.formCol}>
                        <View style={styles.formCard}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Name</Text>
                                <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#94A3B8" />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor="#94A3B8" />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Message</Text>
                                <TextInput style={[styles.input, styles.textArea]} placeholder="How can we help?" placeholderTextColor="#94A3B8" multiline numberOfLines={4} />
                            </View>
                            <TouchableOpacity style={styles.submitButton}>
                                <Text style={styles.submitText}>Send Message</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </PublicLayout>
    );
};

const styles = StyleSheet.create({
    header: { paddingVertical: 96, paddingHorizontal: 24, backgroundColor: '#0F172A', alignItems: 'center' } as any,
    title: { fontSize: 48, fontWeight: '300', color: '#FFF', marginBottom: 16, textAlign: 'center', letterSpacing: -1 },
    subtitle: { fontSize: 20, color: '#94A3B8', textAlign: 'center', fontWeight: '300' },

    container: { paddingVertical: 80, paddingHorizontal: 24, maxWidth: 1200, marginHorizontal: 'auto', width: '100%' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 64 },
    infoCol: { flex: 1, minWidth: 300 },
    formCol: { flex: 1, minWidth: 300 },

    colTitle: { fontSize: 32, fontWeight: '300', color: '#0F172A', marginBottom: 16, letterSpacing: -0.5 } as any,
    desc: { fontSize: 16, color: '#64748B', lineHeight: 26, marginBottom: 48, fontWeight: '300' },

    contactItem: { flexDirection: 'row', gap: 20, marginBottom: 40 },
    iconBox: { width: 48, height: 48, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' } as any,
    contactLabel: { fontSize: 14, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    contactValue: { fontSize: 18, fontWeight: '400', color: '#0F172A' } as any,

    formCard: { backgroundColor: '#FFF', padding: 40, borderWidth: 1, borderColor: '#E2E8F0' },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, letterSpacing: 0.2 },
    input: { height: 50, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 16, color: '#0F172A', fontSize: 16, backgroundColor: '#F8FAFC' },
    textArea: { height: 140, paddingTop: 16, textAlignVertical: 'top' },
    submitButton: { backgroundColor: '#0F172A', height: 56, alignItems: 'center', justifyContent: 'center' } as any,
    submitText: { color: '#FFF', fontWeight: '600', fontSize: 16, letterSpacing: 0.5 }
});
