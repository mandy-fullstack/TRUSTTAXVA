import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { api } from "../../services/api";
import { H4, Text } from "@trusttax/ui";
import { MessageCircle, Search, ArrowLeft, Trash2 } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  getCategoryColor,
  getCategoryLabel,
} from "../../utils/conversationColors";
import { useAdminChat } from "../../hooks/useAdminChat";
import { AdminConversationView } from "../../components/Chat/AdminConversationView";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AlertDialog } from "../../components/AlertDialog";

export const AdminChatPage = () => {
  const { t } = useTranslation();
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    conversationId: string | null;
    title: string;
  }>({ isOpen: false, conversationId: null, title: "" });
  const [deleting, setDeleting] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "info" | "warning";
  }>({ isOpen: false, title: "", message: "", variant: "info" });

  const isMobile = width < 768;

  const {
    messages,
    loading: loadingMessages,
    sendMessage,
    handleTyping,
    isOtherTyping,
    setIsOtherTyping,
    socket,
  } = useAdminChat(paramId);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Sync other typing state via socket
  useEffect(() => {
    if (!socket || !paramId) return;

    socket.on("userTyping", (data: any) => {
      if (data.conversationId === paramId && data.userId !== user?.id) {
        setIsOtherTyping(data.isTyping);
      }
    });

    return () => {
      socket.off("userTyping");
    };
  }, [socket, paramId, user, setIsOtherTyping]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (id: string, e: any, conv: any) => {
    e.stopPropagation();
    const title = conv?.client?.name || conv?.client?.email || conv?.subject || id;
    setDeleteConfirm({ isOpen: true, conversationId: id, title });
  };

  const confirmDeleteConversation = async () => {
    if (!deleteConfirm.conversationId) return;
    try {
      setDeleting(true);
      await api.deleteConversation(deleteConfirm.conversationId);
      setConversations((prev) =>
        prev.filter((c) => c.id !== deleteConfirm.conversationId),
      );
      if (paramId === deleteConfirm.conversationId) navigate("/chat");
      setDeleteConfirm({ isOpen: false, conversationId: null, title: "" });
      setAlertDialog({
        isOpen: true,
        title: t("chat.delete_success_title", "Chat eliminado"),
        message: t("chat.delete_success_message", {
          defaultValue: "La conversación fue eliminada correctamente.",
        }),
        variant: "success",
      });
    } catch (error: any) {
      console.error("Failed to delete conversation:", error);
      setAlertDialog({
        isOpen: true,
        title: t("chat.delete_error_title", "Error al eliminar"),
        message:
          error?.message ||
          t("chat.delete_error_message", {
            defaultValue: "No se pudo eliminar el chat. Intenta nuevamente.",
          }),
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const currentConversation = conversations.find((c) => c.id === paramId);

  return (
    <Layout noScroll={true}>
      <View style={styles.container}>
        {/* Conversations Sidebar */}
        {(!isMobile || !paramId) && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <H4>{t("chat.inbox", "Inbox")}</H4>
            </View>

            <View style={styles.searchContainer}>
              <Search size={16} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder={t("chat.search_placeholder", "Search clients...")}
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
                    style={[
                      styles.convItem,
                      paramId === conv.id && styles.convItemActive,
                    ]}
                    onPress={() => navigate(`/chat/${conv.id}`)}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {(conv.client?.name || "C")[0]}
                      </Text>
                    </View>
                    <View style={styles.convInfo}>
                      <View style={styles.convHeader}>
                        <Text style={styles.convName} numberOfLines={1}>
                          {conv.client?.name || "Unknown"}
                        </Text>
                        <Text style={styles.convTime}>
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.convSubject} numberOfLines={1}>
                        {conv.subject}
                      </Text>
                      <Text style={styles.convPreview} numberOfLines={1}>
                        {conv.messages?.[0]?.content || "No messages"}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 8,
                        }}
                      >
                        <View
                          style={[
                            styles.categoryBadge,
                            {
                              backgroundColor: getCategoryColor(conv.category)
                                .border,
                            },
                          ]}
                        >
                          <Text style={styles.categoryText}>
                            {getCategoryLabel(conv.category)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => openDeleteConfirm(conv.id, e, conv)}
                          disabled={deleting}
                        >
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
                  <Text style={styles.emptyText}>
                    {t("chat.empty", "No conversations found.")}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Chat Area */}
        {(!isMobile || paramId) && (
          <View style={styles.chatArea}>
            {paramId ? (
              <>
                <View style={styles.chatHeader}>
                  {isMobile && (
                    <TouchableOpacity
                      style={styles.mobileBackBtn}
                      onPress={() => navigate("/chat")}
                    >
                      <ArrowLeft size={20} color="#64748B" />
                    </TouchableOpacity>
                  )}
                  <View style={styles.avatarSmall}>
                    <Text
                      style={{
                        color: "#FFF",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      {(currentConversation?.client?.name || "C")[0]}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.chatHeaderTitle}>
                      {currentConversation?.client?.name || "Client"}
                    </Text>
                    <Text style={styles.chatHeaderSubtitle}>
                      {currentConversation?.subject}
                    </Text>
                  </View>
                </View>

                <AdminConversationView
                  messages={messages}
                  loading={loadingMessages}
                  onSendMessage={(content, docId, doc) =>
                    sendMessage(content, docId, doc)
                  }
                  onTyping={handleTyping}
                  isOtherTyping={isOtherTyping}
                />
              </>
            ) : (
              <View style={styles.noChatSelected}>
                <MessageCircle size={64} color="#E2E8F0" />
                <Text style={styles.selectChatText}>
                  {t(
                    "chat.select_conversation",
                    "Select a conversation to start chatting",
                  )}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Confirm Delete Chat */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, conversationId: null, title: "" })
        }
        onConfirm={confirmDeleteConversation}
        isLoading={deleting}
        autoCloseOnConfirm={false}
        title={t("chat.delete_confirm_title", "Eliminar chat")}
        message={t("chat.delete_confirm_message", {
          defaultValue:
            "¿Estás seguro de que deseas eliminar este chat? Esta acción no se puede deshacer.",
          title: deleteConfirm.title,
        })}
        confirmText={t("chat.delete_confirm_button", "Eliminar")}
        cancelText={t("chat.delete_cancel_button", "Cancelar")}
        variant="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() =>
          setAlertDialog({
            isOpen: false,
            title: "",
            message: "",
            variant: "info",
          })
        }
        title={alertDialog.title}
        message={alertDialog.message}
        variant={alertDialog.variant}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#F8FAFC" },
  sidebar: {
    width: 360,
    borderRightWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  sidebarHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 0,
    height: 40,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    outlineStyle: "none",
  } as any,
  conversationList: { flex: 1 },
  convItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  convItemActive: {
    backgroundColor: "#F1F5F9",
    borderLeftWidth: 3,
    borderLeftColor: "#0F172A",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#64748B", fontWeight: "bold" },
  convInfo: { flex: 1 },
  convHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  convName: {
    fontWeight: "600",
    color: "#1E293B",
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  convTime: { fontSize: 11, color: "#94A3B8" },
  convSubject: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    marginBottom: 2,
  },
  convPreview: { fontSize: 13, color: "#64748B" },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#F8FAFC",
    height: "100%",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  mobileBackBtn: { marginRight: 12, padding: 4 },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatHeaderTitle: { fontWeight: "700", color: "#0F172A", fontSize: 15 },
  chatHeaderSubtitle: { fontSize: 12, color: "#64748B" },
  noChatSelected: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  selectChatText: { color: "#64748B", fontSize: 16, fontWeight: "500" },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 0 },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
    textTransform: "uppercase",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  emptyText: { color: "#94A3B8", fontSize: 14 },
});
