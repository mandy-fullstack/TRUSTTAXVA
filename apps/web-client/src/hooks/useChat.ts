import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const useChat = (conversationId: string | null | undefined) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket(
    conversationId ? `conversation_${conversationId}` : undefined,
  );
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
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, documentId?: string, document?: any) => {
      if (!conversationId || (!content.trim() && !documentId)) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        content,
        documentId,
        document,
        senderId: user?.id,
        conversationId,
        createdAt: new Date().toISOString(),
        status: "sending",
        sender: user,
      };

      // Add optimistic message
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const message = await api.sendMessage(
          conversationId,
          content,
          documentId,
        );

        // Replace optimistic message with real message
        // We search for the tempId to ensure we don't duplicate if socket already added it
        setMessages((prev) => {
          const alreadyAdded = prev.some((m) => m.id === message.id);
          if (alreadyAdded) {
            return prev.filter((m) => m.id !== tempId);
          }
          return prev.map((m) => (m.id === tempId ? message : m));
        });
        return message;
      } catch (error) {
        console.error("Failed to send message", error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw error;
      }
    },
    [conversationId, user],
  );

  const markAsRead = useCallback(() => {
    if (conversationId && isConnected) {
      socket.emit("markAsRead", { conversationId });
      socket.emit("markAsDelivered", { conversationId });
    }
  }, [conversationId, isConnected, socket]);

  const handleTyping = useCallback(
    (isTypingValue: boolean) => {
      if (!conversationId || !isConnected) return;

      if (isTypingValue !== isTyping) {
        setIsTyping(isTypingValue);
        socket.emit("typing", { conversationId, isTyping: isTypingValue });
      }

      if (isTypingValue) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          socket.emit("typing", { conversationId, isTyping: false });
        }, 1500);
      }
    },
    [conversationId, isConnected, socket, isTyping],
  );

  useEffect(() => {
    if (!conversationId || !isConnected) {
      setMessages([]);
      return;
    }

    fetchMessages(conversationId);
    markAsRead();

    const handleNewMessage = (msg: any) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          // 1. Check if we already have this real ID
          if (prev.some((m) => m.id === msg.id)) return prev;

          // 2. If it's our own message, try to match it with an optimistic one
          // to prevent "double bubble" while the API request is pending
          if (msg.senderId === user?.id) {
            let optimisticIdx = -1;
            for (let i = prev.length - 1; i >= 0; i--) {
              if (
                prev[i].id.startsWith("temp-") &&
                prev[i].content === msg.content
              ) {
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
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            isRead: msg.senderId !== data.userId ? true : msg.isRead,
            isDelivered: msg.senderId !== data.userId ? true : msg.isDelivered,
          })),
        );
      }
    };

    const handleMessagesDelivered = (data: any) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            isDelivered: msg.senderId !== data.userId ? true : msg.isDelivered,
          })),
        );
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("messagesDelivered", handleMessagesDelivered);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("messagesDelivered", handleMessagesDelivered);
    };
  }, [
    conversationId,
    isConnected,
    socket,
    user?.id,
    fetchMessages,
    markAsRead,
  ]);

  return {
    messages,
    loading,
    sendMessage,
    isOtherTyping,
    handleTyping,
    markAsRead,
    isConnected,
  };
};
