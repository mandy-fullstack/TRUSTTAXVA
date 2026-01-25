import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform, useWindowDimensions } from 'react-native';
import { Text, Button } from '@trusttax/ui';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { useTranslation } from 'react-i18next';
import { TrustTaxLogo } from './TrustTaxLogo';

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { width } = useWindowDimensions();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { profile } = useCompany();
    const { t, i18n } = useTranslation();

    const isMobile = width <= 1024;

    const toggleLanguage = () => {
        const nextLang = i18n.language.startsWith('en') ? 'es' : 'en';
        i18n.changeLanguage(nextLang);
    };

    const navLinks = [
        { label: t('header.home', 'Home'), path: '/' },
        { label: t('header.about', 'About Us'), path: '/about' },
        { label: t('header.services', 'Services'), path: '/services' },
        { label: t('header.contact', 'Contact'), path: '/contact' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const companyName = profile?.companyName || 'TrustTax';
    const primaryColor = profile?.primaryColor || '#0F172A';
    const secondaryColor = profile?.secondaryColor || '#2563EB';

    const theme = profile?.themeOptions || {};

    const FlagIcon = ({ lang }: { lang: string }) => {
        const isEn = lang.startsWith('en');
        const flagUrl = isEn ? 'https://flagcdn.com/w80/us.png' : 'https://flagcdn.com/w80/es.png';

        return (
            <View style={styles.flagWrapper}>
                <Image
                    source={{ uri: flagUrl }}
                    style={styles.flagImage as any}
                />
            </View>
        );
    };

    return (
        <View style={[styles.navbar as any, { backgroundColor: theme.surface || '#FFF' }]}>
            <View style={[styles.navContainer, isMobile && { paddingHorizontal: 20 }]}>
                {/* Brand Section with new Square Logo */}
                <TouchableOpacity onPress={() => navigate('/')} style={styles.logoContainer} activeOpacity={0.8}>
                    <TrustTaxLogo size={isMobile ? 32 : 40} bgColor={primaryColor} />
                    <Text style={[styles.logoText, { color: primaryColor }, isMobile && { fontSize: 18 }]}>{companyName}</Text>
                </TouchableOpacity>

                {/* Desktop Menu - Hidden on Mobile */}
                {!isMobile && (
                    <View style={styles.desktopMenu}>
                        <View style={styles.navLinksRow}>
                            {navLinks.map((link) => (
                                <TouchableOpacity
                                    key={link.path}
                                    onPress={() => navigate(link.path)}
                                    style={styles.navLink}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.navLinkText,
                                        isActive(link.path) && { color: secondaryColor, fontWeight: '600' }
                                    ]}>
                                        {link.label}
                                    </Text>
                                    {isActive(link.path) && <View style={[styles.activeIndicator, { backgroundColor: secondaryColor }]} />}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.authButtons}>
                            <TouchableOpacity onPress={toggleLanguage} style={styles.langSelector} activeOpacity={0.7}>
                                <FlagIcon lang={i18n.language} />
                                <Text style={[styles.langText, { color: primaryColor }]}>
                                    {i18n.language.startsWith('en') ? 'EN' : 'ES'}
                                </Text>
                                <ChevronDown size={14} color="#64748B" />
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <Button
                                title={t('header.login', 'Log In')}
                                variant="ghost"
                                onPress={() => navigate('/login')}
                                style={styles.loginButton}
                                textStyle={{ color: primaryColor, fontSize: 14, fontWeight: '500' }}
                            />
                            <Button
                                title={t('common.get_started', 'Get Started')}
                                variant="primary"
                                onPress={() => navigate('/register')}
                                style={[styles.ctaButton, { backgroundColor: secondaryColor }]}
                            />
                        </View>
                    </View>
                )}

                {/* Mobile Menu Button - Shown on Mobile/Tablet */}
                {isMobile && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={toggleLanguage} style={styles.mobileLangSelector}>
                            <FlagIcon lang={i18n.language} />
                            <Text style={{ fontWeight: '700', color: primaryColor, fontSize: 13 }}>
                                {i18n.language.startsWith('en') ? 'EN' : 'ES'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.mobileMenuBtn}
                            onPress={() => setIsMenuOpen(!isMenuOpen)}
                            activeOpacity={0.7}
                        >
                            {isMenuOpen ? (
                                <X size={24} color={secondaryColor} />
                            ) : (
                                <Menu size={24} color={secondaryColor} />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Mobile Dropdown */}
            {isMobile && isMenuOpen && (
                <View style={[styles.mobileMenu, { backgroundColor: theme.surface || '#FFF' }]}>
                    {navLinks.map((link) => (
                        <TouchableOpacity
                            key={link.path}
                            onPress={() => {
                                navigate(link.path);
                                setIsMenuOpen(false);
                            }}
                            style={styles.mobileNavLink}
                        >
                            <Text style={[
                                styles.mobileNavLinkText,
                                isActive(link.path) && { color: secondaryColor, fontWeight: '600' }
                            ]}>
                                {link.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <View style={styles.mobileAuthRow}>
                        <Button
                            title={t('header.login', 'Log In')}
                            variant="ghost"
                            onPress={() => navigate('/login')}
                            style={{ flex: 1, height: 44, borderRadius: 0 }}
                            textStyle={{ color: primaryColor }}
                        />
                        <Button
                            title={t('common.get_started', 'Get Started')}
                            variant="primary"
                            onPress={() => navigate('/register')}
                            style={{ backgroundColor: secondaryColor, flex: 2, height: 44, borderRadius: 0 }}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        height: 80,
        justifyContent: 'center',
        zIndex: 1000,
        ...Platform.select({
            web: {
                position: 'sticky' as any,
                top: 0,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                backdropFilter: 'blur(10px)',
            },
            default: {
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
            }
        }),
    },
    navContainer: {
        width: '100%',
        maxWidth: 1400,
        marginHorizontal: 'auto',
        paddingHorizontal: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    desktopMenu: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 48,
    },
    navLinksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    navLink: {
        paddingVertical: 8,
        position: 'relative',
    },
    navLinkText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#64748B',
        letterSpacing: 0.2,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -4,
        left: 0,
        right: 0,
        height: 2,
        borderRadius: 1,
    },
    authButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingLeft: 24,
        borderLeftWidth: 1,
        borderLeftColor: '#F1F5F9',
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: '#E2E8F0',
    },
    langSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 0,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    langText: {
        fontSize: 13,
        fontWeight: '700',
    },
    flagWrapper: {
        width: 22,
        height: 22,
        borderRadius: 0,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    flagImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    mobileLangSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 0,
    },
    loginButton: {
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 0,
    },
    ctaButton: {
        paddingHorizontal: 24,
        height: 44,
        borderRadius: 0,
    },
    mobileMenuBtn: {
        padding: 8,
        backgroundColor: '#F8FAFC',
    },
    mobileMenu: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        ...Platform.select({
            web: {
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            }
        })
    },
    mobileNavLink: {
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    mobileNavLinkText: {
        fontSize: 17,
        fontWeight: '500',
        color: '#1E293B',
    },
    mobileAuthRow: {
        marginTop: 32,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    }
});
