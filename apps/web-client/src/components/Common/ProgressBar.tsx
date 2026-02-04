import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
    progress: number; // 0-100
    height?: number;
    color?: string;
    backgroundColor?: string;
    animated?: boolean;
}

export function ProgressBar({
    progress,
    height = 4,
    color = '#0F172A',
    backgroundColor = '#E2E8F0',
    animated = true,
}: ProgressBarProps) {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animated) {
            Animated.timing(animatedWidth, {
                toValue: progress,
                duration: 300,
                useNativeDriver: false,
            }).start();
        } else {
            animatedWidth.setValue(progress);
        }
    }, [progress, animated, animatedWidth]);

    const widthInterpolated = animatedWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { height, backgroundColor }]}>
            <Animated.View
                style={[
                    styles.fill,
                    {
                        height,
                        backgroundColor: color,
                        width: widthInterpolated,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
    },
});
