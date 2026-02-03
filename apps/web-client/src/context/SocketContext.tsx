import { createContext, useContext, useEffect, useState, useRef } from "react";
import { socket } from "../services/socket";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: typeof socket;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize notification sound
    notificationSoundRef.current = new Audio("/notification.mp3");
    notificationSoundRef.current.volume = 0.5;

    // Request notification permission safely
    if (typeof window !== "undefined" && "Notification" in window) {
      if (window.Notification.permission === "default") {
        window.Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    // Connect only if authenticated
    if (token && user) {
      // Update auth token in handshake
      socket.auth = { token };

      if (!socket.connected) {
        console.log("Global Socket Connecting...");
        socket.connect();
      }
    } else {
      if (socket.connected) {
        console.log("Global Socket Disconnecting (No Auth)...");
        socket.disconnect();
      }
    }

    function onConnect() {
      setIsConnected(true);
      console.log("Global Socket Connected:", socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("Global Socket Disconnected");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocketContext must be used within SocketProvider");
  return context;
};
