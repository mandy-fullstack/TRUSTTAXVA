import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface LoadingSpinnerProps {
    size?: number;
    color?: string;
    thickness?: number;
}

export function LoadingSpinner({
    size = 24,
    color = '#0F172A',
    thickness = 3
}: LoadingSpinnerProps) {
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        animation.start();
        return () => animation.stop();
    }, [spinValue]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Animated.View
                style={[
                    styles.spinner,
                    {
                        width: size,
                        height: size,
                        borderWidth: thickness,
                        borderColor: `${color}20`,
                        borderTopColor: color,
                        transform: [{ rotate: spin }],
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        borderRadius: 9999,
    },
});
