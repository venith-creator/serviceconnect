// utils/socket.js
import { Server } from "socket.io";
let io = null;

export const initSocket = (server) => {
  const socketio = new Server(server, {
    cors: { origin: "*" }
  });

  io = socketio;

  io.on("connection", (socket) => {
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
