import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useNavigate } from "react-router-dom";
import {
  X,
  Bell,
  MessageCircle,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { Text } from "@trusttax/ui";
import { useTranslation } from "react-i18next";
import {
  SMALL_MOBILE_BREAKPOINT,
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
} from "../config/navigation";

// Helper function to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  }

  return date.toLocaleDateString();
};

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel = ({
  isOpen,
  onClose,
}: NotificationsPanelProps) => {
  const { width } = useWindowDimensions();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [isClosing, setIsClosing] = useState(false);

  const isSmallMobile = width < SMALL_MOBILE_BREAKPOINT;
  const isMobile = width < MOBILE_BREAKPOINT;
  const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;

  // Reset closing state when opening
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (!isOpen || Platform.OS !== "web") return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Cerrar con Escape key
  useEffect(() => {
    if (!isOpen || Platform.OS !== "web") return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Group notifications by read status - MUST be before any conditional returns
  const groupedNotifications = useMemo(() => {
    const unread = notifications.filter((n) => !n.read);
    const read = notifications.filter((n) => n.read);
    return { unread, read };
  }, [notifications]);

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return MessageCircle;
      case "order":
        return FileText;
      case "success":
        return CheckCircle;
      case "alert":
        return AlertCircle;
      default:
        return Bell;
    }
  };

  // Get icon color for notification type
  const getIconColor = (type: string, read: boolean) => {
    if (read) return "#94A3B8";
    switch (type) {
      case "message":
        return "#3B82F6";
      case "order":
        return "#10B981";
      case "success":
        return "#10B981";
      case "alert":
        return "#F59E0B";
      default:
        return "#64748B";
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => markAsRead(n.id));
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    handleClose();
    navigate(notification.link);
  };

  const allNotifications = notifications;

  // Early return AFTER all hooks
  if (!isOpen && !isClosing) return null;

  if (Platform.OS === "web") {
    return (
      <>
        <style>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(100%);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
        `}</style>
        {/* Overlay */}
        <div
          onClick={handleOverlayClick}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            zIndex: 9998,
            animation: isClosing
              ? "fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              : "fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Panel lateral */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: isSmallMobile
                ? "100%"
                : isMobile
                  ? "90%"
                  : isTablet
                    ? "480px"
                    : "520px",
              maxWidth: "520px",
              backgroundColor: "#FFFFFF",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-4px 0 32px rgba(0,0,0,0.08), -2px 0 12px rgba(0,0,0,0.06)",
              transform: isClosing ? "translateX(100%)" : "translateX(0)",
              animation: isClosing
                ? "slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                : "slideInRight 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isSmallMobile ? "20px 18px" : isMobile ? "24px 20px" : "28px 24px",
                borderBottom: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                <div
                  style={{
                    width: isSmallMobile ? "38px" : "42px",
                    height: isSmallMobile ? "38px" : "42px",
                    borderRadius: "0",
                    backgroundColor: "#F0F7FF",
                    border: "1px solid #E0EFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bell
                    size={isSmallMobile ? 18 : 20}
                    color="#2563EB"
                    strokeWidth={2.5}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: isSmallMobile ? "16px" : isMobile ? "17px" : "18px",
                      fontWeight: "700",
                      color: "#0F172A",
                      lineHeight: 1.4,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {t("notifications.title", "Notifications")}
                  </h2>
                  {unreadCount > 0 && (
                    <p
                      style={{
                        margin: 0,
                      fontSize: isSmallMobile ? "11px" : "12px",
                      color: "#64748B",
                      fontWeight: "500",
                      letterSpacing: "0.05px",
                      }}
                    >
                      {unreadCount}{" "}
                      {unreadCount === 1
                        ? t("notifications.unread", "unread")
                        : t("notifications.unread_plural", "unread")}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563EB",
                      fontSize: isSmallMobile ? "11px" : "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      padding: "6px 12px",
                      borderRadius: "0",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      letterSpacing: "0.15px",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#EFF6FF";
                      e.currentTarget.style.color = "#1D4ED8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#2563EB";
                    }}
                  >
                    {t("notifications.mark_all_read", "Mark all read")}
                  </button>
                )}
                <button
                  onClick={handleClose}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748B",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F1F5F9";
                    e.currentTarget.style.color = "#475569";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#64748B";
                  }}
                >
                  <X size={isSmallMobile ? 20 : 22} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {allNotifications.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: isSmallMobile ? "48px 24px" : "64px 32px",
                    gap: 12,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "0",
                      backgroundColor: "#F1F5F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      border: "2px solid #E2E8F0",
                    }}
                  >
                    <Bell size={40} color="#94A3B8" strokeWidth={1.5} />
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: isSmallMobile ? "14px" : "15px",
                      color: "#64748B",
                      fontWeight: "500",
                      textAlign: "center",
                      letterSpacing: "0.05px",
                    }}
                  >
                    {t("notifications.empty", "No notifications")}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: isSmallMobile ? "12px" : "13px",
                      color: "#94A3B8",
                      textAlign: "center",
                      letterSpacing: "0.02px",
                    }}
                  >
                    {t(
                      "notifications.empty_description",
                      "You're all caught up! New notifications will appear here.",
                    )}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {/* Unread Notifications Section */}
                  {groupedNotifications.unread.length > 0 && (
                    <>
                      <div
                        style={{
                          padding: isSmallMobile ? "12px 16px 8px" : "14px 20px 10px",
                          backgroundColor: "#F8FAFC",
                          borderBottom: "1px solid #E2E8F0",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: isSmallMobile ? "11px" : "12px",
                            fontWeight: "600",
                            color: "#64748B",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {t("notifications.unread_section", "New")}
                        </p>
                      </div>
                      {groupedNotifications.unread.map((n) => {
                        const IconComponent = getNotificationIcon(n.type);
                        const iconColor = getIconColor(n.type, n.read);
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-start",
                              padding: isSmallMobile ? "18px 16px" : isMobile ? "20px 18px" : "22px 20px",
                              borderBottom: "1px solid #F1F5F9",
                              backgroundColor: "#FAFBFC",
                              cursor: "pointer",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              gap: 16,
                              position: "relative",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#F5F7FA";
                              e.currentTarget.style.transform = "translateX(-1px)";
                              e.currentTarget.style.boxShadow = "inset 2px 0 0 " + iconColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#FAFBFC";
                              e.currentTarget.style.transform = "translateX(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <div
                              style={{
                                width: isSmallMobile ? "42px" : "46px",
                                height: isSmallMobile ? "42px" : "46px",
                                borderRadius: "0",
                                backgroundColor: iconColor + "12",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                border: `1.5px solid ${iconColor}25`,
                              }}
                            >
                              <IconComponent
                                size={isSmallMobile ? 18 : 20}
                                color={iconColor}
                                strokeWidth={2.5}
                              />
                            </div>
                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: isSmallMobile ? "14px" : isMobile ? "15px" : "15px",
                                    fontWeight: "600",
                                    color: "#0F172A",
                                    lineHeight: 1.5,
                                    letterSpacing: "-0.15px",
                                    flex: 1,
                                  }}
                                >
                                  {n.title}
                                </p>
                                {!n.read && (
                                  <div
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "0",
                                      backgroundColor: iconColor,
                                      flexShrink: 0,
                                      marginTop: "4px",
                                    }}
                                  />
                                )}
                              </div>
                              <p
                                style={{
                                  margin: 0,
                                    fontSize: isSmallMobile ? "12px" : "13px",
                                    color: "#475569",
                                    lineHeight: 1.55,
                                    letterSpacing: "0.02px",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {n.body}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                <Clock size={12} color="#94A3B8" strokeWidth={2} />
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: isSmallMobile ? "10px" : "11px",
                                    color: "#94A3B8",
                                    fontWeight: "500",
                                    letterSpacing: "0.05px",
                                  }}
                                >
                                  {formatRelativeTime(new Date(n.date))}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Read Notifications Section */}
                  {groupedNotifications.read.length > 0 && (
                    <>
                      {groupedNotifications.unread.length > 0 && (
                        <div
                          style={{
                            padding: isSmallMobile ? "12px 16px 8px" : "14px 20px 10px",
                            backgroundColor: "#FFFFFF",
                            borderBottom: "1px solid #E2E8F0",
                            borderTop: "1px solid #E2E8F0",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: isSmallMobile ? "10px" : "11px",
                              fontWeight: "600",
                              color: "#94A3B8",
                              textTransform: "uppercase",
                              letterSpacing: "0.4px",
                            }}
                          >
                            {t("notifications.read_section", "Earlier")}
                          </p>
                        </div>
                      )}
                      {groupedNotifications.read.map((n) => {
                        const IconComponent = getNotificationIcon(n.type);
                        const iconColor = getIconColor(n.type, n.read);
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-start",
                              padding: isSmallMobile ? "18px 16px" : isMobile ? "20px 18px" : "22px 20px",
                              borderBottom: "1px solid #F1F5F9",
                              backgroundColor: "#FFFFFF",
                              cursor: "pointer",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              gap: 16,
                              opacity: 0.88,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#FAFBFC";
                              e.currentTarget.style.opacity = "1";
                              e.currentTarget.style.transform = "translateX(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#FFFFFF";
                              e.currentTarget.style.opacity = "0.88";
                              e.currentTarget.style.transform = "translateX(0)";
                            }}
                          >
                            <div
                              style={{
                                width: isSmallMobile ? "42px" : "46px",
                                height: isSmallMobile ? "42px" : "46px",
                                borderRadius: "0",
                                backgroundColor: "#F8F9FA",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                border: "1.5px solid #E8EAED",
                              }}
                            >
                              <IconComponent
                                size={isSmallMobile ? 18 : 20}
                                color={iconColor}
                                strokeWidth={2}
                              />
                            </div>
                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: isSmallMobile ? "14px" : isMobile ? "15px" : "15px",
                                  fontWeight: "500",
                                  color: "#475569",
                                  lineHeight: 1.5,
                                  letterSpacing: "-0.1px",
                                }}
                              >
                                {n.title}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: isSmallMobile ? "12px" : "13px",
                                  color: "#64748B",
                                  lineHeight: 1.55,
                                  letterSpacing: "0.02px",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {n.body}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                <Clock size={12} color="#94A3B8" strokeWidth={2} />
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: isSmallMobile ? "10px" : "11px",
                                    color: "#94A3B8",
                                    fontWeight: "500",
                                    letterSpacing: "0.05px",
                                  }}
                                >
                                  {formatRelativeTime(new Date(n.date))}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // React Native version
  return (
    <View style={styles.container}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.overlayContent} />
        </TouchableOpacity>
      <View
        style={[
          styles.panel,
          isSmallMobile && styles.panelSmallMobile,
          isMobile && styles.panelMobile,
          isTablet && styles.panelTablet,
        ]}
      >
        <View
          style={[
            styles.header,
            isSmallMobile && styles.headerSmallMobile,
            isMobile && styles.headerMobile,
          ]}
        >
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.headerIconContainer,
                isSmallMobile && styles.headerIconContainerSmallMobile,
              ]}
            >
              <Bell
                size={isSmallMobile ? 18 : 20}
                color="#2563EB"
                strokeWidth={2.5}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text
                style={[
                  styles.headerTitle,
                  isSmallMobile && styles.headerTitleSmallMobile,
                  isMobile && styles.headerTitleMobile,
                ]}
              >
                {t("notifications.title", "Notifications")}
              </Text>
              {unreadCount > 0 && (
                <Text
                  style={[
                    styles.headerSubtitle,
                    isSmallMobile && styles.headerSubtitleSmallMobile,
                  ]}
                >
                  {unreadCount}{" "}
                  {unreadCount === 1
                    ? t("notifications.unread", "unread")
                    : t("notifications.unread_plural", "unread")}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text
                  style={[
                    styles.markAllButton,
                    isSmallMobile && styles.markAllButtonSmallMobile,
                  ]}
                >
                  {t("notifications.mark_all_read", "Mark all read")}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={isSmallMobile ? 20 : 22} color="#64748B" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {allNotifications.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                isSmallMobile && styles.emptyStateSmallMobile,
              ]}
            >
              <View style={styles.emptyIcon}>
                <Bell size={40} color="#94A3B8" strokeWidth={1.5} />
              </View>
              <Text
                style={[
                  styles.emptyText,
                  isSmallMobile && styles.emptyTextSmallMobile,
                ]}
              >
                {t("notifications.empty", "No notifications")}
              </Text>
              <Text
                style={[
                  styles.emptyDescription,
                  isSmallMobile && styles.emptyDescriptionSmallMobile,
                ]}
              >
                {t(
                  "notifications.empty_description",
                  "You're all caught up! New notifications will appear here.",
                )}
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {/* Unread Notifications */}
              {groupedNotifications.unread.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>
                      {t("notifications.unread_section", "New")}
                    </Text>
                  </View>
                  {groupedNotifications.unread.map((n) => {
                    const IconComponent = getNotificationIcon(n.type);
                    const iconColor = getIconColor(n.type, n.read);
                    return (
                      <TouchableOpacity
                        key={n.id}
                        style={[
                          styles.notificationItem,
                          isSmallMobile && styles.notificationItemSmallMobile,
                        ]}
                        onPress={() => handleNotificationClick(n)}
                      >
                        <View
                          style={[
                            styles.iconContainer,
                            {
                              backgroundColor: iconColor + "15",
                              borderColor: iconColor + "30",
                            },
                            isSmallMobile && styles.iconContainerSmallMobile,
                          ]}
                        >
                          <IconComponent
                            size={isSmallMobile ? 18 : 20}
                            color={iconColor}
                            strokeWidth={2.5}
                          />
                        </View>
                        <View style={styles.notificationContent}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <Text
                              style={[
                                styles.notificationTitle,
                                isSmallMobile && styles.notificationTitleSmallMobile,
                              ]}
                              numberOfLines={1}
                            >
                              {n.title}
                            </Text>
                            <View
                              style={[
                                styles.unreadDot,
                                { backgroundColor: iconColor },
                                isSmallMobile && styles.unreadDotSmallMobile,
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.notificationBody,
                              isSmallMobile && styles.notificationBodySmallMobile,
                            ]}
                            numberOfLines={2}
                          >
                            {n.body}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 6,
                              marginTop: 4,
                            }}
                          >
                            <Clock size={12} color="#94A3B8" strokeWidth={2} />
                            <Text
                              style={[
                                styles.notificationTime,
                                isSmallMobile && styles.notificationTimeSmallMobile,
                              ]}
                            >
                              {formatRelativeTime(new Date(n.date))}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              {/* Read Notifications */}
              {groupedNotifications.read.length > 0 && (
                <>
                  {groupedNotifications.unread.length > 0 && (
                    <View style={[styles.sectionHeader, styles.sectionHeaderRead]}>
                      <Text style={styles.sectionHeaderText}>
                        {t("notifications.read_section", "Earlier")}
                      </Text>
                    </View>
                  )}
                  {groupedNotifications.read.map((n) => {
                    const IconComponent = getNotificationIcon(n.type);
                    const iconColor = getIconColor(n.type, n.read);
                    return (
                      <TouchableOpacity
                        key={n.id}
                        style={[
                          styles.notificationItem,
                          styles.notificationItemRead,
                          isSmallMobile && styles.notificationItemSmallMobile,
                        ]}
                        onPress={() => handleNotificationClick(n)}
                      >
                        <View
                          style={[
                            styles.iconContainer,
                            styles.iconContainerRead,
                            isSmallMobile && styles.iconContainerSmallMobile,
                          ]}
                        >
                          <IconComponent
                            size={isSmallMobile ? 18 : 20}
                            color={iconColor}
                            strokeWidth={2}
                          />
                        </View>
                        <View style={styles.notificationContent}>
                          <Text
                            style={[
                              styles.notificationTitle,
                              styles.notificationTitleRead,
                              isSmallMobile && styles.notificationTitleSmallMobile,
                            ]}
                            numberOfLines={1}
                          >
                            {n.title}
                          </Text>
                          <Text
                            style={[
                              styles.notificationBody,
                              isSmallMobile && styles.notificationBodySmallMobile,
                            ]}
                            numberOfLines={2}
                          >
                            {n.body}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 6,
                              marginTop: 4,
                            }}
                          >
                            <Clock size={12} color="#94A3B8" strokeWidth={2} />
                            <Text
                              style={[
                                styles.notificationTime,
                                isSmallMobile && styles.notificationTimeSmallMobile,
                              ]}
                            >
                              {formatRelativeTime(new Date(n.date))}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayContent: {
    flex: 1,
  },
  panel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 520,
    maxWidth: "100%",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    flexDirection: "column",
  },
  panelSmallMobile: {
    width: "100%",
  },
  panelMobile: {
    width: "90%",
  },
  panelTablet: {
    width: 480,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 28,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  headerSmallMobile: {
    padding: 20,
    paddingHorizontal: 16,
  },
  headerMobile: {
    padding: 22,
    paddingHorizontal: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 0,
    backgroundColor: "#F0F7FF",
    borderWidth: 1,
    borderColor: "#E0EFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerIconContainerSmallMobile: {
    width: 36,
    height: 36,
  },
  headerTextContainer: {
    flexDirection: "column",
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  headerTitleSmallMobile: {
    fontSize: 16,
    lineHeight: 20,
  },
  headerTitleMobile: {
    fontSize: 17,
    lineHeight: 22,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    letterSpacing: 0.05,
  },
  headerSubtitleSmallMobile: {
    fontSize: 11,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  markAllButton: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    letterSpacing: 0.15,
  },
  markAllButtonSmallMobile: {
    fontSize: 11,
  },
  closeButton: {
    padding: 8,
    borderRadius: 0,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 64,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyStateSmallMobile: {
    padding: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 0,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    letterSpacing: 0.05,
  },
  emptyTextSmallMobile: {
    fontSize: 14,
  },
  emptyDescription: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    letterSpacing: 0.02,
  },
  emptyDescriptionSmallMobile: {
    fontSize: 12,
  },
  notificationsList: {
    flexDirection: "column",
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionHeaderRead: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 22,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FAFBFC",
    gap: 16,
  },
  notificationItemRead: {
    backgroundColor: "#FFFFFF",
    opacity: 0.85,
  },
  notificationItemSmallMobile: {
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1.5,
  },
  iconContainerRead: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  iconContainerSmallMobile: {
    width: 40,
    height: 40,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 0,
    flexShrink: 0,
    marginTop: 4,
  },
  unreadDotSmallMobile: {
    width: 6,
    height: 6,
    borderRadius: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: 22,
    marginBottom: 4,
    flex: 1,
    letterSpacing: -0.15,
  },
  notificationTitleRead: {
    fontWeight: "500",
    color: "#475569",
    letterSpacing: -0.1,
  },
  notificationTitleSmallMobile: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationBody: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 4,
    letterSpacing: 0.02,
  },
  notificationBodySmallMobile: {
    fontSize: 12,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    color: "#94A3B8",
    letterSpacing: 0.05,
  },
  notificationTimeSmallMobile: {
    fontSize: 10,
  },
});
