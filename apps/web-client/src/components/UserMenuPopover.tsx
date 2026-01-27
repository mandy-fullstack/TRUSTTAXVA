import { useState, useEffect, forwardRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@trusttax/ui';
import { User, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { ConfirmDialog } from './ConfirmDialog';

interface UserMenuPopoverProps {
    userName: string;
    userEmail?: string;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    isAdmin?: boolean;
}

export const UserMenuPopover = forwardRef<View, UserMenuPopoverProps>(({
    userName,
    userEmail,
    isOpen,
    onClose,
    onLogout,
    isAdmin,
}, ref) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Resetear el estado del diálogo cuando el popover se cierra
    useEffect(() => {
        if (!isOpen) {
            setShowLogoutConfirm(false);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleProfileClick = () => {
        onClose();
        navigate('/dashboard/profile');
    };

    const handleLogoutClick = () => {
        // NO cerrar el popover aquí, solo mostrar el diálogo
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        onClose(); // Cerrar el popover
        onLogout();
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
        // El popover permanece abierto
    };

    return (
        <>
            <View
                ref={ref}
                style={styles.popover}
                {...(Platform.OS === 'web' ? {
                    'data-user-popover': true,
                } : {})}
            >
                {/* Header del popover */}
                <View style={styles.popoverHeader}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <User size={18} color="#2563EB" />
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{userName}</Text>
                            {userEmail && (
                                <Text style={styles.userEmail}>{userEmail}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Separador */}
                <View style={styles.separator} />

                {/* Opciones del menú */}
                <View style={styles.menuItems}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={handleProfileClick}
                        activeOpacity={0.7}
                    >
                        <Settings size={18} color="#64748B" />
                        <Text style={styles.menuItemText}>
                            {t('header.profile', 'Profile')}
                        </Text>
                    </TouchableOpacity>

                    {isAdmin && (
                        <>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    onClose();
                                    navigate('/admin/orders');
                                }}
                                activeOpacity={0.7}
                            >
                                <Settings size={18} color="#2563EB" />
                                <Text style={[styles.menuItemText, { color: '#2563EB', fontWeight: 'bold' }]}>
                                    {t('header.admin_orders', 'Administration')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    onClose();
                                    navigate('/admin/services');
                                }}
                                activeOpacity={0.7}
                            >
                                <Settings size={18} color="#2563EB" />
                                <Text style={[styles.menuItemText, { color: '#2563EB', fontWeight: 'bold' }]}>
                                    {t('header.admin_services', 'Manage Services')}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <View style={styles.menuItemLang}>
                        <Text style={styles.menuItemLabel}>
                            {t('header.language', 'Language')}
                        </Text>
                        <View style={styles.langSelectorWrapper}>
                            <LanguageSelector variant="desktop" showChevron={true} />
                        </View>
                    </View>

                    <View style={styles.separator} />

                    <TouchableOpacity
                        style={[styles.menuItem, styles.logoutItem]}
                        onPress={handleLogoutClick}
                        activeOpacity={0.7}
                    >
                        <LogOut size={18} color="#EF4444" />
                        <Text style={styles.logoutText}>
                            {t('header.logout', 'Logout')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            {showLogoutConfirm && (
                <ConfirmDialog
                    isOpen={showLogoutConfirm}
                    onClose={handleCancelLogout}
                    onConfirm={handleConfirmLogout}
                    title={t('dialog.logout_title', 'Confirm Logout')}
                    message={t('dialog.logout_message', 'Are you sure you want to log out?')}
                    confirmText={t('dialog.logout', 'Logout')}
                    cancelText={t('dialog.cancel', 'Cancel')}
                    variant="danger"
                />
            )}
        </>
    );
});

const styles = StyleSheet.create({
    popover: {
        position: 'absolute',
        top: 48,
        right: 0,
        width: 280,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 0,
        zIndex: 1000,
        ...(Platform.OS === 'web' ? {
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            position: 'absolute',
        } : {}),
    } as any,
    popoverHeader: {
        padding: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        backgroundColor: '#EFF6FF',
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '400',
    },
    separator: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 8,
    },
    menuItems: {
        padding: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 0,
        ...(Platform.OS === 'web' ? {
            cursor: 'pointer',
            pointerEvents: 'auto',
        } : {}),
    } as any,
    menuItemText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    menuItemLang: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 0,
    },
    menuItemLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 8,
    },
    langSelectorWrapper: {
        width: '100%',
    },
    logoutItem: {
        marginTop: 4,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#EF4444',
    },
});
