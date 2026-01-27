import { useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';

export const useSocket = (roomId?: string) => {
    const { socket, isConnected } = useSocketContext();

    useEffect(() => {
        if (roomId && isConnected) {
            console.log('Joining room:', roomId);
            socket.emit('joinRoom', roomId);

            return () => {
                console.log('Leaving room:', roomId);
                socket.emit('leaveRoom', roomId);
            };
        }
    }, [roomId, isConnected, socket]);

    return {
        socket,
        isConnected,
    };
};
