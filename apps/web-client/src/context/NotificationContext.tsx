import { getToken } from '../lib/cookies';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { socket } from '../services/socket';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationItem {
    id: string;
    type: 'message' | 'order';
    title: string;
    body: string;
    date: Date;
    read: boolean;
    link: string;
}

interface NotificationContextType {
    permission: NotificationPermission;
    requestPermission: () => Promise<void>;
    notifications: NotificationItem[];
    markAsRead: (id: string) => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const lastCheckRef = useRef<Date>(new Date());

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const perm = await Notification.requestPermission();
            setPermission(perm);
        }
    };

    const playSound = () => {
        try {
            const audio = new Audio('/assets/notification.mp3');
            audio.play().catch(() => { });
        } catch (e) {
            // ignore
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const checkUpdates = async () => {
        if (!isAuthenticated) return;

        try {
            const [conversations, orders] = await Promise.all([
                api.getConversations().catch(() => []),
                api.getOrders().catch(() => [])
            ]);

            const newNotifications: NotificationItem[] = [];
            let hasNewAlert = false;

            // Check messages
            for (const conv of conversations) {
                if (conv.messages && conv.messages.length > 0) {
                    const lastMsg = conv.messages[0];
                    const msgDate = new Date(lastMsg.createdAt);

                    // Add to notification list if it's new-ish (e.g. last 24h) and unread from preparer
                    // Simplified logic: Just check if it's from preparer. Real app needs true "read" status from API.
                    if (lastMsg.sender?.role !== 'CLIENT') {
                        // Check if we already have this notification
                        const exists = notifications.some(n => n.id === lastMsg.id);
                        if (!exists) {
                            newNotifications.push({
                                id: lastMsg.id,
                                type: 'message',
                                title: 'Nuevo mensaje',
                                body: `De: ${conv.preparer?.name || 'Soporte'}`,
                                date: msgDate,
                                read: false,
                                link: `/dashboard/chat/${conv.id}`
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
                // We will use a STABLE ID for the order to prevent duplicates.
                // We overwrite the existing notification for this order if it exists.
                const notifId = `order-${order.id}`;

                // Find existing index
                const existingIndex = notifications.findIndex(n => n.id === notifId);
                const existingNotif = existingIndex !== -1 ? notifications[existingIndex] : null;

                // Determine if this is a newer update than what we have
                const isNewer = existingNotif ? orderDate > existingNotif.date : true;

                if (isNewer) {
                    const isNewUpdate = orderDate > lastCheckRef.current;

                    // Helper text for notification status
                    const statusMap: Record<string, string> = {
                        'APPROVED': 'Aprobada',
                        'REJECTED': 'Rechazada',
                        'IN_PROGRESS': 'En Progreso',
                        'COMPLETED': 'Completada',
                        'PENDING': 'Pendiente',
                        'needs_info': 'Requiere Información'
                    };

                    let notifTitle = 'Actualización de Orden';
                    let notifBody = `Orden ${order.displayId || order.id.slice(0, 8)}: ${statusMap[order.status] || order.status}`;
                    let notifLink = `/dashboard/orders/${order.id}`;

                    // Check for pending approvals
                    // @ts-ignore - approvals is joined now
                    if (order.approvals && order.approvals.length > 0) {
                        const pendingApproval = order.approvals[0]; // Logic: first pending one
                        notifTitle = 'Acción Requerida';
                        notifBody = `Aprobación pendiente: ${pendingApproval.title}`;
                        // We could link directly to approval section if we had anchors?
                    }
                    // Verify if status changed recently
                    else if (existingNotif && existingNotif.body !== notifBody) {
                        // Body changed (status changed)
                        notifTitle = 'Estado Actualizado';
                    }

                    // Construct new item
                    const newItem: NotificationItem = {
                        id: notifId,
                        type: 'order',
                        title: notifTitle,
                        body: notifBody,
                        date: orderDate,
                        read: false,
                        link: notifLink
                    };

                    // If this is the FIRST load (no existing), and it's old (> 24h), maybe mark as read?
                    if (!existingNotif) {
                        const oneDay = 24 * 60 * 60 * 1000;
                        if (Date.now() - orderDate.getTime() > oneDay) {
                            newItem.read = true;
                        }
                    }

                    newNotifications.push(newItem);

                    // Only alert if it's actually new since last poll
                    if (isNewUpdate && permission === 'granted') {
                        hasNewAlert = true;
                        // Use 'tag' to replace existing browser notification for same order
                        new Notification('TrustTax Update', {
                            body: newItem.body,
                            icon: '/vite.svg',
                            tag: `order-${order.id}`
                        });
                    }
                }
            }

            if (newNotifications.length > 0) {
                setNotifications(prev => {
                    // Remove any items from 'prev' that are present in 'newNotifications' (by ID)
                    // This ensures we replace the old one with the new one
                    const prevFiltered = prev.filter(p => !newNotifications.some(n => n.id === p.id));
                    return [...newNotifications, ...prevFiltered].sort((a, b) => b.date.getTime() - a.date.getTime());
                });

                if (hasNewAlert && permission === 'granted') {
                    // We play sound once even if multiple updates came in
                    playSound();
                }
            }

            lastCheckRef.current = new Date();
        } catch (error) {
            console.error('Notification poll failed', error);
        }
    };


    useEffect(() => {
        if (isAuthenticated) {
            // Initial poll to catch up
            checkUpdates();

            // Connect socket
            socket.auth = { token: getToken() };
            socket.connect();

            socket.on('notification', (payload: any) => {
                const newNotif: NotificationItem = {
                    id: Math.random().toString(36).substr(2, 9), // Temp ID or from payload if available
                    type: payload.type || 'order',
                    title: payload.title,
                    body: payload.body,
                    date: new Date(),
                    read: false,
                    link: payload.link
                };

                setNotifications(prev => [newNotif, ...prev]);
                if (permission === 'granted') {
                    playSound();
                    new Notification(newNotif.title, {
                        body: newNotif.body,
                        icon: '/vite.svg'
                    });
                }
            });

            // Keep polling as backup/sync mechanism, maybe less frequent
            const interval = setInterval(checkUpdates, 60000); // Poll every 60 seconds

            return () => {
                socket.off('notification');
                socket.disconnect();
                clearInterval(interval);
            };
        }
    }, [isAuthenticated]);

    return (
        <NotificationContext.Provider value={{ permission, requestPermission, notifications, markAsRead, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};
