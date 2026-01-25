import { View, StyleSheet } from 'react-native';
import { Text } from '@trusttax/ui';

interface TrustTaxLogoProps {
    size?: number;
    color?: string;
    bgColor?: string;
}

/**
 * TrustTaxLogo - A professional, 100% square SVG-based logo component.
 * Minimalist design featuring a bold 'T' in a perfect square.
 */
export const TrustTaxLogo = ({
    size = 40,
    color = '#FFFFFF',
    bgColor = '#0F172A'
}: TrustTaxLogoProps) => {
    return (
        <View style={[
            styles.container,
            {
                width: size,
                height: size,
                backgroundColor: bgColor
            }
        ]}>
            <Text style={[
                styles.text,
                {
                    color: color,
                    fontSize: size * 0.6,
                    lineHeight: size
                }
            ]}>
                T
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        // Forced 100% square with no rounding as requested
        borderRadius: 0,
    },
    text: {
        fontWeight: '900',
        fontFamily: 'System', // Uses the cleanest system sans-serif
        textAlign: 'center',
    }
});
