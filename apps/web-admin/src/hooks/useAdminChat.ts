import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useSocket } from './useSocket';

export const useAdminChat = (conversationId: string | null | undefined) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    const { socket, isConnected } = useSocket(conversationId ? `conversation_${conversationId}` : undefined);

    const fetchMessages = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const data = await api.getConversation(id);
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (conversationId && socket) {
            fetchMessages(conversationId);

            // Mark as read when entering
            socket.emit('markAsRead', { conversationId });

            const handleNewMessage = (msg: any) => {
                if (msg.conversationId === conversationId) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    // Auto-mark as read
                    socket.emit('markAsRead', { conversationId });
                }
            };

            socket.on('newMessage', handleNewMessage);

            socket.on('messagesRead', (data: any) => {
                if (data.conversationId === conversationId) {
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        isRead: msg.senderId === data.userId ? true : msg.isRead
                    })));
                }
            });

            return () => {
                socket.off('newMessage', handleNewMessage);
                socket.off('messagesRead');
            };
        } else {
            setMessages([]);
        }
    }, [conversationId, socket, fetchMessages]);

    const sendMessage = async (content: string) => {
        if (!conversationId) return;
        try {
            const newMessage = await api.sendMessage(conversationId, content);
            setMessages(prev => [...prev, newMessage]);
            return newMessage;
        } catch (error) {
            console.error('Failed to send message', error);
            throw error;
        }
    };

    const handleTyping = (isTypingNow: boolean) => {
        if (!conversationId || !socket) return;

        if (isTypingNow) {
            if (!isTyping) {
                setIsTyping(true);
                socket.emit('typing', { conversationId, isTyping: true });
            }
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                socket.emit('typing', { conversationId, isTyping: false });
            }, 2000);
        } else {
            setIsTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            socket.emit('typing', { conversationId, isTyping: false });
        }
    };

    return {
        messages,
        loading,
        sendMessage,
        handleTyping,
        isOtherTyping,
        setIsOtherTyping,
        isConnected,
        socket
    };
};
