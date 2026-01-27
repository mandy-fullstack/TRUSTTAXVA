import { createContext, useContext, useEffect, useState } from 'react';
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
            console.log('Global Notification:', data);
            // Ideally trigger a toast here. 
            // For now verifying the event works.
            if (Notification.permission === 'granted') {
                new Notification(data.title, { body: data.message });
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
