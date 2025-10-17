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
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_BASE_URL, {
    path: "/socket.io",
    transports: ["websocket"],
    withCredentials: true,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}


export function disconnectSocket(): void {
  const s = getSocket();
  if (s.connected) s.disconnect();
}
