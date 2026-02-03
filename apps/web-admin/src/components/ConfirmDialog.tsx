import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text } from "@trusttax/ui";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  autoCloseOnConfirm?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
  autoCloseOnConfirm = true,
}: ConfirmDialogProps) => {
  const handleConfirm = async () => {
    if (isLoading) return;
    try {
      await Promise.resolve(onConfirm());
      if (autoCloseOnConfirm) onClose();
    } catch (e) {
      console.error("[ConfirmDialog] onConfirm failed:", e);
    }
  };

  const variantColors = {
    danger: {
      icon: "#EF4444",
      bg: "#FEF2F2",
      border: "#FECACA",
      buttonBg: "#EF4444",
      buttonText: "#FFFFFF",
    },
    warning: {
      icon: "#F59E0B",
      bg: "#FFFBEB",
      border: "#FDE68A",
      buttonBg: "#F59E0B",
      buttonText: "#FFFFFF",
    },
    info: {
      icon: "#2563EB",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      buttonBg: "#2563EB",
      buttonText: "#FFFFFF",
    },
  };

  const colors = variantColors[variant];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={isLoading ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: colors.bg, borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.headerContent}>
              <View
                style={[styles.iconContainer, { backgroundColor: colors.bg }]}
              >
                <AlertTriangle size={24} color={colors.icon} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>{title}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={isLoading ? undefined : onClose}
              style={styles.closeButton}
              disabled={isLoading}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={isLoading ? undefined : onClose}
              style={styles.cancelButton}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                { backgroundColor: colors.buttonBg },
                isLoading && styles.confirmButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.buttonText} />
                  <Text
                    style={[
                      styles.confirmButtonText,
                      { color: colors.buttonText },
                    ]}
                  >
                    {confirmText}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.confirmButtonText,
                    { color: colors.buttonText },
                  ]}
                >
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }
      : {}),
  } as any,
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  closeButton: {
    padding: 4,
    borderRadius: 0,
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer",
        }
      : {}),
  } as any,
  content: {
    padding: 20,
  },
  message: {
    fontSize: 15,
    lineHeight: 24,
    color: "#475569",
    fontWeight: "400",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    justifyContent: "flex-end",
  },
  cancelButton: {
    minWidth: 120,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer",
        }
      : {}),
  } as any,
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    letterSpacing: 0.5,
  },
  confirmButton: {
    minWidth: 120,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    borderRadius: 0,
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer",
        }
      : {}),
  } as any,
  confirmButtonDisabled: {
    opacity: 0.85,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
