import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { socket } from "../services/socket";
import { getToken } from "../lib/cookies";
import { requestFCMToken, onMessageListener } from "../lib/firebase";
import { useTranslation } from "react-i18next";

interface NotificationItem {
  id: string;
  type: "message" | "order";
  title: string;
  body: string;
  date: Date;
  read: boolean;
  link: string;
  senderName?: string;
  senderId?: string;
}

interface NotificationContextType {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  notifications: NotificationItem[];
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const lastCheckRef = useRef<Date>(new Date());
  
  // Limit notifications to last 100 to prevent memory issues
  const MAX_NOTIFICATIONS = 100;

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted" && isAuthenticated) {
        setupFCM();
      }
    }
  };

  const setupFCM = async () => {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("FCM VAPID key not found in environment variables");
      return;
    }

    const token = await requestFCMToken(vapidKey);
    if (token) {
      console.log("Admin FCM Token generated:", token);
      await api.updateFcmToken(token);
    }
  };

  const playSound = () => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
    } catch (e) {
      // ignore
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const checkUpdates = async () => {
    if (!isAuthenticated) return;

    try {
      // Polling for admin: new orders or new messages
      const [conversations] = await Promise.all([
        api.getConversations().catch(() => []),
      ]);

      const newNotifications: NotificationItem[] = [];
      let hasNewAlert = false;

      // Check messages (Sender role should be CLIENT for admin to be notified)
      for (const conv of conversations) {
        if (conv.messages && conv.messages.length > 0) {
          const lastMsg = conv.messages[0];
          const msgDate = new Date(lastMsg.createdAt);

          // Logic: If message is newer than last check AND sender is CLIENT
          if (lastMsg.sender?.role === "CLIENT") {
            const exists = notifications.some((n) => n.id === lastMsg.id);
            if (!exists) {
              // Use sender name as title instead of "Unassigned Message" or "New Message"
              const senderName = conv.client?.name || "Cliente";
              newNotifications.push({
                id: lastMsg.id,
                type: "message",
                title: senderName, // Use sender name as title
                body: t("notifications.new_message_received", "You have a new message"),
                date: msgDate,
                read: false,
                link: `/chat/${conv.id}`,
                senderName: senderName,
                senderId: lastMsg.senderId,
              });
              if (msgDate > lastCheckRef.current) {
                hasNewAlert = true;
              }
            }
          }
        }
      }

      if (newNotifications.length > 0) {
        setNotifications((prev) => {
          const updated = [...newNotifications, ...prev].sort(
            (a, b) => b.date.getTime() - a.date.getTime(),
          );
          return updated.slice(0, MAX_NOTIFICATIONS);
        });

        if (hasNewAlert && permission === "granted") {
          new Notification("Admin Alert", { body: "New client activity." });
          playSound();
        }
      }

      lastCheckRef.current = new Date();
    } catch (error) {
      console.error("Notification poll failed", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkUpdates();

      if (permission === "granted") {
        setupFCM();
      }

      // Foreground FCM Listener
      let unsubscribeFCM: (() => void) | undefined;
      onMessageListener((payload) => {
        console.log("Admin Foreground message received:", payload);
        const notification = payload.notification;
        if (notification) {
          showToast({
            title: notification.title || "New Notification",
            message: notification.body || "",
            type: "info",
            link: payload.data?.link,
            duration: 10000, // 10 seconds
          });

          const newNotif: NotificationItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: "message",
            title: notification.title || "Notification",
            body: notification.body || "",
            date: new Date(),
            read: false,
            link: payload.data?.link || "/",
            senderName: payload.data?.senderName,
            senderId: payload.data?.senderId,
          };
          setNotifications((prev) => {
            const updated = [newNotif, ...prev].sort(
              (a, b) => b.date.getTime() - a.date.getTime(),
            );
            return updated.slice(0, MAX_NOTIFICATIONS);
          });
        }
      }).then((unsub) => {
        if (unsub) unsubscribeFCM = unsub;
      });

      // Use socket from SocketContext instead of connecting independently
      // The socket is already connected by SocketContext
      if (!socket.connected) {
        socket.auth = { token: getToken() };
        socket.connect();
      }

      socket.on("notification", (payload: any) => {
        // Extract sender name from message or payload
        let senderName: string | undefined;
        if (payload.senderName) {
          senderName = payload.senderName;
        } else if (payload.sender?.name) {
          senderName = payload.sender.name;
        } else if (payload.message) {
          // Try to extract name from message like "You have a new message from John Doe"
          const fromMatch = payload.message.match(/from\s+([^\.]+?)(?:\s|$|\.|in)/i);
          if (fromMatch && fromMatch[1]) {
            senderName = fromMatch[1].trim();
          }
        }

        // For message notifications, use sender name in title if available
        let notificationTitle = payload.title;
        if (payload.type === "message" && senderName) {
          // Use sender name as title instead of "New Message" or "Unassigned Message"
          notificationTitle = senderName;
        } else if (payload.type === "message" && !senderName) {
          // If no sender name, use a generic title
          notificationTitle = t("notifications.new_message", "New Message");
        }

        const newNotif: NotificationItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: payload.type || "order",
          title: notificationTitle,
          body: payload.body || payload.message || "",
          date: new Date(),
          read: false,
          link: payload.link || payload.conversationId ? `/chat/${payload.conversationId}` : "/",
          senderName: senderName,
          senderId: payload.senderId || payload.sender?.id,
        };

        setNotifications((prev) => {
          const updated = [newNotif, ...prev].sort(
            (a, b) => b.date.getTime() - a.date.getTime(),
          );
          return updated.slice(0, MAX_NOTIFICATIONS);
        });

        // Improve toast message to show sender name prominently
        let toastTitle = newNotif.title;
        let toastMessage = newNotif.body;
        
        if (newNotif.type === "message") {
          // For messages, always show sender name in title if available
          if (senderName) {
            toastTitle = senderName;
            // Always show a clean message, remove "unassigned" references
            toastMessage = t("notifications.new_message_received", "You have a new message");
          } else {
            // If no sender name, use a generic title
            toastTitle = t("notifications.new_message", "New Message");
            // Remove "unassigned" from message if present
            toastMessage = toastMessage.replace(/unassigned chat/gi, "").replace(/in\s+$/i, "").trim();
            if (!toastMessage) {
              toastMessage = t("notifications.new_message_received", "You have a new message");
            }
          }
        } else {
          // For other notification types, clean up "unassigned" references
          if (toastTitle.toLowerCase().includes("unassigned")) {
            toastTitle = toastTitle.replace(/unassigned\s+/gi, "").trim();
          }
          if (toastMessage.toLowerCase().includes("unassigned")) {
            toastMessage = toastMessage.replace(/unassigned chat/gi, "").replace(/in\s+$/i, "").trim();
          }
        }

        showToast({
          title: toastTitle,
          message: toastMessage,
          type: "info",
          link: newNotif.link,
          duration: 10000, // 10 seconds instead of default 5
        });

        if (permission === "granted") {
          playSound();
          new Notification(newNotif.title, { body: newNotif.body });
        }
      });

      const interval = setInterval(checkUpdates, 60000);
      return () => {
        if (unsubscribeFCM) {
          unsubscribeFCM();
        }
        socket.off("notification");
        // Don't disconnect here - let SocketContext manage the connection
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, permission]);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        requestPermission,
        notifications,
        markAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be used within NotificationProvider");
  return context;
};
