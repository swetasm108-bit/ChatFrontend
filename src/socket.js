console.log("🔥 socket.js FILE LOADED");

import { io } from "socket.io-client";

export const socket = io(
  "https://chatbackend-7vdm.onrender.com",
  {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    timeout: 20000,
  }
);

socket.on("connect", () => {
  console.log("✅ Socket.IO connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket.IO disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket.IO connection error:", error.message);
});