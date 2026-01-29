import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, Menu, X, ShoppingBag, ChevronDown, Bell, MessageCircle, FileText, Settings, Folder, type LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Text } from '@trusttax/ui';
import { TrustTaxLogo } from './TrustTaxLogo';
import { useTranslation } from 'react-i18next';
import { getDashboardNav, MOBILE_BREAKPOINT } from '../config/navigation';
import { LanguageSelector } from './LanguageSelector';
import { UserMenuPopover } from './UserMenuPopover';
import { ChatWidget } from './Chat/ChatWidget';

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    ShoppingBag,
    MessageCircle,
    User,
    LogOut,
    FileText,
    Settings,
    Folder,
};

interface LayoutProps {
    children: React.ReactNode;
    noScroll?: boolean;
}


export const Layout = ({ children, noScroll = false }: LayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { width } = useWindowDimensions();
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { logout, isAuthenticated, user } = useAuth();
    const { notifications, unreadCount, markAsRead } = useNotification();
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

    const isChatPage = location.pathname.startsWith('/dashboard/chat');

    // Automatically close floating chat when navigating to full chat page
    useEffect(() => {
        if (isChatPage && isChatOpen) {
            setIsChatOpen(false);
        }
    }, [isChatPage, isChatOpen]);
    // ... (existing effects remain same) ...
    // Note: Since I am replacing the whole function body or parts, I need to be careful with "..."
    // I will use multi-replace or careful single replace.
    // Let's use standard single replace for the whole return block + state init.

    // Wait, replacing the whole component is risky with "..." comments. 
    // I should probably use multi_replace for specific parts or just view the file again to be precise.
    // I'll stick to a large replace but include the *existing* logic carefully, or better, 
    // I'll use multi-replace to inject the state and then the return JSX.

    // BUT first I need imports.
    // I will do imports first.


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
                            isAdmin={user?.role === 'ADMIN'}
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
                                {isAuthenticated && (
                                    <View style={{ position: 'relative', zIndex: 9999 }}>
                                        <TouchableOpacity
                                            style={styles.iconBox}
                                            onPress={() => setShowNotifications(!showNotifications)}
                                        >
                                            <Bell size={20} color="#0F172A" />
                                            {unreadCount > 0 && (
                                                <View style={styles.badge}>
                                                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>

                                        {showNotifications && (
                                            <View style={[styles.notificationDropdown, { right: -50, width: width - 40, maxWidth: 360 }]}>
                                                <View style={styles.dropdownHeader}>
                                                    <Text style={styles.dropdownTitle}>Notifications</Text>
                                                    {unreadCount > 0 && (
                                                        <Text style={styles.markAll} onPress={() => notifications.forEach(n => markAsRead(n.id))}>
                                                            Mark all read
                                                        </Text>
                                                    )}
                                                </View>
                                                <ScrollView style={styles.dropdownList}>
                                                    {notifications.filter(n => !n.read).length === 0 ? (
                                                        <View style={styles.emptyState}>
                                                            <Text style={styles.emptyText}>No new notifications</Text>
                                                        </View>
                                                    ) : (
                                                        notifications.filter(n => !n.read).map(n => (
                                                            <TouchableOpacity
                                                                key={n.id}
                                                                style={[styles.notifItem, styles.notifUnread]}
                                                                onPress={() => {
                                                                    markAsRead(n.id);
                                                                    setShowNotifications(false);
                                                                    navigate(n.link);
                                                                }}
                                                            >
                                                                <View style={[styles.dot, { backgroundColor: n.type === 'message' ? '#3B82F6' : '#10B981' }]} />
                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={styles.notifTitle}>{n.title}</Text>
                                                                    <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
                                                                    <Text style={styles.notifTime}>{new Date(n.date).toLocaleTimeString()}</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        ))
                                                    )}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>
                                )}
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
                                    {isAuthenticated && (
                                        <View style={{ position: 'relative', zIndex: 9999 }}>
                                            <TouchableOpacity
                                                style={styles.iconBox}
                                                onPress={() => setShowNotifications(!showNotifications)}
                                            >
                                                <Bell size={20} color="#64748B" />
                                                {unreadCount > 0 && (
                                                    <View style={styles.badge}>
                                                        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>

                                            {showNotifications && (
                                                <View style={styles.notificationDropdown}>
                                                    <View style={styles.dropdownHeader}>
                                                        <Text style={styles.dropdownTitle}>Notifications</Text>
                                                        {unreadCount > 0 && (
                                                            <Text style={styles.markAll} onPress={() => notifications.forEach(n => markAsRead(n.id))}>
                                                                Mark all read
                                                            </Text>
                                                        )}
                                                    </View>
                                                    <ScrollView style={styles.dropdownList}>
                                                        {notifications.filter(n => !n.read).length === 0 ? (
                                                            <View style={styles.emptyState}>
                                                                <Text style={styles.emptyText}>No new notifications</Text>
                                                            </View>
                                                        ) : (
                                                            notifications.filter(n => !n.read).map(n => (
                                                                <TouchableOpacity
                                                                    key={n.id}
                                                                    style={[styles.notifItem, styles.notifUnread]}
                                                                    onPress={() => {
                                                                        markAsRead(n.id);
                                                                        setShowNotifications(false);
                                                                        navigate(n.link);
                                                                    }}
                                                                >
                                                                    <View style={[styles.dot, { backgroundColor: n.type === 'message' ? '#3B82F6' : '#10B981' }]} />
                                                                    <View style={{ flex: 1 }}>
                                                                        <Text style={styles.notifTitle}>{n.title}</Text>
                                                                        <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
                                                                        <Text style={styles.notifTime}>{new Date(n.date).toLocaleTimeString()}</Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            ))
                                                        )}
                                                    </ScrollView>
                                                </View>
                                            )}
                                        </View>
                                    )}
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

                <View style={[styles.contentRow, { flex: 1 }]}>
                    {noScroll ? (
                        <View id="main-content" style={[styles.mainContent, { flex: 1 }]}>
                            {children}
                        </View>
                    ) : (
                        <ScrollView style={[styles.contentScroll, isChatOpen && !isMobile && { marginRight: 0 }]} contentContainerStyle={styles.contentInner}>
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
                    )}

                    {/* Chat Panel - Desktop */}
                    {isAuthenticated && isChatOpen && !isChatPage && (
                        <View style={[styles.chatPanel, isMobile && styles.chatPanelMobile]}>
                            <ChatWidget onClose={() => setIsChatOpen(false)} />
                        </View>
                    )}
                </View>

                {/* Floating Chat Button */}
                {isAuthenticated && !isChatOpen && !isChatPage && (
                    <TouchableOpacity
                        style={styles.floatingChatBtn}
                        onPress={() => setIsChatOpen(true)}
                        activeOpacity={0.9}
                    >
                        <MessageCircle size={24} color="#FFFFFF" />
                        {notifications.filter(n => n.type === 'message' && !n.read).length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {notifications.filter(n => n.type === 'message' && !n.read).length}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
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
        borderRadius: 0,
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
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer' as any
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 0,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFF'
    },
    badgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 2
    },
    notificationDropdown: {
        position: 'absolute',
        top: 50,
        right: 0,
        width: 320,
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 9999,
        maxHeight: 400
    },
    dropdownHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dropdownTitle: {
        fontWeight: '600',
        fontSize: 14,
        color: '#0F172A'
    },
    markAll: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '500',
        cursor: 'pointer' as any
    },
    dropdownList: {
        maxHeight: 340
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 14
    },
    notifItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12
    },
    notifUnread: {
        backgroundColor: '#F8FAFC'
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 0,
        marginTop: 6
    },
    notifTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2
    },
    notifBody: {
        fontSize: 12,
        color: '#64748B',
        lineHeight: 16,
        marginBottom: 4
    },
    notifTime: {
        fontSize: 10,
        color: '#94A3B8'
    },
    contentRow: {
        flexDirection: 'row',
        flex: 1,
        overflow: 'hidden' as any
    },
    chatPanel: {
        width: 400,
        borderLeftWidth: 1,
        borderLeftColor: '#E2E8F0',
        backgroundColor: '#FFF',
        height: '100%',
    },
    chatPanelMobile: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100%',
        zIndex: 900
    } as any,
    floatingChatBtn: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 0,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 50
    }
});
