import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, Menu, X, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Text } from '@trusttax/ui';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { logout, isAuthenticated, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = isAuthenticated ? [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Services', icon: ShoppingBag, path: '/services' },
    ] : [
        { label: 'Services', icon: ShoppingBag, path: '/services' },
        { label: 'Login', icon: User, path: '/login' },
    ];

    return (
        <View style={styles.container}>
            {/* Top Navigation Bar */}
            <View style={styles.navBar}>
                <View style={styles.navInner}>
                    <View style={styles.logoRow}>
                        <Text style={styles.logo}>TrustTax</Text>
                        <TouchableOpacity
                            style={styles.mobileMenuBtn}
                            onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} color="#0F172A" /> : <Menu size={24} color="#0F172A" />}
                        </TouchableOpacity>
                    </View>

                    {/* Desktop Navigation */}
                    <View style={styles.desktopNav}>
                        {navItems.map((item) => (
                            <TouchableOpacity
                                key={item.path}
                                onPress={() => navigate(item.path)}
                                style={[styles.navItem, isActive(item.path) && styles.navItemActive]}
                            >
                                <item.icon size={18} color={isActive(item.path) ? '#2563EB' : '#64748B'} />
                                <Text style={[styles.navLabel, isActive(item.path) && styles.navLabelActive]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {isAuthenticated && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.userBox}>
                                    <View style={styles.avatar}><User size={14} color="#64748B" /></View>
                                    <Text style={styles.userNameText}>{user?.name || 'User'}</Text>
                                </View>
                            </>
                        )}
                        <View style={styles.divider} />
                        <TouchableOpacity onPress={handleLogout} style={styles.navItem}>
                            <LogOut size={18} color="#EF4444" />
                            <Text style={styles.logoutLabel}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <View style={styles.mobileOverlay}>
                    {navItems.map((item) => (
                        <TouchableOpacity
                            key={item.path}
                            onPress={() => {
                                navigate(item.path);
                                setIsMobileMenuOpen(false);
                            }}
                            style={styles.mobileNavItem}
                        >
                            <item.icon size={20} color={isActive(item.path) ? '#2563EB' : '#64748B'} />
                            <Text style={[styles.navLabel, isActive(item.path) && styles.navLabelActive, { fontSize: 16 }]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={handleLogout} style={styles.mobileNavItem}>
                        <LogOut size={20} color="#EF4444" />
                        <Text style={styles.logoutLabel}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Main Content */}
            <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentInner}>
                {children}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', minHeight: '100%' },
    navBar: { height: 64, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', zIndex: 50 },
    navInner: { maxWidth: 1200, width: '100%', height: '100%', marginHorizontal: 'auto', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
    logo: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', letterSpacing: -0.5 },
    mobileMenuBtn: { padding: 8 }, // Hidden via logic in real media queries, but using simple approach here
    desktopNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    navItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
    navItemActive: { backgroundColor: '#EFF6FF' },
    navLabel: { fontSize: 14, fontWeight: '500', color: '#64748B' },
    navLabelActive: { color: '#2563EB' },
    logoutLabel: { fontSize: 14, fontWeight: '500', color: '#EF4444' },
    divider: { width: 1, height: 24, backgroundColor: '#E2E8F0', marginHorizontal: 8 },
    userBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
    avatar: { width: 28, height: 28, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    userNameText: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
    mobileOverlay: { position: 'absolute', top: 64, left: 0, right: 0, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: 16, zIndex: 40 },
    mobileNavItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
    contentScroll: { flex: 1 },
    contentInner: { maxWidth: 1200, width: '100%', marginHorizontal: 'auto', padding: 24 }
});
