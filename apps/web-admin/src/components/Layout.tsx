import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { H4, Text } from '@trusttax/ui';
import { LayoutDashboard, Users, FileText, LogOut, Briefcase, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// NavItem component
const NavItem = ({ icon, label, active }: { icon: any; label: string; active?: boolean }) => (
    <View style={[styles.navItem, active && styles.navItemActive]}>
        {icon}
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </View>
);

// Layout wrapper for Admin
export const Layout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = window.location.pathname;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.sidebar}>
                <View style={styles.logoContainer}>
                    <H4 style={{ color: '#FFF', marginBottom: 0 }}>TrustTax Admin</H4>
                    <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>{user?.email || ''}</Text>
                </View>

                <TouchableOpacity onPress={() => navigate('/dashboard')}>
                    <NavItem
                        icon={<LayoutDashboard size={20} color={location === '/dashboard' ? '#FFF' : '#94A3B8'} />}
                        label="Dashboard"
                        active={location === '/dashboard'}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigate('/clients')}>
                    <NavItem
                        icon={<Users size={20} color={location === '/clients' ? '#FFF' : '#94A3B8'} />}
                        label="Clients"
                        active={location === '/clients'}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigate('/orders')}>
                    <NavItem
                        icon={<FileText size={20} color={location.startsWith('/orders') ? '#FFF' : '#94A3B8'} />}
                        label="Orders"
                        active={location.startsWith('/orders')}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigate('/services')}>
                    <NavItem
                        icon={<Briefcase size={20} color={location.startsWith('/services') ? '#FFF' : '#94A3B8'} />}
                        label="Services"
                        active={location.startsWith('/services')}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigate('/settings')}>
                    <NavItem
                        icon={<Settings size={20} color={location.startsWith('/settings') ? '#FFF' : '#94A3B8'} />}
                        label="Settings"
                        active={location.startsWith('/settings')}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.main}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        width: '100vw' as any,
        height: '100vh' as any,
        overflow: 'hidden'
    },
    sidebar: {
        width: 280,
        minWidth: 280,
        backgroundColor: '#0F172A',
        padding: 24,
        gap: 8,
        height: '100%',
        overflow: 'auto' as any
    },
    logoContainer: { marginBottom: 32, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
    navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 },
    navItemActive: { backgroundColor: '#1E293B' },
    navLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
    navLabelActive: { color: '#FFF' },
    logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginTop: 'auto', borderRadius: 8, borderWidth: 1, borderColor: '#EF4444' },
    logoutText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
    main: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        overflow: 'auto' as any,
        width: '100%',
        height: '100%'
    },
});
