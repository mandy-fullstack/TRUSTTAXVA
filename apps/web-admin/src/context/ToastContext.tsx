import React, { createContext, useContext, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Text } from "@trusttax/ui";
import { X, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
  link?: string;
  onClose: (id: string) => void;
}

const Toast = ({
  id,
  title,
  message,
  type = "info",
  duration = 5000,
  link,
  onClose,
}: ToastProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-30)).current;
  const progressAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0) {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: duration,
        useNativeDriver: false,
      }).start();
    }
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -15,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose(id));
  };

  const getIcon = () => {
    const size = 18;
    switch (type) {
      case "success":
        return (
          <View style={[styles.iconWrapper, { backgroundColor: "#10B98115" }]}>
            <CheckCircle size={size} color="#10B981" />
          </View>
        );
      case "error":
        return (
          <View style={[styles.iconWrapper, { backgroundColor: "#EF444415" }]}>
            <AlertCircle size={size} color="#EF4444" />
          </View>
        );
      case "warning":
        return (
          <View style={[styles.iconWrapper, { backgroundColor: "#F59E0B15" }]}>
            <AlertCircle size={size} color="#F59E0B" />
          </View>
        );
      default:
        return (
          <View style={[styles.iconWrapper, { backgroundColor: "#3B82F615" }]}>
            <MessageSquare size={size} color="#3B82F6" />
          </View>
        );
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case "success":
        return "#10B981";
      case "error":
        return "#EF4444";
      case "warning":
        return "#F59E0B";
      default:
        return "#3B82F6";
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={() => {
          if (link) window.location.href = link;
          handleClose();
        }}
        activeOpacity={0.8}
      >
        <View style={styles.mainContainer}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
        <X size={16} color="#94A3B8" />
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: getAccentColor(),
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

interface ToastContextType {
  showToast: (props: Omit<ToastProps, "id" | "onClose">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Omit<ToastProps, "onClose">[]>([]);

  const showToast = useCallback(
    ({
      title,
      message,
      type = "info",
      duration = 5000,
      link,
    }: Omit<ToastProps, "id" | "onClose">) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [
        ...prev,
        { id, title, message, type, duration, link },
      ]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "web" ? 24 : 50,
    left: 0,
    right: 0,
    alignItems: Platform.OS === "web" ? "flex-end" : "center",
    zIndex: 9999,
    paddingHorizontal: 24,
  },
  toast: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    width: Platform.OS === "web" ? 400 : Dimensions.get("window").width - 40,
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(241, 245, 249, 0.8)",
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  } as any,
  content: {
    flex: 1,
  },
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  closeBtn: {
    padding: 16,
    alignSelf: "flex-start",
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  progressBar: {
    height: "100%",
  },
});
