import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { api } from '../../services/api';
import { H4, Text } from '@trusttax/ui';
import { MessageCircle, Search, ArrowLeft, Trash2 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getCategoryColor, getCategoryLabel } from '../../utils/conversationColors';
import { useAdminChat } from '../../hooks/useAdminChat';
import { AdminConversationView } from '../../components/Chat/AdminConversationView';

export const AdminChatPage = () => {
    const { id: paramId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const {
        messages,
        loading: loadingMessages,
        sendMessage,
        handleTyping,
        isOtherTyping,
        setIsOtherTyping,
        socket
    } = useAdminChat(paramId);

    useEffect(() => {
        fetchConversations();
    }, []);

    // Sync other typing state via socket
    useEffect(() => {
        if (!socket || !paramId) return;

        socket.on('userTyping', (data: any) => {
            if (data.conversationId === paramId && data.userId !== user?.id) {
                setIsOtherTyping(data.isTyping);
            }
        });

        return () => {
            socket.off('userTyping');
        };
    }, [socket, paramId, user, setIsOtherTyping]);

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

    const handleDeleteConversation = async (id: string, e: any) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this conversation?")) {
            try {
                await api.deleteConversation(id);
                setConversations(conversations.filter(c => c.id !== id));
                if (paramId === id) navigate('/chat');
            } catch (error) {
                console.error('Failed to delete conversation:', error);
            }
        }
    };

    const currentConversation = conversations.find(c => c.id === paramId);

    return (
        <Layout>
            <View style={styles.container}>
                {/* Conversations Sidebar */}
                <View style={[styles.sidebar, paramId ? styles.sidebarHiddenOnMobile : null]}>
                    <View style={styles.sidebarHeader}>
                        <H4>Inbox</H4>
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
                        {loading && conversations.length === 0 ? (
                            <ActivityIndicator color="#0F172A" style={{ marginTop: 20 }} />
                        ) : (
                            conversations.map((conv) => (
                                <TouchableOpacity
                                    key={conv.id}
                                    style={[styles.convItem, paramId === conv.id && styles.convItemActive]}
                                    onPress={() => navigate(`/chat/${conv.id}`)}
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

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(conv.category).border }]}>
                                                <Text style={styles.categoryText}>{getCategoryLabel(conv.category)}</Text>
                                            </View>
                                            <TouchableOpacity onPress={(e) => handleDeleteConversation(conv.id, e)}>
                                                <Trash2 size={14} color="#94A3B8" />
                                            </TouchableOpacity>
                                        </View>
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

                {/* Chat Area */}
                <View style={[styles.chatArea, !paramId ? styles.chatAreaHiddenOnMobile : null]}>
                    {paramId ? (
                        <>
                            <View style={styles.chatHeader}>
                                {Platform.OS === 'web' && (
                                    <TouchableOpacity style={styles.mobileBackBtn} onPress={() => navigate('/chat')}>
                                        <ArrowLeft size={20} color="#64748B" />
                                    </TouchableOpacity>
                                )}
                                <View style={styles.avatarSmall}>
                                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>
                                        {(currentConversation?.client?.name || 'C')[0]}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.chatHeaderTitle}>{currentConversation?.client?.name || 'Client'}</Text>
                                    <Text style={styles.chatHeaderSubtitle}>{currentConversation?.subject}</Text>
                                </View>
                            </View>

                            <AdminConversationView
                                messages={messages}
                                loading={loadingMessages}
                                onSendMessage={sendMessage}
                                onTyping={handleTyping}
                                isOtherTyping={isOtherTyping}
                            />
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
    container: { flex: 1, flexDirection: 'row', height: Platform.OS === 'web' ? '100vh' as any : '100%', backgroundColor: '#F8FAFC' },
    sidebar: { width: 360, borderRightWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', display: 'flex', flexDirection: 'column', height: '100%' },
    sidebarHiddenOnMobile: {
        display: Platform.OS === 'web' ? 'none' : 'flex',
        '@media (max-width: 768px)': { display: 'none' }
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
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC', height: '100%' },
    chatAreaHiddenOnMobile: { display: Platform.OS === 'web' ? 'none' : 'flex', '@media (max-width: 768px)': { display: 'none' } } as any,
    chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    mobileBackBtn: { marginRight: 12, padding: 4 },
    avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    chatHeaderTitle: { fontWeight: '700', color: '#0F172A', fontSize: 15 },
    chatHeaderSubtitle: { fontSize: 12, color: '#64748B' },
    noChatSelected: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    selectChatText: { color: '#64748B', fontSize: 16, fontWeight: '500' },
    categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
    categoryText: { fontSize: 10, fontWeight: '600', color: '#FFF', textTransform: 'uppercase' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
    emptyText: { color: '#94A3B8', fontSize: 14 },
});
