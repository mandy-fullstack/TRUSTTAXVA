import { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Text } from '@trusttax/ui';
import { Send, Check, CheckCheck, Paperclip, FileText, Download, Folder, X, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

interface ConversationViewProps {
    messages: any[];
    loading: boolean;
    onSendMessage: (content: string, documentId?: string) => void;
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

    const fileInputRef = useRef<any>(null);
    const [uploading, setUploading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    const groupMessagesByDate = (msgs: any[]) => {
        const groups: { date: string; messages: any[] }[] = [];
        msgs.forEach(msg => {
            const date = new Date(msg.createdAt).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.date === date) {
                lastGroup.messages.push(msg);
            } else {
                groups.push({ date, messages: [msg] });
            }
        });
        return groups;
    };

    const formatDateDivider = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return t('chat.today', 'Hoy');
        if (date.toDateString() === yesterday.toDateString()) return t('chat.yesterday', 'Ayer');
        return dateStr;
    };

    const sharedDocuments = messages.filter(m => m.document).map(m => m.document);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOtherTyping]);

    const handleSend = async (content: string = inputText, docId?: string) => {
        if ((!content.trim() && !docId) || sending) return;
        setSending(true);
        try {
            await onSendMessage(content, docId);
            if (!docId) setInputText('');
            onTyping(false);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (event: any) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const document = await api.uploadDocument(file, file.name, 'OTHER');
            // After upload, send a message with the documentId
            // If the user hasn't typed anything, we send a default message or just the doc
            await handleSend(inputText || `Archivo enviado: ${file.name}`, document.id);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Failed to upload document:', error);
            alert('Error al subir el documento. Inténtalo de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.chatMain}>
                <ScrollView
                    ref={scrollRef}
                    style={styles.messagesList}
                    contentContainerStyle={[styles.messagesContent, { paddingBottom: 24 }]}
                    onContentSizeChange={scrollToBottom}
                >
                    {loading && messages.length === 0 ? (
                        <ActivityIndicator color="#0F172A" style={{ marginTop: 20 }} />
                    ) : (
                        groupMessagesByDate(messages).map((group) => (
                            <View key={group.date}>
                                <View style={styles.dateDivider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dateText}>{formatDateDivider(group.date)}</Text>
                                    <View style={styles.dividerLine} />
                                </View>
                                {group.messages.map((msg) => {
                                    const isMine = msg.senderId === user?.id;
                                    return (
                                        <View key={msg.id} style={[styles.messageRow, isMine ? styles.rowRight : styles.rowLeft]}>
                                            <View style={[styles.messageBubble, isMine ? styles.bubbleRight : styles.bubbleLeft]}>
                                                {msg.document && (
                                                    <TouchableOpacity
                                                        style={[styles.documentContainer, isMine ? styles.docMine : styles.docThem]}
                                                        onPress={() => window.open(msg.document.url, '_blank')}
                                                    >
                                                        <FileText size={20} color={isMine ? '#FFF' : '#2563EB'} />
                                                        <View style={styles.docInfo}>
                                                            <Text style={[styles.docTitle, isMine ? styles.textWhite : styles.textDark]} numberOfLines={1}>
                                                                {msg.document.title}
                                                            </Text>
                                                            <Text style={[styles.docSize, isMine ? styles.timeWhite : styles.timeDark]}>
                                                                {(msg.document.size / 1024).toFixed(1)} KB
                                                            </Text>
                                                        </View>
                                                        <Download size={16} color={isMine ? 'rgba(255,255,255,0.6)' : '#94A3B8'} />
                                                    </TouchableOpacity>
                                                )}
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
                                                                msg.status === 'sending' ?
                                                                    <ActivityIndicator size={10} color="rgba(255,255,255,0.6)" /> :
                                                                    <Check size={14} color="rgba(255,255,255,0.6)" />
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        ))
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

                {showSidebar && !isMobile && (
                    <View style={styles.sidebar}>
                        <View style={styles.sidebarHeader}>
                            <Folder size={18} color="#0F172A" />
                            <Text style={styles.sidebarTitle}>{t('chat.shared_files', 'Archivos compartidos')}</Text>
                            <TouchableOpacity onPress={() => setShowSidebar(false)}>
                                <X size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.sidebarContent}>
                            {sharedDocuments.length === 0 ? (
                                <View style={styles.emptySidebar}>
                                    <FileText size={40} color="#E2E8F0" />
                                    <Text style={styles.emptySidebarText}>{t('chat.no_files', 'No hay archivos compartidos')}</Text>
                                </View>
                            ) : (
                                sharedDocuments.map((doc, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.sidebarDocItem}
                                        onPress={() => window.open(doc.url, '_blank')}
                                    >
                                        <View style={styles.sidebarDocIcon}>
                                            <FileText size={16} color="#64748B" />
                                        </View>
                                        <View style={styles.sidebarDocInfo}>
                                            <Text style={styles.sidebarDocTitle} numberOfLines={1}>{doc.title}</Text>
                                            <Text style={styles.sidebarDocMeta}>{(doc.size / 1024).toFixed(1)} KB</Text>
                                        </View>
                                        <ChevronRight size={14} color="#CBD5E1" />
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                )}
            </View>

            <View style={[styles.inputArea, isMobile && styles.inputAreaMobile]}>
                {Platform.OS === 'web' && (
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                )}

                <TouchableOpacity
                    style={[styles.attachBtn, showSidebar && styles.sidebarActiveBtn]}
                    onPress={() => setShowSidebar(!showSidebar)}
                >
                    <Folder size={20} color={showSidebar ? "#0F172A" : "#64748B"} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.attachBtn}
                    onPress={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator size="small" color="#64748B" />
                    ) : (
                        <Paperclip size={20} color="#64748B" />
                    )}
                </TouchableOpacity>

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
                    onPress={() => handleSend()}
                    disabled={(!inputText.trim() && !uploading) || sending}
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
    messageBubble: { padding: 14, borderRadius: 0 },
    bubbleLeft: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
    bubbleRight: { backgroundColor: '#0F172A' },
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
    inputArea: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', gap: 12 },
    inputAreaMobile: { paddingHorizontal: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
    attachBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
    input: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#F8FAFC', borderRadius: 0, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', outlineStyle: 'none' } as any,
    sendBtn: { width: 44, height: 44, borderRadius: 0, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { backgroundColor: '#94A3B8' },
    documentContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, marginBottom: 8, borderWidth: 1, minWidth: 200 },
    docMine: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
    docThem: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
    docInfo: { flex: 1 },
    docTitle: { fontSize: 13, fontWeight: '600' },
    docSize: { fontSize: 11 },
    dateDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, paddingHorizontal: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    dateText: { paddingHorizontal: 12, fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
    chatMain: { flex: 1, flexDirection: 'row' },
    sidebar: { width: 280, borderLeftWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
    sidebarHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 10 },
    sidebarTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0F172A' },
    sidebarContent: { flex: 1 },
    sidebarDocItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', gap: 12 },
    sidebarDocIcon: { width: 32, height: 32, borderRadius: 0, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    sidebarDocInfo: { flex: 1 },
    sidebarDocTitle: { fontSize: 13, color: '#1E293B', fontWeight: '500' },
    sidebarDocMeta: { fontSize: 11, color: '#94A3B8' },
    emptySidebar: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
    emptySidebarText: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
    sidebarActiveBtn: { backgroundColor: '#E2E8F0' },
});
