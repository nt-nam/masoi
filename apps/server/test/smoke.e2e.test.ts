// Smoke test tích hợp (PLAN §16.2): 1 người thật + 4 bot chơi trọn ván từ create → game over.
// Thời gian co lại bằng MASOI_TIMER_SCALE để ván chạy trong vài giây.
process.env.MASOI_TIMER_SCALE = '0.012';
process.env.PORT = '0';

import { describe, expect, it } from 'vitest';
import { io as clientIO, type Socket } from 'socket.io-client';
import type { AddressInfo } from 'node:net';
import type { Ack, StateSync } from '@masoi/shared';

const { httpServer } = await import('../src/index.js');

function emitAck<T = any>(socket: Socket, event: string, ...args: unknown[]): Promise<Ack<T>> {
  return new Promise((resolve) => socket.emit(event, ...args, (r: Ack<T>) => resolve(r)));
}

describe('smoke: ván full bot chạy tới game over', () => {
  it(
    'create → addBot×4 → start → gameOver',
    async () => {
      await new Promise<void>((resolve) => {
        if (httpServer.listening) resolve();
        else httpServer.once('listening', () => resolve());
      });
      const port = (httpServer.address() as AddressInfo).port;
      const base = `http://localhost:${port}`;

      // guest
      const res = await fetch(`${base}/api/guest`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Người Thật', avatar: 1 }),
      });
      expect(res.ok).toBe(true);
      const cookie = res.headers.get('set-cookie')!.split(';')[0]!;

      const socket = clientIO(base, {
        transports: ['websocket'],
        extraHeaders: { cookie },
      });
      await new Promise<void>((resolve, reject) => {
        socket.on('connect', () => resolve());
        socket.on('connect_error', (e) => reject(e));
      });

      const created = await emitAck<{ code: string }>(socket, 'room:create', {
        maxPlayers: 5,
        timerPreset: 'fast',
        isPublic: false,
      });
      expect(created.ok).toBe(true);

      for (let i = 0; i < 4; i++) {
        const r = await emitAck(socket, 'room:addBot');
        expect(r.ok).toBe(true);
      }

      const gameOver = new Promise<StateSync>((resolve) => {
        socket.on('game:stateSync', (sync: StateSync) => {
          if (sync.view.phase.kind === 'gameOver') resolve(sync);
        });
      });

      const started = await emitAck(socket, 'room:start');
      expect(started.ok).toBe(true);

      const finalSync = await gameOver;
      expect(finalSync.view.phase.kind).toBe('gameOver');
      if (finalSync.view.phase.kind === 'gameOver') {
        expect(['village', 'wolves']).toContain(finalSync.view.phase.winner);
        expect(finalSync.view.phase.reveal).toHaveLength(5);
      }

      socket.disconnect();
    },
    { timeout: 90_000 },
  );
});
