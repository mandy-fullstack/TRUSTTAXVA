import { getToken } from '../lib/cookies';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { socket } from '../services/socket';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

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
    isStandalone: boolean;
    isIOS: boolean;
    requestPermission: () => Promise<void>;
    notifications: NotificationItem[];
    markAsRead: (id: string) => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isStandalone, setIsStandalone] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const lastCheckRef = useRef<Date>(new Date());

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if ('Notification' in window) {
                setPermission(window.Notification.permission);
            }

            // Check if iOS
            const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            setIsIOS(ios);

            // Check if standalone (installed as PWA)
            const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone ||
                document.referrer.includes('android-app://');
            setIsStandalone(!!standalone);
        }
    }, []);

    const requestPermission = async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            try {
                const perm = await window.Notification.requestPermission();
                setPermission(perm);
            } catch (e) {
                console.warn('Notification permission request failed', e);
            }
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

    const sendBrowserNotification = (title: string, body: string, tag?: string) => {
        if (typeof window !== 'undefined' && 'Notification' in window && permission === 'granted') {
            try {
                new window.Notification(title, {
                    body,
                    icon: '/vite.svg',
                    tag
                });
            } catch (e) {
                console.warn('Failed to send browser notification', e);
            }
        }
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

                    if (lastMsg.sender?.role !== 'CLIENT') {
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
                const notifId = `order-${order.id}`;

                const existingIndex = notifications.findIndex(n => n.id === notifId);
                const existingNotif = existingIndex !== -1 ? notifications[existingIndex] : null;

                const isNewer = existingNotif ? orderDate > existingNotif.date : true;

                if (isNewer) {
                    const isNewUpdate = orderDate > lastCheckRef.current;

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

                    if (order.approvals && order.approvals.length > 0) {
                        const pendingApproval = order.approvals[0];
                        notifTitle = 'Acción Requerida';
                        notifBody = `Aprobación pendiente: ${pendingApproval.title}`;
                    }
                    else if (existingNotif && existingNotif.body !== notifBody) {
                        notifTitle = 'Estado Actualizado';
                    }

                    const newItem: NotificationItem = {
                        id: notifId,
                        type: 'order',
                        title: notifTitle,
                        body: notifBody,
                        date: orderDate,
                        read: false,
                        link: notifLink
                    };

                    if (!existingNotif) {
                        const oneDay = 24 * 60 * 60 * 1000;
                        if (Date.now() - orderDate.getTime() > oneDay) {
                            newItem.read = true;
                        }
                    }

                    newNotifications.push(newItem);

                    if (isNewUpdate) {
                        hasNewAlert = true;
                        sendBrowserNotification('TrustTax Update', newItem.body, `order-${order.id}`);

                        showToast({
                            title: newItem.title,
                            message: newItem.body,
                            type: order.status === 'REJECTED' || order.status === 'needs_info' ? 'warning' : 'info',
                            link: newItem.link
                        });
                    }
                }
            }

            if (newNotifications.length > 0) {
                setNotifications(prev => {
                    const prevFiltered = prev.filter(p => !newNotifications.some(n => n.id === p.id));
                    return [...newNotifications, ...prevFiltered].sort((a, b) => b.date.getTime() - a.date.getTime());
                });

                if (hasNewAlert && permission === 'granted') {
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
            checkUpdates();

            socket.auth = { token: getToken() };
            socket.connect();

            socket.on('notification', (payload: any) => {
                const newNotif: NotificationItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: payload.type || 'order',
                    title: payload.title,
                    body: payload.body,
                    date: new Date(),
                    read: false,
                    link: payload.link
                };

                setNotifications(prev => [newNotif, ...prev]);

                showToast({
                    title: newNotif.title,
                    message: newNotif.body,
                    type: 'info',
                    link: newNotif.link
                });

                if (permission === 'granted') {
                    playSound();
                    sendBrowserNotification(newNotif.title, newNotif.body);
                }
            });

            const interval = setInterval(checkUpdates, 60000);

            return () => {
                socket.off('notification');
                socket.disconnect();
                clearInterval(interval);
            };
        }
    }, [isAuthenticated, permission]); // Added permission dependency to ensure we use latest value

    return (
        <NotificationContext.Provider value={{
            permission,
            isStandalone,
            isIOS,
            requestPermission,
            notifications,
            markAsRead,
            unreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};
