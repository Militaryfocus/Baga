import { io, Socket } from 'socket.io-client';

class SocketClient {
  socket: Socket | null = null;

  connect(token: string) {
    if (this.socket) return this.socket;
    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001', {
      auth: { token }
    });
    return this.socket;
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }
}

export const socketClient = new SocketClient();
