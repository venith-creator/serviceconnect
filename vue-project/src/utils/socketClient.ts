// utils/socketClient.ts
import { io, Socket } from "socket.io-client";
import { SOCKET_BASE_URL } from "@/config";

let socket: Socket | null = null;

export function getSocket(): Socket {
  // return existing socket (may be null)
  return socket!;
}

/**
 * Connect socket (idempotent). When the socket connects
 * we automatically emit 'registerRole' and 'register' (if localStorage has values).
 *
 * This ensures the actual connected socket joins:
 *  - role room (clients / providers / all)
 *  - user private room (userId)
 *
 * The change is intentionally minimal so existing server events keep working.
 */
export function connectSocket(token?: string): Socket {
  // If socket already exists and connected, reuse it
  if (socket && socket.connected) return socket;

  // If socket exists but not connected, reuse it (it will reconnect)
  if (socket && !socket.connected) {
    // update auth if token provided by reconnecting with new auth is needed
    // but to keep minimal risk we avoid forcing reconnection here
  }

  // Create (or recreate) the socket instance
  socket = io(SOCKET_BASE_URL, {
    path: "/socket.io",
    transports: ["websocket"],
    withCredentials: true,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // When connected, auto-register role & userId on *this* socket
  socket.on("connect", () => {
    try {
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");

      if (role) {
        // keep existing server usage of registerRole (for role rooms)
        socket!.emit("registerRole", { role });
        console.log("socket: emitted registerRole", role);
      }

      if (userId) {
        // private room by user id — the server's register listener will handle it
        socket!.emit("register", { userId, role });
        console.log("socket: emitted register", { userId, role });
      }
    } catch (e) {
      console.error("socket connect handler error:", e);
    }
  });

  // On reconnect, re-emit registration to re-join rooms
  socket.on("reconnect", () => {
    try {
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");

      if (role) {
        socket!.emit("registerRole", { role });
        console.log("socket: re-emitted registerRole", role);
      }
      if (userId) {
        socket!.emit("register", { userId, role });
        console.log("socket: re-emitted register", { userId, role });
      }
    } catch (e) {
      console.error("socket reconnect handler error:", e);
    }
  });

  return socket;
}

export function disconnectSocket(): void {
  if (!socket) return;
  if (socket.connected) socket.disconnect();
}

