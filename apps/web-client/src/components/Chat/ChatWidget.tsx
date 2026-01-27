import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';
import { Text } from '@trusttax/ui';
import { Send, Plus, ArrowLeft, X, HelpCircle, FileText, User as UserIcon, Trash2, Check, CheckCheck } from 'lucide-react';
import { socket } from '../../services/socket';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getCategoryColor, getCategoryLabel } from '../../utils/conversationColors';

interface ChatWidgetProps {
    onClose: () => void;
}

export const ChatWidget = ({ onClose }: ChatWidgetProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [faqs, setFaqs] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [viewState, setViewState] = useState<'list' | 'orders'>('list');
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    // Initial load
    // Initial load
    useEffect(() => {
        fetchConversations();
        fetchExtras();
    }, []);

    const fetchExtras = async () => {
        try {
            const [fetchedFaqs, fetchedOrders] = await Promise.all([
                api.getFAQs().catch(() => []),
                api.getOrders().catch(() => [])
            ]);
            setFaqs(fetchedFaqs);
            setOrders(fetchedOrders);
        } catch (e) {
            console.error('Failed to fetch extras', e);
        }
    };

    // Load messages when selectedId changes
    useEffect(() => {
        if (selectedId) {
            fetchMessages(selectedId);
            socket.emit('joinRoom', `conversation_${selectedId}`);

            // Mark messages as read when opening conversation
            socket.emit('markAsRead', { conversationId: selectedId });

            const handleNewMessage = (msg: any) => {
                if (msg.conversationId === selectedId) {
                    setMessages(prev => [...prev, msg]);
                    scrollToBottom();
                    // Auto-mark new messages as read
                    socket.emit('markAsRead', { conversationId: selectedId });
                }
            };

            const handleMessagesRead = (data: any) => {
                if (data.conversationId === selectedId) {
                    // ONLY mark messages as read if they were sent by the user who read them
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        isRead: msg.senderId === data.userId ? true : msg.isRead
                    })));
                }
            };

            socket.on('newMessage', handleNewMessage);

            socket.on('userTyping', (data: any) => {
                if (data.conversationId === selectedId && data.userId !== user?.id) {
                    setIsOtherTyping(data.isTyping);
                }
            });

            socket.on('messagesRead', handleMessagesRead);

            return () => {
                socket.emit('leaveRoom', `conversation_${selectedId}`);
                socket.off('newMessage', handleNewMessage);
                socket.off('userTyping');
                socket.off('messagesRead', handleMessagesRead);
            };
        }
    }, [selectedId, user]);

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
            // Socket.IO will automatically add the message via 'newMessage' event
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleCreateConversation = async (subject?: string) => {
        const title = subject || window.prompt("Asunto de la nueva consulta:");
        if (title) {
            try {
                const newConv = await api.createConversation(title);
                setConversations([newConv, ...conversations]);
                setSelectedId(newConv.id);
                setViewState('list');
            } catch (error) {
                console.error("Failed to create conversation:", error);
            }
        }
    };

    const handleOrderInquiry = (order: any) => {
        const subject = t('chat.order_inquiry_subject', { orderId: order.displayId || order.id.slice(0, 8) });
        handleCreateConversation(subject);
        handleCreateConversation(subject);
    };

    const handleDeleteConversation = async (id: string, e: any) => {
        e.stopPropagation();
        if (window.confirm(t('chat.confirm_delete'))) {
            try {
                await api.deleteConversation(id);
                setConversations(conversations.filter(c => c.id !== id));
            } catch (error) {
                console.error("Failed to delete conversation:", error);
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

    const currentConversation = conversations.find(c => c.id === selectedId);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {selectedId || viewState === 'orders' ? (
                    <TouchableOpacity onPress={() => {
                        if (viewState === 'orders') setViewState('list');
                        else setSelectedId(null);
                    }} style={styles.backBtn}>
                        <ArrowLeft size={20} color="#64748B" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 24 }} />
                )}
                <Text style={styles.headerTitle}>
                    {selectedId ? (currentConversation?.subject || 'Chat') : (viewState === 'orders' ? 'Seleccionar Orden' : 'Mensajes')}
                </Text>
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
                            <ActivityIndicator color="#2563EB" style={{ marginTop: 20 }} />
                        ) : (
                            messages.map((msg) => {
                                const isMine = msg.sender?.id === user?.id; // More robust check
                                return (
                                    <View key={msg.id} style={[styles.messageRow, isMine ? styles.rowRight : styles.rowLeft]}>
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
                            {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Send size={18} color="#FFF" />}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : viewState === 'orders' ? (
                <ScrollView style={styles.listContainer}>
                    <Text style={styles.sectionTitle}>Mis Órdenes</Text>
                    {orders.map(order => (
                        <TouchableOpacity
                            key={order.id}
                            style={styles.orderItem}
                            onPress={() => handleOrderInquiry(order)}
                        >
                            <FileText size={20} color="#2563EB" />
                            <View>
                                <Text style={styles.orderTitle}>Orden #{order.displayId || order.id.slice(0, 8)}</Text>
                                <Text style={styles.orderStatus}>{order.status}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                // List View / Support Home
                <View style={styles.listContainer}>
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>{t('chat.welcome_user', { name: user?.name?.split(' ')[0] || 'Usuario' })}</Text>
                        <Text style={styles.welcomeSubtitle}>{t('chat.welcome_subtitle')}</Text>
                    </View>

                    {/* Quick Actions Grid */}
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity style={styles.actionCard} onPress={() => handleCreateConversation()}>
                            <View style={styles.actionIcon}>
                                <Plus size={24} color="#2563EB" />
                            </View>
                            <Text style={styles.actionLabel}>{t('chat.new_inquiry')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => setViewState('orders')}>
                            <View style={styles.actionIcon}>
                                <FileText size={24} color="#2563EB" />
                            </View>
                            <Text style={styles.actionLabel}>{t('chat.my_orders')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => handleCreateConversation(t('chat.profile_help'))}>
                            <View style={styles.actionIcon}>
                                <UserIcon size={24} color="#2563EB" />
                            </View>
                            <Text style={styles.actionLabel}>{t('chat.my_profile')}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
                        {/* FAQ Section */}
                        {!loading && faqs.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionHeader}>{t('chat.faq_section')}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll}>
                                    {faqs.slice(0, 5).map(faq => (
                                        <TouchableOpacity
                                            key={faq.id}
                                            style={styles.faqCard}
                                            onPress={() => handleCreateConversation(faq.question)}
                                        >
                                            <HelpCircle size={20} color="#2563EB" style={{ marginBottom: 8 }} />
                                            <Text style={styles.faqCardText} numberOfLines={3}>{faq.question}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Recent Activity */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionHeader}>{t('chat.recent_activity')}</Text>
                            {loading ? (
                                <ActivityIndicator color="#2563EB" style={{ marginTop: 20 }} />
                            ) : conversations.length > 0 ? (
                                conversations.slice(0, 5).map(conv => {
                                    const colors = getCategoryColor(conv.category);
                                    return (
                                        <TouchableOpacity
                                            key={conv.id}
                                            style={[
                                                styles.recentItem,
                                                {
                                                    backgroundColor: colors.bg,
                                                    borderLeftWidth: 4,
                                                    borderLeftColor: colors.border
                                                }
                                            ]}
                                            onPress={() => setSelectedId(conv.id)}
                                        >
                                            <View style={[styles.recentIcon, { backgroundColor: colors.icon }]}>
                                                <HelpCircle size={16} color="#FFF" />
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                                    <View style={[styles.categoryBadge, { backgroundColor: colors.border }]}>
                                                        <Text style={styles.categoryText}>{getCategoryLabel(conv.category)}</Text>
                                                    </View>
                                                    <Text style={[styles.recentSubject, { color: colors.text }]} numberOfLines={1}>
                                                        {conv.subject || t('chat.new_inquiry')}
                                                    </Text>
                                                </View>
                                                <Text style={styles.recentDate}>{new Date(conv.updatedAt).toLocaleDateString()}</Text>
                                            </View>
                                            <TouchableOpacity onPress={(e) => handleDeleteConversation(conv.id, e)} style={{ padding: 4 }}>
                                                <Trash2 size={16} color="#94A3B8" />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <Text style={styles.noRecentText}>{t('chat.no_recent_activity')}</Text>
                            )}
                        </View>
                    </ScrollView>
                </View >
            )
            }
        </View >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', flexDirection: 'column' },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
    backBtn: { padding: 4 },
    closeBtn: { padding: 4 },

    // List
    listContainer: { flex: 1, backgroundColor: '#F8FAFC' },
    mainScroll: { flex: 1 },

    welcomeSection: { padding: 20, backgroundColor: '#FFF', paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    welcomeTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
    welcomeSubtitle: { fontSize: 14, color: '#64748B' },

    actionsGrid: { flexDirection: 'row', padding: 16, gap: 12, marginTop: -20 },
    actionCard: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 0, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
    actionIcon: { width: 40, height: 40, borderRadius: 0, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionLabel: { fontSize: 12, fontWeight: '600', color: '#334155', textAlign: 'center' },

    sectionContainer: { marginTop: 16, paddingHorizontal: 16 },
    sectionHeader: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

    cardsScroll: { flexDirection: 'row', paddingBottom: 8 },
    faqCard: { width: 140, height: 100, backgroundColor: '#FFF', padding: 12, borderRadius: 0, marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'space-between' },
    faqCardText: { fontSize: 12, color: '#334155', fontWeight: '500', lineHeight: 16 },

    recentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 0, marginBottom: 8, borderWidth: 1, borderColor: '#F1F5F9' },
    recentIcon: { width: 32, height: 32, backgroundColor: '#3B82F6', borderRadius: 0, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    recentSubject: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
    recentDate: { fontSize: 12, color: '#94A3B8' },
    noRecentText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic', paddingLeft: 4 },

    // Chat (unchanged but keeping for context)
    chatContainer: { flex: 1, flexDirection: 'column', backgroundColor: '#F8FAFC' },
    messagesList: { flex: 1 },
    messageRow: { flexDirection: 'row', marginBottom: 4, maxWidth: '85%' },
    rowLeft: { alignSelf: 'flex-start' },
    rowRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    messageBubble: { padding: 12, borderRadius: 0, maxWidth: '100%' },
    bubbleLeft: { backgroundColor: '#FFF', borderRadius: 0, borderWidth: 1, borderColor: '#E2E8F0' },
    bubbleRight: { backgroundColor: '#2563EB', borderRadius: 0 },
    messageText: { fontSize: 14, lineHeight: 20 },
    textWhite: { color: '#FFF' },
    textDark: { color: '#1E293B' },
    messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    timeWhite: { color: 'rgba(255,255,255,0.7)' },
    timeDark: { color: '#94A3B8' },

    inputArea: { padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    input: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#F8FAFC', borderRadius: 0, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', outlineStyle: 'none' } as any,
    sendBtn: { width: 40, height: 40, borderRadius: 0, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
    sendBtnDisabled: { opacity: 0.5 },

    // Order List styles
    orderItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12, backgroundColor: '#FFF' },
    orderTitle: { fontWeight: '600', color: '#0F172A', fontSize: 14 },
    orderStatus: { fontSize: 12, color: '#64748B' },

    // Misc
    // Misc
    sectionTitle: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 8, paddingHorizontal: 4 },
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
        textTransform: 'uppercase' as any
    }
});
