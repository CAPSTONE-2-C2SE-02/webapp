import { Socket, io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;

  connect(token?: string): Socket {
    console.log("Attempting to connect to:", SERVER_URL);
    if (!this.socket) {
      this.socket = io(SERVER_URL, {
        auth: token ? { token } : undefined,
        transports: ["websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from Socket.IO server");
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
        console.log(error.name);
        console.log(error.stack);
      });
    }
    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();