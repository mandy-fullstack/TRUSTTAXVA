import { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Text } from "@trusttax/ui";
import { CheckCircle, XCircle, Info, AlertCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  variant?: "success" | "error" | "info" | "warning";
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
}

export const AlertDialog = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText,
  variant = "info",
  buttons,
}: AlertDialogProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen || Platform.OS !== "web") return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantConfig = {
    success: {
      icon: CheckCircle,
      iconColor: "#10B981",
      bg: "#F0FDF4",
      border: "#BBF7D0",
      buttonBg: "#10B981",
    },
    error: {
      icon: XCircle,
      iconColor: "#EF4444",
      bg: "#FEF2F2",
      border: "#FECACA",
      buttonBg: "#EF4444",
    },
    warning: {
      icon: AlertCircle,
      iconColor: "#F59E0B",
      bg: "#FFFBEB",
      border: "#FDE68A",
      buttonBg: "#F59E0B",
    },
    info: {
      icon: Info,
      iconColor: "#2563EB",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      buttonBg: "#2563EB",
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  const displayButtons = buttons || [
    { text: buttonText || t("dialog.ok", "OK"), onPress: onClose },
  ];

  return (
    <>
      {Platform.OS === "web" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={onClose}
        />
      )}
      <View style={styles.dialog}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: config.bg, borderBottomColor: config.border },
          ]}
        >
          <View style={styles.headerContent}>
            <View
              style={[styles.iconContainer, { backgroundColor: config.bg }]}
            >
              <Icon size={24} color={config.iconColor} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.message}>{message}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {displayButtons.map((btn, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                btn.onPress();
                if (btn.style !== "cancel") onClose();
              }}
              style={[
                styles.button,
                btn.style === "destructive" && { backgroundColor: "#EF4444" },
                btn.style === "cancel" && {
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                },
                !btn.style && { backgroundColor: config.buttonBg },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.buttonText,
                  btn.style === "cancel" && { color: "#475569" },
                  (!btn.style || btn.style === "destructive") && {
                    color: "#FFFFFF",
                  },
                ]}
              >
                {btn.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  dialog: {
    width: "90%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    zIndex: 9999,
    ...(Platform.OS === "web"
      ? {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
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
  button: {
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
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
