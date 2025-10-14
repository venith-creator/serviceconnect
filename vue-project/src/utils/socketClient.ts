import { io, Socket } from "socket.io-client";
import { SOCKET_BASE_URL } from "@/config";

let socket: Socket | null = null;

export function getSocket(): Socket {
  console.log("log.socket", socket);
  if (!socket) {
    socket = io(SOCKET_BASE_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectSocket(token?: string): Socket {
  const s = getSocket();
  if (token) {

    (s.io as any).opts.auth = { token };
  }
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  const s = getSocket();
  if (s.connected) s.disconnect();
}
