import { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Text } from '@trusttax/ui';
import { Send, Check, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConversationViewProps {
    messages: any[];
    loading: boolean;
    onSendMessage: (content: string) => void;
    onTyping: (isTyping: boolean) => void;
    isOtherTyping: boolean;
    user: any;
    isMobile?: boolean;
}

export const ConversationView = ({
    messages,
    loading,
    onSendMessage,
    onTyping,
    isOtherTyping,
    user,
    isMobile = false
}: ConversationViewProps) => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOtherTyping]);

    const handleSend = async () => {
        if (!inputText.trim() || sending) return;
        setSending(true);
        try {
            await onSendMessage(inputText);
            setInputText('');
            onTyping(false);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                style={styles.messagesList}
                contentContainerStyle={[styles.messagesContent, { paddingBottom: 24 }]}
                onContentSizeChange={scrollToBottom}
            >
                {loading && messages.length === 0 ? (
                    <ActivityIndicator color="#0F172A" style={{ marginTop: 20 }} />
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.senderId === user?.id;
                        return (
                            <View key={msg.id} style={[styles.messageRow, isMine ? styles.rowRight : styles.rowLeft]}>
                                <View style={[styles.messageBubble, isMine ? styles.bubbleRight : styles.bubbleLeft]}>
                                    <Text style={[styles.messageText, isMine ? styles.textWhite : styles.textDark]}>{msg.content}</Text>
                                    <View style={styles.messageFooter}>
                                        <Text style={[styles.messageTime, isMine ? styles.timeWhite : styles.timeDark]}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        {isMine && (
                                            msg.isRead ?
                                                <CheckCheck size={14} color="#22C55E" /> :
                                                msg.isDelivered ?
                                                    <CheckCheck size={14} color="rgba(255,255,255,0.6)" /> :
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
                        <View style={[styles.messageBubble, styles.bubbleLeft, styles.typingBubble]}>
                            <View style={[styles.dot, styles.dot1]} />
                            <View style={[styles.dot, styles.dot2]} />
                            <View style={[styles.dot, styles.dot3]} />
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={[styles.inputArea, isMobile && styles.inputAreaMobile]}>
                <TextInput
                    style={styles.input}
                    placeholder={t('chat.type_message', 'Escribe un mensaje...')}
                    value={inputText}
                    onChangeText={(text) => {
                        setInputText(text);
                        onTyping(true);
                    }}
                    multiline
                    onKeyPress={(e: any) => {
                        if (Platform.OS === 'web' && e.key === 'Enter' && !e.shiftKey) {
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
                    {sending ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Send size={18} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    messagesList: { flex: 1 },
    messagesContent: { padding: 16, gap: 12 },
    messageRow: { flexDirection: 'row', marginBottom: 2, maxWidth: '85%' },
    rowLeft: { alignSelf: 'flex-start' },
    rowRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    messageBubble: { padding: 12, borderRadius: 0 },
    bubbleLeft: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 0, borderWidth: 1, borderColor: '#E2E8F0' },
    bubbleRight: { backgroundColor: '#0F172A', borderBottomRightRadius: 0 },
    messageText: { fontSize: 14, lineHeight: 20 },
    textWhite: { color: '#FFF' },
    textDark: { color: '#1E293B' },
    messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
    messageTime: { fontSize: 10 },
    timeWhite: { color: 'rgba(255,255,255,0.7)' },
    timeDark: { color: '#94A3B8' },
    typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 14 },
    dot: { width: 6, height: 6, borderRadius: 0, backgroundColor: '#94A3B8' },
    dot1: { opacity: 0.4 },
    dot2: { opacity: 0.7 },
    dot3: { opacity: 1 },
    inputArea: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
    inputAreaMobile: { paddingHorizontal: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
    input: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#F8FAFC', borderRadius: 0, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0', outlineStyle: 'none' } as any,
    sendBtn: { width: 44, height: 44, borderRadius: 0, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { backgroundColor: '#94A3B8' },
});
