import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useSocket } from './useSocket';
import { useAuth } from '../context/AuthContext';

export const useAdminChat = (conversationId: string | null | undefined) => {
    const { user } = useAuth();
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
            socket.emit('markAsDelivered', { conversationId });

            const handleNewMessage = (msg: any) => {
                if (msg.conversationId === conversationId) {
                    setMessages(prev => {
                        // 1. Check if we already have this real ID
                        if (prev.some(m => m.id === msg.id)) return prev;

                        // 2. If it's our own message, try to match it with an optimistic one
                        if (msg.senderId === user?.id) {
                            let optimisticIdx = -1;
                            for (let i = prev.length - 1; i >= 0; i--) {
                                if (prev[i].id.startsWith('temp-') && prev[i].content === msg.content) {
                                    optimisticIdx = i;
                                    break;
                                }
                            }

                            if (optimisticIdx !== -1) {
                                const newMessages = [...prev];
                                newMessages[optimisticIdx] = msg;
                                return newMessages;
                            }
                        }

                        return [...prev, msg];
                    });
                    // Auto-mark as read and delivered
                    socket.emit('markAsRead', { conversationId });
                    socket.emit('markAsDelivered', { conversationId });
                }
            };

            socket.on('newMessage', handleNewMessage);

            socket.on('messagesRead', (data: any) => {
                if (data.conversationId === conversationId) {
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        isRead: msg.senderId !== data.userId ? true : msg.isRead,
                        isDelivered: msg.senderId !== data.userId ? true : msg.isDelivered
                    })));
                }
            });

            socket.on('messagesDelivered', (data: any) => {
                if (data.conversationId === conversationId) {
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        isDelivered: msg.senderId !== data.userId ? true : msg.isDelivered
                    })));
                }
            });

            return () => {
                socket.off('newMessage', handleNewMessage);
                socket.off('messagesRead');
                socket.off('messagesDelivered');
            };
        } else {
            setMessages([]);
        }
    }, [conversationId, socket, fetchMessages]);

    const sendMessage = async (content: string, documentId?: string) => {
        if (!conversationId || (!content.trim() && !documentId)) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            id: tempId,
            content,
            documentId,
            senderId: user?.id,
            conversationId,
            createdAt: new Date().toISOString(),
            status: 'sending',
            sender: user
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            const newMessage = await api.sendMessage(conversationId, content, documentId);
            setMessages(prev => {
                const alreadyAdded = prev.some(m => m.id === newMessage.id);
                if (alreadyAdded) {
                    return prev.filter(m => m.id !== tempId);
                }
                return prev.map(m => m.id === tempId ? newMessage : m);
            });
            return newMessage;
        } catch (error) {
            console.error('Failed to send message', error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
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
