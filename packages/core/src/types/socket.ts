export interface UserTypingPayload {
    userId: string;
    userName: string;
    isTyping: boolean;
    conversationId: string;
}

export interface SendMessagePayload {
    conversationId: string;
    content: string;
}

export interface TypingPayload {
    conversationId: string;
    isTyping: boolean;
}

export interface ServerToClientEvents {
    newMessage: (message: any) => void;
    userTyping: (data: { userId: string; userName?: string; isTyping: boolean; conversationId: string }) => void;
    messagesRead: (data: { conversationId: string; userId: string }) => void;
    error: (error: { message: string }) => void;
    notification: (notification: any) => void; // TODO: Define strict Notification payload
    profile_completed: (data: { userId: string; completedAt: Date }) => void;
}

export interface ClientToServerEvents {
    joinRoom: (room: string) => void;
    leaveRoom: (room: string) => void;
    sendMessage: (payload: SendMessagePayload) => void;
    typing: (payload: TypingPayload) => void;
    markAsRead: (payload: { conversationId: string }) => void;
}
