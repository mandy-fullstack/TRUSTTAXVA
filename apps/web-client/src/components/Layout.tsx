import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, Menu, X, ShoppingBag, ChevronDown, type LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Text } from '@trusttax/ui';
import { TrustTaxLogo } from './TrustTaxLogo';
import { useTranslation } from 'react-i18next';
import { getDashboardNav, MOBILE_BREAKPOINT } from '../config/navigation';
import { LanguageSelector } from './LanguageSelector';
import { UserMenuPopover } from './UserMenuPopover';

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    ShoppingBag,
    User,
    LogOut,
};

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { width } = useWindowDimensions();
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { logout, isAuthenticated, user } = useAuth();
    const menuButtonRef = useRef<any>(null);
    const mobileMenuRef = useRef<any>(null);
    const userMenuButtonRef = useRef<any>(null);
    const userMenuPopoverRef = useRef<any>(null);

    const isMobile = width < MOBILE_BREAKPOINT;

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = getDashboardNav(location);

    // Close menu on Escape key
    useEffect(() => {
        if (!isMobileMenuOpen && !isUserMenuOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isUserMenuOpen) {
                    setIsUserMenuOpen(false);
                    userMenuButtonRef.current?.focus?.();
                } else {
                    setIsMobileMenuOpen(false);
                    menuButtonRef.current?.focus?.();
                }
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMobileMenuOpen, isUserMenuOpen]);

    // Close user menu when clicking outside
    useEffect(() => {
        if (!isUserMenuOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            // Verificar si el click fue en el botón del menú
            if (userMenuButtonRef.current) {
                const buttonElement = userMenuButtonRef.current as any;
                // Obtener el elemento DOM real de react-native-web
                let domElement = buttonElement;
                if (buttonElement?._nativeNode) {
                    domElement = buttonElement._nativeNode;
                } else if (buttonElement?.nodeType) {
                    domElement = buttonElement;
                }
                
                if (domElement && typeof domElement.contains === 'function') {
                    if (domElement.contains(target) || domElement === target) {
                        return; // No cerrar si se clickeó el botón
                    }
                }
            }
            
            // Verificar si el click fue dentro del popover usando la ref
            if (userMenuPopoverRef.current) {
                const popoverElement = userMenuPopoverRef.current as any;
                // Obtener el elemento DOM real de react-native-web
                let popoverDom = popoverElement;
                if (popoverElement?._nativeNode) {
                    popoverDom = popoverElement._nativeNode;
                } else if (popoverElement?.nodeType) {
                    popoverDom = popoverElement;
                }
                
                if (popoverDom && typeof popoverDom.contains === 'function') {
                    if (popoverDom.contains(target) || popoverDom === target) {
                        return; // No cerrar si se clickeó dentro del popover
                    }
                }
            }
            
            // También verificar con querySelector como fallback
            const popoverByAttr = document.querySelector('[data-user-popover]');
            if (popoverByAttr && popoverByAttr.contains(target)) {
                return; // No cerrar si se clickeó dentro del popover
            }
            
            // Cerrar el menú si el click fue fuera
            setIsUserMenuOpen(false);
        };

        if (Platform.OS === 'web') {
            // Usar mousedown en lugar de click para capturar antes de que se propague
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside, true);
            }, 50);
            
            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutside, true);
            };
        }
    }, [isUserMenuOpen]);

    // Focus trap for mobile menu
    useEffect(() => {
        if (!isMobile || !isMobileMenuOpen) return;

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
    }, [isMobile, isMobileMenuOpen]);

    const handleMenuClose = () => {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus?.();
    };

    const navContent = (
        <>
            {navItems.map((item) => {
                const Icon = item.icon ? iconMap[item.icon] : null;
                const label = t(item.i18nKey, item.path);
                const active = isActive(item.path);
                return (
                        <Link
                            key={`${item.path}-${item.i18nKey}`}
                            to={item.path}
                            onClick={handleMenuClose}
                            className={Platform.OS === 'web' ? 'nav-link' : undefined}
                            style={Platform.OS === 'web' 
                                ? { 
                                    display: 'flex', 
                                    flexDirection: 'row', 
                                    alignItems: 'center', 
                                    padding: '8px 14px', 
                                    gap: 8, 
                                    borderRadius: 0,
                                    backgroundColor: active ? '#EFF6FF' : 'transparent',
                                    textDecoration: 'none',
                                    outline: 'none',
                                } 
                                : [styles.navItem, active && styles.navItemActive] as any
                            }
                            aria-current={active ? 'page' : undefined}
                        >
                        {Icon && <Icon size={18} color={active ? '#2563EB' : '#64748B'} />}
                        <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
                    </Link>
                );
            })}
            {isAuthenticated && (
                <>
                    <View style={styles.divider} />
                    <View style={styles.userMenuContainer}>
                        <TouchableOpacity
                            ref={userMenuButtonRef}
                            style={styles.userBox}
                            onPress={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            activeOpacity={0.7}
                            {...(Platform.OS === 'web' ? { 
                                role: 'button',
                                'aria-label': t('header.user_menu', 'User menu'),
                                'aria-expanded': isUserMenuOpen,
                                onClick: (e: any) => {
                                    // Prevenir que el click del botón se propague
                                    e.stopPropagation();
                                },
                            } : {})}
                        >
                            <View style={styles.avatar}>
                                <User size={14} color="#64748B" />
                            </View>
                            <Text style={styles.userNameText} numberOfLines={1}>
                                {user?.name || t('header.user', 'User')}
                            </Text>
                            <ChevronDown 
                                size={14} 
                                color="#64748B" 
                                style={isUserMenuOpen ? styles.chevronOpen : styles.chevron}
                            />
                        </TouchableOpacity>
                        <UserMenuPopover
                            ref={userMenuPopoverRef}
                            userName={user?.name || t('header.user', 'User')}
                            userEmail={user?.email}
                            isOpen={isUserMenuOpen}
                            onClose={() => setIsUserMenuOpen(false)}
                            onLogout={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    </View>
                </>
            )}
        </>
    );

    return (
        <>
            {/* Skip to main content link - rendered outside View for web compatibility */}
            {Platform.OS === 'web' && (
                <Link
                    to="#main-content"
                    className="skip-link"
                    onClick={(e: any) => {
                        e.preventDefault();
                        const mainContent = document.getElementById('main-content');
                        if (mainContent) {
                            mainContent.focus();
                            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }}
                >
                    Skip to main content
                </Link>
            )}
            <View style={styles.container}>

            <View style={styles.navBar}>
                <View style={styles.navInner}>
                    <Link
                        to={isAuthenticated ? '/dashboard' : '/'}
                        onClick={handleMenuClose}
                        className={Platform.OS === 'web' ? 'logo-link' : undefined}
                        style={Platform.OS === 'web' ? undefined : styles.brand}
                    >
                        <TrustTaxLogo size={32} bgColor="#0F172A" color="#FFFFFF" />
                        <Text style={styles.logo}>TrustTax</Text>
                    </Link>
                        {isMobile ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <LanguageSelector variant="mobile" showChevron={false} />
                                <TouchableOpacity
                                    ref={menuButtonRef}
                                    style={styles.mobileMenuBtn}
                                    onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    aria-label={isMobileMenuOpen ? t('header.close_menu', 'Close menu') : t('header.open_menu', 'Open menu')}
                                    aria-expanded={isMobileMenuOpen}
                                    aria-controls="dashboard-mobile-menu"
                                >
                                    {isMobileMenuOpen ? <X size={24} color="#0F172A" /> : <Menu size={24} color="#0F172A" />}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.desktopNavWrapper}>
                                <View style={styles.desktopNav} {...(Platform.OS === 'web' ? { role: 'navigation', 'aria-label': 'Dashboard navigation' } : {})}>
                                    {navContent}
                                </View>
                                <View style={styles.rightSection}>
                                    <LanguageSelector variant="desktop" />
                                </View>
                            </View>
                        )}
                </View>
            </View>

            {isMobile && isMobileMenuOpen && (
                <View
                    ref={mobileMenuRef}
                    id="dashboard-mobile-menu"
                    style={styles.mobileOverlay}
                    {...(Platform.OS === 'web' ? { role: 'navigation', 'aria-label': 'Mobile dashboard navigation' } : {})}
                >
                    {navItems.map((item) => {
                        const Icon = item.icon ? iconMap[item.icon] : null;
                        const label = t(item.i18nKey, item.path);
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={`${item.path}-${item.i18nKey}`}
                                to={item.path}
                                onClick={handleMenuClose}
                                className={Platform.OS === 'web' ? 'nav-link' : undefined}
                                style={Platform.OS === 'web' 
                                    ? { 
                                        display: 'flex', 
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                        padding: '14px 0', 
                                        gap: 12,
                                        textDecoration: 'none',
                                        outline: 'none',
                                    } 
                                    : styles.mobileNavItem as any
                                }
                                aria-current={active ? 'page' : undefined}
                            >
                                {Icon && <Icon size={20} color={active ? '#2563EB' : '#64748B'} />}
                                <Text style={[styles.navLabel, active && styles.navLabelActive, styles.mobileNavText]}>
                                    {label}
                                </Text>
                            </Link>
                        );
                    })}
                    {isAuthenticated && (
                        <Link
                            to="/dashboard/profile"
                            onClick={handleMenuClose}
                            className={Platform.OS === 'web' ? 'nav-link' : undefined}
                            style={Platform.OS === 'web' 
                                ? { 
                                    display: 'flex', 
                                    flexDirection: 'row', 
                                    alignItems: 'center', 
                                    padding: '14px 0', 
                                    gap: 12,
                                    textDecoration: 'none',
                                    outline: 'none',
                                } 
                                : styles.mobileNavItem as any
                            }
                            aria-current={isActive('/dashboard/profile') ? 'page' : undefined}
                        >
                            <User size={20} color={isActive('/dashboard/profile') ? '#2563EB' : '#64748B'} />
                            <Text style={[styles.navLabel, isActive('/dashboard/profile') && styles.navLabelActive, styles.mobileNavText]}>
                                {t('header.profile', 'Profile')}
                            </Text>
                        </Link>
                    )}
                    {isAuthenticated && (
                        <View style={styles.mobileUserRow} {...(Platform.OS === 'web' ? { role: 'status', 'aria-label': `User: ${user?.name || 'User'}` } : {})}>
                            <View style={styles.avatar}>
                                <User size={16} color="#64748B" />
                            </View>
                            <Text style={styles.mobileUserName}>{user?.name || t('header.user', 'User')}</Text>
                        </View>
                    )}
                    <View style={styles.mobileLangRow}>
                        <LanguageSelector variant="mobile" showChevron={false} />
                    </View>
                    {isAuthenticated && (
                        <TouchableOpacity
                            onPress={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                            }}
                            style={styles.mobileNavItem}
                            aria-label={t('header.logout', 'Logout')}
                        >
                            <LogOut size={20} color="#EF4444" />
                            <Text style={styles.logoutLabel}>{t('header.logout', 'Logout')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentInner}>
                <View 
                    id="main-content" 
                    style={styles.mainContent} 
                    tabIndex={-1}
                    {...(Platform.OS === 'web' ? { 
                        // @ts-ignore - web-specific props
                        onFocus: (e: any) => e.target.style.outline = 'none',
                    } : {})}
                >
                    {children}
                </View>
            </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', minHeight: '100%' },
    navBar: {
        height: 64,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        zIndex: 50,
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } 
            : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 2 }
        ),
    } as any,
    navInner: {
        maxWidth: 1200,
        width: '100%',
        height: '100%',
        marginHorizontal: 'auto',
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logo: { fontSize: 18, fontWeight: '700', color: '#0F172A', letterSpacing: -0.5 },
    mobileMenuBtn: { padding: 8 },
    desktopNavWrapper: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'flex-end' },
    desktopNav: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rightSection: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 16, borderLeftWidth: 1, borderLeftColor: '#E2E8F0' },
    mobileLangRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 12, 
        paddingHorizontal: 4, 
        borderTopWidth: 1, 
        borderTopColor: '#F1F5F9', 
        marginTop: 8 
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 8,
        borderRadius: 8,
    },
    navItemActive: { backgroundColor: '#EFF6FF' },
    navLabel: { fontSize: 14, fontWeight: '500', color: '#64748B' },
    navLabelActive: { color: '#2563EB' },
    logoutLabel: { fontSize: 14, fontWeight: '500', color: '#EF4444' },
    divider: { width: 1, height: 20, backgroundColor: '#E2E8F0', marginHorizontal: 4 },
    userMenuContainer: {
        position: 'relative',
        ...(Platform.OS === 'web' ? {
            position: 'relative',
        } : {}),
    } as any,
    userBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8, 
        paddingHorizontal: 12, 
        paddingVertical: 6,
        maxWidth: 200,
        borderRadius: 0,
        ...(Platform.OS === 'web' ? {
            cursor: 'pointer',
        } : {}),
    } as any,
    chevron: {
        marginLeft: 'auto',
    },
    chevronOpen: {
        marginLeft: 'auto',
        ...(Platform.OS === 'web' ? {
            transform: 'rotate(180deg)',
        } : {}),
    } as any,
    avatar: {
        width: 32,
        height: 32,
        backgroundColor: '#EFF6FF',
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    userNameText: { fontSize: 13, fontWeight: '600', color: '#0F172A', flex: 1 },
    mobileOverlay: {
        position: 'absolute',
        top: 64,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        padding: 16,
        zIndex: 40,
        ...(Platform.OS === 'web' 
            ? { boxShadow: '0 2px 4px rgba(0,0,0,0.06)' } 
            : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 4 }
        ),
    } as any,
    mobileNavItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
    mobileNavText: { fontSize: 16 },
    mobileUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 4, borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 8 },
    mobileUserName: { fontSize: 14, fontWeight: '600', color: '#0F172A', flex: 1 },
    contentScroll: { flex: 1 },
    contentInner: { maxWidth: 1200, width: '100%', minWidth: '100%' as any, marginHorizontal: 'auto', padding: 24 },
    mainContent: {},
});
