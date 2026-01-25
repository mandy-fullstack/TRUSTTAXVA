import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '@trusttax/ui';

interface DashboardLoadingProps {
    error?: string | null;
}

export const DashboardLoading = ({ error }: DashboardLoadingProps) => {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
            {error != null && error !== '' && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 280,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
});
