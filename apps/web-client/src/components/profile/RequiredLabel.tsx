import { StyleSheet } from 'react-native';
import { Text } from '@trusttax/ui';

interface RequiredLabelProps {
    children: string;
    required?: boolean;
    style?: any;
}

/**
 * Label con asterisco rojo para campos obligatorios.
 */
export const RequiredLabel = ({ children, required, style }: RequiredLabelProps) => (
    <Text style={[styles.label, style]}>
        {children}
        {required && <Text style={styles.asterisk}> *</Text>}
    </Text>
);

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    asterisk: {
        color: '#DC2626',
    },
});
