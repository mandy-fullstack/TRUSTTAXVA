import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { H4, Text, spacing } from '@trusttax/ui';
import { LayoutDashboard, Users, FileText, LogOut, Briefcase, Settings, Menu, X, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MOBILE_BREAKPOINT = 768;

const navItems: { path: string; label: string; icon: typeof LayoutDashboard; match?: 'startsWith' }[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/orders', label: 'Orders', icon: FileText, match: 'startsWith' },
  { path: '/services', label: 'Services', icon: Briefcase, match: 'startsWith' },
  { path: '/forms', label: 'Forms', icon: ClipboardList, match: 'startsWith' },
  { path: '/settings', label: 'Settings', icon: Settings, match: 'startsWith' },
];

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  onPress,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onPress?: () => void;
}) {
  const content = (
    <View style={[styles.navItem, active && styles.navItemActive]}>
      <Icon size={20} color={active ? '#FFF' : '#94A3B8'} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <Link to={to} style={styles.navLink}>
      {content}
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useWindowDimensions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = width < MOBILE_BREAKPOINT;

  const isActive = (item: typeof navItems[number]) => {
    if (item.match === 'startsWith') return location.pathname.startsWith(item.path);
    return location.pathname === item.path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileMenuOpen]);

  const sidebar = (
    <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
      <View style={styles.logoContainer}>
        <H4 style={styles.logoTitle}>TrustTax Admin</H4>
        <Text style={styles.logoSubtitle} numberOfLines={1}>{user?.email || ''}</Text>
      </View>

      <View style={styles.navList}>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            label={item.label}
            icon={item.icon}
            active={isActive(item)}
            onPress={isMobile ? () => { navigate(item.path); closeMobileMenu(); } : undefined}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {isMobile && (
        <View style={styles.mobileHeader}>
          <TouchableOpacity
            onPress={() => setMobileMenuOpen((o) => !o)}
            style={styles.menuButton}
            activeOpacity={0.7}
            accessibilityLabel={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={24} color="#0F172A" /> : <Menu size={24} color="#0F172A" />}
          </TouchableOpacity>
          <Text style={styles.mobileHeaderTitle}>TrustTax Admin</Text>
          <View style={styles.menuButton} />
        </View>
      )}

      {!isMobile && sidebar}

      {isMobile && mobileMenuOpen && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            onPress={closeMobileMenu}
            activeOpacity={1}
          />
          {sidebar}
        </>
      )}

      <View style={[styles.main, isMobile && styles.mainMobile]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100vh' as any,
    width: '100%',
    backgroundColor: '#F8FAFC',
  },
  mobileHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 100,
    ...(Platform.OS === 'web' ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : {}),
  } as any,
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  overlay: {
    ...(Platform.OS === 'web'
      ? {
          position: 'fixed' as any,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 200,
        }
      : {
          position: 'absolute' as any,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 200,
        }),
  } as any,
  sidebar: {
    width: 280,
    minWidth: 280,
    backgroundColor: '#0F172A',
    padding: spacing[6],
    height: '100vh' as any,
    justifyContent: 'space-between',
  },
  sidebarMobile: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    height: '100%',
    zIndex: 201,
    ...(Platform.OS === 'web' ? { boxShadow: '4px 0 20px rgba(0,0,0,0.15)' } : {}),
  } as any,
  logoContainer: {
    marginBottom: spacing[6],
    paddingBottom: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  logoTitle: { color: '#FFF', marginBottom: 0, fontSize: 18 },
  logoSubtitle: { color: '#94A3B8', fontSize: 12, marginTop: spacing[1] },
  navList: { flex: 1, gap: spacing[1], marginTop: spacing[4] },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: 0,
  },
  navItemActive: { backgroundColor: '#1E293B' },
  navLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  navLabelActive: { color: '#FFF' },
  navLink: {
    textDecoration: 'none',
    ...(Platform.OS === 'web' ? { display: 'block' } : {}),
  } as any,
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    marginTop: spacing[6],
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#EF4444',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  main: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#F8FAFC',
    overflow: 'auto' as any,
    minHeight: '100vh' as any,
  },
  mainMobile: {
    paddingTop: 56,
  },
});
