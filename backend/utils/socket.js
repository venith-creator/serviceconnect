// utils/socket.js
import { Server } from "socket.io";
let io = null;

export const initSocket = (server) => {
  const socketio = new Server(server, {
    cors: { origin: "*" },
    path: "/socket.io",
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
  });

  io = socketio;

  io.on("connection", (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);
     socket.on("registerRole", ({ role }) => {
        console.log("📢 registerRole received:", role);

        if (role === "client" || role === "provider" || role === "admin") {
          const roomName = role === "admin" ? "all" : `${role}s`;
          socket.join(roomName); // e.g. clients, providers, all
          console.log(`Socket ${socket.id} joined room ${roomName}`);
        }
      });
    // client should join room(s) by calling socket.emit('joinRoom', { roomId })
    socket.on("joinRoom", ({ roomId }) => {
      if (roomId) socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("leaveRoom", ({ roomId }) => {
      if (roomId) socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    // optional: handle typing events, etc.
    socket.on("typing", ({ roomId, userId }) => {
      socket.to(roomId).emit("typing", { userId });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return socketio;
};

export const getIO = () => io;
