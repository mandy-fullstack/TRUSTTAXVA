import type { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, type DimensionValue } from 'react-native';
import { useCompany } from '../context/CompanyContext';
import { Footer } from './Footer';
import { Header } from './Header';

interface PublicLayoutProps {
    children: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
    const { profile } = useCompany();
    const theme = profile?.themeOptions || {};

    return (
        <View style={[styles.container, { backgroundColor: theme.background || '#FFF' }]}>
            <Header />

            {/* Content Section */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {children}
                <Footer />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        minHeight: '100vh' as DimensionValue,
        backgroundColor: '#FFF'
    },
    content: {
        flex: 1,
        width: '100%'
    }
});
