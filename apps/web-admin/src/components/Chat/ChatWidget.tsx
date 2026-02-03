import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { api } from "../../services/api";
import { Text } from "@trusttax/ui";
import { ArrowLeft, X, MessageCircle, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAdminChat } from "../../hooks/useAdminChat";
import { AdminConversationView } from "./AdminConversationView";

interface ChatWidgetProps {
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const ChatWidget = ({ onClose, onUnreadCountChange }: ChatWidgetProps) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [staff, setStaff] = useState<any[]>([]);

  const {
    messages,
    loading: loadingMessages,
    sendMessage,
    handleTyping,
    isOtherTyping,
    setIsOtherTyping,
    socket,
  } = useAdminChat(selectedId);

  // Initial load
  useEffect(() => {
    fetchConversations();
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await api.getStaff();
      setStaff(data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  // Listen for events to update list or other typing
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      // Only refresh if message is from a client (not from admin)
      if (data.sender?.role === "CLIENT" || !data.sender?.role) {
        // Refresh conversations and unread count when new message arrives
        fetchConversations();
      }
    };

    const handleMessagesRead = () => {
      // Refresh when messages are marked as read
      fetchConversations();
    };

    const handleNotification = (payload: any) => {
      // Update unread count when notification is received
      if (payload.type === "message" && onUnreadCountChange) {
        api.getUnreadMessageCount()
          .then((data) => {
            onUnreadCountChange(data.count || 0);
          })
          .catch(() => {});
      }
    };

    socket.on("userTyping", (data: any) => {
      if (data.conversationId === selectedId && data.userId !== user?.id) {
        setIsOtherTyping(data.isTyping);
      }
    });

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("userTyping");
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("notification", handleNotification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, selectedId, user?.id, setIsOtherTyping, onUnreadCountChange]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getConversations();
      setConversations(data);
      
      // Update unread count when conversations are loaded
      if (onUnreadCountChange) {
        try {
          const unreadData = await api.getUnreadMessageCount();
          onUnreadCountChange(unreadData.count || 0);
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentConversation = conversations.find((c) => c.id === selectedId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {selectedId ? (
          <TouchableOpacity
            onPress={() => setSelectedId(null)}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="#64748B" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <View>
          <Text style={styles.headerTitle}>
            {selectedId
              ? currentConversation?.client?.name || "Client"
              : "Inbox"}
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
          conversation={currentConversation}
          staff={staff}
          onAssignPreparer={async (preparerId) => {
            if (!selectedId) return;
            try {
              await api.assignPreparer(selectedId, preparerId);
              await fetchConversations();
              // Refresh unread count after assigning
              if (onUnreadCountChange) {
                const unreadData = await api.getUnreadMessageCount();
                onUnreadCountChange(unreadData.count || 0);
              }
            } catch (error) {
              console.error("Failed to assign preparer:", error);
            }
          }}
          onMessagesRead={() => {
            // Refresh conversations and unread count when messages are read
            fetchConversations();
            if (onUnreadCountChange) {
              api.getUnreadMessageCount()
                .then((data) => {
                  onUnreadCountChange(data.count || 0);
                })
                .catch(() => {});
            }
          }}
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
              conversations.map((conv) => (
                <TouchableOpacity
                  key={conv.id}
                  style={styles.convItem}
                  onPress={() => {
                    setSelectedId(conv.id);
                    // Refresh unread count when selecting a conversation
                    if (onUnreadCountChange) {
                      api.getUnreadMessageCount()
                        .then((data) => {
                          onUnreadCountChange(data.count || 0);
                        })
                        .catch(() => {});
                    }
                  }}
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
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        {conv.unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>
                              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.convTime}>
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.convSubject} numberOfLines={1}>
                      {conv.subject}
                    </Text>
                    <Text style={styles.convPreview} numberOfLines={1}>
                      {conv.messages?.[0]?.content || "No messages"}
                    </Text>
                    {!conv.preparerId && (
                      <Text style={styles.unassignedText}>Unassigned</Text>
                    )}
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
  container: { flex: 1, backgroundColor: "#FFF", flexDirection: "column" },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#0F172A" },
  headerSubtitle: { fontSize: 12, color: "#64748B" },
  backBtn: { padding: 4, marginRight: 8 },
  closeBtn: { padding: 4, marginLeft: "auto" },
  listContainer: { flex: 1 },
  listActions: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    borderRadius: 0,
    height: 40,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    outlineStyle: "none",
  } as any,
  conversationList: { flex: 1 },
  convItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
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
  unreadBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 0,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  unassignedText: {
    fontSize: 11,
    color: "#F59E0B",
    fontWeight: "600",
    marginTop: 4,
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
