import { io, type Socket } from 'socket.io-client';
import type { Ack } from '@masoi/shared';

// Socket singleton, cùng origin (dev: Vite proxy /socket.io → server) — PLAN §10.2
export const socket: Socket = io({ autoConnect: false, transports: ['websocket', 'polling'] });

export function connectSocket(): void {
  if (!socket.connected) socket.connect();
}

export function emitAck<T = unknown>(event: string, ...args: unknown[]): Promise<Ack<T>> {
  return new Promise((resolve) => {
    socket.timeout(8000).emit(event, ...args, (err: unknown, r: Ack<T>) => {
      if (err) resolve({ ok: false, error: 'PHASE_CLOSED', message: 'Hết thời gian chờ server' });
      else resolve(r);
    });
  });
}
