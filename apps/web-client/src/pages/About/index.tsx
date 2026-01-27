import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, H1, H2 } from '@trusttax/ui';
import { PublicLayout } from '../../components/PublicLayout';
import { useCompany } from '../../context/CompanyContext';
import { PageMeta } from '../../components/PageMeta';

export const AboutPage = () => {
    const { t } = useTranslation();
    const { profile } = useCompany();
    const companyName = profile?.companyName || 'TrustTax';

    return (
        <PublicLayout>
            <PageMeta
                title={t('about.title', { companyName, defaultValue: `About ${companyName} | TrustTax` })}
                description={profile?.description || t('about.description', 'Our mission is to simplify complex financial and immigration processes for individuals and businesses.')}
            />
            <View style={styles.header}>
                <H1 style={styles.title}>{t('about.page_title', { companyName, defaultValue: `About ${companyName}` })}</H1>
                <Text style={styles.subtitle}>{profile?.description || t('about.subtitle', 'Our mission is to simplify complex financial and immigration processes for individuals and businesses.')}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <H2 style={styles.sectionTitle}>{t('about.who_we_are', 'Who We Are')}</H2>
                    <Text style={styles.paragraph}>
                        {t('about.paragraph1', { companyName, defaultValue: `${companyName} is a premier consulting firm based in Virginia, specializing in tax preparation, business formation, and immigration services. Founded with a vision to provide accessible, expert advice, we have served thousands of clients, helping them navigate bureaucracy with confidence.` })}
                    </Text>
                    <Text style={styles.paragraph}>
                        {t('about.paragraph2', 'Our team allows us to serve a diverse community, ensuring that language barriers never stand in the way of your financial success.')}
                    </Text>
                </View>

                {/* Team Section could go here */}
            </View>
        </PublicLayout>
    );
};

const styles = StyleSheet.create({
    header: { paddingVertical: 96, paddingHorizontal: 24, backgroundColor: '#F8FAFC', alignItems: 'center' },
    title: { fontSize: 48, fontWeight: '300', color: '#0F172A', marginBottom: 24, textAlign: 'center', letterSpacing: -1 } as any,
    subtitle: { fontSize: 20, color: '#64748B', maxWidth: 700, textAlign: 'center', lineHeight: 32, fontWeight: '300' },
    content: { paddingVertical: 80, paddingHorizontal: 24, maxWidth: 900, marginHorizontal: 'auto' },
    section: { marginBottom: 64 },
    sectionTitle: { fontSize: 32, fontWeight: '300', color: '#0F172A', marginBottom: 24, letterSpacing: -0.5 } as any,
    paragraph: { fontSize: 18, color: '#334155', lineHeight: 30, marginBottom: 24, fontWeight: '300' }
});
