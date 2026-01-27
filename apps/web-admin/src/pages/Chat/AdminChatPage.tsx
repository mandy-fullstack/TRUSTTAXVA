import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { api } from '../../services/api';
import { H4, Text } from '@trusttax/ui';
import { MessageCircle, Send, Search, ArrowLeft, User, Trash2, Check, CheckCheck } from 'lucide-react';

import { socket } from '../../services/socket';
import { getCategoryColor, getCategoryLabel } from '../../utils/conversationColors';

export const AdminChatPage = () => {
    const { id: paramId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(paramId || null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<any>(null);
    const [user, setUser] = useState<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    useEffect(() => {
        fetchConversations();
        api.getMe().then(setUser).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedId) {
            fetchMessages(selectedId);

            // Join room
            socket.emit('joinRoom', `conversation_${selectedId}`);

            // Listen for new messages
            const handleNewMessage = (msg: any) => {
                if (msg.conversationId === selectedId) {
                    setMessages(prev => [...prev, msg]);
                    scrollToBottom();
                }
            };

            const handleUserTyping = (data: any) => {
                if (data.conversationId === selectedId && data.userId !== user?.id) {
                    setIsOtherTyping(data.isTyping);
                }
            };

            socket.on('newMessage', handleNewMessage);
            socket.on('userTyping', handleUserTyping);

            return () => {
                socket.emit('leaveRoom', `conversation_${selectedId}`);
                socket.off('newMessage', handleNewMessage);
                socket.off('userTyping', handleUserTyping);
            };
        }
    }, [selectedId, user]); // Added user dependency for typing check

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const data = await api.getConversations();
            setConversations(data);
            if (!selectedId && data.length > 0 && Platform.OS === 'web' && window.innerWidth > 768) {
                setSelectedId(data[0].id);
            }
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

    const handleDeleteConversation = async (id: string, e: any) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this conversation?")) {
            try {
                await api.deleteConversation(id);
                setConversations(conversations.filter(c => c.id !== id));
                if (selectedId === id) setSelectedId(null);
            } catch (error) {
                console.error("Failed to delete conversation:", error);
            }
        }
    };

    const handleSend = async () => {
        if (!selectedId || !inputText.trim()) return;
        try {
            setSending(true);
            await api.sendMessage(selectedId, inputText);
            setInputText('');
            // await fetchMessages(selectedId); // Rely on socket
            fetchConversations();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollToEnd({ animated: true });
            }
        }, 100);
    };

    const currentConversation = conversations.find(c => c.id === selectedId);

    return (
        <Layout>
            <View style={styles.container}>
                {/* Sidebar List */}
                <View style={[styles.sidebar, selectedId && styles.sidebarHiddenOnMobile]}>
                    <View style={styles.sidebarHeader}>
                        <H4>Inbox</H4>
                        {/* Admin typically doesn't start generic chat? Or maybe they do. */}
                    </View>
                    <View style={styles.searchContainer}>
                        <Search size={16} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search clients..."
                            placeholderTextColor="#94A3B8"
                        />
                    </View>
                    <ScrollView style={styles.conversationList}>
                        {loading ? (
                            <ActivityIndicator color="#0F172A" style={{ marginTop: 20 }} />
                        ) : (
                            conversations.map(conv => {
                                const colors = getCategoryColor(conv.category);
                                return (
                                    <TouchableOpacity
                                        key={conv.id}
                                        style={[
                                            styles.convItem,
                                            selectedId === conv.id && styles.convItemActive,
                                            {
                                                backgroundColor: colors.bg,
                                                borderLeftWidth: 4,
                                                borderLeftColor: colors.border
                                            }
                                        ]}
                                        onPress={() => {
                                            setSelectedId(conv.id);
                                            navigate(`/chat/${conv.id}`);
                                        }}
                                    >
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>{(conv.client?.name || 'C')[0]}</Text>
                                        </View>
                                        <View style={styles.convInfo}>
                                            <View style={styles.convHeader}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                                                    <View style={[styles.categoryBadge, { backgroundColor: colors.border }]}>
                                                        <Text style={styles.categoryText}>{getCategoryLabel(conv.category)}</Text>
                                                    </View>
                                                    <Text style={[styles.convName, { color: colors.text }]} numberOfLines={1}>
                                                        {conv.client?.name || 'Unknown Client'}
                                                    </Text>
                                                </View>
                                                <Text style={styles.convTime}>{new Date(conv.updatedAt).toLocaleDateString()}</Text>
                                            </View>
                                            <Text style={styles.convSubject} numberOfLines={1}>{conv.subject}</Text>
                                            <Text style={styles.convPreview} numberOfLines={1}>
                                                {conv.messages?.[0]?.content || 'No messages'}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={(e) => handleDeleteConversation(conv.id, e)} style={{ padding: 8 }}>
                                            <Trash2 size={16} color="#94A3B8" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                        {!loading && conversations.length === 0 && (
                            <View style={styles.emptyState}>
                                <MessageCircle size={40} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No conversations found.</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Chat Details Area */}
                <View style={[styles.chatArea, !selectedId && styles.chatAreaHiddenOnMobile]}>
                    {selectedId ? (
                        <>
                            <View style={styles.chatHeader}>
                                <TouchableOpacity style={styles.mobileBackBtn} onPress={() => setSelectedId(null)}>
                                    <ArrowLeft size={20} color="#64748B" />
                                </TouchableOpacity>
                                <View style={styles.avatarSmall}>
                                    <User size={16} color="#FFF" />
                                </View>
                                <View>
                                    <Text style={styles.chatHeaderTitle}>{currentConversation?.client?.name || 'Client'}</Text>
                                    <Text style={styles.chatHeaderSubtitle}>{currentConversation?.subject || 'Direct Message'}</Text>
                                </View>
                            </View>

                            <ScrollView
                                style={styles.messagesList}
                                contentContainerStyle={{ padding: 16, gap: 16 }}
                                ref={messagesEndRef}
                            >
                                {loadingMessages ? (
                                    <ActivityIndicator color="#0F172A" style={{ marginTop: 20 }} />
                                ) : (
                                    messages.map((msg) => {
                                        const isMine = msg.sender?.id === user?.id || msg.sender?.role !== 'CLIENT';

                                        return (
                                            <View key={msg.id} style={[styles.messageRow, isMine ? styles.rowRight : styles.rowLeft]}>
                                                {!isMine && (
                                                    <View style={styles.msgAvatar}>
                                                        <Text style={{ fontSize: 10, color: '#FFF' }}>C</Text>
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
                                                                <CheckCheck size={14} color="#FFF" /> :
                                                                <Check size={14} color="rgba(255,255,255,0.7)" />
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                                {isOtherTyping && (
                                    <View style={[styles.messageRow, styles.rowLeft]}>
                                        <View style={[styles.msgAvatar, { backgroundColor: 'transparent' }]} />
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
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChangeText={(text) => {
                                        setInputText(text);

                                        if (!isTyping && selectedId) {
                                            setIsTyping(true);
                                            socket.emit('typing', { conversationId: selectedId, isTyping: true });
                                        }

                                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

                                        typingTimeoutRef.current = setTimeout(() => {
                                            setIsTyping(false);
                                            if (selectedId) socket.emit('typing', { conversationId: selectedId, isTyping: false });
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
                            <Text style={styles.selectChatText}>Select a conversation to start chatting</Text>
                        </View>
                    )}
                </View>
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', height: Platform.OS === 'web' ? 'calc(100vh - 64px)' as any : '100%', backgroundColor: '#F8FAFC' },

    // Sidebar
    sidebar: { width: 320, borderRightWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', display: 'flex' },
    sidebarHiddenOnMobile: {
        display: 'none',
        '@media (min-width: 768px)': { display: 'flex' }
    } as any,

    sidebarHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', margin: 16, paddingHorizontal: 12, borderRadius: 8, height: 40, borderWidth: 1, borderColor: '#E2E8F0' },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, outlineStyle: 'none' } as any,
    conversationList: { flex: 1 },
    convItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    convItemActive: { backgroundColor: '#F1F5F9', borderLeftWidth: 3, borderLeftColor: '#0F172A' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: '#64748B', fontWeight: 'bold' },
    convInfo: { flex: 1 },
    convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    convName: { fontWeight: '600', color: '#1E293B', fontSize: 14, flex: 1, marginRight: 8 },
    convTime: { fontSize: 11, color: '#94A3B8' },
    convSubject: { fontSize: 13, color: '#475569', fontWeight: '500', marginBottom: 2 },
    convPreview: { fontSize: 13, color: '#64748B' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
    emptyText: { color: '#94A3B8', fontSize: 14 },

    // Chat Area
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' },
    chatAreaHiddenOnMobile: {
        display: 'none',
    } as any,

    chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    mobileBackBtn: { marginRight: 12, padding: 4 },
    avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    chatHeaderTitle: { fontWeight: '700', color: '#0F172A', fontSize: 15 },
    chatHeaderSubtitle: { fontSize: 12, color: '#64748B' },

    messagesList: { flex: 1 },
    messageRow: { flexDirection: 'row', marginBottom: 4, maxWidth: '80%' },
    rowLeft: { alignSelf: 'flex-start' },
    rowRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    msgAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#94A3B8', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 'auto' },
    messageBubble: { padding: 12, borderRadius: 16, maxWidth: '100%' },
    bubbleLeft: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
    bubbleRight: { backgroundColor: '#0F172A', borderBottomRightRadius: 4 },
    messageText: { fontSize: 14, lineHeight: 20 },
    textWhite: { color: '#FFF' },
    textDark: { color: '#1E293B' },
    messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    timeWhite: { color: 'rgba(255,255,255,0.7)' },
    timeDark: { color: '#94A3B8' },

    inputArea: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
    input: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#F8FAFC', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#E2E8F0', outlineStyle: 'none' } as any,
    sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { backgroundColor: '#94A3B8' },

    noChatSelected: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    selectChatText: { color: '#64748B', fontSize: 16, fontWeight: '500' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#94A3B8' },
    categoryBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFF',
        textTransform: 'uppercase'
    }
});
