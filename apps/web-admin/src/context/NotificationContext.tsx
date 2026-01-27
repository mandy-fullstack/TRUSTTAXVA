import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { socket } from '../services/socket';
import { getToken } from '../lib/cookies';

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
            const audio = new Audio('/notification.mp3');
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
                    if (lastMsg.sender?.role === 'CLIENT') {
                        const exists = notifications.some(n => n.id === lastMsg.id);
                        if (!exists) {
                            newNotifications.push({
                                id: lastMsg.id,
                                type: 'message',
                                title: 'Nuevo mensaje de cliente',
                                body: `De: ${conv.client?.name || 'Cliente'}`,
                                date: msgDate,
                                read: false,
                                link: `/chat/${conv.id}`
                            });
                            if (msgDate > lastCheckRef.current) {
                                hasNewAlert = true;
                            }
                        }
                    }
                }
            }

            if (newNotifications.length > 0) {
                setNotifications(prev => [...newNotifications, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));

                if (hasNewAlert && permission === 'granted') {
                    new Notification('Admin Alert', { body: 'New client activity.' });
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
                if (permission === 'granted') {
                    playSound();
                    new Notification(newNotif.title, { body: newNotif.body });
                }
            });

            const interval = setInterval(checkUpdates, 60000);
            return () => {
                socket.off('notification');
                socket.disconnect();
                clearInterval(interval);
            };
        }
    }, [isAuthenticated, permission]);

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
