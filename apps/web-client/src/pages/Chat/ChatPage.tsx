import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { api } from '../../services/api';
import { H4, Text, Button } from '@trusttax/ui';
import { MessageCircle, Send, Plus, Search, ArrowLeft, User, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../hooks/useSocket';

export const ChatPage = () => {
    const { t } = useTranslation();
    const { id: paramId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);
    const [user, setUser] = useState<any>(null);

    // Use Professional Socket Hook
    // paramId is now the source of truth for the selected room
    const { socket, isConnected: socketConnected } = useSocket(paramId ? `conversation_${paramId}` : undefined);

    // Initial load
    useEffect(() => {
        fetchConversations();
        api.getMe().then(setUser).catch(() => { });
    }, []);

    // Effect to select the first conversation on desktop if none selected
    useEffect(() => {
        if (!loading && conversations.length > 0 && !paramId && Platform.OS === 'web' && window.innerWidth > 768) {
            navigate(`/dashboard/chat/${conversations[0].id}`, { replace: true });
        }
    }, [conversations, loading, paramId, navigate]);

    // Load messages when paramId changes
    useEffect(() => {
        if (paramId) {
            fetchMessages(paramId);

            // Listen for new messages
            const handleNewMessage = (msg: any) => {
                if (msg.conversationId === paramId) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    scrollToBottom();
                }
            };

            const handleUserTyping = (data: any) => {
                if (data.conversationId === paramId && data.userId !== user?.id) {
                    setIsOtherTyping(data.isTyping);
                    if (data.isTyping) scrollToBottom();
                }
            };

            socket.on('newMessage', handleNewMessage);
            socket.on('userTyping', handleUserTyping);

            return () => {
                socket.off('newMessage', handleNewMessage);
                socket.off('userTyping', handleUserTyping);
            };
        } else {
            setMessages([]);
        }
    }, [paramId, user, socket]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const data = await api.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (id: string) => {
        try {
            setLoadingMessages(true);
            const data = await api.getConversation(id);
            setMessages(data.messages || []);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSend = async () => {
        if (!paramId || !inputText.trim()) return;
        try {
            setSending(true);
            const content = inputText;
            setInputText(''); // Clear immediately for better UX

            // Send via API
            const newMessage = await api.sendMessage(paramId, content);

            // OPTIMISTIC UPDATE: Manually append message immediately
            setMessages(prev => {
                if (prev.some(m => m.id === newMessage.id)) return prev;
                return [...prev, newMessage];
            });
            scrollToBottom();

            // Refresh list to update latest message preview, but don't reset selection
            const data = await api.getConversations();
            setConversations(data);

        } catch (error) {
            console.error('Failed to send message:', error);
            setInputText(inputText); // Restore on failure
        } finally {
            setSending(false);
        }
    };

    const handleCreateConversation = async () => {
        const subject = window.prompt("Asunto de la nueva consulta:");
        if (subject) {
            try {
                const newConv = await api.createConversation(subject);
                setConversations([newConv, ...conversations]);
                navigate(`/dashboard/chat/${newConv.id}`);
            } catch (error) {
                console.error("Failed to create conversation:", error);
            }
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollToEnd({ animated: true });
            }
        }, 100);
    };

    const currentConversation = conversations.find(c => c.id === paramId);

    return (
        <Layout>
            <View style={styles.container}>
                {/* Sidebar List */}
                <View style={[styles.sidebar, paramId && styles.sidebarHiddenOnMobile]}>
                    <View style={styles.sidebarHeader}>
                        <H4>Mensajes</H4>
                        <TouchableOpacity onPress={handleCreateConversation} style={styles.iconBtn}>
                            <Plus size={20} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.searchContainer}>
                        <Search size={16} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar..."
                            placeholderTextColor="#94A3B8"
                        />
                    </View>
                    <ScrollView style={styles.conversationList}>
                        {loading ? (
                            <ActivityIndicator color="#2563EB" style={{ marginTop: 20 }} />
                        ) : (
                            conversations.map(conv => (
                                <TouchableOpacity
                                    key={conv.id}
                                    style={[styles.convItem, paramId === conv.id && styles.convItemActive]}
                                    onPress={() => navigate(`/dashboard/chat/${conv.id}`)}
                                >
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{(conv.preparer?.name || 'S')[0]}</Text>
                                    </View>
                                    <View style={styles.convInfo}>
                                        <View style={styles.convHeader}>
                                            <Text style={styles.convName} numberOfLines={1}>{conv.subject || 'Consulta General'}</Text>
                                            <Text style={styles.convTime}>{new Date(conv.updatedAt).toLocaleDateString()}</Text>
                                        </View>
                                        <Text style={styles.convPreview} numberOfLines={1}>
                                            {conv.messages?.[0]?.content || 'Sin mensajes aún'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                        {!loading && conversations.length === 0 && (
                            <View style={styles.emptyState}>
                                <MessageCircle size={40} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No tienes mensajes aún.</Text>
                                <Button title="Iniciar Chat" onPress={handleCreateConversation} style={{ marginTop: 12 }} />
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Chat Details Area */}
                <View style={[styles.chatArea, !paramId && styles.chatAreaHiddenOnMobile]}>
                    {paramId ? (
                        <>
                            <View style={styles.chatHeader}>
                                <TouchableOpacity style={styles.mobileBackBtn} onPress={() => navigate('/dashboard/chat')}>
                                    <ArrowLeft size={20} color="#64748B" />
                                </TouchableOpacity>
                                <View style={styles.avatarSmall}>
                                    <User size={16} color="#FFF" />
                                </View>
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={styles.chatHeaderTitle}>{currentConversation?.subject || 'Chat'}</Text>
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: socketConnected ? '#22C55E' : '#EF4444' }} />
                                    </View>
                                    <Text style={styles.chatHeaderSubtitle}>
                                        <Text>{t('chat.support_team')}</Text>
                                        <Text> • </Text>
                                        <Text>{socketConnected ? 'Online' : 'Reconnecting...'}</Text>
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }} />
                                <TouchableOpacity>
                                    <MoreVertical size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.messagesList}
                                contentContainerStyle={{ padding: 16, gap: 16 }}
                                ref={messagesEndRef}
                            >
                                {loadingMessages ? (
                                    <ActivityIndicator color="#2563EB" style={{ marginTop: 20 }} />
                                ) : (
                                    messages.map((msg) => {
                                        const isMine = msg.sender?.role === 'CLIENT';
                                        return (
                                            <View key={msg.id} style={[styles.messageRow, isMine ? styles.rowRight : styles.rowLeft]}>
                                                {!isMine && (
                                                    <View style={styles.msgAvatar}>
                                                        <Text style={{ fontSize: 10, color: '#FFF' }}>S</Text>
                                                    </View>
                                                )}
                                                <View style={[styles.messageBubble, isMine ? styles.bubbleRight : styles.bubbleLeft]}>
                                                    <Text style={[styles.messageText, isMine ? styles.textWhite : styles.textDark]}>{msg.content}</Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 }}>
                                                        <Text style={[styles.messageTime, isMine ? styles.timeWhite : styles.timeDark, { marginTop: 0 }]}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Text>
                                                        {isMine && (
                                                            msg.isRead ?
                                                                <CheckCheck size={14} color="rgba(255,255,255,0.9)" /> :
                                                                <Check size={14} color="rgba(255,255,255,0.6)" />
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                                {isOtherTyping && (
                                    <View style={[styles.messageRow, styles.rowLeft]}>
                                        <View style={styles.msgAvatar}>
                                            <Text style={{ fontSize: 10, color: '#FFF' }}>S</Text>
                                        </View>
                                        <View style={[styles.messageBubble, styles.bubbleLeft, { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 14 }]}>
                                            <View style={[styles.dot, { opacity: 0.6 }]} />
                                            <View style={[styles.dot, { opacity: 0.6 }]} />
                                            <View style={[styles.dot, { opacity: 0.6 }]} />
                                        </View>
                                    </View>
                                )}
                            </ScrollView>

                            <View style={styles.inputArea}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('chat.type_message')}
                                    value={inputText}
                                    onChangeText={(text) => {
                                        setInputText(text);

                                        // Emit typing event
                                        if (!isTyping && paramId) {
                                            setIsTyping(true);
                                            socket.emit('typing', { conversationId: paramId, isTyping: true });
                                        }

                                        // Debounce stop typing
                                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                        typingTimeoutRef.current = setTimeout(() => {
                                            setIsTyping(false);
                                            if (paramId) socket.emit('typing', { conversationId: paramId, isTyping: false });
                                        }, 1500);
                                    }}
                                    multiline
                                    onKeyPress={(e: any) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <TouchableOpacity
                                    style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
                                    onPress={handleSend}
                                    disabled={!inputText.trim() || sending}
                                >
                                    {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Send size={20} color="#FFF" />}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={styles.noChatSelected}>
                            <MessageCircle size={64} color="#E2E8F0" />
                            <Text style={styles.selectChatText}>{t('chat.select_conversation')}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', height: Platform.OS === 'web' ? '100vh' as any : '100%', backgroundColor: '#F8FAFC' },

    // Sidebar
    sidebar: { width: 360, borderRightWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', display: 'flex', flexDirection: 'column', height: '100%' },
    sidebarHiddenOnMobile: {
        display: 'none',
        // '@media (min-width: 768px)': { display: 'flex' }
    } as any,

    sidebarHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    iconBtn: { padding: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', margin: 16, paddingHorizontal: 12, borderRadius: 8, height: 40, borderWidth: 1, borderColor: '#E2E8F0' },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, outlineStyle: 'none' } as any,
    conversationList: { flex: 1 },
    convItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    convItemActive: { backgroundColor: '#EFF6FF', borderLeftWidth: 3, borderLeftColor: '#2563EB' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: '#4F46E5', fontWeight: 'bold' },
    convInfo: { flex: 1 },
    convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    convName: { fontWeight: '600', color: '#1E293B', fontSize: 14, flex: 1, marginRight: 8 },
    convTime: { fontSize: 11, color: '#94A3B8' },
    convPreview: { fontSize: 13, color: '#64748B' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
    emptyText: { color: '#94A3B8', fontSize: 14 },

    // Chat Area
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC', height: '100%' },
    chatAreaHiddenOnMobile: {
        display: 'none',
    } as any,

    chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    mobileBackBtn: { marginRight: 12, padding: 4 },
    avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    chatHeaderTitle: { fontWeight: '700', color: '#0F172A', fontSize: 15 },
    chatHeaderSubtitle: { fontSize: 12, color: '#64748B' },

    messagesList: { flex: 1 },
    messageRow: { flexDirection: 'row', marginBottom: 4, maxWidth: '80%' },
    rowLeft: { alignSelf: 'flex-start' },
    rowRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    msgAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#94A3B8', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 'auto' },
    messageBubble: { padding: 12, borderRadius: 16, maxWidth: '100%' },
    bubbleLeft: { backgroundColor: '#FFF', borderBottomLeftRadius: 4 },
    bubbleRight: { backgroundColor: '#2563EB', borderBottomRightRadius: 4 },
    messageText: { fontSize: 14, lineHeight: 20 },
    textWhite: { color: '#FFF' },
    textDark: { color: '#1E293B' },
    messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    timeWhite: { color: 'rgba(255,255,255,0.7)' },
    timeDark: { color: '#94A3B8' },

    inputArea: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'flex-end', gap: 12, minHeight: 72 },
    input: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#F8FAFC', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', outlineStyle: 'none' } as any,
    sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { backgroundColor: '#94A3B8' },

    noChatSelected: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    selectChatText: { color: '#64748B', fontSize: 16, fontWeight: '500' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#94A3B8' }
});
