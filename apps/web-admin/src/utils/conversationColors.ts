// Category color mapping for conversations
export const CONVERSATION_COLORS = {
  GENERAL: {
    bg: "#EFF6FF", // Light blue
    border: "#3B82F6", // Blue
    text: "#1E40AF", // Dark blue
    icon: "#60A5FA", // Medium blue
  },
  TECHNICAL: {
    bg: "#F3E8FF", // Light purple
    border: "#A855F7", // Purple
    text: "#6B21A8", // Dark purple
    icon: "#C084FC", // Medium purple
  },
  BILLING: {
    bg: "#D1FAE5", // Light green
    border: "#10B981", // Green
    text: "#065F46", // Dark green
    icon: "#34D399", // Medium green
  },
  URGENT: {
    bg: "#FEE2E2", // Light red
    border: "#EF4444", // Red
    text: "#991B1B", // Dark red
    icon: "#F87171", // Medium red
  },
} as const;

export type ConversationCategory = keyof typeof CONVERSATION_COLORS;

export function getCategoryColor(category: ConversationCategory = "GENERAL") {
  return CONVERSATION_COLORS[category] || CONVERSATION_COLORS.GENERAL;
}

export function getCategoryLabel(category: ConversationCategory): string {
  const labels: Record<ConversationCategory, string> = {
    GENERAL: "General",
    TECHNICAL: "Technical",
    BILLING: "Billing",
    URGENT: "Urgent",
  };
  return labels[category] || "General";
}
