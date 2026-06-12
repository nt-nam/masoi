import type { Server, Socket } from 'socket.io';
import type { EngineAction } from '@masoi/engine';
import {
  EMOTES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  TIMER_PRESETS,
  type Ack,
  type ChannelId,
  type EmoteId,
  type ErrorCode,
  type VoteTarget,
} from '@masoi/shared';
import { userFromCookieHeader, type User } from './auth.js';
import { RoomManager } from './room.js';

type AckFn = (r: Ack<any>) => void;
const ok = (ack: AckFn, data?: unknown) => ack({ ok: true, data });
const err = (ack: AckFn, error: ErrorCode, message?: string) => ack({ ok: false, error, message });

export function setupSockets(io: Server): RoomManager {
  const manager = new RoomManager(io);

  io.use((socket, next) => {
    const user = userFromCookieHeader(socket.handshake.headers.cookie);
    if (!user) return next(new Error('UNAUTHORIZED'));
    socket.data.user = user;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as User;

    // re-attach nếu đang ở phòng (reconnect giữa ván)
    const existing = manager.handleReconnect(user.id, socket.id);
    if (existing) {
      const member = existing.memberByUser(user.id);
      if (member) {
        socket.emit('room:update', existing.roomViewFor(member));
        const sync = existing.stateSyncFor(member);
        if (sync) socket.emit('game:stateSync', sync);
      }
    }

    const myRoom = () => manager.roomOfUser(user.id);
    const myMember = () => myRoom()?.memberByUser(user.id) ?? null;

    socket.on('room:create', (cfg: unknown, ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const c = (cfg ?? {}) as { maxPlayers?: number; timerPreset?: string; isPublic?: boolean };
      const maxPlayers = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Number(c.maxPlayers) || 8));
      const timerPreset = c.timerPreset === 'fast' || c.timerPreset === 'slow' ? c.timerPreset : 'standard';
      const room = manager.createRoom(user, { maxPlayers, timerPreset, isPublic: !!c.isPublic });
      if ('error' in room) return err(ack, room.error);
      const member = room.memberByUser(user.id)!;
      member.socketId = socket.id;
      room.broadcastRoom();
      ok(ack, { code: room.code, room: room.roomViewFor(member) });
    });

    socket.on('room:join', (p: unknown, ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const code = String((p as any)?.code ?? '').trim().toUpperCase();
      if (!code) return err(ack, 'ROOM_NOT_FOUND');
      const room = manager.joinRoom(user, code);
      if ('error' in room) return err(ack, room.error);
      const member = room.memberByUser(user.id)!;
      member.connected = true;
      member.socketId = socket.id;
      room.broadcastRoom();
      const sync = room.stateSyncFor(member);
      if (sync) socket.emit('game:stateSync', sync);
      ok(ack, { room: room.roomViewFor(member) });
    });

    socket.on('room:leave', (ack: AckFn) => {
      manager.leaveCurrentRoom(user.id);
      if (typeof ack === 'function') ok(ack);
    });

    socket.on('room:addBot', (ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      if (!room) return err(ack, 'NOT_IN_ROOM');
      if (room.hostUserId !== user.id) return err(ack, 'NOT_HOST');
      if (room.status !== 'waiting' && room.status !== 'finished') return err(ack, 'ROOM_ALREADY_STARTED');
      if (!room.addBot()) return err(ack, 'ROOM_FULL');
      room.broadcastRoom();
      ok(ack);
    });

    socket.on('room:kickSeat', (p: unknown, ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      if (!room) return err(ack, 'NOT_IN_ROOM');
      if (room.hostUserId !== user.id) return err(ack, 'NOT_HOST');
      if (room.status !== 'waiting' && room.status !== 'finished') return err(ack, 'ROOM_ALREADY_STARTED');
      const idx = Number((p as any)?.seat);
      const target = room.members[idx];
      if (!target || target.userId === user.id) return err(ack, 'INVALID_TARGET');
      if (target.userId) manager.leaveCurrentRoom(target.userId);
      else {
        room.members.splice(idx, 1);
        room.broadcastRoom();
      }
      ok(ack);
    });

    socket.on('room:configure', (cfg: unknown, ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      if (!room) return err(ack, 'NOT_IN_ROOM');
      if (room.hostUserId !== user.id) return err(ack, 'NOT_HOST');
      if (room.status !== 'waiting' && room.status !== 'finished') return err(ack, 'ROOM_ALREADY_STARTED');
      const c = (cfg ?? {}) as { maxPlayers?: number; timerPreset?: string; isPublic?: boolean };
      if (c.maxPlayers !== undefined) {
        const n = Number(c.maxPlayers);
        if (n >= Math.max(MIN_PLAYERS, room.members.length) && n <= MAX_PLAYERS) room.config.maxPlayers = n;
      }
      if (c.timerPreset && c.timerPreset in TIMER_PRESETS) room.config.timerPreset = c.timerPreset as never;
      if (c.isPublic !== undefined) room.config.isPublic = !!c.isPublic;
      room.broadcastRoom();
      ok(ack);
    });

    socket.on('room:start', (ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      if (!room) return err(ack, 'NOT_IN_ROOM');
      if (room.hostUserId !== user.id) return err(ack, 'NOT_HOST');
      const e = room.start();
      if (e) return err(ack, e);
      ok(ack);
    });

    socket.on('game:action', (p: unknown, ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      const member = myMember();
      if (!room || !member || member.seat === null) return err(ack, 'NOT_IN_ROOM');
      const seat = member.seat;
      const a = (p ?? {}) as { step?: string; target?: number | null; witch?: { save?: boolean; poisonTarget?: number | null } };
      let action: EngineAction;
      switch (a.step) {
        case 'seer':
        case 'guard':
          action = { type: a.step, seat, target: Number(a.target) };
          break;
        case 'wolves':
          action = { type: 'wolfVote', seat, target: Number(a.target) };
          break;
        case 'witch':
          action = {
            type: 'witch',
            seat,
            save: !!a.witch?.save,
            poisonTarget: a.witch?.poisonTarget == null ? null : Number(a.witch.poisonTarget),
          };
          break;
        case 'hunterShoot':
          action = { type: 'hunterShoot', seat, target: a.target == null ? null : Number(a.target) };
          break;
        default:
          return err(ack, 'INVALID_ACTION');
      }
      const e = room.applyEngineAction(seat, action);
      if (e) return err(ack, e);
      ok(ack);
    });

    socket.on('vote:cast', (p: unknown, ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      const member = myMember();
      if (!room || !member || member.seat === null) return err(ack, 'NOT_IN_ROOM');
      const raw = (p as any)?.target;
      const target: VoteTarget | null = raw === 'mercy' ? 'mercy' : raw == null ? null : Number(raw);
      const e = room.applyEngineAction(member.seat, { type: 'vote', seat: member.seat, target });
      if (e) return err(ack, e);
      ok(ack);
    });

    socket.on('speak:done', (ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      const member = myMember();
      if (!room || !member || member.seat === null) return err(ack, 'NOT_IN_ROOM');
      const e = room.applyEngineAction(member.seat, { type: 'speakDone', seat: member.seat });
      if (e) return err(ack, e);
      ok(ack);
    });

    socket.on('chat:send', (p: unknown, ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      const member = myMember();
      if (!room || !member) return err(ack, 'NOT_IN_ROOM');
      const channel = (p as any)?.channel as ChannelId;
      const text = String((p as any)?.text ?? '').trim().slice(0, 500);
      if (!text || !['lobby', 'village', 'wolf', 'dead'].includes(channel)) return err(ack, 'INVALID_ACTION');
      const now = Date.now();
      if (now - member.lastChatAt < 600) return err(ack, 'RATE_LIMITED');
      if (!room.canChat(member, channel)) return err(ack, 'CHANNEL_FORBIDDEN');
      member.lastChatAt = now;
      room.deliverChat(member, channel, text);
      ok(ack);
    });

    socket.on('emote:send', (p: unknown, ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      const member = myMember();
      if (!room || !member) return err(ack, 'NOT_IN_ROOM');
      const emote = (p as any)?.emote as EmoteId;
      if (!EMOTES.includes(emote)) return err(ack, 'INVALID_ACTION');
      const now = Date.now();
      if (now - member.lastEmoteAt < 3000) return err(ack, 'RATE_LIMITED');
      member.lastEmoteAt = now;
      const seat = member.seat ?? room.members.indexOf(member);
      for (const m of room.humanMembers()) {
        if (m.socketId) io.to(m.socketId).emit('emote:shown', { seat, emote });
      }
      ok(ack);
    });

    socket.on('accuse:set', (p: unknown, ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      const member = myMember();
      if (!room || !member) return err(ack, 'NOT_IN_ROOM');
      const raw = (p as any)?.target;
      const e = room.setMemberAccusal(member, raw == null ? null : Number(raw));
      if (e) return err(ack, e);
      ok(ack);
    });

    socket.on('game:requestSync', (ack: AckFn) => {
      if (typeof ack !== 'function') return;
      const room = myRoom();
      const member = myMember();
      if (!room || !member) return err(ack, 'NOT_IN_ROOM');
      const sync = room.stateSyncFor(member);
      if (!sync) return err(ack, 'PHASE_CLOSED');
      ok(ack, { sync });
    });

    socket.on('disconnect', () => {
      manager.handleDisconnect(user.id);
    });
  });

  return manager;
}
