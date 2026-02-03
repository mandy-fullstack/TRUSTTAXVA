import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { H4, Text, spacing } from "@trusttax/ui";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Briefcase,
  Settings,
  Menu,
  X,
  ClipboardList,
  MessageCircle,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useSocketContext } from "../context/SocketContext";
import { ChatWidget } from "./Chat/ChatWidget";
import { NotificationsPanel } from "./NotificationsPanel";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";

const MOBILE_BREAKPOINT = 768;

const getNavItems = (t: (key: string) => string) => [
  { path: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
  { path: "/clients", label: t("nav.clients"), icon: Users },
  { path: "/staff", label: t("nav.staff"), icon: Users },
  { path: "/orders", label: t("nav.orders"), icon: FileText, match: "startsWith" as const },
  {
    path: "/services",
    label: t("nav.services"),
    icon: Briefcase,
    match: "startsWith" as const,
  },
  { path: "/forms", label: t("nav.forms"), icon: ClipboardList, match: "startsWith" as const },
  { path: "/settings", label: t("nav.settings"), icon: Settings, match: "startsWith" as const },
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
      <Icon size={20} color={active ? "#FFF" : "#94A3B8"} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
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

export function Layout({
  children,
  noScroll = false,
}: {
  children: React.ReactNode;
  noScroll?: boolean;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotification();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const { socket, isConnected } = useSocketContext();

  const isMobile = width < MOBILE_BREAKPOINT;
  const isChatRoute = location.pathname.startsWith("/chat");
  const navItems = getNavItems(t);

  // Close chat widget if navigating to full chat page
  useEffect(() => {
    if (isChatRoute && isChatOpen) {
      setIsChatOpen(false);
    }
  }, [isChatRoute, isChatOpen]);

  // Fetch unread message count
  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      try {
        const data = await api.getUnreadMessageCount();
        setUnreadMessageCount(data.count || 0);
      } catch (error) {
        console.error("Failed to fetch unread message count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Listen for new messages to update count in real-time
  useEffect(() => {
    if (!isConnected || !socket || !user?.id) return;

    const refreshUnreadCount = async () => {
      try {
        const data = await api.getUnreadMessageCount();
        setUnreadMessageCount(data.count || 0);
      } catch (error) {
        console.error("Failed to refresh unread count:", error);
      }
    };

    const handleNewMessage = (data: any) => {
      // Only increment if message is not from the current user and not already read
      if (data.senderId !== user.id && !data.isRead) {
        // Increment count immediately for better UX
        setUnreadMessageCount((prev) => prev + 1);
        // Then refresh to get accurate count from server
        refreshUnreadCount();
      }
    };

    const handleMessagesRead = (data: any) => {
      // When messages are marked as read, refresh the count
      if (data.userId === user.id) {
        // If current user marked messages as read, refresh count
        refreshUnreadCount();
      } else {
        // If other user marked messages as read, we might need to refresh too
        refreshUnreadCount();
      }
    };

    const handleNotification = (payload: any) => {
      // Update count when notification is received
      if (payload.type === "message") {
        refreshUnreadCount();
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("notification", handleNotification);
    };
  }, [isConnected, socket, user?.id]);

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.match === "startsWith")
      return location.pathname.startsWith(item.path);
    return location.pathname === item.path;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileMenuOpen]);

  const sidebar = (
    <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
      <View style={styles.logoContainer}>
        <H4 style={styles.logoTitle}>TrustTax Admin</H4>
        <Text style={styles.logoSubtitle} numberOfLines={1}>
          {user?.email || ""}
        </Text>
      </View>

      <View style={styles.navList}>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            label={item.label}
            icon={item.icon}
            active={isActive(item)}
            onPress={
              isMobile
                ? () => {
                    navigate(item.path);
                    closeMobileMenu();
                  }
                : undefined
            }
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <LogOut size={20} color="#EF4444" />
        <Text style={styles.logoutText}>{t("nav.logout")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Header Bar - Desktop and Mobile */}
      <View style={[styles.topHeader, isMobile && styles.topHeaderMobile]}>
        <View style={styles.topHeaderInner}>
          {isMobile && (
            <TouchableOpacity
              onPress={() => setMobileMenuOpen((o) => !o)}
              style={styles.menuButton}
              activeOpacity={0.7}
              accessibilityLabel={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X size={24} color="#0F172A" />
              ) : (
                <Menu size={24} color="#0F172A" />
              )}
            </TouchableOpacity>
          )}
          {!isMobile && (
            <Text style={styles.topHeaderTitle}>TrustTax Admin</Text>
          )}
          {isMobile && (
            <Text style={styles.mobileHeaderTitle}>TrustTax Admin</Text>
          )}
          <View style={styles.topHeaderRight}>
            {/* Notifications */}
            <View
              style={{
                position: "relative",
                zIndex: 9999,
                ...(Platform.OS === "web"
                  ? { overflow: "visible" as any }
                  : {}),
              }}
            >
              <TouchableOpacity
                style={styles.notificationIconBox}
                onPress={() => setShowNotifications(!showNotifications)}
                activeOpacity={0.7}
              >
                <Bell size={isMobile ? 20 : 22} color="#0F172A" />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <NotificationsPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </View>
            {/* Language Selector */}
            <LanguageSelector variant={isMobile ? "mobile" : "desktop"} />
          </View>
        </View>
      </View>

      <View style={styles.contentWrapper}>
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

        <View style={[styles.main, isMobile && styles.mainMobile]}>
          <View style={styles.contentRow}>
          {noScroll ? (
            <View style={{ flex: 1 }}>{children}</View>
          ) : (
            <ScrollView
              style={[styles.contentScroll]}
              contentContainerStyle={styles.contentInner}
            >
              {children}
            </ScrollView>
          )}

          {/* Chat Panel */}
          {!isChatRoute && isChatOpen && (
            <View
              style={[styles.chatPanel, isMobile && styles.chatPanelMobile]}
            >
              <ChatWidget 
                onClose={async () => {
                  setIsChatOpen(false);
                  // Refresh unread count when closing chat
                  try {
                    const data = await api.getUnreadMessageCount();
                    setUnreadMessageCount(data.count || 0);
                  } catch (error) {
                    console.error("Failed to fetch unread count:", error);
                  }
                }}
                onUnreadCountChange={(count) => {
                  setUnreadMessageCount(count);
                }}
              />
            </View>
          )}
        </View>

        {/* Floating Chat Button */}
        {!isChatRoute && !isChatOpen && (
          <View
            style={{
              position: "fixed" as any,
              bottom: 32,
              right: 32,
              zIndex: 50,
              ...(Platform.OS === "web"
                ? { overflow: "visible" as any }
                : {}),
            }}
          >
            <TouchableOpacity
              style={styles.floatingChatBtn}
              onPress={async () => {
                setIsChatOpen(true);
                // Mark all messages as read when opening chat
                try {
                  await api.markAllMessagesAsRead();
                  setUnreadMessageCount(0);
                } catch (error) {
                  console.error("Failed to mark messages as read:", error);
                  // Refresh count on error
                  api.getUnreadMessageCount()
                    .then((data) => {
                      setUnreadMessageCount(data.count || 0);
                    })
                    .catch(() => {});
                }
              }}
              activeOpacity={0.9}
            >
              <MessageCircle size={24} color="#FFFFFF" />
              {unreadMessageCount > 0 && (
                <View style={styles.chatBadge}>
                  <Text style={styles.chatBadgeText}>
                    {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    minHeight: "100vh" as any,
    width: "100%",
    backgroundColor: "#F8FAFC",
  },
  mobileHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 100,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
      : {}),
  } as any,
  menuButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  } as any,
  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  overlay: {
    ...(Platform.OS === "web"
      ? {
          position: "fixed" as any,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 200,
        }
      : {
          position: "absolute" as any,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 200,
        }),
  } as any,
  sidebar: {
    width: 280,
    minWidth: 280,
    backgroundColor: "#0F172A",
    padding: spacing[6],
    height: "calc(100vh - 64px)" as any,
    justifyContent: "space-between",
    position: "fixed" as any,
    top: 64,
    left: 0,
    bottom: 0,
    ...(Platform.OS === "web"
      ? { overflow: "auto" as any }
      : {}),
  } as any,
  sidebarMobile: {
    position: "fixed" as any,
    top: 64,
    left: 0,
    bottom: 0,
    width: 280,
    height: "calc(100% - 64px)" as any,
    zIndex: 201,
    marginTop: 0,
    ...(Platform.OS === "web"
      ? { boxShadow: "4px 0 20px rgba(0,0,0,0.15)" }
      : {}),
  } as any,
  logoContainer: {
    marginBottom: spacing[6],
    paddingBottom: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  logoTitle: { color: "#FFF", marginBottom: 0, fontSize: 18 },
  logoSubtitle: { color: "#94A3B8", fontSize: 12, marginTop: spacing[1] },
  navList: { flex: 1, gap: spacing[1], marginTop: spacing[4] },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: 0,
  },
  navItemActive: { backgroundColor: "#1E293B" },
  navLabel: { color: "#94A3B8", fontSize: 14, fontWeight: "500" },
  navLabelActive: { color: "#FFF" },
  navLink: {
    textDecorationLine: "none",
    ...(Platform.OS === "web" ? { display: "block" } : {}),
  } as any,
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    padding: spacing[3],
    marginTop: spacing[6],
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#EF4444",
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  } as any,
  logoutText: { color: "#EF4444", fontSize: 14, fontWeight: "600" },
  main: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#F8FAFC",
    overflow: "auto" as any,
    minHeight: "calc(100vh - 64px)" as any,
    marginLeft: 280,
    ...(Platform.OS === "web"
      ? {
          width: "calc(100% - 280px)" as any,
        }
      : {}),
  } as any,
  mainMobile: {
    marginLeft: 0,
    width: "100%",
    minHeight: "calc(100vh - 64px)" as any,
  },
  topHeader: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 50,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          overflow: "visible",
        }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 2,
          elevation: 2,
        }),
  } as any,
  topHeaderMobile: {
    height: 64,
  },
  topHeaderInner: {
    maxWidth: "100%",
    width: "100%",
    height: "100%",
    marginHorizontal: "auto",
    paddingHorizontal: spacing[6],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...(Platform.OS === "web"
      ? {
          overflow: "visible",
        }
      : {}),
  } as any,
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  topHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  notificationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  } as any,
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 0,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  notificationBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
  contentRow: {
    flexDirection: "row",
    flex: 1,
    height: "100%",
    overflow: "hidden" as any,
  },
  contentScroll: {
    flex: 1,
    height: "100%",
  },
  contentInner: {
    minHeight: "100%",
    padding: spacing[6],
  },
  chatPanel: {
    width: 400,
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
    backgroundColor: "#FFF",
    height: "100%",
  },
  chatPanelMobile: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    zIndex: 900,
  } as any,
  floatingChatBtn: {
    width: 56,
    height: 56,
    borderRadius: 0,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: "relative" as any,
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  } as any,
  chatBadge: {
    position: "absolute" as any,
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 0,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingHorizontal: 4,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }
      : {}),
  } as any,
  chatBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: "row",
    marginTop: 64,
    minHeight: "calc(100vh - 64px)" as any,
  },
});
