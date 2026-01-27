import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, useWindowDimensions, type ViewStyle } from 'react-native';
import { Link, useLocation } from 'react-router-dom';
import { Text } from '@trusttax/ui';
import { Menu, X } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useTranslation } from 'react-i18next';
import { TrustTaxLogo } from './TrustTaxLogo';
import { getPublicNav, getAuthNav, MOBILE_BREAKPOINT } from '../config/navigation';
import { useAuth } from '../context/AuthContext';
import { LanguageSelector } from './LanguageSelector';


export const Header = () => {
    const location = useLocation();
    const { width } = useWindowDimensions();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { profile } = useCompany();
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const menuButtonRef = useRef<any>(null);
    const { logout, user } = useAuth();
    const mobileMenuRef = useRef<any>(null);

    const isMobile = width < MOBILE_BREAKPOINT;

    const navItems = getPublicNav();
    const authItems = getAuthNav(isAuthenticated);

    const isActive = (path: string) => location.pathname === path;

    const companyName = profile?.companyName || 'TrustTax';
    const primaryColor = profile?.primaryColor || '#0F172A';
    const secondaryColor = profile?.secondaryColor || '#2563EB';
    const theme = profile?.themeOptions || {};

    // Close menu on Escape key
    useEffect(() => {
        if (!isMenuOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMenuOpen(false);
                menuButtonRef.current?.focus?.();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen]);

    // Focus trap for mobile menu
    useEffect(() => {
        if (!isMobile || !isMenuOpen) return;

        const menuElement = mobileMenuRef.current;
        if (!menuElement) return;

        const focusableElements = menuElement.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => document.removeEventListener('keydown', handleTab);
    }, [isMobile, isMenuOpen]);

    const handleMenuClose = () => {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus?.();
    };

    return (
        <View
            style={[styles.navbar, { backgroundColor: (theme as { surface?: string }).surface || '#FFF' }]}
            accessibilityRole="header"
        >
            <View style={[styles.navContainer, isMobile && { paddingHorizontal: 20 }]}>
                {/* Brand Section */}
                <Link to="/" className={Platform.OS === 'web' ? 'logo-link' : undefined} style={Platform.OS === 'web' ? undefined : styles.logoContainer}>
                    <TrustTaxLogo size={isMobile ? 32 : 40} bgColor={primaryColor} />
                    <Text style={[styles.logoText, { color: primaryColor }, isMobile && { fontSize: 18 }]}>
                        {companyName}
                    </Text>
                </Link>

                {/* Desktop Menu */}
                {!isMobile && (
                    <View style={styles.desktopMenu} {...(Platform.OS === 'web' ? { role: 'navigation', 'aria-label': 'Main navigation' } : {})}>
                        <View style={styles.navLinksRow}>
                            {navItems.map((item) => {
                                const label = t(item.i18nKey, item.path);
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={Platform.OS === 'web' ? 'nav-link' : undefined}
                                        style={Platform.OS === 'web' ? { padding: '8px 0', position: 'relative' } : [styles.navLink, active && styles.navLinkActive] as any}
                                        aria-current={active ? 'page' : undefined}
                                    >
                                        <Text
                                            style={[
                                                styles.navLinkText,
                                                active && { color: secondaryColor, fontWeight: '600' },
                                            ]}
                                        >
                                            {label}
                                        </Text>
                                        {active && (
                                            <View style={[styles.activeIndicator, { backgroundColor: secondaryColor }]} />
                                        )}
                                    </Link>
                                );
                            })}
                        </View>

                        <View style={styles.authButtons}>
                            <LanguageSelector variant="desktop" />

                            <View style={styles.divider} />

                            {authItems.map((item) => {
                                if (item.type === 'link') {
                                    const isRegister = item.path === '/register';
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={Platform.OS === 'web' ? 'nav-link' : undefined}
                                            style={Platform.OS === 'web'
                                                ? isRegister
                                                    ? { padding: '0 24px', height: 44, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: secondaryColor }
                                                    : { height: 44, padding: '0 16px', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }
                                                : isRegister
                                                    ? { ...styles.ctaButton, backgroundColor: secondaryColor } as any
                                                    : styles.loginButton as any
                                            }
                                        >
                                            <Text
                                                style={
                                                    isRegister
                                                        ? styles.ctaButtonText
                                                        : { color: primaryColor, fontSize: 14, fontWeight: '500' }
                                                }
                                            >
                                                {t(item.i18nKey, item.path)}
                                            </Text>
                                        </Link>
                                    );
                                }
                                if (item.type === 'user') {
                                    return (
                                        <Link
                                            key="user-profile"
                                            to="/dashboard"
                                            className={Platform.OS === 'web' ? 'nav-link' : undefined}
                                            style={Platform.OS === 'web' ? { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 } : { flexDirection: 'row', alignItems: 'center', gap: 8 } as any}
                                        >
                                            <Text style={{ color: primaryColor, fontWeight: '600', fontSize: 14 }}>
                                                {user?.name || user?.email || t(item.i18nKey)}
                                            </Text>
                                        </Link>
                                    );
                                }
                                if (item.type === 'logout') {
                                    return (
                                        <TouchableOpacity
                                            key="logout-btn"
                                            onPress={logout}
                                            style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                                        >
                                            <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '500' }}>
                                                {t(item.i18nKey)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }
                                return null;
                            })}
                        </View>
                    </View>
                )}

                {/* Mobile Menu Button */}
                {isMobile && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <LanguageSelector variant="mobile" showChevron={false} />
                        <TouchableOpacity
                            ref={menuButtonRef}
                            style={styles.mobileMenuBtn}
                            onPress={() => setIsMenuOpen(!isMenuOpen)}
                            activeOpacity={0.7}
                            aria-label={isMenuOpen ? t('header.close_menu', 'Close menu') : t('header.open_menu', 'Open menu')}
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            {isMenuOpen ? <X size={24} color={secondaryColor} /> : <Menu size={24} color={secondaryColor} />}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Mobile Dropdown */}
            {isMobile && isMenuOpen && (
                <View
                    ref={mobileMenuRef}
                    id="mobile-menu"
                    style={[styles.mobileMenu, { backgroundColor: theme.surface || '#FFF' }]}
                    {...(Platform.OS === 'web' ? { role: 'navigation', 'aria-label': 'Mobile navigation' } : {})}
                >
                    {navItems.map((item) => {
                        const label = t(item.i18nKey, item.path);
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleMenuClose}
                                className={Platform.OS === 'web' ? 'nav-link' : undefined}
                                style={Platform.OS === 'web' ? { padding: '18px 0', borderBottom: '1px solid #F8FAFC' } : styles.mobileNavLink as any}
                                aria-current={active ? 'page' : undefined}
                            >
                                <Text
                                    style={[
                                        styles.mobileNavLinkText,
                                        active && { color: secondaryColor, fontWeight: '600' },
                                    ]}
                                >
                                    {label}
                                </Text>
                            </Link>
                        );
                    })}
                    <View style={styles.mobileAuthRow}>
                        {authItems.map((item) => {
                            if (item.type === 'link') {
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={handleMenuClose}
                                        style={
                                            item.path === '/register'
                                                ? { flex: 2, height: 44, borderRadius: 0, backgroundColor: secondaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }
                                                : { flex: 1, height: 44, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }
                                        }
                                    >
                                        <Text
                                            style={
                                                item.path === '/register'
                                                    ? { color: '#FFF', fontWeight: '600' }
                                                    : { color: primaryColor, fontWeight: '500' }
                                            }
                                        >
                                            {t(item.i18nKey, item.path)}
                                        </Text>
                                    </Link>
                                );
                            }
                            if (item.type === 'user') {
                                return (
                                    <Link
                                        key="user-profile-mobile"
                                        to="/dashboard"
                                        onClick={handleMenuClose}
                                        style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text style={{ color: primaryColor, fontWeight: '600' }}>
                                            {user?.name || t(item.i18nKey)}
                                        </Text>
                                    </Link>
                                );
                            }
                            if (item.type === 'logout') {
                                return (
                                    <TouchableOpacity
                                        key="logout-btn-mobile"
                                        onPress={() => { logout(); handleMenuClose(); }}
                                        style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text style={{ color: '#EF4444', fontWeight: '500' }}>
                                            {t(item.i18nKey)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }
                            return null;
                        })}
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
                position: 'sticky',
                top: 0,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                backdropFilter: 'blur(10px)',
            } as unknown as ViewStyle,
            default: {
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
            },
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
    navLinkActive: {
        // Active state handled by text color
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
    loginButton: {
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 0,
    },
    ctaButton: {
        paddingHorizontal: 24,
        height: 44,
        borderRadius: 0,
        ...(Platform.OS === 'web' ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}),
    } as any,
    ctaButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
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
            },
        }),
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
    },
});
