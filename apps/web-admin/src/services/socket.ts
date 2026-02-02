import { io, Socket } from "socket.io-client";
import { getToken } from "../lib/cookies";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@trusttax/core";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    autoConnect: false,
    auth: (cb) => {
      cb({ token: getToken() });
    },
  },
);
