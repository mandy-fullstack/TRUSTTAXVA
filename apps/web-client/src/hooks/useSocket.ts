import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@trusttax/core";
import { Socket } from "socket.io-client";

export const useSocket = (roomId?: string) => {
  // Use the global socket context
  const { socket, isConnected } = useSocketContext();

  useEffect(() => {
    if (roomId && isConnected) {
      socket.emit("joinRoom", roomId);

      return () => {
        socket.emit("leaveRoom", roomId);
      };
    }
  }, [roomId, isConnected, socket]);

  return {
    // Cast to typed socket for better DX
    socket: socket as Socket<ServerToClientEvents, ClientToServerEvents>,
    isConnected,
  };
};
