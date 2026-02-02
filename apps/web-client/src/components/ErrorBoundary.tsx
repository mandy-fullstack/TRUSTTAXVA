import { Component, type ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.message}>
            Recarga la página o intenta más tarde. Si el problema continúa,
            contacta a soporte.
          </Text>
          {this.state.error && (
            <Text
              style={[
                styles.message,
                { fontSize: 12, color: "#ef4444", fontFamily: "monospace" },
              ]}
            >
              Additional Info: {this.state.error.toString()}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Recargar página</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    minHeight: "100vh" as any,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
    ...(Platform.OS === "web" ? { fontFamily: "system-ui, sans-serif" } : {}),
  },
  message: {
    color: "#64748b",
    marginBottom: 24,
    textAlign: "center",
    maxWidth: 400,
    fontSize: 16,
    lineHeight: 24,
    ...(Platform.OS === "web" ? { fontFamily: "system-ui, sans-serif" } : {}),
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    ...(Platform.OS === "web" ? { fontFamily: "system-ui, sans-serif" } : {}),
  },
});
