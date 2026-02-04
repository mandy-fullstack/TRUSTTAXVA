import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number;
    style?: any;
}

export function SkeletonLoader({ width = '100%', height = 20, style }: SkeletonLoaderProps) {
    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [shimmerValue]);

    const opacity = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    opacity,
                },
                style,
            ]}
        />
    );
}

export function SkeletonDocumentRow() {
    return (
        <View style={styles.row}>
            <View style={{ flex: 1, gap: 8 }}>
                <SkeletonLoader height={16} width="60%" />
                <SkeletonLoader height={12} width="40%" />
            </View>
            <SkeletonLoader height={32} width={80} />
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E2E8F0',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 10,
        gap: 12,
    },
});
