import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';
import { Text } from '@trusttax/ui';
import { MessageCircle, Send, Search, ArrowLeft, X } from 'lucide-react';
import { socket } from '../../services/socket';

interface ChatWidgetProps {
    onClose: () => void;
}

export const ChatWidget = ({ onClose }: ChatWidgetProps) => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<any>(null);

    // Initial load
    useEffect(() => {
        fetchConversations();
    }, []);

    // Load messages when selectedId changes
    useEffect(() => {
        if (selectedId) {
            fetchMessages(selectedId);
            socket.emit('joinRoom', `conversation_${selectedId}`);

            const handleNewMessage = (msg: any) => {
                if (msg.conversationId === selectedId) {
                    setMessages(prev => [...prev, msg]);
                    scrollToBottom();
                }
            };

            socket.on('newMessage', handleNewMessage);

            return () => {
                socket.emit('leaveRoom', `conversation_${selectedId}`);
                socket.off('newMessage', handleNewMessage);
            };
        }
    }, [selectedId]);

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
        if (!selectedId || !inputText.trim()) return;
        try {
            setSending(true);
            await api.sendMessage(selectedId, inputText);
            setInputText('');
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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {selectedId ? (
                    <TouchableOpacity onPress={() => setSelectedId(null)} style={styles.backBtn}>
                        <ArrowLeft size={20} color="#64748B" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 24 }} />
                )}
                <View>
                    <Text style={styles.headerTitle}>
                        {selectedId ? (currentConversation?.client?.name || 'Client') : 'Inbox'}
                    </Text>
                    {selectedId && (
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            {currentConversation?.subject}
                        </Text>
                    )}
                </View>

                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X size={20} color="#64748B" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {selectedId ? (
                // Chat View
                <View style={styles.chatContainer}>
                    <ScrollView
                        style={styles.messagesList}
                        contentContainerStyle={{ padding: 16, gap: 16 }}
                        ref={messagesEndRef}
                    >
                        {loadingMessages ? (
                            <ActivityIndicator color="#0F172A" style={{ marginTop: 20 }} />
                        ) : (
                            messages.map((msg) => {
                                // Admin logic: isMine if role != CLIENT
                                const isMine = msg.sender?.role !== 'CLIENT';
                                return (
                                    <View key={msg.id} style={[styles.messageRow, isMine ? styles.rowRight : styles.rowLeft]}>
                                        <View style={[styles.messageBubble, isMine ? styles.bubbleRight : styles.bubbleLeft]}>
                                            <Text style={[styles.messageText, isMine ? styles.textWhite : styles.textDark]}>{msg.content}</Text>
                                            <Text style={[styles.messageTime, isMine ? styles.timeWhite : styles.timeDark]}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
                    <View style={styles.inputArea}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            value={inputText}
                            onChangeText={setInputText}
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
                            {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Send size={18} color="#FFF" />}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                // List View
                <View style={styles.listContainer}>
                    <View style={styles.listActions}>
                        <View style={styles.searchContainer}>
                            <Search size={16} color="#94A3B8" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search clients..."
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                    </View>

                    <ScrollView style={styles.conversationList}>
                        {loading ? (
                            <ActivityIndicator color="#0F172A" style={{ marginTop: 20 }} />
                        ) : (
                            conversations.map(conv => (
                                <TouchableOpacity
                                    key={conv.id}
                                    style={styles.convItem}
                                    onPress={() => setSelectedId(conv.id)}
                                >
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{(conv.client?.name || 'C')[0]}</Text>
                                    </View>
                                    <View style={styles.convInfo}>
                                        <View style={styles.convHeader}>
                                            <Text style={styles.convName} numberOfLines={1}>{conv.client?.name || 'Unknown'}</Text>
                                            <Text style={styles.convTime}>{new Date(conv.updatedAt).toLocaleDateString()}</Text>
                                        </View>
                                        <Text style={styles.convSubject} numberOfLines={1}>{conv.subject}</Text>
                                        <Text style={styles.convPreview} numberOfLines={1}>
                                            {conv.messages?.[0]?.content || 'No messages'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                        {!loading && conversations.length === 0 && (
                            <View style={styles.emptyState}>
                                <MessageCircle size={40} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No conversations found.</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', flexDirection: 'column' },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
    headerSubtitle: { fontSize: 12, color: '#64748B' },
    backBtn: { padding: 4, marginRight: 8 },
    closeBtn: { padding: 4, marginLeft: 'auto' },

    // List
    listContainer: { flex: 1 },
    listActions: { flexDirection: 'row', padding: 12, gap: 8, alignItems: 'center' },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, borderRadius: 0, height: 40, borderWidth: 1, borderColor: '#E2E8F0' },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, outlineStyle: 'none' } as any,

    conversationList: { flex: 1 },
    convItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    avatar: { width: 40, height: 40, borderRadius: 0, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: '#64748B', fontWeight: 'bold' },
    convInfo: { flex: 1 },
    convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    convName: { fontWeight: '600', color: '#1E293B', fontSize: 14, flex: 1, marginRight: 8 },
    convTime: { fontSize: 11, color: '#94A3B8' },
    convSubject: { fontSize: 13, color: '#475569', fontWeight: '500', marginBottom: 2 },
    convPreview: { fontSize: 13, color: '#64748B' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
    emptyText: { color: '#94A3B8', fontSize: 14 },

    // Chat
    chatContainer: { flex: 1, flexDirection: 'column', backgroundColor: '#F8FAFC' },
    messagesList: { flex: 1 },
    messageRow: { flexDirection: 'row', marginBottom: 4, maxWidth: '85%' },
    rowLeft: { alignSelf: 'flex-start' },
    rowRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    messageBubble: { padding: 12, borderRadius: 0, maxWidth: '100%' },
    bubbleLeft: { backgroundColor: '#FFF', borderRadius: 0, borderWidth: 1, borderColor: '#E2E8F0' },
    bubbleRight: { backgroundColor: '#0F172A', borderRadius: 0 },
    messageText: { fontSize: 14, lineHeight: 20 },
    textWhite: { color: '#FFF' },
    textDark: { color: '#1E293B' },
    messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    timeWhite: { color: 'rgba(255,255,255,0.7)' },
    timeDark: { color: '#94A3B8' },

    inputArea: { padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    input: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#F8FAFC', borderRadius: 0, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#E2E8F0', outlineStyle: 'none' } as any,
    sendBtn: { width: 40, height: 40, borderRadius: 0, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { backgroundColor: '#94A3B8' },
});
