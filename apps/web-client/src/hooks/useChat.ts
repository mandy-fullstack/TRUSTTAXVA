import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useChat = (conversationId: string | null | undefined) => {
    const { user } = useAuth();
    const { socket, isConnected } = useSocket(conversationId ? `conversation_${conversationId}` : undefined);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

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

    const sendMessage = useCallback(async (content: string) => {
        if (!conversationId || !content.trim()) return;
        try {
            const message = await api.sendMessage(conversationId, content);
            // socket.emit('newMessage') is handled by backend emitting back to room
            return message;
        } catch (error) {
            console.error('Failed to send message', error);
            throw error;
        }
    }, [conversationId]);

    const markAsRead = useCallback(() => {
        if (conversationId && isConnected) {
            socket.emit('markAsRead', { conversationId });
            socket.emit('markAsDelivered', { conversationId });
        }
    }, [conversationId, isConnected, socket]);

    const handleTyping = useCallback((isTypingValue: boolean) => {
        if (!conversationId || !isConnected) return;

        if (isTypingValue !== isTyping) {
            setIsTyping(isTypingValue);
            socket.emit('typing', { conversationId, isTyping: isTypingValue });
        }

        if (isTypingValue) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                socket.emit('typing', { conversationId, isTyping: false });
            }, 1500);
        }
    }, [conversationId, isConnected, socket, isTyping]);

    useEffect(() => {
        if (!conversationId || !isConnected) {
            setMessages([]);
            return;
        }

        fetchMessages(conversationId);
        markAsRead();

        const handleNewMessage = (msg: any) => {
            if (msg.conversationId === conversationId) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                markAsRead();
            }
        };

        const handleUserTyping = (data: any) => {
            if (data.conversationId === conversationId && data.userId !== user?.id) {
                setIsOtherTyping(data.isTyping);
            }
        };

        const handleMessagesRead = (data: any) => {
            if (data.conversationId === conversationId) {
                setMessages(prev => prev.map(msg => ({
                    ...msg,
                    isRead: msg.senderId !== data.userId ? true : msg.isRead,
                    isDelivered: msg.senderId !== data.userId ? true : msg.isDelivered
                })));
            }
        };

        const handleMessagesDelivered = (data: any) => {
            if (data.conversationId === conversationId) {
                setMessages(prev => prev.map(msg => ({
                    ...msg,
                    isDelivered: msg.senderId !== data.userId ? true : msg.isDelivered
                })));
            }
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('userTyping', handleUserTyping);
        socket.on('messagesRead', handleMessagesRead);
        socket.on('messagesDelivered', handleMessagesDelivered);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('userTyping', handleUserTyping);
            socket.off('messagesRead', handleMessagesRead);
            socket.off('messagesDelivered', handleMessagesDelivered);
        };
    }, [conversationId, isConnected, socket, user?.id, fetchMessages, markAsRead]);

    return {
        messages,
        loading,
        sendMessage,
        isOtherTyping,
        handleTyping,
        markAsRead,
        isConnected
    };
};
