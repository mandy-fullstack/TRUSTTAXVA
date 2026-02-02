import { io, Socket } from "socket.io-client";
import { getToken } from "../lib/cookies";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@trusttax/core";
import { API_BASE_URL } from "../config/api";

const SOCKET_URL = API_BASE_URL;

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    autoConnect: false,
    auth: (cb) => {
      cb({ token: getToken() });
    },
  },
);
