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
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 9999,
            }}>
                <AnimatedView style={[
                    styles.container,
                    { transform: [{ translateY: slideAnim }] }
                ]}>
                    <View style={styles.wrapper}>
                        <View style={styles.content}>
                            <View style={styles.iconBox}>
                                <Cookie size={20} color="#0F172A" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>
                                    {t('cookies.title', 'We value your privacy')}
                                </Text>
                                <Text style={styles.message}>
                                    {t('cookies.message', 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.')}
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
                                title={t('cookies.accept', 'Accept')}
                                onPress={handleAccept}
                                variant="primary"
                                style={styles.acceptButton}
                            />
                        </View>
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
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 16,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
        borderRadius: 0, // Sharp corners
        width: '100%',
    } as any,
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        maxWidth: 1200, // Limit content width on large screens
        alignSelf: 'center',
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        gap: 16,
        flex: 1,
        minWidth: 300,
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 0, // Sharp aesthetic
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
    },
    message: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    policyLink: {
        fontSize: 13,
        color: '#64748B',
        textDecorationLine: 'underline',
    },
    acceptButton: {
        minWidth: 100,
        height: 36, // Smaller, compact button
        borderRadius: 0, // Sharp button
    }
});
