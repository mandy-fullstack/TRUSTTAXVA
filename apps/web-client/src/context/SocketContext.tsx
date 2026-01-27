import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { socket } from '../services/socket';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: typeof socket;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { token, user } = useAuth();
    const [isConnected, setIsConnected] = useState(socket.connected);
    const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize notification sound
        notificationSoundRef.current = new Audio('/notification.mp3');
        notificationSoundRef.current.volume = 0.5;

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        // Connect only if authenticated
        if (token && user) {
            // Update auth token in handshake
            socket.auth = { token };

            if (!socket.connected) {
                console.log('Global Socket Connecting...');
                socket.connect();
            }
        } else {
            if (socket.connected) {
                console.log('Global Socket Disconnecting (No Auth)...');
                socket.disconnect();
            }
        }

        function onConnect() {
            setIsConnected(true);
            console.log('Global Socket Connected:', socket.id);
        }

        function onDisconnect() {
            setIsConnected(false);
            console.log('Global Socket Disconnected');
        }

        function onNotification(data: any) {
            console.log('🔔 Global Notification:', data);

            // Play notification sound
            if (notificationSoundRef.current) {
                notificationSoundRef.current.play().catch(err => {
                    console.log('Could not play notification sound:', err);
                });
            }

            // Show browser notification with click handler
            if (Notification.permission === 'granted') {
                const notification = new Notification(data.title || 'New Message', {
                    body: data.message || 'You have a new message',
                    icon: '/logo.png',
                    tag: data.conversationId,
                    requireInteraction: false,
                });

                // Make notification clickable - navigate to conversation
                notification.onclick = () => {
                    window.focus();
                    if (data.conversationId) {
                        window.location.href = `/dashboard/chat/${data.conversationId}`;
                    }
                    notification.close();
                };
            }
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('notification', onNotification);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('notification', onNotification);
        };
    }, [token, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocketContext must be used within SocketProvider');
    return context;
};
