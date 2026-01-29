import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Text, Button } from '@trusttax/ui';
import { Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CookieConsent = () => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [slideAnim] = useState(new Animated.Value(100)); // Start off-screen

    useEffect(() => {
        // Check if user has already consented
        const consented = localStorage.getItem('cookie_consent');
        if (!consented) {
            // Small delay for smooth entrance
            setTimeout(() => {
                setVisible(true);
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8
                }).start();
            }, 1000);
        }
    }, [slideAnim]);

    const handleAccept = () => {
        // Save consent
        localStorage.setItem('cookie_consent', 'true');

        // Animate out
        Animated.timing(slideAnim, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            setVisible(false);
        });
    };

    if (!visible) return null;

    if (Platform.OS === 'web') {
        const AnimatedView = Animated.View;

        return (
            <div style={{
                position: 'fixed',
                bottom: 24,
                left: 24,
                right: 24,
                maxWidth: 480,
                zIndex: 9999,
                margin: '0 auto', // Center on mobile if needed, but left aligned looks pro
            }}>
                <AnimatedView style={[
                    styles.container,
                    { transform: [{ translateY: slideAnim }] }
                ]}>
                    <View style={styles.content}>
                        <View style={styles.iconBox}>
                            <Cookie size={24} color="#D97706" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>
                                {t('cookies.title', 'We value your privacy')}
                            </Text>
                            <Text style={styles.message}>
                                {t('cookies.message', 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. Your session data is securely stored for your convenience.')}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleAccept} activeOpacity={0.7}>
                            <Text style={styles.policyLink}>
                                {t('cookies.policy', 'Privacy Policy')}
                            </Text>
                        </TouchableOpacity>
                        <Button
                            title={t('cookies.accept', 'Accept All')}
                            onPress={handleAccept}
                            variant="primary"
                            style={styles.acceptButton}
                        />
                    </View>
                </AnimatedView>
            </div>
        );
    }

    // Fallback for native (though likely not needed for this web request)
    return null;
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(12px)', // Glassmorphism
    } as any, // Cast to any for web-specific styles
    content: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFFBEB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    message: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 16,
    },
    policyLink: {
        fontSize: 14,
        color: '#64748B',
        textDecorationLine: 'underline',
    },
    acceptButton: {
        minWidth: 120,
    }
});
