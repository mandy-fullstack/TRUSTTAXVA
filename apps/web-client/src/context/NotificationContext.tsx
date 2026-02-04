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
import { useSocketContext } from "./SocketContext";
import { requestFCMToken, onMessageListener } from "../lib/firebase";

interface NotificationItem {
  id: string;
  type: "message" | "order";
  title: string;
  body: string;
  date: Date;
  read: boolean;
  link: string;
}

interface NotificationContextType {
  permission: NotificationPermission;
  isStandalone: boolean;
  isIOS: boolean;
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
  const { socket, isConnected } = useSocketContext();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const lastCheckRef = useRef<Date>(new Date());
  // Track recent socket notifications to avoid duplicates with polling
  const recentSocketNotificationsRef = useRef<Set<string>>(new Set());
  // Dedupe guard (covers socket/poll/FCM duplicates)
  const seenNotificationsRef = useRef<Map<string, number>>(new Map());

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setPermission(window.Notification.permission);
      }

      // Check if iOS
      const ios =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      setIsIOS(ios);

      // Check if standalone (installed as PWA)
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");
      setIsStandalone(!!standalone);

      // If iOS and not standalone, show a tip after a delay
      if (ios && !standalone) {
        setTimeout(() => {
          showToast({
            title: "💡 Tip para iPhone",
            message:
              'Para recibir notificaciones, pulsa "Compartir" y luego "Añadir a la pantalla de inicio".',
            type: "info",
            duration: 10000,
          });
        }, 5000);
      }
    }
  }, [showToast]);

  const requestPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await window.Notification.requestPermission();
        setPermission(perm);

        if (perm === "granted" && isAuthenticated) {
          setupFCM();
        }
      } catch (e) {
        console.warn("Notification permission request failed", e);
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
      console.log("FCM Token generated:", token);
      await api.updateFCMToken(token);
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

  const makeDedupeKey = (n: Pick<NotificationItem, "type" | "title" | "body" | "link">) => {
    const raw = `${n.type}|${n.title}|${n.body}|${n.link}`;
    return raw.toLowerCase();
  };

  const shouldSkipAsDuplicate = (key: string, windowMs: number) => {
    const now = Date.now();
    const last = seenNotificationsRef.current.get(key);
    if (last && now - last < windowMs) return true;
    seenNotificationsRef.current.set(key, now);
    // Light cleanup to avoid unbounded growth
    if (seenNotificationsRef.current.size > 500) {
      const cutoff = now - 60 * 60 * 1000; // 1 hour
      for (const [k, t] of seenNotificationsRef.current.entries()) {
        if (t < cutoff) seenNotificationsRef.current.delete(k);
      }
    }
    return false;
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const sendBrowserNotification = (
    title: string,
    body: string,
    tag?: string,
  ) => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      permission === "granted"
    ) {
      try {
        new window.Notification(title, {
          body,
          icon: "/vite.svg",
          tag,
        });
      } catch (e) {
        console.warn("Failed to send browser notification", e);
      }
    }
  };

  const checkUpdates = async () => {
    if (!isAuthenticated) return;

    try {
      const [conversations, orders] = await Promise.all([
        api.getConversations().catch(() => []),
        api.getOrders().catch(() => []),
      ]);

      const newNotifications: NotificationItem[] = [];
      let hasNewAlert = false;

      // Check messages - but skip if we already received a socket notification for this conversation
      // This prevents duplicates between socket notifications and polling
      for (const conv of conversations) {
        if (conv.messages && conv.messages.length > 0) {
          const lastMsg = conv.messages[0];
          const msgDate = new Date(lastMsg.createdAt);

          if (lastMsg.sender?.role !== "CLIENT") {
            // Skip if we recently received a socket notification for this conversation
            if (recentSocketNotificationsRef.current.has(conv.id)) {
              continue;
            }

            // IMPORTANT:
            // Previously we skipped "recent" messages whenever the socket was connected,
            // assuming the socket notification would always arrive. In practice, reconnects
            // and transient drops can cause the socket event to be missed, resulting in
            // missing notifications. We only skip when we *actually* saw a socket notif
            // (recentSocketNotificationsRef), which is handled above.

            // Check if notification already exists by message ID or by conversation link
            const exists = notifications.some(
              (n) => n.id === lastMsg.id || 
              (n.type === "message" && n.link === `/dashboard/chat/${conv.id}` && 
               Math.abs(new Date(n.date).getTime() - msgDate.getTime()) < 60000) // Within 1 minute
            );
            
            if (!exists) {
              // Dedupe across sources (poll can still overlap with socket/FCM)
              const dedupeKey = makeDedupeKey({
                type: "message",
                title: "Nuevo mensaje",
                body: `De: ${conv.preparer?.name || "Soporte"}`,
                link: `/dashboard/chat/${conv.id}`,
              });
              if (shouldSkipAsDuplicate(dedupeKey, 15_000)) {
                continue;
              }

              newNotifications.push({
                id: lastMsg.id,
                type: "message",
                title: "Nuevo mensaje",
                body: `De: ${conv.preparer?.name || "Soporte"}`,
                date: msgDate,
                read: false,
                link: `/dashboard/chat/${conv.id}`,
              });

              if (msgDate > lastCheckRef.current) {
                hasNewAlert = true;
              }
            }
          }
        }
      }

      // Check orders
      for (const order of orders) {
        const orderDate = new Date(order.updatedAt);
        const notifId = `order-${order.id}`;

        const existingIndex = notifications.findIndex((n) => n.id === notifId);
        const existingNotif =
          existingIndex !== -1 ? notifications[existingIndex] : null;

        const isNewer = existingNotif ? orderDate > existingNotif.date : true;

        if (isNewer) {
          const isNewUpdate = orderDate > lastCheckRef.current;

          const statusMap: Record<string, string> = {
            APPROVED: "Aprobada",
            REJECTED: "Rechazada",
            IN_PROGRESS: "En Progreso",
            COMPLETED: "Completada",
            PENDING: "Pendiente",
            needs_info: "Requiere Información",
          };

          let notifTitle = "Actualización de Orden";
          let notifBody = `Orden ${order.displayId || order.id.slice(0, 8)}: ${statusMap[order.status] || order.status}`;
          let notifLink = `/dashboard/orders/${order.id}`;

          if (order.approvals && order.approvals.length > 0) {
            const pendingApproval = order.approvals[0];
            notifTitle = "Acción Requerida";
            notifBody = `Aprobación pendiente: ${pendingApproval.title}`;
          } else if (existingNotif && existingNotif.body !== notifBody) {
            notifTitle = "Estado Actualizado";
          }

          const newItem: NotificationItem = {
            id: notifId,
            type: "order",
            title: notifTitle,
            body: notifBody,
            date: orderDate,
            read: false,
            link: notifLink,
          };

          if (!existingNotif) {
            const oneDay = 24 * 60 * 60 * 1000;
            if (Date.now() - orderDate.getTime() > oneDay) {
              newItem.read = true;
            }
          }

          {
            const dedupeKey = makeDedupeKey({
              type: "order",
              title: newItem.title,
              body: newItem.body,
              link: newItem.link,
            });
            if (!shouldSkipAsDuplicate(dedupeKey, 15_000)) {
          newNotifications.push(newItem);
            }
          }

          if (isNewUpdate) {
            hasNewAlert = true;
            sendBrowserNotification(
              "TrustTax Update",
              newItem.body,
              `order-${order.id}`,
            );

            showToast({
              title: newItem.title,
              message: newItem.body,
              type:
                order.status === "REJECTED" || order.status === "needs_info"
                  ? "warning"
                  : "info",
              link: newItem.link,
            });
          }
        }
      }

      if (newNotifications.length > 0) {
        setNotifications((prev) => {
          const prevFiltered = prev.filter(
            (p) => !newNotifications.some((n) => n.id === p.id),
          );
          return [...newNotifications, ...prevFiltered].sort(
            (a, b) => b.date.getTime() - a.date.getTime(),
          );
        });

        if (hasNewAlert && permission === "granted") {
          playSound();
        }
      }

      lastCheckRef.current = new Date();
    } catch (error) {
      console.error("Notification poll failed", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    checkUpdates();
    const interval = setInterval(checkUpdates, 60 * 1000);

    // Use socket from SocketContext - don't create a new connection
    // Only listen for notifications if socket is connected
    if (!isConnected || !socket) {
      return () => {
        clearInterval(interval);
      };
    }

    const handleNotification = (payload: any) => {
      // Create a unique ID for this notification based on payload
      // For messages, use conversationId to group notifications from same conversation
      // For orders, use order ID
      let notificationId: string;
      if (payload.type === "message" && payload.conversationId) {
        // For messages, use conversationId as base ID
        // This allows us to replace old notifications from the same conversation
        notificationId = `msg-${payload.conversationId}`;
      } else if (payload.type === "order" && payload.orderId) {
        notificationId = `order-${payload.orderId}`;
      } else {
        // Fallback: use payload ID or generate one
        notificationId = payload.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      const newNotif: NotificationItem = {
        id: notificationId,
        type: payload.type || "order",
        title: payload.title,
        body: payload.body,
        date: new Date(),
        read: false,
        link: payload.link,
      };

      // Global dedupe: if we just showed the same notif via polling/FCM, skip
      const dedupeKey = makeDedupeKey({
        type: newNotif.type,
        title: newNotif.title,
        body: newNotif.body,
        link: newNotif.link,
      });
      if (shouldSkipAsDuplicate(dedupeKey, 10_000)) {
        return;
      }

      // Track this notification to prevent polling from creating duplicates
      if (payload.type === "message" && payload.conversationId) {
        recentSocketNotificationsRef.current.add(payload.conversationId);
        // Clear after 5 minutes
        setTimeout(() => {
          recentSocketNotificationsRef.current.delete(payload.conversationId);
        }, 5 * 60 * 1000);
      }

      // Check if notification already exists to avoid duplicates
      let wasAdded = false;
      setNotifications((prev) => {
        // For messages, check by conversationId and link to prevent duplicates
        if (payload.type === "message" && payload.conversationId) {
          // Check if we already have a notification for this conversation
          // Compare by conversationId (from link) and time (within 30 seconds)
          const existing = prev.find((n) => {
            if (n.type !== "message") return false;
            // Extract conversationId from link
            const nConvId = n.link.match(/\/chat\/([^\/]+)/)?.[1];
            const payloadConvId = payload.conversationId;
            const isSameConversation = nConvId === payloadConvId || n.link === payload.link;
            const isRecent = Math.abs(new Date(n.date).getTime() - Date.now()) < 30000; // 30 seconds
            return isSameConversation && isRecent;
          });
          
          if (existing) {
            // Update existing notification instead of creating duplicate
            wasAdded = false;
            return prev.map((n) => {
              const nConvId = n.link.match(/\/chat\/([^\/]+)/)?.[1];
              const payloadConvId = payload.conversationId;
              const isSameConversation = nConvId === payloadConvId || n.link === payload.link;
              const isRecent = Math.abs(new Date(n.date).getTime() - Date.now()) < 30000;
              return (isSameConversation && isRecent) ? newNotif : n;
            });
          }
          
          // Remove any existing notifications from this conversation and add new one
          const filtered = prev.filter((n) => {
            if (n.type !== "message") return true;
            const nConvId = n.link.match(/\/chat\/([^\/]+)/)?.[1];
            const payloadConvId = payload.conversationId;
            return !(nConvId === payloadConvId || n.link === payload.link);
          });
          wasAdded = true;
          return [newNotif, ...filtered];
        } else {
          // For other notifications, check by ID or by title+body+link
          const existing = prev.find(
            (n) => n.id === notificationId || 
            (n.title === newNotif.title && n.body === newNotif.body && n.link === newNotif.link &&
             Math.abs(new Date(n.date).getTime() - Date.now()) < 10000) // Within 10 seconds
          );
          if (existing) {
            console.log("Duplicate notification detected, skipping");
            wasAdded = false;
            return prev;
          }
          wasAdded = true;
          return [newNotif, ...prev];
        }
      });

      // Show toast if notification was added (always show toast for new notifications)
      if (wasAdded) {
        showToast({
          title: newNotif.title,
          message: newNotif.body,
          type: "info",
          link: newNotif.link,
        });

        if (permission === "granted") {
          playSound();
          sendBrowserNotification(newNotif.title, newNotif.body);
        }
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
      clearInterval(interval);
      // Don't disconnect socket here - let SocketContext manage it
    };
  }, [isAuthenticated, permission, socket, isConnected]);

  // Separate effect for Firebase Cloud Messaging
  useEffect(() => {
    // Setup FCM Token (even if not authenticated, the api service will skip if no token)
    if (permission === "granted") {
      setupFCM();
    }

    // Foreground FCM Listener - Always active if permission granted
    let unsubscribeFCM: (() => void) | undefined;
    if (permission === "granted") {
      onMessageListener((payload) => {
        console.log("Foreground FCM message received:", payload);
        const notification = payload.notification;
        if (notification) {
          const conversationId = payload.data?.conversationId;
          const link = payload.data?.link || "/";
          
          // Global dedupe (socket vs FCM)
          const dedupeKey = makeDedupeKey({
            type: "message",
            title: notification.title || "New Notification",
            body: notification.body || "",
            link: link,
          });
          const isDup = shouldSkipAsDuplicate(dedupeKey, 10_000);
          if (isDup) return;

          // Add notification (only if not a recent duplicate). This avoids incorrectly
          // skipping *new* updates just because they share conversationId with an
          // earlier notification.
            const newNotif: NotificationItem = {
            id: conversationId
              ? `msg-${conversationId}-${Date.now()}`
              : `fcm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              type: "message",
              title: notification.title || "Notification",
              body: notification.body || "",
              date: new Date(),
              read: false,
              link: link,
            };
            
          setNotifications((prev) => [newNotif, ...prev]);

          // Show toast only if it's a new notification (not duplicate)
            showToast({
              title: notification.title || "New Notification",
              message: notification.body || "",
              type: "info",
              link: payload.data?.link,
            });
        }
      }).then((unsub) => {
        if (unsub) unsubscribeFCM = unsub;
      });
    }

    return () => {
      if (unsubscribeFCM) {
        unsubscribeFCM();
      }
    };
  }, [permission, isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        requestPermission,
        notifications,
        markAsRead,
        unreadCount,
        isStandalone,
        isIOS,
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
