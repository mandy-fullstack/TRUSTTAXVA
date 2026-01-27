import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { api } from '../../services/api';
import { Text } from '@trusttax/ui';
import { ArrowLeft, X, MessageCircle, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminChat } from '../../hooks/useAdminChat';
import { AdminConversationView } from './AdminConversationView';

interface ChatWidgetProps {
    onClose: () => void;
}

export const ChatWidget = ({ onClose }: ChatWidgetProps) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const {
        messages,
        loading: loadingMessages,
        sendMessage,
        handleTyping,
        isOtherTyping,
        setIsOtherTyping,
        socket
    } = useAdminChat(selectedId);

    // Initial load
    useEffect(() => {
        fetchConversations();
    }, []);

    // Listen for events to update list or other typing
    useEffect(() => {
        if (!socket) return;

        socket.on('userTyping', (data: any) => {
            if (data.conversationId === selectedId && data.userId !== user?.id) {
                setIsOtherTyping(data.isTyping);
            }
        });

        return () => {
            socket.off('userTyping');
        };
    }, [socket, selectedId, user, setIsOtherTyping]);

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
                <AdminConversationView
                    messages={messages}
                    loading={loadingMessages}
                    onSendMessage={sendMessage}
                    onTyping={handleTyping}
                    isOtherTyping={isOtherTyping}
                    user={user}
                />
            ) : (
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
});
