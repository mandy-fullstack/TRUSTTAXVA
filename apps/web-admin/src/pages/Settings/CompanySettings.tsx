import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { H1, Text } from '@trusttax/ui';
import { adminApi } from '../../services/adminApi';
import { Save, RotateCcw } from 'lucide-react';
import { Layout } from '../../components/Layout';

// Subcomponents
import { GeneralForm } from './components/GeneralForm';
import { ContactForm } from './components/ContactForm';
import { BrandForm } from './components/BrandForm';
import { SocialForm } from './components/SocialForm';
import { HoursForm } from './components/HoursForm';

export const CompanySettingsPage = () => {
    const [isLoading, setIsLoading] = useState(true);

    // State Objects
    const [general, setGeneral] = useState<any>({});
    const [themeOptions, setThemeOptions] = useState<any>({});
    const [hours, setHours] = useState<any[]>([]);

    // Helper to extract social entries
    const [socialLinks, setSocialLinks] = useState<any>({});

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await adminApi.getCompanyProfile();

            setGeneral({
                companyName: data.companyName || '',
                dba: data.dba || '',
                description: data.description || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                website: data.website || '',
                primaryColor: data.primaryColor || '#0F172A',
                secondaryColor: data.secondaryColor || '#2563EB',
                logoUrl: data.logoUrl || '',
                faviconUrl: data.faviconUrl || ''
            });

            setThemeOptions(data.themeOptions || {});

            if (Array.isArray(data.businessHours)) {
                setHours(data.businessHours);
            } else if (data.businessHours && typeof data.businessHours === 'object') {
                const legacy = [];
                if (data.businessHours.weekdays) legacy.push({ id: '1', label: 'Mon-Fri', value: data.businessHours.weekdays });
                if (data.businessHours.saturday) legacy.push({ id: '2', label: 'Saturday', value: data.businessHours.saturday });
                if (data.businessHours.sunday) legacy.push({ id: '3', label: 'Sunday', value: data.businessHours.sunday });
                setHours(legacy.length ? legacy : [{ id: '1', label: 'Mon-Fri', value: '9-5' }]);
            } else {
                setHours([{ id: '1', label: 'Mon-Fri', value: '9:00 AM - 5:00 PM' }]);
            }

            setSocialLinks(data.socialLinks || {});

        } catch (err) {
            console.error('Failed to load profile', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all settings to the default professional theme? This will discard your current changes.')) {
            setGeneral({
                companyName: 'Trust Tax Services',
                dba: '',
                description: 'Professional Tax Preparation & Immigration Services.',
                email: 'contact@trusttax.com',
                phone: '(555) 123-4567',
                address: '',
                website: '',
                primaryColor: '#0F172A',
                secondaryColor: '#2563EB',
                logoUrl: '',
                faviconUrl: ''
            });

            setThemeOptions({
                background: '#FFFFFF',
                surface: '#F8FAFC',
                textMain: '#0F172A',
                accent: '#F59E0B',
                success: '#10B981',
                error: '#EF4444',
                warning: '#F59E0B'
            });

            setHours([{ id: '1', label: 'Mon-Fri', value: '9:00 AM - 5:00 PM' }]);
            setSocialLinks({});
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...general, // spread root fields
                socialLinks,
                businessHours: hours, // Save as Array now
                themeOptions
            };

            await adminApi.updateCompanyProfile(payload);
            alert('Settings saved successfully!');
        } catch (err: any) {
            alert('Failed to save settings: ' + err.message);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <View style={styles.center}><ActivityIndicator size="large" color="#0F172A" /></View>
            </Layout>
        );
    }

    return (
        <Layout>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.headerRow}>
                    <View>
                        <H1>Company Settings</H1>
                        <Text style={styles.subtitle}>Manage your public profile, appearance, and schedule.</Text>
                    </View>
                    <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                        <RotateCcw size={16} color="#64748B" />
                        <Text style={styles.resetText}>Reset Defaults</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    {/* LEFT COL */}
                    <View style={styles.col}>
                        <GeneralForm
                            data={general}
                            onChange={(f, v) => setGeneral({ ...general, [f]: v })}
                        />
                        <ContactForm
                            data={general}
                            onChange={(f, v) => setGeneral({ ...general, [f]: v })}
                        />
                        <HoursForm
                            hours={hours}
                            onChange={setHours}
                        />
                    </View>

                    {/* RIGHT COL */}
                    <View style={styles.col}>
                        <BrandForm
                            data={general}
                            themeOptions={themeOptions}
                            onChange={(f, v) => setGeneral({ ...general, [f]: v })}
                            onThemeChange={(f, v) => setThemeOptions({ ...themeOptions, [f]: v })}
                        />
                        <SocialForm
                            links={socialLinks}
                            onChange={(f, v) => setSocialLinks({ ...socialLinks, [f]: v })}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.fab} onPress={handleSave}>
                    <Save size={24} color="#FFF" />
                    <Text style={styles.fabText}>Save Changes</Text>
                </TouchableOpacity>

            </ScrollView>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 32 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
    subtitle: { color: '#64748B', fontSize: 16, marginTop: 8 },

    resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    resetText: { fontSize: 13, fontWeight: '600', color: '#64748B' },

    grid: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
    col: { flex: 1, minWidth: 400, gap: 24 },

    fab: { position: 'absolute', bottom: 32, right: 32, backgroundColor: '#0F172A', flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 50, gap: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
    fabText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});
